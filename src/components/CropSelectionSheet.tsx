import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X } from 'lucide-react-native';

interface CropSelectionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCrop: (crop: string) => void;
  detectionType?: 'pest' | 'disease';
}

// 💡 백엔드 FastAPI 모델이 요구하는 24종 작물 배열
const CROP_LIST = [
  '가지', '감자', '고추', '단호박', '딸기', '마늘', '무', '배', 
  '배추', '벼', '사과', '상추', '수박', '애호박', '양배추', '양파', 
  '오이', '쥬키니호박', '참외', '콩', '토마토', '파', '포도', '호박'
];

export function CropSelectionSheet({
  visible,
  onClose,
  onSelectCrop,
}: CropSelectionSheetProps) {
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
          <View style={styles.header}>
            <Text style={styles.title}>촬영한 작물 선택 🌿</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            진단 정확도를 높이기 위해 어떤 작물인지 선택해 주세요.
          </Text>

          {/* 💡 24종 작물 선택 그리드 (스크롤 가능) */}
          <ScrollView 
            style={styles.scrollArea} 
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {CROP_LIST.map((crop, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cropItem}
                onPress={() => onSelectCrop(crop)} // 선택된 한국어 작물명을 정확히 전달
                activeOpacity={0.7}
              >
                <Text style={styles.cropText}>{crop}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SafeAreaView />
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
    height: '70%', // 너무 꽉 차지 않도록 높이 조절
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  scrollArea: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 20,
  },
  cropItem: {
    width: '30%', 
    backgroundColor: '#F1F8E9', 
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  cropText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});