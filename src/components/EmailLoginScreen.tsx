// components/EmailLoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { memberApi } from '../apis/member'; // 상대 경로가 맞는지 확인해 주세요.
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface EmailLoginScreenProps {
  navigation: any;
}

export function EmailLoginScreen({ navigation }: EmailLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // 1. 유효성 검사
    if (!email.trim() || !password.trim()) {
      Alert.alert('알림', '이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. API 호출
      const response = await memberApi.login({ email, password });

      // ApiResponse 포맷 구조에 맞춰 토큰 추출 (response.data.accessToken)
      const token = response.data?.accessToken;

      if (token) {
        // 3. 토큰 로컬 저장
        await AsyncStorage.setItem('userToken', token);
        
        Alert.alert('성공', '로그인에 성공했습니다.', [
          {
            text: '확인',
            onPress: () => {
              navigation.replace('MainTabs');
            },
          },
        ]);
      } else {
        Alert.alert('오류', '토큰 정보를 가져오지 못했습니다.');
      }
    } catch (error: any) {
      console.error('로그인 에러:', error);
      // 백엔드 에러 응답 처리 (예: 비밀번호 불일치 등)
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.';
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>이메일 로그인</Text>
            <Text style={styles.subtitle}>초보농부 서비스를 이용하기 위해 로그인해 주세요.</Text>
          </View>

        <View style={styles.form}>
          {/* 이메일 입력 */}
          <Text style={styles.label}>이메일 주소</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor="#888888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* 비밀번호 입력 */}
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력해 주세요."
            placeholderTextColor="#888888"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>
          {/* 로그인 버튼 하단 등에 배치 */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignupScreen')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: '#666666', fontSize: 14 }}>
              아직 계정이 없으신가요? <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#EAEAEE',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    height: 54,
    backgroundColor: '#4CAF50', // 스마트팜 느낌의 초록 계열 포인트 컬러
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});