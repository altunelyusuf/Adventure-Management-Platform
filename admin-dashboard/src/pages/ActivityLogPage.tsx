import { useState, useEffect } from 'react';
import { Activity, Filter, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3011/api/admin';

interface ActivityLog {
  activity_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const ACTION_TYPES = [
  'all',
  'user.created',
  'user.login',
  'user.logout',
  'user.banned',
  'user.unbanned',
  'quest.created',
  'quest.updated',
  'quest.approved',
  'quest.rejected',
  'quest.completed',
  'payment.created',
  'payment.completed',
  'system.error',
];

const ENTITY_TYPES = ['all', 'user', 'quest', 'payment', 'checkpoint', 'review', 'system'];

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, actionFilter, entityFilter, searchQuery]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchActivities();
      }, 10000); // Refresh every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/activity-logs`, {
        params: { limit: 100 },
      });
      setActivities(response.data.activities);
    } catch (error: any) {
      toast.error('Failed to load activity logs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    if (actionFilter !== 'all') {
      filtered = filtered.filter((a) => a.action_type === actionFilter);
    }

    if (entityFilter !== 'all') {
      filtered = filtered.filter((a) => a.entity_type === entityFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.user_email?.toLowerCase().includes(query) ||
          a.user_name?.toLowerCase().includes(query) ||
          a.entity_id?.toLowerCase().includes(query) ||
          a.ip_address?.includes(query)
      );
    }

    setFilteredActivities(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User', 'Email', 'IP Address'],
      ...filteredActivities.map((a) => [
        new Date(a.created_at).toISOString(),
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.user_name || 'System',
        a.user_email || 'N/A',
        a.ip_address,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Activity log exported');
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes('created')) return 'bg-green-100 text-green-800';
    if (actionType.includes('updated')) return 'bg-blue-100 text-blue-800';
    if (actionType.includes('deleted') || actionType.includes('banned'))
      return 'bg-red-100 text-red-800';
    if (actionType.includes('approved')) return 'bg-green-100 text-green-800';
    if (actionType.includes('rejected')) return 'bg-orange-100 text-orange-800';
    if (actionType.includes('login')) return 'bg-purple-100 text-purple-800';
    if (actionType.includes('error')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('created')) return '➕';
    if (actionType.includes('updated')) return '✏️';
    if (actionType.includes('deleted')) return '🗑️';
    if (actionType.includes('banned')) return '🚫';
    if (actionType.includes('approved')) return '✅';
    if (actionType.includes('rejected')) return '❌';
    if (actionType.includes('login')) return '🔑';
    if (actionType.includes('completed')) return '🎉';
    if (actionType.includes('error')) return '⚠️';
    return '📋';
  };

  const formatDetails = (details: any) => {
    if (!details) return null;
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Activity Log
        </h1>
        <p className="text-gray-600 mt-2">Monitor all system activities and user actions</p>
      </div>

      {/* Filters and Controls */}
      <div className="mb-6 bg-white shadow-md rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by user, email, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Actions' : type}
              </option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Entities' : type}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={fetchActivities}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh (10s)</span>
            </label>
            <span className="text-sm text-gray-500">
              Showing {filteredActivities.length} of {activities.length} activities
            </span>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity.activity_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{new Date(activity.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex items-center gap-2 text-xs font-semibold rounded-full ${getActionColor(
                        activity.action_type
                      )}`}
                    >
                      <span>{getActionIcon(activity.action_type)}</span>
                      {activity.action_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{activity.entity_type}</div>
                    <div className="text-xs text-gray-500 font-mono truncate max-w-xs">
                      {activity.entity_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-gray-900">
                      {activity.user_name || 'System'}
                    </div>
                    <div className="text-xs text-gray-500">{activity.user_email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <div className="truncate">{formatDetails(activity.details) || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {activity.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Live Activity Indicator */}
      {autoRefresh && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg inline-flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">Live updates active</span>
        </div>
      )}
    </div>
  );
}
