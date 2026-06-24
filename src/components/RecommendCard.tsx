import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { CropRecommendDetailDto } from '../apis/ai'; 

interface RecommendCardProps {
  crop: CropRecommendDetailDto;
  onPress: () => void;
}

export const RecommendCard = ({ crop, onPress }: RecommendCardProps) => {
  return (
    <TouchableOpacity
      style={styles.cropCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cropImageContainer}>
        <Text style={styles.cropEmoji}>🌱</Text>
        <View style={styles.matchBadge}>
          <Star size={10} color="#FFF" fill="#FFF" />
          <Text style={styles.matchBadgeText}>{crop.recommendScore}%</Text>
        </View>
      </View>
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{crop.cropName}</Text>
        <Text style={styles.cropSeason}>{crop.difficultyLevel} | {crop.cultivationPeriod}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cropCard: { width: 112, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEE', borderRadius: 20, overflow: 'hidden' },
  cropImageContainer: { height: 80, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cropEmoji: { fontSize: 40 },
  matchBadge: {
    position: 'absolute', top: 4, right: 4, backgroundColor: '#4CAF50',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, gap: 2,
  },
  matchBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cropInfo: { padding: 8 },
  cropName: { fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 2 },
  cropSeason: { fontSize: 10, color: '#888' },
});