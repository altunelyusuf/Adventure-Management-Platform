import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { questAPI } from '@/services/api';
import { Quest } from '@/types';
import { Search, Plus, MapPin, Clock, BarChart3 } from 'lucide-react';

type DifficultyFilter = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export default function QuestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('ALL');

  const { data: quests, isLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const response = await questAPI.getQuests();
      return response.data as Quest[];
    },
  });

  const filteredQuests = quests?.filter((quest) => {
    const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'ALL' || quest.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const difficultyOptions: DifficultyFilter[] = ['ALL', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quests</h1>
            <p className="mt-2 text-gray-600">
              Discover and embark on exciting adventures
            </p>
          </div>
          <Link to="/quests/create" className="btn btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            Create Quest
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {difficultyOptions.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setDifficultyFilter(difficulty)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  difficultyFilter === difficulty
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Quest Grid */}
        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredQuests && filteredQuests.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuests.map((quest) => (
              <Link
                key={quest.questId}
                to={`/quests/${quest.questId}`}
                className="card hover:shadow-lg transition-shadow group"
              >
                {/* Quest Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {quest.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                    quest.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    quest.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    quest.difficulty === 'HARD' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quest.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {quest.description}
                </p>

                {/* Quest Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{quest.checkpoints.length}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{quest.estimatedDuration}m</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    <span>{quest.totalDistance}km</span>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      by {quest.creator?.profile?.firstName || 'Anonymous'}
                    </span>
                    {quest.tags && quest.tags.length > 0 && (
                      <div className="flex gap-1">
                        {quest.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No quests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || difficultyFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first quest!'}
            </p>
            {!searchQuery && difficultyFilter === 'ALL' && (
              <div className="mt-6">
                <Link to="/quests/create" className="btn btn-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Quest
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
