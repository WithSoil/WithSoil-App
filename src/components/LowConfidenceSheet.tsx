import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { MessageSquare, Camera } from 'lucide-react-native';

interface LowConfidenceSheetProps {
  visible: boolean; // RN 모달 제어를 위한 상태
  onAskChatbot: () => void;
  onRetake: () => void;
  onClose: () => void;
}

export function LowConfidenceSheet({
  visible,
  onAskChatbot,
  onRetake,
  onClose,
}: LowConfidenceSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dark Overlay - Clickable to dismiss */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <View style={styles.sheetContainer}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>사진을 구별하기 어려워요</Text>
            <Text style={styles.description}>
              조금 더 가까이서 밝게 찍어주시거나, 챗봇에게 증상을 직접 설명해 주시겠어요?
            </Text>
          </View>

          {/* Two Equal-Sized Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={onAskChatbot}
              activeOpacity={0.7}
            >
              <MessageSquare size={20} color="#4CAF50" />
              <Text style={styles.outlineButtonText}>챗봇에게 묻기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onRetake}
              activeOpacity={0.7}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>다시 촬영하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24, // 아이폰 하단 바 대응
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outlineButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
