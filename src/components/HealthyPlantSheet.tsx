import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback 
} from 'react-native';
import { MessageSquare, Camera } from 'lucide-react-native';

interface HealthyPlantSheetProps {
  visible: boolean;
  onAskChatbot: () => void;
  onRetake: () => void;
  onClose: () => void;
}

export function HealthyPlantSheet({ visible, onAskChatbot, onRetake, onClose }: HealthyPlantSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheetContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>다행히 벌레나 아픈 곳이 없어요! 🌱</Text>
          <Text style={styles.description}>
            식물이 건강해 보여요. 혹시 제가 놓친 부분이 있다면 다른 각도에서 다시 찍어볼까요?
          </Text>

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#000000',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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