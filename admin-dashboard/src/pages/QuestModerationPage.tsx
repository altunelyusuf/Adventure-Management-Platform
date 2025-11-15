import { useState, useEffect } from 'react';
import { Map, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3011/api/admin';

interface Quest {
  quest_id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: number;
  total_distance: number;
  xp_reward: number;
  status: string;
  creator_name: string;
  creator_email: string;
  checkpoint_count: number;
  created_at: string;
  flagged_count: number;
}

export default function QuestModerationPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  useEffect(() => {
    fetchQuests();
  }, [statusFilter]);

  const fetchQuests = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await axios.get(`${API_BASE}/quests`, { params });
      setQuests(response.data.quests);
    } catch (error: any) {
      toast.error('Failed to load quests');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveQuest = async (questId: string) => {
    try {
      await axios.post(`${API_BASE}/quests/${questId}/approve`, {
        adminId: 'admin-user-id',
      });
      toast.success('Quest approved successfully');
      fetchQuests();
      setSelectedQuest(null);
    } catch (error: any) {
      toast.error('Failed to approve quest');
      console.error(error);
    }
  };

  const handleRejectQuest = async (questId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await axios.post(`${API_BASE}/quests/${questId}/reject`, {
        reason,
        adminId: 'admin-user-id',
      });
      toast.success('Quest rejected');
      fetchQuests();
      setSelectedQuest(null);
    } catch (error: any) {
      toast.error('Failed to reject quest');
      console.error(error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading quests...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Map className="h-8 w-8" />
          Quest Moderation
        </h1>
        <p className="text-gray-600 mt-2">Review and approve user-created quests</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>

        <div className="ml-auto text-sm text-gray-600">
          Showing {quests.length} quest{quests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quest List */}
        <div className="space-y-4">
          {quests.map((quest) => (
            <div
              key={quest.quest_id}
              className={`bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                selectedQuest?.quest_id === quest.quest_id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedQuest(quest)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex-1">{quest.title}</h3>
                <div className="flex gap-2 ml-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quest.status)}`}>
                    {quest.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{quest.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>📍 {quest.checkpoint_count} checkpoints</span>
                <span>⏱️ {quest.estimated_duration}m</span>
                <span>🗺️ {quest.total_distance}km</span>
                <span>⭐ {quest.xp_reward} XP</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm">
                  <span className="text-gray-600">By: </span>
                  <span className="font-medium text-gray-900">{quest.creator_name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(quest.created_at).toLocaleDateString()}
                </div>
              </div>

              {quest.flagged_count > 0 && (
                <div className="mt-3 flex items-center gap-2 text-orange-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{quest.flagged_count} user report{quest.flagged_count !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          ))}

          {quests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <Map className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quests found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Quest Detail Panel */}
        <div className="sticky top-6">
          {selectedQuest ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quest Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedQuest.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-700">{selectedQuest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Difficulty</label>
                    <p className="text-gray-900">{selectedQuest.difficulty}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-gray-900">{selectedQuest.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-gray-900">{selectedQuest.estimated_duration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Distance</label>
                    <p className="text-gray-900">{selectedQuest.total_distance} km</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Checkpoints</label>
                    <p className="text-gray-900">{selectedQuest.checkpoint_count}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">XP Reward</label>
                    <p className="text-gray-900">{selectedQuest.xp_reward} XP</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Creator</label>
                  <p className="text-gray-900">{selectedQuest.creator_name}</p>
                  <p className="text-sm text-gray-500">{selectedQuest.creator_email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900">{new Date(selectedQuest.created_at).toLocaleString()}</p>
                </div>

                {selectedQuest.flagged_count > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">
                        {selectedQuest.flagged_count} user report{selectedQuest.flagged_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedQuest.status === 'pending' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleApproveQuest(selectedQuest.quest_id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve Quest
                  </button>
                  <button
                    onClick={() => handleRejectQuest(selectedQuest.quest_id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject Quest
                  </button>
                </div>
              )}

              <button
                onClick={() => window.open(`/quests/${selectedQuest.quest_id}`, '_blank')}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="h-5 w-5" />
                View Full Quest
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-12 text-center">
              <Map className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Select a quest to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
