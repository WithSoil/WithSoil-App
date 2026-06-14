import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Navigation, ChevronRight } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { memberApi } from '../apis/member';
import { AddressSearchModal } from './AddressSearchModel';

interface LocationSetupProps {
  navigation: any;
}

export function LocationSetup({ navigation }: LocationSetupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [locationData, setLocationData] = useState<any>(null);

  const route = useRoute<any>(); 
  const signupParams = route.params;

  const handleAddressSelect = (data: any) => {
    console.log("모달에서 받은 데이터:", data);

    if (!data) return;

    const selectedAddress = data.address || data.roadAddress || '';
    setSearchQuery(selectedAddress);

    let eupMyeonDong = '';
    let ri = '';

    if (data.bname1 && data.bname1 !== '') {
      eupMyeonDong = data.bname1; 
      ri = data.bname; 
    } else {

      eupMyeonDong = data.bname || ''; 
      ri = '';                         
    }

    setLocationData({
      sido: data.sido || '',
      sigungu: data.sigungu || '',
      eupMyeonDong: eupMyeonDong,
      ri: ri,                 
      latitude: 35.8032, 
      longitude: 126.8801,
    });

    setIsModalVisible(false);
  };

  const handleCompleteSignup = async () => {
    // 1. 회원가입 프로세스로 들어온 경우
    // if (signupParams && !locationData) {
    //   Alert.alert('알림', '농장 위치를 먼저 검색해 주세요.');
    //   return;
    // }

    if (signupParams) {
      const { name, email, password } = signupParams;

      setIsLoading(true);
      try {
        const mockLocation = {
          sido: '전북특별자치도', // 또는 '전라북도' (sido)
          sigungu: '김제시',      // (sigungu)
          eupMyeonDong: '백산면',  // (eupMyeonDong) - optional
          ri: '상정리',            // (ri) - optional
          latitude: 35.8032,       // (latitude)
          longitude: 126.8801,     // (longitude)
        };

        // 백엔드 회원가입 API 호출
        await memberApi.signup({
          email,
          password,
          name,
          location: locationData || mockLocation , // 실제 위치 데이터가 없을 때는 mockLocation 사용
        });

        Alert.alert('성공', '회원가입이 완료되었습니다! 로그인해 주세요.', [
          {
            text: '확인',
            onPress: () => {
              // 가입 완료 후 로그인 화면으로 이동
              navigation.replace('EmailLoginScreen');
            },
          },
        ]);
      } catch (error: any) {
        console.error('회원가입 에러:', error);
        const errorMessage =
          error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해 주세요.';
        Alert.alert('회원가입 실패', errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      // 2. 만약 회원가입을 거치지 않고 들어온 일반 흐름(시뮬레이션 등)일 때는 
      // 기존 기획대로 메인 탭으로 바로 이동합니다.
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>위치 설정</Text>
      </View>

      {/* Map Area (Placeholder) */}
      <View style={styles.mapContainer}>
        {/* Map Center Placeholder */}
        <View style={styles.mapCenterPlaceholder}>
          <MapPin size={48} color="#4CAF50" style={styles.mapPinIcon} />
          <Text style={styles.mapPlaceholderText}>Map view placeholder</Text>
        </View>

        {/* Floating Search Bar */}
        <View style={styles.searchBarContainer}>
          <TouchableOpacity 
            style={styles.searchBar} 
            activeOpacity={0.8}
            onPress={() => setIsModalVisible(true)}
          >
            <MapPin size={20} color="#888" />
            <Text style={[styles.searchInput, { color: searchQuery ? '#000' : '#888' }]}>
              {searchQuery || "지역 검색 (터치하여 검색)"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Section */}
      <View style={styles.bottomSheet}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        <Text style={styles.sheetTitle}>농장 위치 설정</Text>
        <Text style={styles.sheetDescription}>
          지역 기후와 토양 조건에 맞는 작물을 추천해드립니다.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCompleteSignup}
            activeOpacity={0.8}
          >
            <Navigation size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>현재 위치 사용하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleCompleteSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>계속하기</Text>
            <ChevronRight size={20} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>
      <AddressSearchModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelected={handleAddressSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  mapCenterPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinIcon: {
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#888',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 48,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    height: '100%',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20, // 안드로이드 상단 그림자
  },
  handleBar: {
    width: 48,
    height: 6,
    backgroundColor: '#EAEAEE',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sheetDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  buttonContainer: {
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
  primaryButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5', // 웹의 secondary(muted) 느낌 연출
  },
  secondaryButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
});