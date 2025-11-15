import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Quest = {
  questId: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  estimatedDuration: number;
  totalDistance: number;
  checkpoints: any[];
  xpReward: number;
};

type QuestListScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function QuestListScreen({ navigation }: QuestListScreenProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchQuests();
  }, []);

  useEffect(() => {
    filterQuests();
  }, [searchQuery, selectedDifficulty, quests]);

  const fetchQuests = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // TODO: Implement quest API call
      // const response = await questAPI.getQuests();
      // setQuests(response.data);

      // Mock data
      const mockQuests: Quest[] = [
        {
          questId: '1',
          title: 'Historic Downtown Adventure',
          description: 'Explore the historic downtown area and discover hidden gems',
          difficulty: 'EASY',
          estimatedDuration: 60,
          totalDistance: 2.5,
          checkpoints: [{}, {}, {}],
          xpReward: 100,
        },
        {
          questId: '2',
          title: 'Mountain Trail Challenge',
          description: 'Conquer the mountain trail with breathtaking views',
          difficulty: 'HARD',
          estimatedDuration: 180,
          totalDistance: 8.5,
          checkpoints: [{}, {}, {}, {}, {}],
          xpReward: 500,
        },
        {
          questId: '3',
          title: 'City Park Scavenger Hunt',
          description: 'Find hidden treasures in the city park',
          difficulty: 'MEDIUM',
          estimatedDuration: 90,
          totalDistance: 3.2,
          checkpoints: [{}, {}, {}, {}],
          xpReward: 250,
        },
      ];

      setTimeout(() => {
        setQuests(mockQuests);
        setIsLoading(false);
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterQuests = () => {
    let filtered = quests;

    if (searchQuery) {
      filtered = filtered.filter(
        (quest) =>
          quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quest.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDifficulty !== 'ALL') {
      filtered = filtered.filter((quest) => quest.difficulty === selectedDifficulty);
    }

    setFilteredQuests(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '#22c55e';
      case 'MEDIUM':
        return '#f59e0b';
      case 'HARD':
        return '#ef4444';
      case 'EXPERT':
        return '#a855f7';
      default:
        return '#666';
    }
  };

  const renderQuestCard = ({ item }: { item: Quest }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('QuestDetail', { questId: item.questId })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>📍 {item.checkpoints.length}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>⏱️ {item.estimatedDuration}m</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>🗺️ {item.totalDistance}km</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>⭐ {item.xpReward} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search quests..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Difficulty Filter */}
      <View style={styles.filterContainer}>
        {['ALL', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((difficulty) => (
          <TouchableOpacity
            key={difficulty}
            style={[
              styles.filterButton,
              selectedDifficulty === difficulty && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedDifficulty(difficulty)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedDifficulty === difficulty && styles.filterButtonTextActive,
              ]}
            >
              {difficulty}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quest List */}
      <FlatList
        data={filteredQuests}
        renderItem={renderQuestCard}
        keyExtractor={(item) => item.questId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchQuests(true)}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quests found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
