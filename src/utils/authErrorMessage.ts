import axios from 'axios';

type AuthFlow = 'login' | 'signup';

const LOGIN_FALLBACK_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.';
const SIGNUP_FALLBACK_MESSAGE = '회원가입 정보를 다시 확인해 주세요.';

export const getAuthErrorMessage = (error: unknown, flow: AuthFlow) => {
  if (!axios.isAxiosError(error)) {
    return flow === 'login' ? LOGIN_FALLBACK_MESSAGE : SIGNUP_FALLBACK_MESSAGE;
  }

  const status = error.response?.status;

  if (!status) {
    return '서버에 연결할 수 없습니다. 네트워크 상태와 백엔드 실행 여부를 확인해 주세요.';
  }

  if (flow === 'login') {
    if (status === 401 || status === 404) {
      return LOGIN_FALLBACK_MESSAGE;
    }
    if (status >= 500) {
      return '잠시 후 다시 로그인해 주세요.';
    }
    return LOGIN_FALLBACK_MESSAGE;
  }

  if (status === 409) {
    return '이미 가입했거나 사용할 수 없는 이메일입니다.';
  }
  if (status === 401) {
    return '인증 정보가 만료되었습니다. 앱을 새로고침한 뒤 다시 시도해 주세요.';
  }
  if (status === 400) {
    return '입력한 회원가입 정보를 다시 확인해 주세요.';
  }
  if (status >= 500) {
    return '잠시 후 다시 회원가입을 시도해 주세요.';
  }

  return SIGNUP_FALLBACK_MESSAGE;
};

export const getErrorStatus = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }
  return error.response?.status;
};
