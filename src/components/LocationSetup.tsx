import React, { useEffect, useState } from 'react';
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
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { memberApi, MemberLocation } from '../apis/member';
import { FormErrorMessage } from './FormErrorMessage';
import { getErrorStatus } from '../utils/authErrorMessage';
import { getCurrentLocation, getLocationErrorMessage } from '../utils/currentLocation';
import { AddressSearchModal } from './AddressSearchModel';

interface LocationSetupProps {
  navigation: any;
}

const KAKAO_MAP_API_KEY = '585a0d74c620c91802e27770e06d7b8a';

export function LocationSetup({ navigation }: LocationSetupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [locationData, setLocationData] = useState<MemberLocation | null>(null);

  const route = useRoute<any>(); 
  const signupParams = route.params;

  useEffect(() => {
    let active = true;

    const loadCurrentLocation = async () => {
      setIsLoading(true);
      try {
        const current = await getCurrentLocation();
        if (!active) return;
        setLocationData(current.memberLocation);
        setSearchQuery(current.displayAddress);
      } catch (error: unknown) {
        if (active) setErrorMessage(getLocationErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadCurrentLocation();
    return () => {
      active = false;
    };
  }, []);

  const handleAddressSelect = async (data: any) => {
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

    setIsLoading(true);
    try {
      const [coordinates] = await Location.geocodeAsync(selectedAddress);
      if (!coordinates) {
        setErrorMessage('선택한 주소의 지도 위치를 찾지 못했습니다.');
        return;
      }

      setLocationData({
        sido: data.sido || '',
        sigungu: data.sigungu || '',
        eupMyeonDong,
        ri,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      setIsModalVisible(false);
    } catch {
      setErrorMessage('선택한 주소의 지도 위치를 찾지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocationAndContinue = async (location: MemberLocation) => {
    if (!location) {
      setErrorMessage('농장 위치를 먼저 선택하거나 검색해 주세요.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // 회원가입이든 단순 수정이든 서버에 위치를 반영해야 하므로 호출
      await memberApi.updateLocation(location);

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

  const handleUseCurrentLocation = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const current = await getCurrentLocation();
      setLocationData(current.memberLocation);
      setSearchQuery(current.displayAddress);
      await saveLocationAndContinue(current.memberLocation);
    } catch (error: unknown) {
      console.warn('현재 위치 확인 실패:', getErrorStatus(error));
      setErrorMessage(getLocationErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSignup = () => {
    if (!locationData) {
      setErrorMessage('현재 위치를 사용하거나 지역을 먼저 검색해 주세요.');
      return;
    }
    saveLocationAndContinue(locationData);
  };

  const mapHtml = locationData?.latitude != null && locationData?.longitude != null ? `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <style>html,body,#map{width:100%;height:100%;margin:0;padding:0}</style>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}"></script>
    </head><body><div id="map"></div><script>
      var position = new kakao.maps.LatLng(${locationData.latitude}, ${locationData.longitude});
      var map = new kakao.maps.Map(document.getElementById('map'), { center: position, level: 4 });
      new kakao.maps.Marker({ position: position }).setMap(map);
    </script></body></html>
  ` : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>위치 설정</Text>
      </View>

      <View style={styles.mapContainer}>
        {mapHtml ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml, baseUrl: 'http://localhost:8081' }}
            style={styles.map}
            javaScriptEnabled
            domStorageEnabled
          />
        ) : (
          <View style={styles.mapCenterPlaceholder}>
            <MapPin size={48} color="#4CAF50" style={styles.mapPinIcon} />
            <Text style={styles.mapPlaceholderText}>위치를 선택해 주세요</Text>
          </View>
        )}

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
            onPress={handleUseCurrentLocation}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Navigation size={20} color="#FFFFFF" />
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>현재 위치 사용하기</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleCompleteSignup}
            disabled={isLoading}
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
  map: { flex: 1 },
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
