import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { 
  ArrowLeft, 
  Thermometer, 
  Droplet, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Sprout
} from 'lucide-react-native';
import { CropRecommendDetailDto } from '../apis/ai';

interface CropDetailScreenProps {
  navigation: any;
  route: {
    params: {
      cropData: CropRecommendDetailDto;
    };
  };
}

export function CropDetailScreen({ navigation, route }: CropDetailScreenProps) {
  const { cropData } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>추천 작물 상세</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 상단: 작물 요약 및 점수 */}
        <View style={styles.topSection}>
          <View style={styles.iconCircle}>
            <Sprout size={48} color="#4CAF50" />
          </View>
          <Text style={styles.cropName}>{cropData.cropName}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>AI 추천 매칭률 {cropData.recommendScore}%</Text>
          </View>
        </View>

        {/* AI 분석 사유 영역 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 {cropData.aiReasonTitle}</Text>
          <Text style={styles.reasonDetail}>{cropData.aiReasonDetail}</Text>
        </View>

        {/* 생육 환경 조건 영역 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>재배 환경</Text>
          
          <View style={styles.envRow}>
            <View style={styles.envItem}>
              <View style={styles.envIconBox}><Sprout size={20} color="#4CAF50" /></View>
              <Text style={styles.envLabel}>난이도</Text>
              <Text style={styles.envValue}>{cropData.difficultyLevel}</Text>
            </View>
            <View style={styles.envItem}>
              <View style={styles.envIconBox}><Clock size={20} color="#FF9800" /></View>
              <Text style={styles.envLabel}>재배 기간</Text>
              <Text style={styles.envValue}>{cropData.cultivationPeriod}</Text>
            </View>
          </View>

          <View style={[styles.envRow, { marginTop: 16 }]}>
            <View style={styles.envItem}>
              <View style={styles.envIconBox}><Thermometer size={20} color="#F44336" /></View>
              <Text style={styles.envLabel}>적정 온도</Text>
              <Text style={styles.envValue}>{cropData.optimalTemp}</Text>
            </View>
            <View style={styles.envItem}>
              <View style={styles.envIconBox}><Droplet size={20} color="#2196F3" /></View>
              <Text style={styles.envLabel}>토양 산도</Text>
              <Text style={styles.envValue}>{cropData.soilPh}</Text>
            </View>
          </View>
        </View>

        {/* 주요 농작업 영역 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>주요 농작업</Text>
          {cropData.mainTasks.map((task, index) => (
            <View key={index} style={styles.listItem}>
              <CheckCircle size={18} color="#4CAF50" style={{ marginTop: 2 }} />
              <Text style={styles.listText}>{task}</Text>
            </View>
          ))}
        </View>

        {/* 주의할 위험 요소 영역 */}
        <View style={[styles.card, { marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: '#D32F2F' }]}>주의 요소</Text>
          {cropData.mainRisks.map((risk, index) => (
            <View key={index} style={styles.listItem}>
              <AlertTriangle size={18} color="#D32F2F" style={{ marginTop: 2 }} />
              <Text style={styles.listText}>{risk}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEE',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 20 },
  
  topSection: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  cropName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  scoreBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  scoreText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  reasonDetail: { fontSize: 15, color: '#555', lineHeight: 24 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  
  envRow: { flexDirection: 'row', gap: 12 },
  envItem: { flex: 1, backgroundColor: '#F9F9FB', padding: 12, borderRadius: 12 },
  envIconBox: { marginBottom: 8 },
  envLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  envValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 8 },
  listText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },
});