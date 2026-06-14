// components/SignupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface SignupScreenProps {
  navigation: any;
}

export function SignupScreen({ navigation }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleNextStep = () => {
    // 1. 공백 유효성 검사
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim()) {
      Alert.alert('알림', '모든 필드를 입력해 주세요.');
      return;
    }

    // 2. 이메일 형식 간단 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    // 3. 비밀번호 길이 검사 (백엔드 스펙: 8자 이상 64자 이하)
    if (password.length < 8 || password.length > 64) {
      Alert.alert('알림', '비밀번호는 8자 이상 64자 이하로 설정해 주세요.');
      return;
    }

    // 4. 비밀번호 일치 확인
    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 5. 위치 설정 화면(LocationSetup)으로 가면서 지금까지 입력한 정보들을 파라미터로 넘깁니다.
    navigation.navigate('LocationSetup', {
      name,
      email,
      password,
    });
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
          <Text style={styles.subtitle}>간단한 정보 입력 후 스마트팜 서비스를 시작하세요.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            placeholder="김농부"
            placeholderTextColor="#888888"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>이메일 주소</Text>
          <TextInput
            style={styles.input}
            placeholder="farmer@example.com"
            placeholderTextColor="#888888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>비밀번호 (8자 이상)</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력해 주세요."
            placeholderTextColor="#888888"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 다시 입력해 주세요."
            placeholderTextColor="#888888"
            secureTextEntry
            autoCapitalize="none"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
          />

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextStep}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>다음 단계로 (위치 설정)</Text>
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
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});