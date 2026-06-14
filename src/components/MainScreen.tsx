import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  MapPin,
  Navigation,
  Cloud,
  Droplet,
  Calendar,
  Star,
  MessageSquare,
  Bell,
  Settings,
} from 'lucide-react-native';

import profileImage from '../assets/image.png'; // 실제 경로에 맞게 주석 해제
import { WebView } from 'react-native-webview';

interface MainScreenProps {
  navigation: any;
}

const KAKAO_MAP_API_KEY = '585a0d74c620c91802e27770e06d7b8a';

export function MainScreen({ navigation }: MainScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  // 임시 좌표 (추후 백엔드에서 회원 가입 시 등록한 location.latitude, longitude를 받아와 바인딩하면 됩니다)
  const farmLatitude = 36.6358; // 예: 충북 지역 위도
  const farmLongitude = 127.4914; // 예: 충북 지역 경도

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        html, body, #map {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      </style>
      <script>
        window.onerror = function(message, source, lineno, colno, error) {
          window.ReactNativeWebView.postMessage("🚨 카카오맵 에러: " + message);
        };
        console.error = function(message) {
          window.ReactNativeWebView.postMessage("🚨 콘솔 에러: " + message);
        };
      </script>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var container = document.getElementById('map');
        var options = {
          center: new kakao.maps.LatLng(${farmLatitude}, ${farmLongitude}),
          level: 4 // 지도 확대 레벨
        };

        var map = new kakao.maps.Map(container, options);

        var markerPosition  = new kakao.maps.LatLng(${farmLatitude}, ${farmLongitude}); 
        var marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);
      </script>
    </body>
    </html>
  `;
  
  const crops = [
    { id: '1', name: '방울토마토', match: 95, season: '봄-여름' },
    { id: '2', name: '상추', match: 92, season: '연중' },
    { id: '3', name: '딸기', match: 88, season: '봄' },
    { id: '4', name: '파프리카', match: 85, season: '여름' },
  ];

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
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Settings size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Half - Map (50%) */}
        {/* <View style={styles.mapSection}>
          <View style={styles.mapCenter}>
            <MapPin size={48} color="#4CAF50" style={styles.mapPinIcon} />
            <Text style={styles.mapText}>지도 보기</Text>
          </View>

          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <MapPin size={20} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="지역 검색..."
                placeholderTextColor="#888"
              />
            </View>
          </View> */}
          <View style={styles.container}>
          <WebView
            originWhitelist={['*']}
            source={{ 
              html: mapHtml,
              baseUrl: 'http://localhost:8081'
             }}
            style={styles.webview}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />

          {/* 지도 로딩 중에 보여줄 스피너 */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
      </View>

          <TouchableOpacity style={styles.myLocationButton} activeOpacity={0.8}>
            <Navigation size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Bottom Half - Content (50%) */}
        <View style={styles.contentSection}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>충청북도 청주시</Text>
            <Text style={styles.locationDesc}>7a구역 · 양토</Text>
          </View>

          <View style={styles.envGrid}>
            <View style={[styles.envCard, { backgroundColor: '#F1F8E9', borderColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <Droplet size={16} color="#4CAF50" style={styles.envIcon} />
              <Text style={styles.envLabel}>토양</Text>
              <Text style={styles.envValue}>양토</Text>
            </View>

            <View style={[styles.envCard, { backgroundColor: '#FFF8E1', borderColor: 'rgba(255, 152, 0, 0.2)' }]}>
              <Cloud size={16} color="#FF9800" style={styles.envIcon} />
              <Text style={styles.envLabel}>기후</Text>
              <Text style={styles.envValue}>22°C</Text>
            </View>

            <View style={[styles.envCard, { backgroundColor: '#EFEBE9', borderColor: 'rgba(121, 85, 72, 0.3)' }]}>
              <Calendar size={16} color="#795548" style={styles.envIcon} />
              <Text style={styles.envLabel}>계절</Text>
              <Text style={styles.envValue}>봄</Text>
            </View>
          </View>

          <View style={styles.cropsContainer}>
            <Text style={styles.sectionTitle}>추천 작물</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropsScroll}>
              {crops.map((crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={styles.cropCard}
                  onPress={() => navigation.navigate('CropDetail', { id: crop.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.cropImageContainer}>
                    <Text style={styles.cropEmoji}>🌱</Text>
                    <View style={styles.matchBadge}>
                      <Star size={10} color="#FFF" fill="#FFF" />
                      <Text style={styles.matchBadgeText}>{crop.match}%</Text>
                    </View>
                  </View>
                  <View style={styles.cropInfo}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    <Text style={styles.cropSeason}>{crop.season}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Floating Action Button for Chatbot */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Chatbot')}
          activeOpacity={0.8}
        >
          <MessageSquare size={28} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  webview: { flex: 1 },
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
    ...StyleSheet.absoluteFillObject, // 화면 전체를 덮도록 설정
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
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
  mapSection: { flex: 1, backgroundColor: '#F5F5F5', position: 'relative' },
  mapCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapPinIcon: { marginBottom: 8 },
  mapText: { fontSize: 14, color: '#888' },
  searchBarContainer: { position: 'absolute', top: 16, left: 16, right: 16, zIndex: 20 },
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#000', height: '100%' },
  myLocationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
  },
  contentSection: { flex: 1, backgroundColor: '#FFFFFF' },
  locationInfo: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  locationTitle: { fontSize: 18, color: '#000', marginBottom: 4 },
  locationDesc: { fontSize: 14, color: '#888' },
  envGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
  envCard: { flex: 1, borderRadius: 20, padding: 12, borderWidth: 1, alignItems: 'flex-start' },
  envIcon: { marginBottom: 4 },
  envLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  envValue: { fontSize: 14, fontWeight: '500', color: '#000' },
  cropsContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  sectionTitle: { fontSize: 16, color: '#000', marginBottom: 8 },
  cropsScroll: { gap: 8, paddingBottom: 16 },
  cropCard: { width: 112, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: 'rgba(76, 175, 80, 0.2)', borderRadius: 20, overflow: 'hidden' },
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
});