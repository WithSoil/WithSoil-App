import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Thermometer,
  Droplet,
  Clock,
  AlertTriangle,
  CheckCircle,
  Sprout,
  Heart,
  MessageSquare,
  Sun,
  BookOpen,
  Star
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
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>작물 상세</Text>
        </View>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.iconButton}>
          <Heart size={20} color={isFavorite ? '#FF5252' : '#666'} fill={isFavorite ? '#FF5252' : 'transparent'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 상단 이미지 영역 */}
        <View style={styles.imageContainer}>
          <View style={styles.emojiBackground}>
            <Sprout size={80} color="#4CAF50" />
            <View style={styles.matchBadge}>
              <Star size={14} color="#FFF" fill="#FFF" />
              <Text style={styles.matchBadgeText}>{cropData.recommendScore}% 적합!</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.cropName}>{cropData.cropName}</Text>

          {/* AI 분석 사유 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Star size={16} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>{cropData.aiReasonTitle}</Text>
            </View>
            <Text style={styles.cardDescription}>{cropData.aiReasonDetail}</Text>
          </View>

          {/* 재배 환경 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Thermometer size={16} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>재배 환경</Text>
            </View>
            <View style={styles.envList}>
              <View style={styles.envItem}>
                <View style={[styles.iconCircleLarge, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
                  <Thermometer size={20} color="#F44336" />
                </View>
                <View><Text style={styles.envLabel}>온도</Text><Text style={styles.envValue}>{cropData.optimalTemp}</Text></View>
              </View>
              <View style={styles.envItem}>
                <View style={[styles.iconCircleLarge, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                  <Droplet size={20} color="#2196F3" />
                </View>
                <View><Text style={styles.envLabel}>토양 산도</Text><Text style={styles.envValue}>{cropData.soilPh}</Text></View>
              </View>
              <View style={styles.envItem}>
                <View style={[styles.iconCircleLarge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                  <Clock size={20} color="#FF9800" />
                </View>
                <View><Text style={styles.envLabel}>재배 기간</Text><Text style={styles.envValue}>{cropData.cultivationPeriod}</Text></View>
              </View>
            </View>
          </View>

          {/* 농작업 단계 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <BookOpen size={16} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>주요 농작업</Text>
            </View>
            <View style={styles.stepList}>
              {cropData.mainTasks.map((task, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumberCircle}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                  <View style={styles.stepTextContainer}><Text style={styles.stepTitle}>{task}</Text></View>
                </View>
              ))}
            </View>
          </View>

          {/* 주의 요소 */}
          <View style={[styles.card, { marginBottom: 40 }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(211, 47, 47, 0.1)' }]}>
                <AlertTriangle size={16} color="#D32F2F" />
              </View>
              <Text style={[styles.cardTitle, { color: '#D32F2F' }]}>주의 요소</Text>
            </View>
            {cropData.mainRisks.map((risk, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <CheckCircle size={14} color="#D32F2F" style={{ marginRight: 8 }} />
                <Text style={{ color: '#666' }}>{risk}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => navigation.navigate('Chatbot')}>
          <MessageSquare size={20} color="#4CAF50" />
          <Text style={styles.outlineButtonText}>챗봇에 물어보기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.navigate('Logbook')}>
          <Text style={styles.primaryButtonText}>내 농부일지에 추가하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 기존 Mock의 스타일을 그대로 유지하여 적용
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#EAEAEE' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 160 },
  imageContainer: { padding: 24, paddingBottom: 16 },
  emojiBackground: { backgroundColor: '#E8F5E9', borderRadius: 20, padding: 32, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  matchBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, elevation: 4 },
  matchBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  contentContainer: { paddingHorizontal: 24 },
  cropName: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEE', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  cardDescription: { fontSize: 14, color: '#666', lineHeight: 22 },
  envList: { gap: 16 },
  envItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircleLarge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  envLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  envValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  stepList: { gap: 16 },
  stepItem: { flexDirection: 'row', gap: 12 },
  stepNumberCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  stepTextContainer: { flex: 1, justifyContent: 'center' },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#000' },
  bottomActionContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EAEAEE', paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24, gap: 12 },
  button: { height: 56, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#4CAF50' },
  primaryButton: { backgroundColor: '#4CAF50' },
  outlineButtonText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});