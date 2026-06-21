import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
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
  Trash2,
} from 'lucide-react-native';

import profileImage from '../assets/image.png';
import {
  DiaryPhotoFile,
  FarmDiaryResponse,
  FarmDiarySummaryResponse,
  farmDiaryApi,
} from '../apis/farmDiary';

interface FarmDiaryScreenProps {
  navigation: any;
}

type TaskId = 'watered' | 'fertilized' | 'weeded' | 'pruned';

interface TaskButtonItem {
  id: TaskId;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const taskButtons: TaskButtonItem[] = [
  { id: 'watered', label: '물 주기', icon: Droplets },
  { id: 'fertilized', label: '비료 주기', icon: Plus },
  { id: 'weeded', label: '잡초 제거', icon: Wind },
  { id: 'pruned', label: '가지치기', icon: Cloud },
];

const pad = (value: number) => String(value).padStart(2, '0');

const toMonthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toDiaryDateTime = (date: Date) => {
  const now = new Date();
  return `${toDateKey(date)}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getMonthStartOffset = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const formatKoreanDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const createPreview = (diary: FarmDiaryResponse) => {
  if (diary.memo?.trim()) {
    return diary.memo.trim();
  }
  if (diary.works.length > 0) {
    return diary.works.join(', ');
  }
  return '기록된 내용이 없습니다.';
};

const makePhotoFile = (asset: ImagePicker.ImagePickerAsset, index: number): DiaryPhotoFile => {
  const extension = asset.uri.split('.').pop()?.split('?')[0] || 'jpg';
  return {
    uri: asset.uri,
    name: asset.fileName ?? `diary-photo-${Date.now()}-${index}.${extension}`,
    type: asset.mimeType ?? 'image/jpeg',
  };
};

export function FarmDiaryScreen({ navigation }: FarmDiaryScreenProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [customWork, setCustomWork] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<DiaryPhotoFile[]>([]);
  const [monthlyDiaries, setMonthlyDiaries] = useState<FarmDiarySummaryResponse[]>([]);
  const [selectedDateDiaries, setSelectedDateDiaries] = useState<FarmDiaryResponse[]>([]);
  const [loggedDays, setLoggedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const monthKey = toMonthKey(currentMonth);
  const selectedDateKey = toDateKey(selectedDate);
  const daysInMonth = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1);
  const calendarDays = daysInMonth.map((date) => ({ date, hasLog: loggedDays.has(date) }));
  const monthTitle = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const loadMonthlyData = useCallback(async () => {
    const [summaries, calendar] = await Promise.all([
      farmDiaryApi.getMonthlyDiaries(monthKey),
      farmDiaryApi.getMonthlyCalendar(monthKey),
    ]);
    setMonthlyDiaries(summaries);
    setLoggedDays(new Set(calendar.map((item) => Number(item.date.split('-')[2]))));
  }, [monthKey]);

  const loadSelectedDateDiaries = useCallback(async () => {
    const diaries = await farmDiaryApi.getDiariesByDate(selectedDateKey);
    setSelectedDateDiaries(diaries);
  }, [selectedDateKey]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadMonthlyData(), loadSelectedDateDiaries()]);
    } catch (error) {
      console.error(error);
      Alert.alert('일지 조회 실패', '농부일지를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [loadMonthlyData, loadSelectedDateDiaries]);

  useEffect(() => {
    AsyncStorage.getItem('userToken').then(setAuthToken).catch(() => setAuthToken(null));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    const nextSelectedDay = Math.min(selectedDate.getDate(), getDaysInMonth(nextMonth));
    setCurrentMonth(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextSelectedDay));
  };

  const selectDay = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  const toggleWork = (label: string) => {
    setSelectedWorks((prev) => (
      prev.includes(label) ? prev.filter((work) => work !== label) : [...prev, label]
    ));
  };

  const addCustomWork = () => {
    const trimmed = customWork.trim();
    if (!trimmed) {
      return;
    }
    setSelectedWorks((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCustomWork('');
  };

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 권한 필요', '작물 사진을 추가하려면 사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    setPhotos((prev) => [
      ...prev,
      ...result.assets.map((asset, index) => makePhotoFile(asset, index)),
    ]);
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.uri !== uri));
  };

  const resetForm = () => {
    setSelectedWorks([]);
    setCustomWork('');
    setNotes('');
    setPhotos([]);
  };

  const saveDiary = async () => {
    if (selectedWorks.length === 0 && !notes.trim() && photos.length === 0) {
      Alert.alert('입력 필요', '오늘 한 일, 사진, 메모 중 하나 이상을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      await farmDiaryApi.createDiary(
        {
          diaryDateTime: toDiaryDateTime(selectedDate),
          works: selectedWorks,
          memo: notes.trim(),
        },
        photos
      );
      resetForm();
      await refresh();
      Alert.alert('저장 완료', '농부일지가 저장되었습니다.');
    } catch (error) {
      console.error(error);
      Alert.alert('저장 실패', '농부일지를 저장하지 못했어요. 입력값과 네트워크를 확인해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const imageSource = (uri: string) => ({
    uri,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });

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
          <TouchableOpacity style={styles.iconButtonSmall} onPress={() => changeMonth(-1)}>
            <ChevronLeft size={20} color="#000" />
          </TouchableOpacity>
          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarButton}>
              <CalendarIcon size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.iconButtonSmall} onPress={() => changeMonth(1)}>
            <ChevronRight size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {daysInMonth.map((date) => {
            const hasLog = loggedDays.has(date);
            const isSelected = selectedDate.getDate() === date;

            return (
              <TouchableOpacity
                key={date}
                onPress={() => selectDay(date)}
                style={[
                  styles.dateItem,
                  hasLog ? styles.dateItemLogged : styles.dateItemNormal,
                  isSelected && !hasLog && styles.dateItemSelectedNormal,
                  isSelected && hasLog && styles.dateItemSelectedLogged,
                ]}
              >
                <Text style={[styles.dateText, hasLog ? styles.dateTextLogged : styles.dateTextNormal]}>
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
            <Text style={styles.calendarModalTitle}>{monthTitle}</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.iconButtonSmall}>
              <X size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarGrid}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
            ))}
            {Array.from({ length: getMonthStartOffset(currentMonth) }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.calendarCell} />
            ))}
            {calendarDays.map(({ date, hasLog }) => (
              <TouchableOpacity
                key={date}
                onPress={() => { selectDay(date); setShowCalendar(false); }}
                style={styles.calendarCell}
              >
                <Text style={[styles.calendarCellText, selectedDate.getDate() === date && styles.calendarCellTextSelected]}>
                  {date}
                </Text>
                {hasLog && <View style={styles.logDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentPadding}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#4CAF50" />}
      >
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

        <Text style={styles.sectionTitle}>오늘 한 일</Text>
        <View style={styles.tasksGrid}>
          {taskButtons.map(({ id, label, icon: Icon }) => {
            const isActive = selectedWorks.includes(label);
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                onPress={() => toggleWork(label)}
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

        <View style={styles.customTaskRow}>
          <TextInput
            style={styles.customTaskInput}
            placeholder="직접 입력"
            placeholderTextColor="#999"
            value={customWork}
            onChangeText={setCustomWork}
            returnKeyType="done"
            onSubmitEditing={addCustomWork}
          />
          <TouchableOpacity style={styles.addCustomTaskButton} onPress={addCustomWork}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {selectedWorks.length > 0 && (
          <View style={styles.selectedWorksWrap}>
            {selectedWorks.map((work) => (
              <TouchableOpacity key={work} style={styles.workChip} onPress={() => toggleWork(work)}>
                <Text style={styles.workChipText}>{work}</Text>
                <X size={12} color="#2E7D32" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>작물 사진</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}>
          <View style={styles.photoIconCircle}>
            <Camera size={28} color="#4CAF50" />
          </View>
          <Text style={styles.photoText}>오늘의 사진 추가</Text>
        </TouchableOpacity>

        {photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoPreviewList}>
            {photos.map((photo) => (
              <View key={photo.uri} style={styles.photoPreviewItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreviewImage} />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(photo.uri)}>
                  <Trash2 size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
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

        <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={saveDiary} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>일지 저장</Text>}
        </TouchableOpacity>

        <View style={styles.diarySection}>
          <Text style={styles.sectionTitle}>{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 기록</Text>
          {loading && selectedDateDiaries.length === 0 ? (
            <ActivityIndicator color="#4CAF50" />
          ) : selectedDateDiaries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>선택한 날짜에 기록된 일지가 없습니다.</Text>
            </View>
          ) : (
            selectedDateDiaries.map((diary) => (
              <View key={diary.id} style={styles.diaryCard}>
                <View style={styles.diaryCardHeader}>
                  <Text style={styles.diaryDate}>{formatKoreanDateTime(diary.diaryDateTime)}</Text>
                  <Text style={styles.diaryCount}>{diary.photos.length}장</Text>
                </View>
                {diary.works.length > 0 && (
                  <View style={styles.diaryWorksWrap}>
                    {diary.works.map((work) => (
                      <View key={`${diary.id}-${work}`} style={styles.diaryWorkChip}>
                        <Text style={styles.diaryWorkChipText}>{work}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.diaryPreview} numberOfLines={3}>{createPreview(diary)}</Text>
                {diary.photos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedPhotoList}>
                    {diary.photos.map((photo) => (
                      <Image key={photo.id} source={imageSource(photo.photoUrl)} style={styles.savedPhotoImage} />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.sectionTitle}>이번 달 전체 일지</Text>
          {monthlyDiaries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>이번 달에 기록된 일지가 없습니다.</Text>
            </View>
          ) : (
            monthlyDiaries.map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.pastLogCard}
                onPress={() => {
                  const date = new Date(log.diaryDateTime);
                  setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
                }}
              >
                {log.thumbnailUrl ? (
                  <Image source={imageSource(log.thumbnailUrl)} style={styles.pastLogThumbnail} />
                ) : (
                  <View style={styles.pastLogEmoji}>
                    <Camera size={24} color="#4CAF50" />
                  </View>
                )}
                <View style={styles.pastLogContent}>
                  <Text style={styles.pastLogDate}>{formatKoreanDateTime(log.diaryDateTime)}</Text>
                  <Text style={styles.pastLogPreview} numberOfLines={2}>{log.preview}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#EAEAEE' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImageContainer: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(76, 175, 80, 0.3)', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
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
  dateItemSelectedLogged: { borderWidth: 2, borderColor: '#1B5E20' },
  dateText: { fontSize: 16, fontWeight: '600' },
  dateTextNormal: { color: '#000' },
  dateTextLogged: { color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarModal: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, elevation: 20, position: 'absolute', alignSelf: 'center', top: '18%' },
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
  customTaskRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  customTaskInput: { flex: 1, height: 48, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEE', paddingHorizontal: 14, fontSize: 14, color: '#111' },
  addCustomTaskButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  selectedWorksWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  workChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  workChipText: { color: '#2E7D32', fontSize: 13, fontWeight: '600' },
  photoButton: { height: 140, backgroundColor: '#F1F8E9', borderRadius: 20, borderWidth: 2, borderColor: 'rgba(76, 175, 80, 0.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 },
  photoIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 },
  photoText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  photoPreviewList: { gap: 10, paddingBottom: 24 },
  photoPreviewItem: { width: 88, height: 88, borderRadius: 16, overflow: 'hidden', position: 'relative', backgroundColor: '#E8F5E9' },
  photoPreviewImage: { width: '100%', height: '100%' },
  removePhotoButton: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  notesInput: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EAEAEE', borderRadius: 20, padding: 16, height: 120, fontSize: 15, color: '#000', marginBottom: 24 },
  saveButton: { height: 56, backgroundColor: '#4CAF50', borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 4 },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  diarySection: { marginTop: 32 },
  emptyCard: { minHeight: 72, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAEAEE', borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 16 },
  emptyText: { color: '#777', fontSize: 14 },
  diaryCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAEAEE', borderRadius: 20, padding: 16, marginBottom: 12 },
  diaryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  diaryDate: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },
  diaryCount: { fontSize: 12, color: '#777' },
  diaryWorksWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  diaryWorkChip: { backgroundColor: '#F1F8E9', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
  diaryWorkChipText: { color: '#2E7D32', fontSize: 12, fontWeight: '600' },
  diaryPreview: { fontSize: 14, color: '#555', lineHeight: 20 },
  savedPhotoList: { gap: 8, paddingTop: 12 },
  savedPhotoImage: { width: 72, height: 72, borderRadius: 14, backgroundColor: '#E8F5E9' },
  pastLogCard: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAEAEE', borderRadius: 20, padding: 16, marginBottom: 12, gap: 16 },
  pastLogEmoji: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center' },
  pastLogThumbnail: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F1F8E9' },
  pastLogContent: { flex: 1, justifyContent: 'center' },
  pastLogDate: { fontSize: 14, fontWeight: '600', color: '#4CAF50', marginBottom: 4 },
  pastLogPreview: { fontSize: 14, color: '#666', lineHeight: 20 },
});
