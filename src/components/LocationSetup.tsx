import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Navigation, ChevronRight } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { memberApi } from '../apis/member';
import { FormErrorMessage } from './FormErrorMessage';
import { getErrorStatus } from '../utils/authErrorMessage';
import { AddressSearchModal } from './AddressSearchModel';

interface LocationSetupProps {
  navigation: any;
}

export function LocationSetup({ navigation }: LocationSetupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [locationData, setLocationData] = useState<any>(null);

  const route = useRoute<any>(); 
  const signupParams = route.params;

  const handleAddressSelect = (data: any) => {
    if (!data) return;
    setErrorMessage('');

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

    if (!locationData) {
      alert('농장 위치를 먼저 검색해 주세요.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await memberApi.updateLocation(locationData);

      if (signupParams?.fromSignup) {
        navigation.replace('MainTabs');
      } else {
        alert('농장 위치가 성공적으로 수정되었습니다.');
        navigation.goBack(); 
      }

    } catch (error: unknown) {
      console.warn('위치 저장 실패:', getErrorStatus(error));
      setErrorMessage('위치 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
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

        <FormErrorMessage message={errorMessage} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCompleteSignup}
            activeOpacity={0.8}
          >
            <Navigation size={20} color="#FFFFFF" />
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>현재 위치 사용하기</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleCompleteSignup}
            activeOpacity={0.8}
          >
            {isLoading ? <ActivityIndicator color="#4CAF50" /> : <Text style={styles.secondaryButtonText}>계속하기</Text>}
            {!isLoading && <ChevronRight size={20} color="#333333" />}
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