import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, Star, Clock, MapPin, Share2, Home } from 'lucide-react-native';
import Confetti from 'react-native-confetti';

const { width } = Dimensions.get('window');

type QuestCompletionScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { questId: string } };
};

interface CompletionStats {
  questTitle: string;
  xpEarned: number;
  totalCheckpoints: number;
  completionTime: number;
  totalDistance: number;
  rank: string;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export default function QuestCompletionScreen({
  navigation,
  route,
}: QuestCompletionScreenProps) {
  const { questId } = route.params;
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchCompletionStats();
    startAnimations();
  }, []);

  const fetchCompletionStats = async () => {
    try {
      // TODO: Implement API call
      // const response = await questAPI.getCompletionStats(questId);
      // setStats(response.data);

      // Mock data
      const mockStats: CompletionStats = {
        questTitle: 'Historic Downtown Adventure',
        xpEarned: 250,
        totalCheckpoints: 5,
        completionTime: 45,
        totalDistance: 2.8,
        rank: 'Gold',
        achievements: [
          {
            id: '1',
            title: 'First Quest Complete',
            description: 'Completed your first quest',
            icon: '🎯',
          },
          {
            id: '2',
            title: 'Speed Runner',
            description: 'Completed quest in under 60 minutes',
            icon: '⚡',
          },
          {
            id: '3',
            title: 'Perfect Run',
            description: 'Validated all checkpoints',
            icon: '✨',
          },
        ],
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch completion stats:', error);
    }
  };

  const startAnimations = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share completion');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'gold':
        return '#f59e0b';
      case 'silver':
        return '#9ca3af';
      case 'bronze':
        return '#92400e';
      default:
        return '#2563eb';
    }
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Trophy Animation */}
        <Animated.View
          style={[
            styles.trophyContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.trophyCircle, { backgroundColor: getRankColor(stats.rank) }]}>
            <Trophy color="#fff" size={80} />
          </View>
        </Animated.View>

        {/* Congratulations Text */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.congratsText}>Quest Completed!</Text>
          <Text style={styles.questTitle}>{stats.questTitle}</Text>
          <View style={styles.rankBadge}>
            <Star color="#fff" size={16} />
            <Text style={styles.rankText}>{stats.rank} Rank</Text>
          </View>
        </Animated.View>

        {/* XP Reward */}
        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>Experience Earned</Text>
          <Text style={styles.xpValue}>+{stats.xpEarned} XP</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MapPin color="#2563eb" size={24} />
            </View>
            <Text style={styles.statValue}>{stats.totalCheckpoints}</Text>
            <Text style={styles.statLabel}>Checkpoints</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock color="#10b981" size={24} />
            </View>
            <Text style={styles.statValue}>{stats.completionTime}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Star color="#f59e0b" size={24} />
            </View>
            <Text style={styles.statValue}>{stats.totalDistance}km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>

        {/* Achievements */}
        {stats.achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>🏆 Achievements Unlocked</Text>
            {stats.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 color="#2563eb" size={20} />
            <Text style={styles.shareButtonText}>Share Achievement</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Home color="#fff" size={20} />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Quest Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quest Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completion Rate:</Text>
            <Text style={styles.summaryValue}>100%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Photos Taken:</Text>
            <Text style={styles.summaryValue}>{stats.totalCheckpoints}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Speed:</Text>
            <Text style={styles.summaryValue}>
              {((stats.totalDistance / stats.completionTime) * 60).toFixed(1)} km/h
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  trophyContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  trophyCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  congratsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  xpCard: {
    width: width - 40,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  xpLabel: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 8,
  },
  xpValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  achievementsSection: {
    width: width - 40,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    width: width - 40,
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  shareButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
