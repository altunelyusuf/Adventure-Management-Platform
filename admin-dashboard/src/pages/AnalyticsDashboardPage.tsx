import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Map, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3011/api/admin';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalQuests: number;
  activeQuests: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalParticipations: number;
  avgQuestRating: number;
}

interface UserGrowthData {
  date: string;
  users: number;
  activeUsers: number;
}

interface QuestStatsData {
  difficulty: string;
  count: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [questStats, setQuestStats] = useState<QuestStatsData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [statsRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
      ]);

      setStats(statsRes.data);

      // Mock data for charts (replace with real API calls)
      setUserGrowth([
        { date: '2024-01', users: 1200, activeUsers: 850 },
        { date: '2024-02', users: 1450, activeUsers: 1020 },
        { date: '2024-03', users: 1680, activeUsers: 1180 },
        { date: '2024-04', users: 1920, activeUsers: 1350 },
        { date: '2024-05', users: 2150, activeUsers: 1520 },
        { date: '2024-06', users: 2480, activeUsers: 1740 },
      ]);

      setQuestStats([
        { difficulty: 'Easy', count: 145 },
        { difficulty: 'Medium', count: 98 },
        { difficulty: 'Hard', count: 67 },
        { difficulty: 'Expert', count: 34 },
      ]);

      setRevenueData([
        { month: 'Jan', revenue: 4500 },
        { month: 'Feb', revenue: 5200 },
        { month: 'Mar', revenue: 6100 },
        { month: 'Apr', revenue: 5800 },
        { month: 'May', revenue: 7200 },
        { month: 'Jun', revenue: 8500 },
      ]);
    } catch (error: any) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      subValue: `${stats?.activeUsers || 0} active`,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Total Quests',
      value: stats?.totalQuests || 0,
      subValue: `${stats?.activeQuests || 0} active`,
      icon: Map,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      subValue: `$${(stats?.totalRevenue || 0).toLocaleString()} total`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      trend: '+15%',
    },
    {
      title: 'Participations',
      value: stats?.totalParticipations || 0,
      subValue: `${(stats?.avgQuestRating || 0).toFixed(1)} avg rating`,
      icon: Activity,
      color: 'bg-purple-500',
      trend: '+23%',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Platform performance and insights</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-semibold">{card.trend}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-sm text-gray-500">{card.subValue}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#2563eb"
                strokeWidth={2}
                name="Total Users"
              />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#10b981"
                strokeWidth={2}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#f59e0b" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quest Difficulty Distribution */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quest Difficulty Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={questStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ difficulty, count }) => `${difficulty}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {questStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {questStats.map((stat, index) => (
              <div key={stat.difficulty} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">
                  {stat.difficulty}: <span className="font-semibold">{stat.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Metrics Table */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average Session Duration</p>
                <p className="text-2xl font-bold text-gray-900">24m 35s</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Quest Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">78.5%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average Quest Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.avgQuestRating || 0).toFixed(1)} / 5.0
                </p>
              </div>
              <Map className="h-8 w-8 text-purple-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">User Retention (30d)</p>
                <p className="text-2xl font-bold text-gray-900">65.2%</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">2,480</p>
            <p className="text-sm text-gray-600 mt-1">Registered Users</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-3xl font-bold text-green-600">344</p>
            <p className="text-sm text-gray-600 mt-1">Published Quests</p>
            <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">8,562</p>
            <p className="text-sm text-gray-600 mt-1">Quest Completions</p>
            <p className="text-xs text-green-600 mt-1">↑ 23% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
