import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Mail } from 'lucide-react-native';

import profileImage from '../assets/image.png'; // 실제 프로젝트의 이미지 경로에 맞게 주석 해제

interface LoginScreenProps {
  navigation: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header & Logo Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image source={profileImage} style={styles.logoImage} />
          </View>
          <Text style={styles.mainTitle}>스마트팜</Text>
          <Text style={styles.subTitle}>똑똑하게 키우고, 풍성하게 수확하세요</Text>
        </View>

        {/* Social Login Buttons */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FEE500' }]}
            onPress={() => navigation.navigate('LocationSetup')}
            activeOpacity={0.8}
          >
            {/* 카카오 아이콘이 있다면 여기에 추가 */}
            <Text style={[styles.buttonText, { color: '#000000' }]}>카카오로 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#03C75A' }]}
            onPress={() => navigation.navigate('LocationSetup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>네이버로 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#000000' }]}
            onPress={() => navigation.navigate('LocationSetup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Apple로 시작하기</Text>
          </TouchableOpacity>

          {/* Divider Line ("또는") */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextWrapper}>
              <Text style={styles.dividerText}>또는</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={() => navigation.navigate('EmailLoginScreen')} 
            activeOpacity={0.8}
          >
            <Mail size={20} color="#333333" />
            <Text style={[styles.buttonText, { color: '#333333' }]}>이메일로 시작하기</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          계속 진행하시면 이용약관 및 개인정보 처리방침에 동의하게 됩니다
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA', // 웹의 background 색상
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 64 : 48,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: 'rgba(76, 175, 80, 0.3)', // primary/30 컬러
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 15,
    color: '#666666', // muted-foreground 느낌
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 360,
    gap: 12, // 버튼 사이 간격
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#FFFFFF', // card 컬러
    borderWidth: 1,
    borderColor: '#EAEAEE', // border 컬러
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#EAEAEE',
  },
  dividerTextWrapper: {
    backgroundColor: '#FAFAFA', // safeArea 배경색과 동일하게 맞추어 선을 가림
    paddingHorizontal: 12,
  },
  dividerText: {
    fontSize: 12,
    color: '#888888',
  },
  footerText: {
    marginTop: 32,
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});