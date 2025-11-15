import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { questAPI } from '@/services/api';
import { Quest } from '@/types';
import { ArrowLeft, MapPin, Clock, BarChart3, Trophy, User, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function QuestDetailPage() {
  const { questId } = useParams<{ questId: string }>();

  const { data: quest, isLoading } = useQuery({
    queryKey: ['quest', questId],
    queryFn: async () => {
      const response = await questAPI.getQuest(questId!);
      return response.data as Quest;
    },
    enabled: !!questId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Quest not found</h2>
        <Link to="/quests" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
          Back to Quests
        </Link>
      </div>
    );
  }

  const sortedCheckpoints = [...quest.checkpoints].sort((a, b) => a.order - b.order);
  const pathCoordinates = sortedCheckpoints.map(cp => [cp.latitude, cp.longitude] as [number, number]);
  const center = pathCoordinates[0] || [0, 0];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/quests"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Quests
        </Link>

        {/* Quest Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{quest.title}</h1>
              <p className="mt-2 text-gray-600">{quest.description}</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap ml-4 ${
              quest.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
              quest.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              quest.difficulty === 'HARD' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {quest.difficulty}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Checkpoints</p>
                <p className="text-lg font-semibold text-gray-900">{quest.checkpoints.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{quest.estimatedDuration} mins</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="text-lg font-semibold text-gray-900">{quest.totalDistance} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">XP Reward</p>
                <p className="text-lg font-semibold text-gray-900">{quest.xpReward}</p>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Created by {quest.creator?.profile?.firstName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(quest.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Tags */}
          {quest.tags && quest.tags.length > 0 && (
            <div className="mt-4 flex gap-2">
              {quest.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden">
              <div className="h-[500px]">
                <MapContainer
                  center={center}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {sortedCheckpoints.map((checkpoint) => (
                    <Marker
                      key={checkpoint.checkpointId}
                      position={[checkpoint.latitude, checkpoint.longitude]}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">{checkpoint.name}</p>
                          <p className="text-gray-600">{checkpoint.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Order: {checkpoint.order}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {pathCoordinates.length > 1 && (
                    <Polyline positions={pathCoordinates} color="#2563eb" weight={3} />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Checkpoints List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Checkpoints</h2>
              <div className="space-y-3">
                {sortedCheckpoints.map((checkpoint, index) => (
                  <div
                    key={checkpoint.checkpointId}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {checkpoint.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {checkpoint.description}
                        </p>
                        {checkpoint.hint && (
                          <p className="text-xs text-primary-600 mt-1 italic">
                            Hint: {checkpoint.hint}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {checkpoint.latitude.toFixed(5)}, {checkpoint.longitude.toFixed(5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
