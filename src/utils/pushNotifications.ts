import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('푸시 알림은 실제 기기에서만 등록할 수 있습니다.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('weather-alerts', {
      name: '농장 기상 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;
  if (finalStatus !== 'granted') {
    finalStatus = (await Notifications.requestPermissionsAsync()).status;
  }
  if (finalStatus !== 'granted') {
    console.warn('알림 권한이 허용되지 않았습니다.');
    return null;
  }

  const projectId = Constants.easConfig?.projectId
    ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('EAS projectId가 없어 Expo 푸시 토큰을 발급할 수 없습니다.');
    return null;
  }

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}
