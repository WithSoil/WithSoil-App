import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Droplets,
  Wind,
  Plus,
  Camera,
  Calendar as CalendarIcon,
  X,
  Bell,
  Settings,
  Sun,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { diaryApi } from '../apis/diary'; 

import profileImage from '../assets/image.png'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../apis/apiClient';

interface LogbookScreenProps {
  navigation: any;
  route?: any; 
}

export function LogbookScreen({ navigation, route }: LogbookScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate()); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const editMode = route?.params?.editMode || false;
  const editDiaryId = route?.params?.diaryId;
  const existingData = route?.params?.existingData;

  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);

  const [tasks, setTasks] = useState({
    watered: false,
    fertilized: false,
    weeded: false,
    pruned: false,
  });
  const [notes, setNotes] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]); 

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const [pastLogs, setPastLogs] = useState<any[]>([]);
  const [loggedDays, setLoggedDays] = useState<number[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);

  const taskButtons = [
    { id: 'watered', label: '물 주기', icon: Droplets },
    { id: 'fertilized', label: '비료 주기', icon: Plus },
    { id: 'weeded', label: '잡초 제거', icon: Wind },
    { id: 'pruned', label: '가지치기', icon: Cloud },
  ];

  const loadDiaries = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);

      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const logs = await diaryApi.getMonthlyDiaries(monthStr);
      setPastLogs(logs || []);

      const calendar = await diaryApi.getMonthlyCalendar(monthStr);
      if (calendar) {
        const days = calendar.map((item: any) => parseInt(item.date.split('-')[2], 10));
        setLoggedDays(days);
      }
    } catch (error) {
      console.error("일지 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  useEffect(() => {
    if (editMode && existingData) {
      setNotes(existingData.memo || '');
      
      const dateObj = new Date(existingData.diaryDateTime);
      setSelectedDate(dateObj.getDate());

      // 기존 한 일(works) 체크박스 활성화
      const newTasks = { watered: false, fertilized: false, weeded: false, pruned: false };
      existingData.works?.forEach((work: string) => {
        if (work === '물 주기') newTasks.watered = true;
        if (work === '비료 주기') newTasks.fertilized = true;
        if (work === '잡초 제거') newTasks.weeded = true;
        if (work === '가지치기') newTasks.pruned = true;
      });
      setTasks(newTasks);

      // 서버에 저장되어 있던 기존 사진 셋팅
      if (existingData.photos && existingData.photos.length > 0) {
        setExistingPhotos(existingData.photos);
      }
    }
  }, [editMode, existingData]);

  const calendarDays = Array.from({ length: 31 }, (_, i) => ({
    date: i + 1,
    hasLog: loggedDays.includes(i + 1),
  }));

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhotos([result.assets[0].uri]);
        setExistingPhotos([]); 
      }
    } catch (error) {
      Alert.alert('오류', '이미지를 불러오는 중 문제가 발생했습니다.');
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setExistingPhotos([]); // X를 누르면 기존 서버 사진도 화면에서 비움
  };

  const handleSaveDiary = async () => {

    const selectedTaskLabels = taskButtons
      .filter((button) => tasks[button.id as keyof typeof tasks])
      .map((button) => button.label);

    if (selectedTaskLabels.length === 0 && !notes.trim() && selectedPhotos.length === 0) {
      Alert.alert('알림', '오늘 한 일, 메모, 혹은 사진 중 하나는 기록해주세요!');
      return;
    }

    setIsLoading(true);
    try {

      const now = new Date();

      const diaryDateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        selectedDate,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      ).toISOString().split('.')[0]; 


      const payload = {
        diaryDateTime: diaryDateTime,
        works: selectedTaskLabels, 
        memo: notes,
        photoUris: selectedPhotos, 
      };

      if (editMode) {
        await diaryApi.updateDiary(editDiaryId, payload);
        Alert.alert('성공', '일지가 수정되었습니다!', [
          { 
            text: '확인', 
            onPress: () => {
              navigation.navigate('LogbookScreen', { editMode: false, existingData: null });
              loadDiaries(); 
            } 
          }
        ]);
      } else {
        await diaryApi.createDiary(payload);
        Alert.alert('성공', '농부일지가 저장되었습니다!', [
          { 
            text: '확인', 
            onPress: () => {
              setTasks({ watered: false, fertilized: false, weeded: false, pruned: false });
              setNotes('');
              setSelectedPhotos([]);
              loadDiaries(); 
            } 
          }
        ]);
      }
    } catch (error: any) {
      console.error('일지 저장 에러:', error);
      const errMsg = error.response?.data?.message || '일지 저장에 실패했습니다.';
      Alert.alert('저장 실패', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileImageContainer}>
            <Image source={profileImage} style={styles.profileImage} />
          </View>
          <Text style={styles.headerTitle}>초보 농부</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateSection}>
        <View style={styles.dateHeader}>
          <TouchableOpacity style={styles.iconButtonSmall}>
            <ChevronLeft size={20} color="#000" />
          </TouchableOpacity>
          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>2026년 5월</Text>
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarButton}>
              <CalendarIcon size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.iconButtonSmall}>
            <ChevronRight size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {daysInMonth.map((date) => {
            const hasLog = loggedDays.includes(date);
            const isSelected = selectedDate === date;

            return (
              <TouchableOpacity
                key={date}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dateItem,
                  hasLog ? styles.dateItemLogged : styles.dateItemNormal,
                  isSelected && !hasLog && styles.dateItemSelectedNormal,
                  isSelected && hasLog && styles.dateItemSelectedLogged,
                ]}
              >
                <Text style={[
                  styles.dateText,
                  hasLog ? styles.dateTextLogged : styles.dateTextNormal
                ]}>
                  {date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Modal visible={showCalendar} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowCalendar(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.calendarModal}>
          <View style={styles.calendarModalHeader}>
            <Text style={styles.calendarModalTitle}>2026년 5월</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.iconButtonSmall}>
              <X size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarGrid}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
            ))}

            {Array.from({ length: 3 }).map((_, i) => <View key={`empty-${i}`} style={styles.calendarCell} />)}
            
            {calendarDays.map(({ date, hasLog }) => (
              <TouchableOpacity
                key={date}
                onPress={() => { setSelectedDate(date); setShowCalendar(false); }}
                style={styles.calendarCell}
              >
                <Text style={[styles.calendarCellText, selectedDate === date && styles.calendarCellTextSelected]}>
                  {date}
                </Text>
                {hasLog && <View style={styles.logDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Main Content Area */}
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentPadding}>
        
        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <View style={styles.weatherIconContainer}>
              <Sun size={28} color="#FF9800" fill="#FFB74D" />
            </View>
            <Text style={styles.weatherTitle}>오늘의 날씨</Text>
          </View>
          <View style={styles.weatherInfoGrid}>
            <View style={styles.weatherInfoItem}>
              <Text style={styles.weatherLabel}>온도</Text>
              <Text style={styles.weatherValue}>22°C</Text>
            </View>
            <View style={styles.weatherInfoItem}>
              <Text style={styles.weatherLabel}>습도</Text>
              <Text style={styles.weatherValue}>65%</Text>
            </View>
            <View style={styles.weatherInfoItem}>
              <Text style={styles.weatherLabel}>강수량</Text>
              <Text style={styles.weatherValue}>0mm</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>오늘 할 일</Text>
        <View style={styles.tasksGrid}>
          {taskButtons.map(({ id, label, icon: Icon }) => {
            const isActive = tasks[id as keyof typeof tasks];
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                onPress={() => setTasks((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }))}
                style={[styles.taskCard, isActive ? styles.taskCardActive : styles.taskCardInactive]}
              >
                <View style={[styles.taskIconCircle, isActive ? styles.taskIconCircleActive : styles.taskIconCircleInactive]}>
                  <Icon size={24} color={isActive ? '#FFFFFF' : '#4CAF50'} />
                </View>
                <Text style={[styles.taskLabel, isActive && styles.taskLabelActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.customTaskButton}>
          <Plus size={20} color="#4CAF50" />
          <Text style={styles.customTaskText}>직접 입력 (+)</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>작물 사진</Text>

        {/* 💡 선택된 사진이 있으면 프리뷰 보여주고, 없으면 카메라 버튼 노출 */}
        {selectedPhotos.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {selectedPhotos.map((uri, index) => (
              <View key={index} style={styles.photoPreviewContainer}>
                <Image source={{ uri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removePhoto(index)}>
                  <X size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.photoAddSmallBtn} onPress={pickImage}>
              <Plus size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        ) : existingPhotos.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {existingPhotos.map((photo, index) => (
              <View key={index} style={styles.photoPreviewContainer}>
                <Image 
                  source={{ 
                    uri: `${apiClient.defaults.baseURL}${photo.imageUrl}`,
                    headers: userToken ? { Authorization: `Bearer ${userToken}` } : undefined,
                  }} 
                  style={styles.photoPreview} 
                />
                <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removePhoto(index)}>
                  <X size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.photoAddSmallBtn} onPress={pickImage}>
              <Text style={{ fontSize: 12, color: '#4CAF50', marginTop: 4 }}>사진 교체</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <View style={styles.photoIconCircle}>
              <Camera size={28} color="#4CAF50" />
            </View>
            <Text style={styles.photoText}>오늘의 사진 추가</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>메모</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          textAlignVertical="top"
          placeholder="오늘의 농사 활동을 기록해보세요..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity 
          style={[styles.saveButton, isLoading && { opacity: 0.7 }]} 
          onPress={handleSaveDiary}
          disabled={isLoading}
        >
          {isLoading ? (
             <ActivityIndicator color="#FFFFFF" />
          ) : (
             <Text style={styles.saveButtonText}>
              {editMode ? '일지 수정 완료' : '일지 저장'}
             </Text>
          )}
        </TouchableOpacity>

        {/* Past Logs */}
        {!editMode && (
        <View style={styles.pastLogsSection}>
          <Text style={styles.sectionTitle}>기록된 일지 보기</Text>
          
          {pastLogs.length === 0 ? (
            <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
              아직 기록된 일지가 없습니다.
            </Text>
          ) : (
            pastLogs.map((log) => {
              // 백엔드의 "2026-05-28T09:30" 포맷을 "5월 28일"로 변환
              const dateObj = new Date(log.diaryDateTime);
              const dateStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

              return (
                <TouchableOpacity 
                  key={log.id} 
                  style={styles.pastLogCard} 
                  onPress={() => navigation.navigate('DiaryDetailScreen', { diaryId: log.id })}
                >
                  {/* 썸네일 이미지가 있으면 렌더링, 없으면 기본 아이콘 표시 */}
                  {log.thumbnailUrl ? (
                    <Image
                      source={{
                        uri: `${apiClient.defaults.baseURL}${log.thumbnailUrl}`,
                        headers: userToken ? { Authorization: `Bearer ${userToken}` } : undefined,
                      }}
                      style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#F1F8E9' }}
                    />
                  ) : (
                    <View style={styles.pastLogEmoji}>
                      <Text style={{ fontSize: 24 }}>🌿</Text>
                    </View>
                  )}
                  <View style={styles.pastLogContent}>
                    <Text style={styles.pastLogDate}>{dateStr}</Text>
                    <Text style={styles.pastLogPreview} numberOfLines={2}>{log.preview}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#EAEAEE' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImageContainer: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(76, 175, 80, 0.3)', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  profileImage: { width: '100%',height: '100%',resizeMode: 'cover' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  dateSection: { backgroundColor: '#F1F8E9', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(76, 175, 80, 0.1)' },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  iconButtonSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EAEAEE', justifyContent: 'center', alignItems: 'center' },
  monthTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  calendarButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(76, 175, 80, 0.1)', justifyContent: 'center', alignItems: 'center' },
  dateScroll: { paddingHorizontal: 24, gap: 8 },
  dateItem: { minWidth: 48, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dateItemNormal: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAEAEE' },
  dateItemLogged: { backgroundColor: '#4CAF50', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 },
  dateItemSelectedNormal: { borderWidth: 2, borderColor: '#4CAF50' },
  dateItemSelectedLogged: { borderWidth: 2, borderColor: '#1B5E20' }, // ring 효과 대체
  dateText: { fontSize: 16, fontWeight: '600' },
  dateTextNormal: { color: '#000' },
  dateTextLogged: { color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarModal: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, elevation: 20 },
  calendarModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  calendarModalTitle: { fontSize: 20, fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayHeader: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#888', fontWeight: '600', paddingVertical: 8 },
  calendarCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  calendarCellText: { fontSize: 14, color: '#333' },
  calendarCellTextSelected: { fontWeight: 'bold', color: '#4CAF50' },
  logDot: { position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#4CAF50' },
  mainContent: { flex: 1, backgroundColor: '#FAFAFA' },
  mainContentPadding: { padding: 24, paddingBottom: 40 },
  weatherCard: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFECB3', borderRadius: 20, padding: 20, marginBottom: 24 },
  weatherHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  weatherIconContainer: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  weatherTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  weatherInfoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  weatherInfoItem: { flex: 1 },
  weatherLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  weatherValue: { fontSize: 20, fontWeight: '600', color: '#FF9800' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 12 },
  tasksGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  taskCard: { width: '48%', height: 110, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  taskCardInactive: { backgroundColor: '#FFF', borderColor: '#EAEAEE' },
  taskCardActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  taskIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  taskIconCircleInactive: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  taskIconCircleActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  taskLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  taskLabelActive: { color: '#FFF' },
  customTaskButton: { height: 60, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 2, borderColor: 'rgba(76, 175, 80, 0.3)', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  customTaskText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  photoButton: { height: 140, backgroundColor: '#F1F8E9', borderRadius: 20, borderWidth: 2, borderColor: 'rgba(76, 175, 80, 0.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 },
  photoIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 },
  photoText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  notesInput: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EAEAEE', borderRadius: 20, padding: 16, height: 120, fontSize: 15, color: '#000', marginBottom: 24 },
  saveButton: { height: 56, backgroundColor: '#4CAF50', borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 4 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  pastLogsSection: { marginTop: 32 },
  pastLogCard: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAEAEE', borderRadius: 20, padding: 16, marginBottom: 12, gap: 16 },
  pastLogEmoji: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center' },
  pastLogContent: { flex: 1, justifyContent: 'center' },
  pastLogDate: { fontSize: 14, fontWeight: '600', color: '#4CAF50', marginBottom: 4 },
  pastLogPreview: { fontSize: 14, color: '#666', lineHeight: 20 },
  photoPreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoAddSmallBtn: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
  },
});