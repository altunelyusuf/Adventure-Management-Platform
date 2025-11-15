import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

type Checkpoint = {
  checkpointId: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  order: number;
  hint?: string;
};

type Quest = {
  questId: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  estimatedDuration: number;
  totalDistance: number;
  xpReward: number;
  checkpoints: Checkpoint[];
  creator?: { firstName: string; lastName: string };
  tags?: string[];
};

type QuestDetailScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { questId: string } };
};

export default function QuestDetailScreen({ navigation, route }: QuestDetailScreenProps) {
  const { questId } = route.params;
  const [quest, setQuest] = useState<Quest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuestDetails();
  }, [questId]);

  const fetchQuestDetails = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement quest detail API call
      // const response = await questAPI.getQuest(questId);
      // setQuest(response.data);

      // Mock data
      const mockQuest: Quest = {
        questId,
        title: 'Historic Downtown Adventure',
        description:
          'Explore the historic downtown area and discover hidden gems. This quest takes you through the most iconic landmarks and secret spots known only to locals.',
        difficulty: 'EASY',
        estimatedDuration: 60,
        totalDistance: 2.5,
        xpReward: 100,
        creator: { firstName: 'John', lastName: 'Doe' },
        tags: ['historic', 'walking', 'urban'],
        checkpoints: [
          {
            checkpointId: '1',
            name: 'Central Plaza',
            description: 'Start your journey at the iconic central plaza',
            latitude: 37.7749,
            longitude: -122.4194,
            order: 0,
            hint: 'Look for the fountain',
          },
          {
            checkpointId: '2',
            name: 'Historic Museum',
            description: 'Visit the historic museum',
            latitude: 37.7759,
            longitude: -122.4184,
            order: 1,
          },
          {
            checkpointId: '3',
            name: 'City Hall',
            description: 'Marvel at the architecture of City Hall',
            latitude: 37.7769,
            longitude: -122.4174,
            order: 2,
          },
        ],
      };

      setTimeout(() => {
        setQuest(mockQuest);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch quest:', error);
      setIsLoading(false);
    }
  };

  const handleStartQuest = () => {
    navigation.navigate('QuestTracking', { questId: quest?.questId });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!quest) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Quest not found</Text>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '#22c55e';
      case 'MEDIUM': return '#f59e0b';
      case 'HARD': return '#ef4444';
      case 'EXPERT': return '#a855f7';
      default: return '#666';
    }
  };

  const mapCoordinates = quest.checkpoints.map((cp) => ({
    latitude: cp.latitude,
    longitude: cp.longitude,
  }));

  const initialRegion = {
    latitude: quest.checkpoints[0]?.latitude || 37.7749,
    longitude: quest.checkpoints[0]?.longitude || -122.4194,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
          >
            {quest.checkpoints.map((checkpoint, index) => (
              <Marker
                key={checkpoint.checkpointId}
                coordinate={{
                  latitude: checkpoint.latitude,
                  longitude: checkpoint.longitude,
                }}
                title={checkpoint.name}
                description={checkpoint.description}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.markerNumber}>
                    <Text style={styles.markerText}>{index + 1}</Text>
                  </View>
                </View>
              </Marker>
            ))}
            {mapCoordinates.length > 1 && (
              <Polyline
                coordinates={mapCoordinates}
                strokeColor="#2563eb"
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>

        {/* Quest Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{quest.title}</Text>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(quest.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{quest.difficulty}</Text>
            </View>
          </View>

          <Text style={styles.description}>{quest.description}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>📍</Text>
              <Text style={styles.statValue}>{quest.checkpoints.length}</Text>
              <Text style={styles.statLabel}>Checkpoints</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>{quest.estimatedDuration}m</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>🗺️</Text>
              <Text style={styles.statValue}>{quest.totalDistance}km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{quest.xpReward}</Text>
              <Text style={styles.statLabel}>XP Reward</Text>
            </View>
          </View>

          {/* Creator */}
          {quest.creator && (
            <View style={styles.creatorContainer}>
              <Text style={styles.creatorLabel}>Created by</Text>
              <Text style={styles.creatorName}>
                {quest.creator.firstName} {quest.creator.lastName}
              </Text>
            </View>
          )}

          {/* Tags */}
          {quest.tags && quest.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {quest.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Checkpoints */}
          <Text style={styles.sectionTitle}>Checkpoints</Text>
          {quest.checkpoints.map((checkpoint, index) => (
            <View key={checkpoint.checkpointId} style={styles.checkpoint}>
              <View style={styles.checkpointNumber}>
                <Text style={styles.checkpointNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.checkpointContent}>
                <Text style={styles.checkpointName}>{checkpoint.name}</Text>
                <Text style={styles.checkpointDescription}>
                  {checkpoint.description}
                </Text>
                {checkpoint.hint && (
                  <Text style={styles.checkpointHint}>💡 Hint: {checkpoint.hint}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Start Quest Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartQuest}>
          <Text style={styles.startButtonText}>Start Quest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    height: 250,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerNumber: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  checkpoint: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkpointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkpointNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkpointContent: {
    flex: 1,
  },
  checkpointName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  checkpointDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  checkpointHint: {
    fontSize: 12,
    color: '#2563eb',
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
