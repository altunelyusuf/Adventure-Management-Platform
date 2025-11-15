import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { questAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CheckpointData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  order: number;
  hint?: string;
}

interface QuestFormData {
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  estimatedDuration: number;
  totalDistance: number;
  xpReward: number;
  tags: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function CreateQuestPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<QuestFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<number | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    const newCheckpoint: CheckpointData = {
      name: `Checkpoint ${checkpoints.length + 1}`,
      description: '',
      latitude: lat,
      longitude: lng,
      order: checkpoints.length,
    };
    setCheckpoints([...checkpoints, newCheckpoint]);
    setSelectedCheckpoint(checkpoints.length);
  };

  const updateCheckpoint = (index: number, field: keyof CheckpointData, value: string | number) => {
    const updated = [...checkpoints];
    updated[index] = { ...updated[index], [field]: value };
    setCheckpoints(updated);
  };

  const deleteCheckpoint = (index: number) => {
    const updated = checkpoints.filter((_, i) => i !== index);
    // Reorder remaining checkpoints
    const reordered = updated.map((cp, i) => ({ ...cp, order: i }));
    setCheckpoints(reordered);
    if (selectedCheckpoint === index) {
      setSelectedCheckpoint(null);
    } else if (selectedCheckpoint !== null && selectedCheckpoint > index) {
      setSelectedCheckpoint(selectedCheckpoint - 1);
    }
  };

  const onSubmit = async (data: QuestFormData) => {
    if (checkpoints.length < 2) {
      toast.error('Please add at least 2 checkpoints');
      return;
    }

    setIsLoading(true);
    try {
      const questData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        checkpoints: checkpoints.map(cp => ({
          ...cp,
          radiusMeters: 50, // Default radius
        })),
      };

      await questAPI.createQuest(questData);
      toast.success('Quest created successfully!');
      navigate('/quests');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create quest');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultCenter: [number, number] = [37.7749, -122.4194]; // San Francisco

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          to="/quests"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Quests
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Quest</h1>
        <p className="text-gray-600 mb-6">
          Design an exciting adventure for others to embark on
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quest Details Card */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quest Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="input w-full"
                      placeholder="Enter quest title"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={4}
                      className="input w-full"
                      placeholder="Describe your quest"
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty *
                    </label>
                    <select
                      {...register('difficulty', { required: 'Difficulty is required' })}
                      className="input w-full"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (mins) *
                      </label>
                      <input
                        type="number"
                        {...register('estimatedDuration', {
                          required: 'Duration is required',
                          min: 1,
                        })}
                        className="input w-full"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distance (km) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('totalDistance', {
                          required: 'Distance is required',
                          min: 0.1,
                        })}
                        className="input w-full"
                        placeholder="5.0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      XP Reward *
                    </label>
                    <input
                      type="number"
                      {...register('xpReward', {
                        required: 'XP reward is required',
                        min: 1,
                      })}
                      className="input w-full"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      {...register('tags')}
                      className="input w-full"
                      placeholder="hiking, scenic, historical"
                    />
                  </div>
                </div>
              </div>

              {/* Checkpoints List Card */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Checkpoints ({checkpoints.length})
                  </h2>
                  <span className="text-xs text-gray-500">Click map to add</span>
                </div>

                {checkpoints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Click on the map to add checkpoints</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {checkpoints.map((checkpoint, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${
                          selectedCheckpoint === index
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={checkpoint.name}
                              onChange={(e) => updateCheckpoint(index, 'name', e.target.value)}
                              className="input w-full text-sm"
                              placeholder="Checkpoint name"
                            />
                            <textarea
                              value={checkpoint.description}
                              onChange={(e) => updateCheckpoint(index, 'description', e.target.value)}
                              className="input w-full text-sm"
                              rows={2}
                              placeholder="Description"
                            />
                            <input
                              type="text"
                              value={checkpoint.hint || ''}
                              onChange={(e) => updateCheckpoint(index, 'hint', e.target.value)}
                              className="input w-full text-sm"
                              placeholder="Hint (optional)"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteCheckpoint(index)}
                            className="flex-shrink-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Creating...' : 'Create Quest'}
              </button>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="card p-0 overflow-hidden sticky top-6">
                <div className="h-[calc(100vh-120px)]">
                  <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    {checkpoints.map((checkpoint, index) => (
                      <Marker
                        key={index}
                        position={[checkpoint.latitude, checkpoint.longitude]}
                        eventHandlers={{
                          click: () => setSelectedCheckpoint(index),
                        }}
                      />
                    ))}
                  </MapContainer>
                </div>
                <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-gray-900">
                    Click on the map to add checkpoints
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''} added
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
