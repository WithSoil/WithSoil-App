// components/SignupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { memberApi } from '../apis/member';
import { FormErrorMessage } from './FormErrorMessage';
import { getAuthErrorMessage, getErrorStatus } from '../utils/authErrorMessage';

interface SignupScreenProps {
  navigation: any;
}

export function SignupScreen({ navigation }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = async () => {
    setErrorMessage('');

    // 1. 공백 유효성 검사
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim()) {
      setErrorMessage('모든 필드를 입력해 주세요.');
      return;
    }

    // 2. 이메일 형식 간단 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    // 3. 비밀번호 길이 검사 (백엔드 스펙: 8자 이상 64자 이하)
    if (password.length < 8 || password.length > 64) {
      setErrorMessage('비밀번호는 8자 이상 64자 이하로 설정해 주세요.');
      return;
    }

    // 4. 비밀번호 일치 확인
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await memberApi.signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      const loginResponse = await memberApi.login({
        email: email.trim(),
        password,
      });
      const token = loginResponse.data?.accessToken;
      if (!token) {
        setErrorMessage('회원가입은 완료됐지만 로그인 정보를 확인할 수 없습니다. 로그인 화면에서 다시 로그인해 주세요.');
        return;
      }

      await AsyncStorage.setItem('userToken', token);
      navigation.replace('LocationSetup', { fromSignup: true });
    } catch (error: unknown) {
      console.warn('회원가입 실패:', getErrorStatus(error));
      setErrorMessage(getAuthErrorMessage(error, 'signup'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            간단한 정보 입력 후 <Text style={styles.subtitleBold}>흙과 함께</Text> 시작하세요.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            placeholder="김농부"
            placeholderTextColor="#888888"
            value={name}
            onChangeText={(value) => { setName(value); setErrorMessage(''); }}
          />

          <Text style={styles.label}>이메일 주소</Text>
          <TextInput
            style={styles.input}
            placeholder="farmer@example.com"
            placeholderTextColor="#888888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(value) => { setEmail(value); setErrorMessage(''); }}
          />

          <Text style={styles.label}>비밀번호 (8자 이상)</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력해 주세요."
            placeholderTextColor="#888888"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={(value) => { setPassword(value); setErrorMessage(''); }}
          />

          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 다시 입력해 주세요."
            placeholderTextColor="#888888"
            secureTextEntry
            autoCapitalize="none"
            value={passwordConfirm}
            onChangeText={(value) => { setPasswordConfirm(value); setErrorMessage(''); }}
          />

          <FormErrorMessage message={errorMessage} />

          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
            onPress={handleNextStep}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>회원가입 후 위치 설정</Text>
            )}
          </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
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
  subtitleBold: {
    fontWeight: 'bold',
    color: '#666666',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#EAEAEE',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    height: 54,
    backgroundColor: '#4CAF50',
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
  nextButtonDisabled: {
    opacity: 0.65,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});