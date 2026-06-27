import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Camera as CameraIcon,
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// 이미 변환된 시트 컴포넌트들
import { CropSelectionSheet } from './CropSelectionSheet';
import { HealthyPlantSheet } from './HealthyPlantSheet';
import { LowConfidenceSheet } from './LowConfidenceSheet';
import { aiApi, AiDiagnosisResponseDto } from '../apis/ai';

type DiagnosisState = 'camera' | 'crop-selection' | 'low-confidence' | 'healthy' | 'result';

const MIN_DIAGNOSIS_CONFIDENCE = 0.9;

export const getDiagnosisState = (result: AiDiagnosisResponseDto): DiagnosisState => {
  if (result.confidence <= MIN_DIAGNOSIS_CONFIDENCE || result.resultType === 'low_confidence') {
    return 'low-confidence';
  }

  if (result.resultType === 'healthy') {
    return 'healthy';
  }

  return 'result';
};

interface DiagnosisScreenProps {
  navigation: any;
}

const getImageFileName = (imageUri: string) => {
  const uriWithoutQuery = imageUri.split('?')[0];
  return uriWithoutQuery.split('/').pop() || 'crop_image.jpg';
};

const getImageContentType = (fileName: string, fallback?: string) => {
  if (fallback) {
    return fallback;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'webp') {
    return 'image/webp';
  }
  if (extension === 'heic') {
    return 'image/heic';
  }
  return 'image/jpeg';
};

const appendImageFile = async (formData: FormData, imageUri: string) => {
  const fileName = getImageFileName(imageUri);

  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const contentType = getImageContentType(fileName, blob.type);
    const file = new File([blob], fileName, { type: contentType });

    formData.append('file', file);
    return;
  }

  formData.append('file', {
    uri: imageUri,
    name: fileName,
    type: getImageContentType(fileName),
  } as any);
};

const formatConfidence = (confidence?: number) => {
  if (typeof confidence !== 'number') {
    return '분석 중';
  }
  return `${Math.round(confidence * 100)}%`;
};

const getConfidenceColor = (confidence?: number) => {
  if (typeof confidence !== 'number') {
    return '#8A8F8A';
  }
  if (confidence >= 0.8) {
    return '#43A047';
  }
  if (confidence >= 0.6) {
    return '#F9A825';
  }
  return '#EF5350';
};

const formatDiseaseName = (value?: string | null) => {
  return value?.replace(/_/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
};

const splitGuideContent = (value?: string | null) => {
  return value?.split('\n').map((line) => line.trim()).filter(Boolean) ?? [];
};

const cleanBulletPrefix = (value: string) => value.replace(/^[-•]\s*/, '').trim();

const takeGuideLines = (value?: string | null, limit = 3) => {
  return splitGuideContent(value)
    .map(cleanBulletPrefix)
    .filter((line) => line && !line.endsWith(':'))
    .slice(0, limit);
};

export function DiagnosisScreen({ navigation }: DiagnosisScreenProps) {
  const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>('camera');
  const [detectionType, setDetectionType] = useState<'pest' | 'disease'>('pest');

  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [serverResult, setServerResult] = useState<AiDiagnosisResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const CROP_LIST = [
    '가지', '감자', '고추', '단호박', '딸기', '마늘', '무', '배', 
    '배추', '벼', '사과', '상추', '수박', '애호박', '양배추', '양파', 
    '오이', '쥬키니호박', '참외', '콩', '토마토', '파', '포도', '호박'
  ];

  const handleRealCapture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.8, skipProcessing: false };
        const photo = await cameraRef.current.takePictureAsync(options);
        
        if (photo && photo.uri) {
          setSelectedImageUri(photo.uri);
          setDiagnosisState('crop-selection');
        }
      } catch (error) {
        console.error('사진 촬영 실패:', error);
        Alert.alert('오류', '사진을 촬영하는 중 문제가 발생했습니다.');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, 
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
        setDiagnosisState('crop-selection');
      }
    } catch (error) {
      console.error('갤러리 접근 실패:', error);
      Alert.alert('오류', '이미지를 불러오는 중 문제가 발생했습니다.');
    }
  };

  const uploadAndDiagnose = async (cropName: string, imageUri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('crop_name', cropName);
      formData.append('topk', '5');
      await appendImageFile(formData, imageUri);

      const data = await aiApi.diagnoseCrop(formData);

      if (data && data.status === 'success') {
        setServerResult(data);
        setDiagnosisState(getDiagnosisState(data));
      } else {
          throw new Error('진단에 실패했습니다.');
      }
      } catch (error: any) {
        console.error('진단 에러:', error);
        const errMsg = error.response?.data?.message || error.message || '서버 통신 실패';
        Alert.alert('진단 실패', errMsg);
      } finally {
        setLoading(false);
      }
  };

  const handleSelectCrop = (crop: string) => {
    if (selectedImageUri) {
      uploadAndDiagnose(crop, selectedImageUri);
    } else {
      Alert.alert('오류', '촬영된 이미지가 없습니다. 다시 촬영해주세요.');
      setDiagnosisState('camera'); 
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>작물 진단을 위해 카메라 권한이 필요합니다.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>권한 허용하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 결과 화면 렌더링 ---
  if (diagnosisState === 'result') {
    const guide = serverResult?.guide ?? null;
    const diagnosisName = formatDiseaseName(serverResult?.diagnosis);
    const title = serverResult
      ? `${serverResult.crop} ${diagnosisName || guide?.diseaseName || '진단 결과'}`
      : '진단 결과';
    const confidenceColor = getConfidenceColor(serverResult?.confidence);
    const actionLines = takeGuideLines(guide?.preventionMethod, 4);
    const symptomLines = takeGuideLines(guide?.symptoms, 3);
    const conditionLines = takeGuideLines(guide?.developmentCondition, 3);
    const hasGuideContent = actionLines.length > 0 || symptomLines.length > 0 || conditionLines.length > 0;
    const hasPathogenInfo = Boolean(guide?.pathogenName || guide?.pathogenGroup || guide?.sourceDiseaseName);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => {
                setServerResult(null);
                setDiagnosisState('camera');
              }} 
              style={styles.iconButton}
            >
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>진단 결과</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: selectedImageUri || 'https://images.unsplash.com/photo-1495908333425-29a1e0918c5f?w=800&h=600&fit=crop&auto=format' }}
              style={styles.heroImage}
            />
            <View style={[styles.dangerBadge, { backgroundColor: confidenceColor }]}>
              <Text style={styles.dangerBadgeText}>
                {serverResult ? `신뢰도 ${formatConfidence(serverResult.confidence)}` : '분석 완료'}
              </Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <View style={styles.resultMetaRow}>
              <Text style={styles.resultCropBadge}>{serverResult?.crop ?? guide?.cropName ?? '작물'}</Text>
              {guide?.pathogenGroup ? (
                <Text style={styles.resultTypeBadge}>{guide.pathogenGroup}</Text>
              ) : null}
            </View>
            <Text style={styles.mainTitle}>{title}</Text>
            <Text style={styles.subTitle}>
              {serverResult?.message ?? '진단 결과를 확인해주세요.'}
            </Text>
          </View>

          <View style={[styles.card, styles.guideCard]}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardHeaderTitle}>초보 농부 가이드</Text>
              {guide?.sourceDiseaseName ? (
                <Text style={styles.sourceTag}>{guide.sourceDiseaseName}</Text>
              ) : null}
            </View>

            {hasGuideContent ? (
              <View style={styles.guideContent}>
                {actionLines.length > 0 ? (
                  <View style={styles.primaryGuideBox}>
                    <View style={styles.guideBlockHeader}>
                      <View style={styles.primaryIconCircle}>
                        <Scissors size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.guideBlockTitleWrap}>
                        <Text style={styles.primaryGuideTitle}>
                          {guide?.normal ? '이 상태를 유지해요' : '지금 할 일'}
                        </Text>
                        <Text style={styles.primaryGuideCaption}>가장 먼저 확인하고 실행할 관리 방법이에요.</Text>
                      </View>
                    </View>
                    <View style={styles.guideBulletList}>
                      {actionLines.map((line, index) => (
                        <Text key={`action-${index}`} style={styles.primaryGuideText}>• {line}</Text>
                      ))}
                    </View>
                  </View>
                ) : null}

                <View style={styles.supportGuideGrid}>
                  {symptomLines.length > 0 ? (
                    <View style={styles.supportGuideBox}>
                      <View style={styles.supportGuideHeader}>
                        <View style={styles.iconCircle}>
                          <Droplets size={18} color="#4CAF50" />
                        </View>
                        <Text style={styles.guideItemTitle}>판단 근거</Text>
                      </View>
                      {symptomLines.map((line, index) => (
                        <Text key={`symptom-${index}`} style={styles.supportGuideText}>{line}</Text>
                      ))}
                    </View>
                  ) : null}

                  {conditionLines.length > 0 ? (
                    <View style={styles.supportGuideBox}>
                      <View style={styles.supportGuideHeader}>
                        <View style={styles.iconCircle}>
                          <BookOpen size={18} color="#4CAF50" />
                        </View>
                        <Text style={styles.guideItemTitle}>주의할 환경</Text>
                      </View>
                      {conditionLines.map((line, index) => (
                        <Text key={`condition-${index}`} style={styles.supportGuideText}>{line}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyGuideText}>
                아직 이 진단 결과에 연결된 상세 가이드가 없습니다. 챗봇에게 증상을 함께 물어보세요.
              </Text>
            )}
          </View>

          {hasPathogenInfo ? (
            <View style={[styles.card, styles.detailCard]}>
              <View style={styles.warningHeader}>
                <AlertTriangle size={22} color="#FF9800" />
                <Text style={styles.warningTitle}>병해 정보</Text>
              </View>

              {guide?.sourceDiseaseName ? (
                <View style={styles.pathogenInfoRow}>
                  <Text style={styles.pathogenLabel}>병명</Text>
                  <Text style={styles.pathogenValue}>{guide.sourceDiseaseName}</Text>
                </View>
              ) : null}
              {guide?.pathogenGroup ? (
                <View style={styles.pathogenInfoRow}>
                  <Text style={styles.pathogenLabel}>분류</Text>
                  <Text style={styles.pathogenValue}>{guide.pathogenGroup}</Text>
                </View>
              ) : null}
              {guide?.pathogenName ? (
                <View style={styles.pathogenInfoRow}>
                  <Text style={styles.pathogenLabel}>병원체</Text>
                  <Text style={styles.pathogenValue}>{guide.pathogenName}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.bottomActionContainer}>
          <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => navigation.navigate('Chatbot')}>
            <MessageSquare size={20} color="#4CAF50" />
            <Text style={styles.outlineButtonText}>챗봇에게 질문하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.navigate('FarmDiary')}>
            <Text style={styles.primaryButtonText}>일지에 진단 기록 저장</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} facing="back">

        <SafeAreaView style={styles.cameraTopBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cameraIconButton}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>병해 진단</Text>
          <TouchableOpacity style={styles.cameraIconButton}>
            <Zap size={20} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.overlayContent}>
          <Text style={styles.cameraInstruction}>잎을 프레임 안에 맞춰주세요</Text>

          {/* Frame UI */}
          <View style={styles.frameWrapper}>
            <View style={styles.frameInner}>
              <CameraIcon size={48} color="rgba(76, 175, 80, 0.4)" />
            </View>
            <View style={[styles.frameCorner, styles.topLeft]} />
            <View style={[styles.frameCorner, styles.topRight]} />
            <View style={[styles.frameCorner, styles.bottomLeft]} />
            <View style={[styles.frameCorner, styles.bottomRight]} />
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.subCamBtn} onPress={pickImage}>
              <ImageIcon size={26} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRealCapture} style={styles.captureBtn}>
              <CameraIcon size={36} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.subCamBtn}>
              <Zap size={26} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>AI 작물 분석 중입니다...</Text>
        </View>
      )}

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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 24 },
  permissionText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  permissionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  overlayContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 24, paddingBottom: 160 },
  heroImageContainer: { borderRadius: 20, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  heroImage: { width: '100%', height: 256 },
  dangerBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#FF9800', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dangerBadgeText: { color: '#FFF', fontWeight: 'bold' },
  titleSection: { marginBottom: 24 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  subTitle: { fontSize: 14, color: '#666', lineHeight: 21 },
  resultMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  resultCropBadge: { backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: 13, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  resultTypeBadge: { backgroundColor: '#F7F7F2', color: '#5F665D', fontSize: 13, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  card: { borderWidth: 2, borderRadius: 20, padding: 20, marginBottom: 16 },
  guideCard: { backgroundColor: '#F6FAEF', borderColor: '#CFE8C9' },
  detailCard: { backgroundColor: '#FFF8EC', borderColor: '#FFD38A' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  sourceTag: { flexShrink: 1, backgroundColor: '#FFFFFF', color: '#4CAF50', fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, overflow: 'hidden' },
  guideContent: { gap: 12 },
  primaryGuideBox: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.18)' },
  guideBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  guideBlockTitleWrap: { flex: 1 },
  primaryIconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50' },
  primaryGuideTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 3 },
  primaryGuideCaption: { fontSize: 12, color: '#7A8278', lineHeight: 17 },
  guideBulletList: { gap: 5 },
  primaryGuideText: { fontSize: 13, color: '#4E554D', lineHeight: 20 },
  supportGuideGrid: { gap: 10 },
  supportGuideBox: { backgroundColor: 'rgba(255, 255, 255, 0.72)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.12)' },
  supportGuideHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  supportGuideText: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 4 },
  guideList: { gap: 16 },
  guideItem: { flexDirection: 'row', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(76, 175, 80, 0.14)' },
  guideTextContainer: { flex: 1 },
  guideItemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#000' },
  guideItemDesc: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 2 },
  emptyGuideText: { fontSize: 14, color: '#777', lineHeight: 21 },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  warningTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  pathogenBox: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255, 152, 0, 0.18)' },
  pathogenInfoRow: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255, 152, 0, 0.18)' },
  pathogenLabel: { fontSize: 12, color: '#8A6D3B', fontWeight: '700', marginBottom: 4 },
  pathogenValue: { fontSize: 14, color: '#222', fontWeight: '600', lineHeight: 20 },
  detailSection: { backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 14, padding: 14, marginTop: 10 },
  detailSectionTitle: { fontSize: 14, color: '#111', fontWeight: '700', marginBottom: 8 },
  detailSectionText: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 3 },
  warningInnerCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: 16 },
  warningInnerTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  warningInnerDesc: { fontSize: 12, color: '#666', marginBottom: 12 },
  tipBox: { backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.2)' },
  tipText: { fontSize: 12, fontWeight: '600', color: '#4CAF50' },
  bottomActionContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EAEAEE', paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24, gap: 12 },
  button: { height: 56, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#4CAF50' },
  primaryButton: { backgroundColor: '#4CAF50' },
  outlineButtonText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraTopBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, zIndex: 10 },
  cameraIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cameraTitle: { color: '#FFF', fontSize: 18, fontWeight: '500' },
  cameraInstruction: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500', marginBottom: 20, zIndex: 10 },
  frameWrapper: { position: 'relative', width: 288, height: 288, marginBottom: 20 },
  frameInner: { flex: 1, borderWidth: 4, borderColor: 'rgba(76, 175, 80, 0.8)', borderStyle: 'dashed', borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  frameCorner: { position: 'absolute', width: 32, height: 32, borderColor: '#4CAF50' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  cameraControls: { flexDirection: 'row', alignItems: 'center', gap: 24, zIndex: 10 },
  subCamBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loadingText: { color: '#FFF', marginTop: 16, fontSize: 16, fontWeight: '500' },
});
