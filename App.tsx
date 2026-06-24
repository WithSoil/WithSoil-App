import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home, Camera, BookOpen, User } from 'lucide-react-native';

import { LoginScreen } from './src/components/LoginScreen';
import { SignupScreen } from './src/components/SignupScreen';
import { EmailLoginScreen } from './src/components/EmailLoginScreen'; 
import { LocationSetup } from './src/components/LocationSetup';
import { MainScreen } from './src/components/MainScreen';
import { CropDetailScreen } from './src/components/CropDetailScreen';
import { DiagnosisScreen } from './src/components/DiagnosisScreen';
import { FarmDiaryScreen } from './src/components/FarmDiaryScreen';
import { ChatbotScreen } from './src/components/ChatbotScreen';
import { ProfileScreen } from './src/components/ProfileScreen';
import { DiaryDetailScreen } from './src/components/DiaryDetailScreen';

export type TabParamList = {
  Home: undefined;
  Diagnosis: undefined;
  FarmDiary: {
    editMode?: boolean;
    diaryId?: number;
    existingData?: any | null;
  } | undefined;
  Profile: undefined;
};

// 네비게이션 파라미터 타입 정의
export type RootStackParamList = {
  Login: undefined;
  EmailLoginScreen: undefined;
  LocationSetup: {
    fromSignup?: boolean;
  } | undefined;
  SignupScreen: undefined;

  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  CropDetail: { id: string }; 
  Chatbot: undefined;
  DiaryDetailScreen: { diaryId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,          
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: { height: 60, paddingBottom: 8 },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={MainScreen} 
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Diagnosis" 
        component={DiagnosisScreen} 
        options={{
          tabBarLabel: '진단',
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="FarmDiary" 
        component={FarmDiaryScreen} 
        options={{
          tabBarLabel: '일지',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: '프로필',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="LocationSetup" component={LocationSetup} />
        <Stack.Screen name="EmailLoginScreen" component={EmailLoginScreen} />
        <Stack.Screen name="DiaryDetailScreen" component={DiaryDetailScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="CropDetail" component={CropDetailScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
