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
import { Keyboard } from 'lucide-react-native';

interface CropSelectionSheetProps {
  visible: boolean; // RN용 visible 상태 추가
  onClose: () => void;
  onSelectCrop: (crop: string) => void;
  detectionType: 'pest' | 'disease';
}

export function CropSelectionSheet({
  visible,
  onClose,
  onSelectCrop,
  detectionType,
}: CropSelectionSheetProps) {
  const title =
    detectionType === 'pest'
      ? '담배가루이가 발견되었어요! 🐛 어떤 작물인가요?'
      : '벌레는 없지만 식물이 아파 보여요! 🍂 어떤 작물인가요?';

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
          {/* Header */}
          <Text style={styles.title}>{title}</Text>

          {/* Large Prominent Tomato Card */}
          <TouchableOpacity
            style={styles.cropCard}
            onPress={() => onSelectCrop('tomato')}
            activeOpacity={0.8}
          >
            <View style={styles.emojiCircle}>
              <Text style={styles.emojiText}>🍅</Text>
            </View>
            <View style={styles.cropTextContainer}>
              <Text style={styles.cropSubtitle}>내 작물</Text>
              <Text style={styles.cropTitle}>토마토</Text>
            </View>
          </TouchableOpacity>

          {/* Manual Input Button */}
          <TouchableOpacity
            style={styles.manualButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Keyboard size={20} color="#888" />
            <Text style={styles.manualButtonText}>작물 직접 입력하기 ⌨️</Text>
          </TouchableOpacity>
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
    minHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
    marginBottom: 24,
    color: '#000',
  },
  cropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9', // from-primary/10 느낌
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  emojiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emojiText: {
    fontSize: 32,
  },
  cropTextContainer: {
    flex: 1,
  },
  cropSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 4,
  },
  cropTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#EAEAEE',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  manualButtonText: {
    fontWeight: '500',
    color: '#888',
    fontSize: 16,
  },
});