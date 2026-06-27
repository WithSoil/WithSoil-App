import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { CropRecommendDetailDto } from '../apis/ai'; 
import { getCropIcon } from '../utils/crop';

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
        {React.createElement(getCropIcon(crop.cropName), { size: 24 })}
        <View style={styles.matchBadge}>
          <Star size={10} color="#FFF" fill="#FFF" />
          <Text style={styles.matchBadgeText}>{Math.round(crop.recommendScore)}%</Text>
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
  cropCard: { 
    width: 112, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#EAEAEE', 
    borderRadius: 20, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cropImageContainer: { 
    height: 75, 
    backgroundColor: '#E8F5E9', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative' 
  },
  cropEmoji: { fontSize: 44 },
  matchBadge: {
    position: 'absolute', 
    top: 6, 
    right: 6, 
    backgroundColor: '#4CAF50',
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 12, 
    gap: 2,
  },
  matchBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cropInfo: { padding: 10, marginBottom: 10, alignItems: 'center' },
  cropName: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  cropSeason: { fontSize: 10, color: '#777' },
});