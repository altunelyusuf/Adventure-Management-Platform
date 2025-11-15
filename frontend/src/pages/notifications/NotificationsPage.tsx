import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@/services/api';
import { Notification } from '@/types';
import {
  Bell,
  Trophy,
  Award,
  Users,
  MapPin,
  MessageCircle,
  CreditCard,
  CheckCircle,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationAPI.getNotifications();
      return response.data as Notification[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationAPI.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all as read');
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'QUEST_COMPLETED':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'ACHIEVEMENT_UNLOCKED':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'FRIEND_REQUEST':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'CHECKPOINT_REACHED':
        return <MapPin className="h-5 w-5 text-green-600" />;
      case 'COMMENT_RECEIVED':
        return <MessageCircle className="h-5 w-5 text-indigo-600" />;
      case 'SUBSCRIPTION_UPDATED':
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white';

    switch (type) {
      case 'QUEST_COMPLETED':
        return 'bg-yellow-50';
      case 'ACHIEVEMENT_UNLOCKED':
        return 'bg-purple-50';
      case 'FRIEND_REQUEST':
        return 'bg-blue-50';
      case 'CHECKPOINT_REACHED':
        return 'bg-green-50';
      case 'COMMENT_RECEIVED':
        return 'bg-indigo-50';
      case 'SUBSCRIPTION_UPDATED':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-medium">
            Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full font-medium">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
            Medium
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">
              Stay updated with your adventures
              {unreadCount > 0 && (
                <span className="ml-2 text-primary-600 font-medium">
                  ({unreadCount} unread)
                </span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="btn btn-secondary flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.notificationId}
                className={`${getNotificationBgColor(
                  notification.notificationType,
                  notification.isRead
                )} border ${
                  notification.isRead ? 'border-gray-200' : 'border-primary-200'
                } rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.isRead ? 'bg-gray-100' : 'bg-white'
                    }`}>
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        notification.isRead ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(notification.priority)}
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.notificationId)}
                            className="text-primary-600 hover:text-primary-700 p-1"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className={`text-sm ${
                      notification.isRead ? 'text-gray-500' : 'text-gray-700'
                    } mb-2`}>
                      {notification.message}
                    </p>

                    {/* Metadata */}
                    {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs text-gray-600 space-y-1">
                        {notification.metadata.questTitle && (
                          <p>
                            <span className="font-medium">Quest:</span> {notification.metadata.questTitle}
                          </p>
                        )}
                        {notification.metadata.achievementName && (
                          <p>
                            <span className="font-medium">Achievement:</span>{' '}
                            {notification.metadata.achievementName}
                          </p>
                        )}
                        {notification.metadata.xpEarned && (
                          <p>
                            <span className="font-medium">XP Earned:</span> +{notification.metadata.xpEarned}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                      {notification.isRead && notification.readAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! Complete quests to get updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
