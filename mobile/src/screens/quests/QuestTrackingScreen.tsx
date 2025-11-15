import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Checkpoint = {
  checkpointId: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  order: number;
  radius: number;
};

type QuestTrackingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { questId: string } };
};

const CHECKPOINT_RADIUS = 50; // meters
const LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds

export default function QuestTrackingScreen({ navigation, route }: QuestTrackingScreenProps) {
  const { questId } = route.params;
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(new Set());
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [distanceToNext, setDistanceToNext] = useState<number | null>(null);
  const [pathCoordinates, setPathCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const mapRef = useRef<MapView>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    fetchQuestCheckpoints();
    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (currentLocation && checkpoints.length > 0) {
      checkProximityToCheckpoint();
      updateDistanceToNext();
    }
  }, [currentLocation, currentCheckpointIndex]);

  const fetchQuestCheckpoints = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      // const response = await questAPI.getQuestCheckpoints(questId);
      // setCheckpoints(response.data);

      // Mock data
      const mockCheckpoints: Checkpoint[] = [
        {
          checkpointId: '1',
          name: 'Central Plaza',
          description: 'Start your journey here',
          latitude: 37.7749,
          longitude: -122.4194,
          order: 0,
          radius: CHECKPOINT_RADIUS,
        },
        {
          checkpointId: '2',
          name: 'Historic Museum',
          description: 'Second checkpoint',
          latitude: 37.7759,
          longitude: -122.4184,
          order: 1,
          radius: CHECKPOINT_RADIUS,
        },
        {
          checkpointId: '3',
          name: 'City Hall',
          description: 'Final checkpoint',
          latitude: 37.7769,
          longitude: -122.4174,
          order: 2,
          radius: CHECKPOINT_RADIUS,
        },
      ];
      setCheckpoints(mockCheckpoints);
    } catch (error) {
      console.error('Failed to fetch checkpoints:', error);
      Alert.alert('Error', 'Failed to load quest checkpoints');
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }

    // Get initial position
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setPathCoordinates([{ latitude, longitude }]);
        setIsTracking(true);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Failed to get your location');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    // Watch position
    watchId.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setPathCoordinates((prev) => [...prev, { latitude, longitude }]);
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: LOCATION_UPDATE_INTERVAL,
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const updateDistanceToNext = () => {
    if (!currentLocation || currentCheckpointIndex >= checkpoints.length) return;

    const nextCheckpoint = checkpoints[currentCheckpointIndex];
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nextCheckpoint.latitude,
      nextCheckpoint.longitude
    );
    setDistanceToNext(distance);
  };

  const checkProximityToCheckpoint = () => {
    if (!currentLocation || currentCheckpointIndex >= checkpoints.length) return;

    const currentCheckpoint = checkpoints[currentCheckpointIndex];
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      currentCheckpoint.latitude,
      currentCheckpoint.longitude
    );

    if (distance <= currentCheckpoint.radius && !completedCheckpoints.has(currentCheckpoint.checkpointId)) {
      handleCheckpointReached(currentCheckpoint);
    }
  };

  const handleCheckpointReached = (checkpoint: Checkpoint) => {
    Alert.alert(
      'Checkpoint Reached! 🎉',
      `You've reached ${checkpoint.name}`,
      [
        {
          text: 'Validate',
          onPress: () => {
            navigation.navigate('CheckpointValidation', {
              questId,
              checkpointId: checkpoint.checkpointId,
              onValidated: () => handleCheckpointValidated(checkpoint.checkpointId),
            });
          },
        },
      ]
    );
  };

  const handleCheckpointValidated = (checkpointId: string) => {
    setCompletedCheckpoints((prev) => new Set(prev).add(checkpointId));

    const nextIndex = currentCheckpointIndex + 1;
    if (nextIndex >= checkpoints.length) {
      // Quest completed
      Alert.alert(
        'Quest Completed! 🏆',
        'Congratulations on completing this quest!',
        [
          {
            text: 'View Summary',
            onPress: () => {
              navigation.navigate('QuestCompletion', { questId });
            },
          },
        ]
      );
    } else {
      setCurrentCheckpointIndex(nextIndex);
    }
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Quest?',
      'Are you sure you want to quit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            stopTracking();
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const currentCheckpoint = checkpoints[currentCheckpointIndex];
  const region = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: checkpoints[0]?.latitude || 37.7749,
        longitude: checkpoints[0]?.longitude || -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
      >
        {/* Checkpoints */}
        {checkpoints.map((checkpoint, index) => {
          const isCompleted = completedCheckpoints.has(checkpoint.checkpointId);
          const isCurrent = index === currentCheckpointIndex;

          return (
            <React.Fragment key={checkpoint.checkpointId}>
              <Marker
                coordinate={{
                  latitude: checkpoint.latitude,
                  longitude: checkpoint.longitude,
                }}
                title={checkpoint.name}
              >
                <View
                  style={[
                    styles.markerContainer,
                    isCompleted && styles.markerCompleted,
                    isCurrent && styles.markerCurrent,
                  ]}
                >
                  <Text style={styles.markerText}>{index + 1}</Text>
                </View>
              </Marker>
              <Circle
                center={{
                  latitude: checkpoint.latitude,
                  longitude: checkpoint.longitude,
                }}
                radius={checkpoint.radius}
                fillColor={
                  isCompleted
                    ? 'rgba(34, 197, 94, 0.2)'
                    : isCurrent
                    ? 'rgba(37, 99, 235, 0.2)'
                    : 'rgba(156, 163, 175, 0.2)'
                }
                strokeColor={
                  isCompleted ? '#22c55e' : isCurrent ? '#2563eb' : '#9ca3af'
                }
                strokeWidth={2}
              />
            </React.Fragment>
          );
        })}

        {/* User path */}
        {pathCoordinates.length > 1 && (
          <Polyline
            coordinates={pathCoordinates}
            strokeColor="#f59e0b"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Checkpoint {currentCheckpointIndex + 1} of {checkpoints.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentCheckpointIndex) / checkpoints.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {currentCheckpoint && (
          <>
            <Text style={styles.checkpointName}>{currentCheckpoint.name}</Text>
            <Text style={styles.checkpointDescription}>
              {currentCheckpoint.description}
            </Text>

            {distanceToNext !== null && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>Distance to checkpoint:</Text>
                <Text style={styles.distanceValue}>
                  {distanceToNext < 1000
                    ? `${Math.round(distanceToNext)}m`
                    : `${(distanceToNext / 1000).toFixed(2)}km`}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitButtonText}>Quit Quest</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tracking Indicator */}
      {isTracking && (
        <View style={styles.trackingIndicator}>
          <View style={styles.trackingDot} />
          <Text style={styles.trackingText}>Tracking...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerCurrent: {
    backgroundColor: '#2563eb',
  },
  markerCompleted: {
    backgroundColor: '#22c55e',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  checkpointName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  checkpointDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 16,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quitButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  trackingIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#22c55e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  trackingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
