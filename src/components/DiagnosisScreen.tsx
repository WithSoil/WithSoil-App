import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  Camera,
  Image as ImageIcon,
  Zap,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  Share2,
  X,
  Droplets,
  Scissors,
  BookOpen,
} from 'lucide-react-native';

// 이미 변환된 시트 컴포넌트들
import { CropSelectionSheet } from './CropSelectionSheet';
import { HealthyPlantSheet } from './HealthyPlantSheet';
import { LowConfidenceSheet } from './LowConfidenceSheet';
// import { LowConfidenceSheet } from './LowConfidenceSheet'; // 업로드 대기 중인 파일

type DiagnosisState = 'camera' | 'crop-selection' | 'low-confidence' | 'healthy' | 'result';

interface DiagnosisScreenProps {
  navigation: any;
}

export function DiagnosisScreen({ navigation }: DiagnosisScreenProps) {
  const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>('camera');
  const [detectionType, setDetectionType] = useState<'pest' | 'disease'>('pest');

  const handleCapture = (state: DiagnosisState) => {
    setDiagnosisState(state);
  };

  const handleSelectCrop = (crop: string) => {
    setDiagnosisState('result');
  };

  // --- 결과 화면 렌더링 ---
  if (diagnosisState === 'result') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Top App Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setDiagnosisState('camera')} style={styles.iconButton}>
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>진단 결과</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1495908333425-29a1e0918c5f?w=800&h=600&fit=crop&auto=format' }}
              style={styles.heroImage}
            />
            <View style={styles.dangerBadge}>
              <Text style={styles.dangerBadgeText}>위험도: 중간</Text>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>토마토 담배가루이</Text>
            <Text style={styles.subTitle}>작은 흰색 날개를 가진 해충으로 잎 뒷면에 서식합니다</Text>
          </View>

          {/* LLM Summary Card */}
          <View style={[styles.card, { backgroundColor: '#F5F5DC', borderColor: '#D7CCC8' }]}>
            <Text style={styles.cardHeaderTitle}>👩‍🌾 초보 농부 가이드</Text>
            
            <View style={styles.guideList}>
              <View style={styles.guideItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                  <Scissors size={20} color="#4CAF50" />
                </View>
                <View style={styles.guideTextContainer}>
                  <Text style={styles.guideItemTitle}>감염된 잎 제거</Text>
                  <Text style={styles.guideItemDesc}>피해 입은 잎을 조심스럽게 잘라내고 봉투에 버려주세요</Text>
                </View>
              </View>
              
              <View style={styles.guideItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                  <Droplets size={20} color="#4CAF50" />
                </View>
                <View style={styles.guideTextContainer}>
                  <Text style={styles.guideItemTitle}>친환경 살충제 사용</Text>
                  <Text style={styles.guideItemDesc}>님 오일이나 칼륨 비누를 5-7일 간격으로 뿌려주세요</Text>
                </View>
              </View>

              <View style={styles.guideItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                  <BookOpen size={20} color="#4CAF50" />
                </View>
                <View style={styles.guideTextContainer}>
                  <Text style={styles.guideItemTitle}>예방 관리</Text>
                  <Text style={styles.guideItemDesc}>주 1회 잎 뒷면을 확인하고 황색 끈끈이 트랩을 설치하세요</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Warning Card */}
          <View style={[styles.card, { backgroundColor: '#FFF3E0', borderColor: '#FFB74D' }]}>
            <View style={styles.warningHeader}>
              <AlertTriangle size={24} color="#FF9800" />
              <Text style={styles.warningTitle}>⚠️ 2차 피해 주의</Text>
            </View>
            <View style={styles.warningInnerCard}>
              <Text style={styles.warningInnerTitle}>토마토황화잎말림병 (TYLCV) 위험</Text>
              <Text style={styles.warningInnerDesc}>담배가루이가 바이러스를 옮겨 잎이 노랗게 변하고 말릴 수 있습니다.</Text>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 예방 TIP: 해충 발견 즉시 방제하고 주변 잡초를 제거하세요</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View style={styles.bottomActionContainer}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => navigation.navigate('Chatbot')}
          >
            <MessageSquare size={20} color="#4CAF50" />
            <Text style={styles.outlineButtonText}>챗봇에게 질문하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('FarmDiary')}
          >
            <Text style={styles.primaryButtonText}>일지에 진단 기록 저장</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- 카메라 화면 렌더링 ---
  return (
    <View style={styles.cameraContainer}>
      {/* Top Bar (Absolute) */}
      <SafeAreaView style={styles.cameraTopBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cameraIconButton}>
          <X size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.cameraTitle}>병해충 진단</Text>
        <TouchableOpacity style={styles.cameraIconButton}>
          <Zap size={20} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>

      <Text style={styles.cameraInstruction}>잎을 프레임 안에 맞춰주세요</Text>

      {/* Frame UI */}
      <View style={styles.frameWrapper}>
        <View style={styles.frameInner}>
          <Camera size={48} color="rgba(76, 175, 80, 0.4)" />
        </View>
        <View style={[styles.frameCorner, styles.topLeft]} />
        <View style={[styles.frameCorner, styles.topRight]} />
        <View style={[styles.frameCorner, styles.bottomLeft]} />
        <View style={[styles.frameCorner, styles.bottomRight]} />
      </View>

      {/* Test Scenario Menu */}
      <View style={styles.testMenuContainer}>
        <View style={styles.testMenu}>
          <Text style={styles.testMenuTitle}>테스트 시나리오</Text>
          <View style={styles.testMenuButtons}>
            <TouchableOpacity onPress={() => handleCapture('low-confidence')} style={styles.testBtn}>
              <Text style={styles.testBtnText}>낮은 확신도</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCapture('healthy')} style={styles.testBtn}>
              <Text style={styles.testBtnText}>건강한 식물</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Camera Controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.subCamBtn}>
          <ImageIcon size={26} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleCapture('crop-selection')} style={styles.captureBtn}>
          <Camera size={36} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.subCamBtn}>
          <Zap size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheets (Modals) */}
      <CropSelectionSheet
        visible={diagnosisState === 'crop-selection'}
        onClose={() => setDiagnosisState('camera')}
        onSelectCrop={handleSelectCrop}
        detectionType={detectionType}
      />

      <HealthyPlantSheet
        visible={diagnosisState === 'healthy'}
        onAskChatbot={() => navigation.navigate('Chatbot')}
        onRetake={() => setDiagnosisState('camera')}
        onClose={() => setDiagnosisState('camera')}
      />

      {/* LowConfidenceSheet는 주석 처리 (구현 시 주석 해제) */}
      <LowConfidenceSheet
        visible={diagnosisState === 'low-confidence'}
        onAskChatbot={() => navigation.navigate('Chatbot')}
        onRetake={() => setDiagnosisState('camera')}
        onClose={() => setDiagnosisState('camera')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // 공통 & 결과 화면 스타일
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
  scrollContent: { padding: 24, paddingBottom: 160 },
  heroImageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroImage: { width: '100%', height: 256 },
  dangerBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dangerBadgeText: { color: '#FFF', fontWeight: 'bold' },
  titleSection: { marginBottom: 24 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  subTitle: { fontSize: 14, color: '#666' },
  card: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#000' },
  guideList: { gap: 16 },
  guideItem: { flexDirection: 'row', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  guideTextContainer: { flex: 1 },
  guideItemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#000' },
  guideItemDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  warningTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  warningInnerCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: 16 },
  warningInnerTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  warningInnerDesc: { fontSize: 12, color: '#666', marginBottom: 12 },
  tipBox: { backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.2)' },
  tipText: { fontSize: 12, fontWeight: '600', color: '#4CAF50' },
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    gap: 12,
  },
  button: { height: 56, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#4CAF50' },
  primaryButton: { backgroundColor: '#4CAF50' },
  outlineButtonText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  // 카메라 화면 스타일
  cameraContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  cameraTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    zIndex: 10,
  },
  cameraIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cameraTitle: { color: '#FFF', fontSize: 18, fontWeight: '500' },
  cameraInstruction: { position: 'absolute', top: 120, color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500', zIndex: 10 },
  frameWrapper: { position: 'relative', width: 288, height: 288 },
  frameInner: { flex: 1, borderWidth: 4, borderColor: 'rgba(76, 175, 80, 0.8)', borderStyle: 'dashed', borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  frameCorner: { position: 'absolute', width: 32, height: 32, borderColor: '#4CAF50' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  testMenuContainer: { position: 'absolute', bottom: 160, left: 16, right: 16, zIndex: 10 },
  testMenu: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  testMenuTitle: { color: '#FFF', fontSize: 12, textAlign: 'center', marginBottom: 8, fontWeight: '500' },
  testMenuButtons: { flexDirection: 'row', gap: 8 },
  testBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  testBtnText: { color: '#FFF', fontSize: 12 },
  cameraControls: { position: 'absolute', bottom: 60, flexDirection: 'row', alignItems: 'center', gap: 24, zIndex: 10 },
  subCamBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
});