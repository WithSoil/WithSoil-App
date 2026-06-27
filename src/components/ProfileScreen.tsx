import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MapPin, Settings, Bell, HelpCircle, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { memberApi } from '../apis/member';

import profileImage from '../assets/default_image.png';

interface ProfileScreenProps {
  navigation: any;
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // 1. 화면 진입 시 회원 정보 API 호출
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await memberApi.getMypage();
        // 백엔드 Response 구조에 맞춰 바인딩 (ex: response.data)
        setUserData(response.data);
      } catch (error: any) {
        console.error('프로필 로딩 에러:', error);
        Alert.alert('오류', '사용자 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. 로그아웃 처리
  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        style: 'destructive',
        onPress: async () => {
          // EmailLoginScreen에서 토큰 저장 시 사용한 키 명칭과 통일 ('userToken')
          await AsyncStorage.removeItem('userToken');
          // 최초 소셜/이메일 선택 로그인 화면으로 이동
          Alert.alert('성공', '로그아웃 되었습니다.', [
            { text: '확인', onPress: () => navigation.replace('Login') }
          ]);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  // 백엔드 주소 객체를 한 줄 문자열로 조립 (ex: "전북특별자치도 김제시 백산면")
  const formattedAddress = userData?.location 
    ? `${userData.location.sido} ${userData.location.sigungu} ${userData.location.eupMyeonDong || ''}`.trim()
    : '위치 정보 없음';

  const menuItems = [
    { icon: MapPin, label: '농장 위치', value: formattedAddress, onPress: () => navigation.navigate('LocationSetup') },
    { icon: Settings, label: '설정', value: null },
    { icon: Bell, label: '알림', value: null },
    { icon: HelpCircle, label: '도움말 & 지원', value: null },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.smallAvatar}>
            <Image source={profileImage} style={styles.image} />
          </View>
          <Text style={styles.headerTitle}>{userData?.name || '농부'}</Text>
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Summary Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.largeAvatar}>
              <Image source={profileImage} style={styles.image} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{userData?.name || '이름 없음'}</Text>
              <Text style={styles.profileRole}>{userData?.email || '초보 농부'}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>42</Text>
              <Text style={styles.statLabel}>활동 일수</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>재배 작물</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>일지 기록</Text>
            </View>
          </View>
        </View>

        {/* Menu List & Logout Section */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.menuItem,
                  idx !== menuItems.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={styles.menuIconCircle}>
                  <item.icon size={20} color="#333" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  {item.value && (
                    <Text style={styles.menuItemValue}>{item.value}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#F44336" />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
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
  smallAvatar: {
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
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
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
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  profileSection: {
    backgroundColor: '#F1F8E9', // from-primary/10 느낌
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileText: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  profileRole: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888' },
  menuSection: { paddingHorizontal: 24, paddingTop: 24 },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEE',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#EAEAEE' },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: { flex: 1, alignItems: 'flex-start' },
  menuItemLabel: { fontSize: 16, fontWeight: '500', color: '#000' },
  menuItemValue: { fontSize: 14, color: '#888', marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(244, 67, 54, 0.2)',
    marginTop: 24,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#F44336' },
});