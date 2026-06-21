import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Image as ImageIcon,
  CheckCircle2,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { diaryApi } from '../apis/diary';
import { apiClient } from '../apis/apiClient';

const { width } = Dimensions.get('window');

interface DiaryDetailScreenProps {
  route: any;
  navigation: any;
}

export function DiaryDetailScreen({ route, navigation }: DiaryDetailScreenProps) {
  // LogbookScreen에서 네비게이션으로 넘겨줄 일지 ID
  const { diaryId } = route.params;

  const [diary, setDiary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchDiaryDetail = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);

        const data = await diaryApi.getDiaryDetail(diaryId);
        setDiary(data);
      } catch (error) {
        console.error('일지 상세 조회 실패:', error);
        Alert.alert('오류', '일지를 불러올 수 없습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaryDetail();
  }, [diaryId]);

  const handleDelete = () => {
    setShowMenu(false); // 메뉴 닫기
    Alert.alert(
      '일지 삭제',
      '정말로 이 농부일지를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await diaryApi.deleteDiary(diaryId); // 백엔드 API 호출
              Alert.alert('성공', '일지가 삭제되었습니다.', [
                { 
                  text: '확인', 
                  // 삭제 성공 시 이전 목록 화면으로 돌아가기
                  onPress: () => navigation.goBack() 
                }
              ]);
            } catch (error) {
              console.error('삭제 에러:', error);
              Alert.alert('오류', '일지 삭제에 실패했습니다.');
              setIsLoading(false);
            }
          } 
        }
      ]
    );
  };

  const handleEdit = () => {
    setShowMenu(false);
    navigation.navigate('LogbookScreen', {
      editMode: true,      
      diaryId: diary.id,     
      existingData: diary, 
    });
  };

  if (isLoading || !diary) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timePart = `${ampm} ${hours}:${minutes}`;

    return { datePart, timePart };
  };

  if (isLoading || !diary) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  const { datePart, timePart } = formatDate(diary.diaryDateTime);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>농부일지 상세</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.iconButton}>
          <MoreVertical size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <Modal visible={showMenu} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.menuOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <Edit2 size={18} color="#333" />
                <Text style={styles.menuText}>수정하기</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Trash2 size={18} color="#F44336" />
                <Text style={[styles.menuText, { color: '#F44336' }]}>삭제하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <CalendarIcon size={20} color="#4CAF50" />
            <Text style={styles.dateText}>{datePart}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Clock size={16} color="#888" />
            <Text style={styles.timeText}>{timePart}</Text>
          </View>
        </View>

        {diary.photos && diary.photos.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoScrollContainer}
          >
            {diary.photos.map((photo: any) => (
              <Image
                key={photo.id}
                source={{
                  uri: `${apiClient.defaults.baseURL}${photo.imageUrl}`,
                  headers: userToken ? { Authorization: `Bearer ${userToken}` } : undefined,
                }}
                style={styles.photoImage}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPhotoContainer}>
            <ImageIcon size={40} color="#EAEAEE" />
            <Text style={styles.noPhotoText}>첨부된 사진이 없습니다.</Text>
          </View>
        )}

        <View style={styles.contentPadding}>
          <Text style={styles.sectionTitle}>오늘 한 일 🌾</Text>
          {diary.works && diary.works.length > 0 ? (
            <View style={styles.worksContainer}>
              {diary.works.map((work: string, index: number) => (
                <View key={index} style={styles.workChip}>
                  <CheckCircle2 size={16} color="#4CAF50" />
                  <Text style={styles.workChipText}>{work}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>기록된 작업이 없습니다.</Text>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>메모 📝</Text>
          <View style={styles.memoCard}>
            {diary.memo ? (
              <Text style={styles.memoText}>{diary.memo}</Text>
            ) : (
              <Text style={styles.emptyText}>작성된 메모가 없습니다.</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEE',
  },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  mainContent: { flex: 1 },
  dateTimeContainer: { paddingHorizontal: 24, paddingVertical: 24, alignItems: 'center', gap: 8 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  timeText: { fontSize: 15, color: '#666', fontWeight: '500' },
  photoScrollContainer: { paddingHorizontal: 24, gap: 16, paddingBottom: 24 },
  photoImage: { width: width * 0.7, height: width * 0.7, borderRadius: 20, backgroundColor: '#F5F5F5' },
  noPhotoContainer: { marginHorizontal: 24, height: 160, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#EAEAEE', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 8 },
  noPhotoText: { color: '#888', fontSize: 14 },
  contentPadding: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 16 },
  worksContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  workChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F8E9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#4CAF50', gap: 8 },
  workChipText: { color: '#1B5E20', fontSize: 15, fontWeight: '600' },
  memoCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#EAEAEE', minHeight: 120, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  memoText: { fontSize: 16, color: '#333', lineHeight: 24 },
  emptyText: { fontSize: 15, color: '#999', fontStyle: 'italic' },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // 배경 살짝 어둡게
  },
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70, // 헤더 바로 아래 위치하도록
    right: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EAEAEE',
    marginHorizontal: 16,
  },
});