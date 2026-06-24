import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Star,
  Thermometer,
  Droplets,
  Sun,
  BookOpen,
  Heart,
  MessageSquare,
} from 'lucide-react-native';

interface CropDetailScreenProps {
  route: any;
  navigation: any;
}

export function CropDetailScreen({ route, navigation }: CropDetailScreenProps) {
  // 웹의 useParams() 대신 RN의 route.params 사용
  const { id } = route?.params || { id: '1' };
  const [isFavorite, setIsFavorite] = useState(false);

  const cropData: Record<string, any> = {
    '1': {
      name: '방울토마토',
      match: 95,
      emoji: '🍅',
      whyFit: '청주시의 온화한 기후와 양토는 방울토마토 재배에 최적입니다. 적절한 일조량과 배수가 잘 되는 토양이 풍성한 수확을 보장합니다.',
      temperature: '20-25°C',
      water: '주 2-3회',
      sunlight: '하루 6-8시간',
      steps: [
        { title: '모종 심기', desc: '30cm 간격으로 심어주세요' },
        { title: '지지대 설치', desc: '키가 크면 지지대가 필요해요' },
        { title: '물 주기', desc: '흙이 마르면 충분히 주세요' },
        { title: '수확', desc: '빨갛게 익으면 수확하세요' },
      ],
    },
    '2': {
      name: '상추',
      match: 92,
      emoji: '🥬',
      whyFit: '상추는 사계절 재배가 가능하며, 청주 지역의 기후에 잘 적응합니다. 초보자도 쉽게 키울 수 있어요.',
      temperature: '15-20°C',
      water: '매일',
      sunlight: '하루 4-6시간',
      steps: [
        { title: '씨앗 뿌리기', desc: '얇게 흙을 덮어주세요' },
        { title: '물 주기', desc: '매일 아침 물을 주세요' },
        { title: '솎아내기', desc: '너무 빽빽하면 간격 조정' },
        { title: '수확', desc: '바깥 잎부터 따세요' },
      ],
    },
  };

  const crop = cropData[id] || cropData['1'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>작물 상세</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsFavorite(!isFavorite)}
          style={styles.iconButton}
        >
          <Heart
            size={20}
            color={isFavorite ? '#FF5252' : '#666'}
            fill={isFavorite ? '#FF5252' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* 스크롤 가능한 본문 영역 */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Crop Image Container */}
        <View style={styles.imageContainer}>
          <View style={styles.emojiBackground}>
            <Text style={styles.emojiText}>{crop.emoji}</Text>
            <View style={styles.matchBadge}>
              <Star size={14} color="#FFF" fill="#FFF" />
              <Text style={styles.matchBadgeText}>{crop.match}% 적합!</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.cropName}>{crop.name}</Text>

          {/* Card 1: Why it fits */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Star size={16} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>왜 나한테 맞을까요?</Text>
            </View>
            <Text style={styles.cardDescription}>{crop.whyFit}</Text>
          </View>

          {/* Card 2: Growing Environment */}
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
                <View>
                  <Text style={styles.envLabel}>온도</Text>
                  <Text style={styles.envValue}>{crop.temperature}</Text>
                </View>
              </View>

              <View style={styles.envItem}>
                <View style={[styles.iconCircleLarge, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                  <Droplets size={20} color="#2196F3" />
                </View>
                <View>
                  <Text style={styles.envLabel}>물 주기</Text>
                  <Text style={styles.envValue}>{crop.water}</Text>
                </View>
              </View>

              <View style={styles.envItem}>
                <View style={[styles.iconCircleLarge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                  <Sun size={20} color="#FF9800" />
                </View>
                <View>
                  <Text style={styles.envLabel}>햇빛</Text>
                  <Text style={styles.envValue}>{crop.sunlight}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card 3: How to Grow */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <BookOpen size={16} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>키우는 방법</Text>
            </View>
            
            <View style={styles.stepList}>
              {crop.steps.map((step: any, idx: number) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 액션 버튼 */}
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.outlineButton]}
          onPress={() => navigation.navigate('Chatbot')}
        >
          <MessageSquare size={20} color="#4CAF50" />
          <Text style={styles.outlineButtonText}>챗봇에 물어보기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'FarmDiary' })}
        >
          <Text style={styles.primaryButtonText}>내 농부일지에 추가하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEE',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 160 }, // 하단 버튼에 가려지지 않도록 여유 공간 확보
  imageContainer: { padding: 24, paddingBottom: 16 },
  emojiBackground: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emojiText: { fontSize: 80 },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  matchBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  contentContainer: { paddingHorizontal: 24 },
  cropName: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
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
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  stepTextContainer: { flex: 1, justifyContent: 'center' },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 4 },
  stepDesc: { fontSize: 12, color: '#666' },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEE',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // iOS Home Indicator 대응
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#4CAF50' },
  primaryButton: { backgroundColor: '#4CAF50' },
  outlineButtonText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
