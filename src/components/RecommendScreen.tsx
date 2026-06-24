import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { ArrowLeft, MapPin, Target } from 'lucide-react-native';
import { aiApi } from '../apis/ai';
import { memberApi } from '../apis/member';

export function RecommendScreen({ navigation }: any) {
  const [region, setRegion] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isFetchingInfo, setIsFetchingInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await memberApi.getMypage();
        if (response?.data?.location) {
          const fetchedRegion = response.data.location.sigungu || '진천군';
          setRegion(fetchedRegion);
        }
      } catch (error) {
        console.log("사용자 정보 로딩 실패, 기본값 사용");
        setRegion('진천군');
      } finally {
        setIsFetchingInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleRecommendRequest = async () => {
    if (!region.trim()) {
      Alert.alert("알림", "지역 정보를 입력해 주세요.");
      return;
    }
    if (!purpose.trim()) {
      Alert.alert("알림", "농사 목적이나 상황을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = { region: region.trim(), purpose: purpose.trim() };
      const response = await aiApi.recommendCrop(requestData);

      let cropList = [];
      if (response.recommendedCrops) {
        cropList = response.recommendedCrops;
      } else if (Array.isArray(response)) {
        cropList = response; 
      } else {
        cropList = [response]; 
      }

      navigation.navigate('MainTabs', { crops: cropList });

    } catch (error) {
      Alert.alert("오류", "데이터를 가져오는데 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetchingInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 12, color: '#666' }}>내 농장 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI 작물 추천 설정</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageDescription}>
            성공적인 농사를 위해{'\n'}지역 환경과 목적을 알려주세요 🌱
          </Text>


          <View style={styles.inputSection}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>재배 지역</Text>
            </View>
            <Text style={styles.inputHint}>* 가입하신 주소를 기반으로 불러왔습니다. 수정도 가능해요.</Text>
            <TextInput
              style={styles.textInput}
              value={region}
              onChangeText={setRegion}
              placeholder="예: 청주시, 진천군"
              editable={!isSubmitting}
            />
          </View>

          {/* 2. 목적 입력 */}
          <View style={styles.inputSection}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>재배 목적 및 상황</Text>
            </View>
            <Text style={styles.inputHint}>* 구체적일수록 AI가 더 정확하게 추천해 드립니다.</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="예: 주말에만 방문하는 텃밭이에요. 물을 자주 안 줘도 되고 아이들이 좋아할 만한 작물이 있을까요?"
              multiline
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>
        </ScrollView>

        {/* 하단 고정 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleRecommendRequest}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>내 환경에 맞는 작물 추천받기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  pageDescription: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', lineHeight: 32, marginBottom: 32 },
  inputSection: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  inputHint: { fontSize: 12, color: '#888', marginBottom: 12 },
  textInput: {
    backgroundColor: '#F9F9FB',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: { minHeight: 120, paddingTop: 16 },
  bottomButtonContainer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  submitButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#A5D6A7' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});