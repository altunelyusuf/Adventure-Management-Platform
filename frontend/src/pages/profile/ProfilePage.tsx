import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchUserXP } from '@/store/slices/userSlice';
import { gamificationAPI } from '@/services/api';
import { Achievement } from '@/types';
import { Trophy, Award, Star, TrendingUp, Calendar, Mail, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { xp } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchUserXP());
  }, [dispatch]);

  const { data: achievements } = useQuery({
    queryKey: ['userAchievements'],
    queryFn: async () => {
      const response = await gamificationAPI.getUserAchievements();
      return response.data as Achievement[];
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await gamificationAPI.getLeaderboard('global');
      return response.data;
    },
  });

  const unlockedAchievements = achievements?.filter(a => a.unlockedAt) || [];
  const lockedAchievements = achievements?.filter(a => !a.unlockedAt) || [];
  const userRank = leaderboard?.findIndex((entry: any) => entry.userId === user?.userId) + 1 || 0;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.profile?.firstName?.[0] || user?.email[0].toUpperCase()}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.profile?.firstName && user?.profile?.lastName
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : 'Adventurer'}
              </h1>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              </div>
              {user?.profile?.bio && (
                <p className="mt-4 text-gray-600">{user.profile.bio}</p>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-xs text-yellow-800">Level</p>
                    <p className="text-2xl font-bold text-yellow-900">{xp?.currentLevel || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-800">Total XP</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {xp?.totalXp.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Level Progress */}
            {xp && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                  Level Progress
                </h2>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-2">
                      <span className="text-3xl font-bold text-primary-600">
                        {xp.currentLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Current Level</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress to Level {xp.currentLevel + 1}</span>
                      <span className="font-medium text-gray-900">
                        {Math.round((xp.currentLevelXp / xp.xpForNextLevel) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${(xp.currentLevelXp / xp.xpForNextLevel) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{xp.currentLevelXp} XP</span>
                      <span>{xp.xpForNextLevel} XP</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">XP to next level</span>
                      <span className="font-semibold text-primary-600">
                        {xp.xpForNextLevel - xp.currentLevelXp} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Position */}
            {userRank > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard Rank</h2>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mb-2">
                    <span className="text-2xl font-bold text-white">#{userRank}</span>
                  </div>
                  <p className="text-sm text-gray-600">Global Ranking</p>
                </div>
              </div>
            )}

            {/* Achievement Summary */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievement Progress</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unlocked</span>
                  <span className="text-lg font-bold text-green-600">
                    {unlockedAchievements.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Locked</span>
                  <span className="text-lg font-bold text-gray-400">
                    {lockedAchievements.length}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {achievements?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Achievements */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-2 text-primary-600" />
                Achievements
              </h2>

              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Unlocked ({unlockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unlockedAchievements.map((achievement) => (
                      <div
                        key={achievement.achievementId}
                        className="p-4 border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <Award className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-yellow-700">
                                +{achievement.xpReward} XP
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(achievement.unlockedAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Locked ({lockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {lockedAchievements.map((achievement) => (
                      <div
                        key={achievement.achievementId}
                        className="p-4 border border-gray-200 bg-gray-50 rounded-lg opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <Award className="h-8 w-8 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-700">{achievement.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-500">
                                +{achievement.xpReward} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!achievements || achievements.length === 0) && (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No achievements yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Complete quests to unlock achievements!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
