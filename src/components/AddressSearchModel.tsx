import React from 'react';
import { Modal, SafeAreaView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';

interface AddressSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelected: (data: any) => void;
}

export function AddressSearchModal({ visible, onClose, onSelected }: AddressSearchModalProps) {
  // 다음 우편번호 API를 띄우기 위한 간단한 HTML 템플릿
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style> body, html { margin: 0; padding: 0; height: 100%; } </style>
    </head>
    <body>
      <div id="layer" style="width:100%;height:100%;"></div>
      <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
      <script>
        new daum.Postcode({
          oncomplete: function(data) {
            // 주소 선택 시 React Native 쪽으로 데이터를 문자열로 변환해 보냄
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
          },
          width: '100%',
          height: '100%'
        }).embed(document.getElementById('layer'));
      </script>
    </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* 상단 닫기 버튼 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* 웹뷰 영역 */}
        <WebView
          source={{ 
            html: htmlContent,
            baseUrl: 'https://postcode.map.daum.net', 
          }}
          style={styles.webview}
          onMessage={(event) => {
            // 웹뷰에서 PostMessage로 보낸 데이터를 받아옴
            const parsedData = JSON.parse(event.nativeEvent.data);
            onSelected(parsedData);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true} // 로컬 스토리지 기능 활성화
          originWhitelist={['*']}  // 모든 출처에서의 통신 및 외부 스크립트 로드 허용
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    height: 56, 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEE'
  },
  closeButton: { padding: 8 },
  webview: { flex: 1 },
});