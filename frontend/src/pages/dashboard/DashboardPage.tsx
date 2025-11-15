import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { fetchUserXP } from '@/store/slices/userSlice';
import { questAPI, gamificationAPI } from '@/services/api';
import { Trophy, Map, Award, TrendingUp } from 'lucide-react';
import { Quest, Achievement } from '@/types';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { xp } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchUserXP());
  }, [dispatch]);

  const { data: recentQuests } = useQuery({
    queryKey: ['recentQuests'],
    queryFn: async () => {
      const response = await questAPI.getQuests({ limit: 5 });
      return response.data as Quest[];
    },
  });

  const { data: achievements } = useQuery({
    queryKey: ['userAchievements'],
    queryFn: async () => {
      const response = await gamificationAPI.getUserAchievements();
      return response.data as Achievement[];
    },
  });

  const stats = [
    {
      name: 'Current Level',
      value: xp?.currentLevel || 0,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Total XP',
      value: xp?.totalXp.toLocaleString() || '0',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Achievements',
      value: achievements?.filter(a => a.unlockedAt).length || 0,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Active Quests',
      value: recentQuests?.length || 0,
      icon: Map,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.profile?.firstName || 'Adventurer'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your adventures today.
        </p>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        {xp && (
          <div className="mt-8 card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Level Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Level {xp.currentLevel}</span>
                <span className="text-gray-600">
                  {xp.currentLevelXp} / {xp.xpForNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(xp.currentLevelXp / xp.xpForNextLevel) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {xp.xpForNextLevel - xp.currentLevelXp} XP to next level
              </p>
            </div>
          </div>
        )}

        {/* Recent Quests */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Quests</h2>
            <Link to="/quests" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentQuests?.map((quest) => (
              <Link
                key={quest.questId}
                to={`/quests/${quest.questId}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {quest.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    quest.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    quest.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    quest.difficulty === 'HARD' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quest.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {quest.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{quest.checkpoints.length} checkpoints</span>
                  <span>{quest.estimatedDuration} mins</span>
                </div>
              </Link>
            ))}
          </div>
          {(!recentQuests || recentQuests.length === 0) && (
            <div className="text-center py-12 card">
              <Map className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No quests yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first quest!
              </p>
              <div className="mt-6">
                <Link to="/quests/create" className="btn btn-primary">
                  Create Quest
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
              <Link to="/profile" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.achievementId}
                  className={`card ${
                    achievement.unlockedAt ? 'border-2 border-yellow-400' : 'opacity-60'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <Award className={`h-8 w-8 mb-2 ${
                      achievement.unlockedAt ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {achievement.description}
                    </p>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-green-600 mt-2 font-medium">
                        Unlocked!
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
