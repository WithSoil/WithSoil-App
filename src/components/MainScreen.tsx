import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  MapPin,
  Cloud,
  Droplet,
  Calendar,
  Star,
  MessageSquare,
  Bell,
  Settings,
  ArrowRight,
} from 'lucide-react-native';
import profileImage from '../assets/image.png'; 
import { WebView } from 'react-native-webview';
import { memberApi } from '../apis/member'; // 임의 지정한 API 구조, 팀 구조에 맞게 변경
import { RecommendCard } from './RecommendCard';


interface MainScreenProps {
  navigation: any;
}

const KAKAO_MAP_API_KEY = '585a0d74c620c91802e27770e06d7b8a';

export function MainScreen({ navigation }: MainScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const [memberLocation, setMemberLocation] = useState<any>(null);
  const [recommendedCrops, setRecommendedCrops] = useState<any[]>([]);

  const [mapCoords, setMapCoords] = useState({
    latitude: 36.6358,
    longitude: 127.4914
  });

  useFocusEffect(
    useCallback(() => {
      console.log("=== [DEBUG] useFocusEffect가 작동했습니다! ===");
    const fetchMainData = async () => {
      try {
        setIsLoading(true);
        const response = await memberApi.getMypage(); 
        console.log(">>> 백엔드에서 온 전체 응답 데이터:", JSON.stringify(response, null, 2));
        
        if (response?.data) {
          const data = response.data;
          console.log(">>> response.data 안에 들어있는 키값들:", Object.keys(data));
          const { location, recommendations } = response.data;
          
          setMemberLocation(location);
          
          if (recommendations && recommendations.length > 0) {
              setRecommendedCrops(recommendations);
            } else {
              setRecommendedCrops([]);
          }
          
          if (location?.latitude && location?.longitude) {
            setMapCoords({
              latitude: Number(location.latitude),
              longitude: Number(location.longitude)
            });
          }
        }
      } catch (error) {
        console.error("메인 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMainData();
  }, [])
  );

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }</style>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var container = document.getElementById('map');
        var options = { center: new kakao.maps.LatLng(${mapCoords.latitude}, ${mapCoords.longitude}), level: 4 };
        var map = new kakao.maps.Map(container, options);
        var marker = new kakao.maps.Marker({ position: new kakao.maps.LatLng(${mapCoords.latitude}, ${mapCoords.longitude}) });
        marker.setMap(map);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profileImageContainer}>
              <Image source={profileImage} style={styles.profileImage} />
            </View>
            <Text style={styles.headerTitle}>초보 농부</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notification')}>
              <Bell size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
              <Settings size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Half - Map */}
        <View style={styles.mapSection}>
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml, baseUrl: 'http://localhost:8081' }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
        </View>

        {/* Bottom Half - Content Section */}
        <View style={styles.contentSection}>
          {/* 주소 정보 영역 */}
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>
              {memberLocation ? `${memberLocation.sido} ${memberLocation.sigungu}` : "등록된 농장 없음"}
            </Text>
            <Text style={styles.locationDesc}>
              {memberLocation ? `${memberLocation.eupMyeonDong || ''} ${memberLocation.ri || ''}` : "위치 설정을 먼저 진행해 주세요."}
            </Text>
          </View>

          {/* 환경 그리드 */}
          <View style={styles.envGrid}>
            <View style={styles.envCard}>
              <Droplet size={16} color="#4CAF50" style={styles.envIcon} />
              <Text style={styles.envLabel}>토양</Text>
              <Text style={styles.envValue}>{memberLocation ? "양토" : "-"}</Text>
            </View>
            <View style={styles.envCard}>
              <Cloud size={16} color="#FF9800" style={styles.envIcon} />
              <Text style={styles.envLabel}>기후</Text>
              <Text style={styles.envValue}>22°C</Text>
            </View>
            <View style={styles.envCard}>
              <Calendar size={16} color="#795548" style={styles.envIcon} />
              <Text style={styles.envLabel}>계절</Text>
              <Text style={styles.envValue}>봄</Text>
            </View>
          </View>

          <View style={styles.cropsContainer}>
            <Text style={styles.sectionTitle}>추천 작물</Text>
            
            {recommendedCrops.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropsScroll}>
                {recommendedCrops.map((crop, index) => (
                  <RecommendCard
                    key={index} 
                    crop={crop}
                    onPress={() => navigation.navigate('CropDetail', { cropData: crop })}
                  />
                ))}
              </ScrollView>
            ) : (
              <TouchableOpacity 
                style={styles.emptyRecommendBox}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Recommend')} 
              >
                <View style={styles.emptyTextContainer}>
                  <Text style={styles.emptyTitle}>나에게 맞는 작물은 무엇일까요?</Text>
                  <Text style={styles.emptySub}>간단한 목적을 입력하고 맞춤형 작물을 추천받아보세요!</Text>
                </View>
                <View style={styles.emptyArrowCircle}>
                  <ArrowRight size={20} color="#4CAF50" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Recommend')} activeOpacity={0.8}>
          <MessageSquare size={28} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  webview: { flex: 1 },
  mapSection: { flex: 1, backgroundColor: '#F5F5F5', position: 'relative' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEE',
    zIndex: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: { flex: 1, backgroundColor: '#FFFFFF' },
  locationInfo: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  locationTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  locationDesc: { fontSize: 14, color: '#888' },
  envGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
  envCard: { flex: 1, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#EAEAEE', backgroundColor: '#FAFAFA', alignItems: 'flex-start' },
  envIcon: { marginBottom: 4 },
  envLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  envValue: { fontSize: 14, fontWeight: '500', color: '#000' },
  cropsContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 12 },
  cropsScroll: { gap: 12, paddingBottom: 16 },
  cropCard: { width: 112, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEE', borderRadius: 20, overflow: 'hidden' },
  cropImageContainer: { height: 80, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cropEmoji: { fontSize: 40 },
  matchBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  matchBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cropInfo: { padding: 8 },
  cropName: { fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 2 },
  cropSeason: { fontSize: 10, color: '#888' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 50,
  },
  
  // 🌟 새로 정의한 추천 유도 박스 스타일
  emptyRecommendBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    marginTop: 4,
  },
  emptyTextContainer: {
    flex: 1,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
  },
  emptySub: {
    fontSize: 12,
    color: '#666',
  },
  emptyArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});