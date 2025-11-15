import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAPI } from '@/services/api';
import { Activity } from '@/types';
import { Heart, MessageCircle, Users, Trophy, MapPin, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

type FeedType = 'global' | 'friends';

export default function SocialPage() {
  const [feedType, setFeedType] = useState<FeedType>('global');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['socialFeed', feedType],
    queryFn: async () => {
      const response = await socialAPI.getFeed(feedType);
      return response.data as Activity[];
    },
  });

  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await socialAPI.getFriends();
      return response.data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: (activityId: string) => socialAPI.likeActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      toast.success('Activity liked!');
    },
    onError: () => {
      toast.error('Failed to like activity');
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ activityId, content }: { activityId: string; content: string }) =>
      socialAPI.commentActivity(activityId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      setCommentInputs({ ...commentInputs, [variables.activityId]: '' });
      toast.success('Comment added!');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const handleLike = (activityId: string) => {
    likeMutation.mutate(activityId);
  };

  const handleComment = (activityId: string) => {
    const content = commentInputs[activityId]?.trim();
    if (!content) {
      toast.error('Please enter a comment');
      return;
    }
    commentMutation.mutate({ activityId, content });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'QUEST_COMPLETED':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'ACHIEVEMENT_UNLOCKED':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'CHECKPOINT_REACHED':
        return <MapPin className="h-5 w-5 text-blue-600" />;
      case 'FRIEND_ADDED':
        return <Users className="h-5 w-5 text-green-600" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Feed</h1>
        <p className="text-gray-600 mb-6">
          See what your friends and the community are up to
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feed Type Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setFeedType('global')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  feedType === 'global'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Global Feed
              </button>
              <button
                onClick={() => setFeedType('friends')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  feedType === 'friends'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Friends Feed
              </button>
            </div>

            {/* Activities */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.activityId} className="card">
                    {/* Activity Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                        {activity.user?.profile?.firstName?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {activity.user?.profile?.firstName || 'User'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(activity.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getActivityIcon(activity.activityType)}
                          <span className="text-sm text-gray-600">{activity.description}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Metadata */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-700">
                          {activity.metadata.questTitle && (
                            <p>
                              <span className="font-medium">Quest:</span> {activity.metadata.questTitle}
                            </p>
                          )}
                          {activity.metadata.achievementName && (
                            <p>
                              <span className="font-medium">Achievement:</span>{' '}
                              {activity.metadata.achievementName}
                            </p>
                          )}
                          {activity.metadata.xpEarned && (
                            <p>
                              <span className="font-medium">XP Earned:</span> +{activity.metadata.xpEarned}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interaction Stats */}
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleLike(activity.activityId)}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{activity.likeCount || 0}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{activity.commentCount || 0}</span>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {activity.comments && activity.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        {activity.comments.map((comment, idx) => (
                          <div key={idx} className="flex gap-2">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {comment.user?.profile?.firstName?.[0] || 'U'}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-2">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.user?.profile?.firstName || 'User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[activity.activityId] || ''}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [activity.activityId]: e.target.value })
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleComment(activity.activityId);
                        }}
                        placeholder="Write a comment..."
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => handleComment(activity.activityId)}
                        className="btn btn-secondary text-sm"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No activities yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {feedType === 'friends'
                    ? 'Add friends to see their activities'
                    : 'Complete quests to share your adventures'}
                </p>
              </div>
            )}
          </div>

          {/* Friends Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-600" />
                Friends ({friends?.length || 0})
              </h2>

              {friends && friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friend: any) => (
                    <div key={friend.userId} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                        {friend.profile?.firstName?.[0] || 'F'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {friend.profile?.firstName || 'Friend'}
                        </p>
                        <p className="text-xs text-gray-500">Level {friend.xp?.currentLevel || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No friends yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
