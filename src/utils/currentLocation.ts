import * as Location from 'expo-location';

import { MemberLocation } from '../apis/member';

export interface CurrentLocationResult {
  memberLocation: MemberLocation;
  latitude: number;
  longitude: number;
  displayAddress: string;
}

export async function getCurrentLocation(): Promise<CurrentLocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new Error('LOCATION_PERMISSION_DENIED');
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('LOCATION_SERVICES_DISABLED');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  const { latitude, longitude } = position.coords;
  const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

  const sido = address?.region || address?.city || '';
  const sigungu =
    (address?.city && address.city !== sido ? address.city : '') ||
    address?.subregion ||
    address?.district ||
    '';
  const eupMyeonDong =
    (address?.district && address.district !== sigungu ? address.district : '') ||
    (address?.subregion && address.subregion !== sigungu ? address.subregion : '') ||
    '';
  const displayAddress = [sido, sigungu, eupMyeonDong].filter(Boolean).join(' ');

  return {
    latitude,
    longitude,
    displayAddress: displayAddress || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    memberLocation: {
      sido,
      sigungu,
      eupMyeonDong,
      latitude,
      longitude,
    },
  };
}

export function getLocationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === 'LOCATION_PERMISSION_DENIED') {
      return '현재 위치를 사용하려면 기기 설정에서 위치 권한을 허용해 주세요.';
    }
    if (error.message === 'LOCATION_SERVICES_DISABLED') {
      return '기기의 위치 서비스를 켠 뒤 다시 시도해 주세요.';
    }
  }

  return '현재 위치를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
