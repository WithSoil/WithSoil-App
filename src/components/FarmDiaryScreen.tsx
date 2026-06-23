import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Camera,
  Calendar as CalendarIcon,
  X,
  Bell,
  Settings,
  Trash2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import profileImage from '../assets/image.png';
import { diaryApi } from '../apis/diary';
import { apiClient } from '../apis/apiClient';

interface FarmDiaryScreenProps {
  navigation: any;
  route?: any;
}

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

const createPreview = (diary: any) => {
  if (diary.memo?.trim()) {
    return diary.memo.trim();
  }
  if (diary.works?.length > 0) {
    return diary.works.join(', ');
  }
  return '기록된 내용이 없습니다.';
};

export function FarmDiaryScreen({ navigation, route }: FarmDiaryScreenProps) {
  const today = useMemo(() => new Date(), []);
  const { width: screenWidth } = useWindowDimensions();
  const dateScrollRef = useRef<ScrollView>(null);
  const yearPickerRef = useRef<ScrollView>(null);
  const monthPickerRef = useRef<ScrollView>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [customWork, setCustomWork] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [monthlyDiaries, setMonthlyDiaries] = useState<any[]>([]);
  const [selectedDateDiaries, setSelectedDateDiaries] = useState<any[]>([]);
  const [loggedDays, setLoggedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  const editMode = route?.params?.editMode || false;
  const editDiaryId = route?.params?.diaryId;
  const existingData = route?.params?.existingData;

  const monthKey = toMonthKey(currentMonth);
  const selectedDateKey = toDateKey(selectedDate);
  const daysInMonth = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1);
  const calendarDays = daysInMonth.map((date) => ({ date, hasLog: loggedDays.has(date) }));
  const monthTitle = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;
  const dateItemWidth = 48;
  const dateItemGap = 8;
  const dateItemStep = dateItemWidth + dateItemGap;
  const dateListSidePadding = Math.max(24, (screenWidth - dateItemWidth) / 2);
  const yearOptions = useMemo(
    () => Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i),
    [today]
  );
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  const imageSource = (uri: string) => ({
    uri: `${apiClient.defaults.baseURL}${uri}`,
    headers: userToken ? { Authorization: `Bearer ${userToken}` } : undefined,
  });

  const loadMonthlyData = useCallback(async () => {
    const [summaries, calendar] = await Promise.all([
      diaryApi.getMonthlyDiaries(monthKey),
      diaryApi.getMonthlyCalendar(monthKey),
    ]);
    setMonthlyDiaries(summaries || []);
    setLoggedDays(new Set((calendar || []).map((item: any) => Number(item.date.split('-')[2]))));
  }, [monthKey]);

  const loadSelectedDateDiaries = useCallback(async () => {
    const diaries = await diaryApi.getDiariesByDate(selectedDateKey);
    setSelectedDateDiaries(diaries || []);
  }, [selectedDateKey]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadMonthlyData(), loadSelectedDateDiaries()]);
    } catch (error) {
      console.error('일지 목록 불러오기 실패:', error);
      Alert.alert('일지 조회 실패', '농부일지를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [loadMonthlyData, loadSelectedDateDiaries]);

  useEffect(() => {
    AsyncStorage.getItem('userToken').then(setUserToken).catch(() => setUserToken(null));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const scrollX = Math.max(0, (selectedDate.getDate() - 1) * dateItemStep);
    requestAnimationFrame(() => {
      dateScrollRef.current?.scrollTo({ x: scrollX, animated: true });
    });
  }, [selectedDate, monthKey, screenWidth]);

  useEffect(() => {
    if (editMode && existingData) {
      const dateObj = new Date(existingData.diaryDateTime);
      setCurrentMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
      setSelectedDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
      setSelectedWorks(existingData.works || []);
      setNotes(existingData.memo || '');
      setExistingPhotos(existingData.photos || []);
    }
  }, [editMode, existingData]);

  useEffect(() => {
    if (!showMonthPicker) {
      return;
    }

    const selectedYearIndex = Math.max(0, yearOptions.indexOf(pickerYear));
    requestAnimationFrame(() => {
      yearPickerRef.current?.scrollTo({ y: selectedYearIndex * 44, animated: false });
      monthPickerRef.current?.scrollTo({ y: pickerMonth * 44, animated: false });
    });
  }, [showMonthPicker, pickerYear, pickerMonth, yearOptions]);

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    const nextSelectedDay = Math.min(selectedDate.getDate(), getDaysInMonth(nextMonth));
    setCurrentMonth(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextSelectedDay));
  };

  const selectDay = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  const openMonthPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setPickerMonth(currentMonth.getMonth());
    setShowMonthPicker(true);
  };

  const applyMonthPicker = () => {
    const nextMonth = new Date(pickerYear, pickerMonth, 1);
    const nextSelectedDay = Math.min(selectedDate.getDate(), getDaysInMonth(nextMonth));
    setCurrentMonth(nextMonth);
    setSelectedDate(new Date(pickerYear, pickerMonth, nextSelectedDay));
    setShowMonthPicker(false);
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

  const pickImage = async () => {
    try {
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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhotos((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
        setExistingPhotos([]);
      }
    } catch (error) {
      Alert.alert('오류', '이미지를 불러오는 중 문제가 발생했습니다.');
    }
  };

  const removePhoto = (uri: string) => {
    setSelectedPhotos((prev) => prev.filter((photoUri) => photoUri !== uri));
  };

  const removeExistingPhoto = (photoId: number) => {
    setExistingPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const resetForm = () => {
    setSelectedWorks([]);
    setCustomWork('');
    setNotes('');
    setSelectedPhotos([]);
    setExistingPhotos([]);
  };

  const handleSaveDiary = async () => {
    const trimmedCustomWork = customWork.trim();
    const works = trimmedCustomWork && !selectedWorks.includes(trimmedCustomWork)
      ? [...selectedWorks, trimmedCustomWork]
      : selectedWorks;

    if (works.length === 0 && !notes.trim() && selectedPhotos.length === 0 && existingPhotos.length === 0) {
      Alert.alert('입력 필요', '오늘 한 일, 사진, 메모 중 하나 이상을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        diaryDateTime: toDiaryDateTime(selectedDate),
        works,
        memo: notes.trim(),
        photoUris: selectedPhotos,
      };

      if (editMode) {
        await diaryApi.updateDiary(editDiaryId, payload);
        Alert.alert('수정 완료', '농부일지가 수정되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              navigation.navigate('FarmDiary', { editMode: false, existingData: null });
              refresh();
            },
          },
        ]);
      } else {
        await diaryApi.createDiary(payload);
        resetForm();
        await refresh();
        Alert.alert('저장 완료', '농부일지가 저장되었습니다.');
      }
    } catch (error: any) {
      console.error('일지 저장 에러:', error);
      const errMsg = error.response?.data?.message || '농부일지를 저장하지 못했어요. 입력값과 네트워크를 확인해주세요.';
      Alert.alert('저장 실패', errMsg);
    } finally {
      setSaving(false);
    }
  };

  const renderSelectedDateDiaries = () => {
    if (editMode) {
      return null;
    }

    return (
      <View style={styles.selectedDiarySection}>
        <Text style={styles.sectionTitle}>{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 기록</Text>
        {loading && selectedDateDiaries.length === 0 ? (
          <ActivityIndicator color="#4CAF50" />
        ) : selectedDateDiaries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>선택한 날짜에 기록된 일지가 없습니다.</Text>
          </View>
        ) : (
          selectedDateDiaries.map((diary) => (
            <TouchableOpacity
              key={diary.id}
              style={styles.diaryCard}
              onPress={() => navigation.navigate('DiaryDetailScreen', { diaryId: diary.id })}
            >
              <View style={styles.diaryCardHeader}>
                <Text style={styles.diaryDate}>{formatKoreanDateTime(diary.diaryDateTime)}</Text>
                <Text style={styles.diaryCount}>{diary.photos?.length || 0}장</Text>
              </View>
              {diary.works?.length > 0 && (
                <View style={styles.diaryWorksWrap}>
                  {diary.works.map((work: string) => (
                    <View key={`${diary.id}-${work}`} style={styles.diaryWorkChip}>
                      <Text style={styles.diaryWorkChipText}>{work}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.diaryPreview} numberOfLines={3}>{createPreview(diary)}</Text>
              {diary.photos?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedPhotoList}>
                  {diary.photos.map((photo: any) => (
                    <Image key={photo.id} source={imageSource(photo.imageUrl)} style={styles.savedPhotoImage} />
                  ))}
                </ScrollView>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
    );
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

        <ScrollView
          ref={dateScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.dateScroll, { paddingHorizontal: dateListSidePadding }]}
        >
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
                <Text style={[styles.dateText, isSelected || hasLog ? styles.dateTextSelected : styles.dateTextNormal]}>
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
            <TouchableOpacity activeOpacity={0.75} onPress={openMonthPicker} style={styles.calendarTitleButton}>
              <Text style={styles.calendarModalTitle}>{monthTitle}</Text>
              <ChevronDown size={18} color="#4CAF50" />
            </TouchableOpacity>
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

      <Modal visible={showMonthPicker} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowMonthPicker(false)}>
          <View style={styles.monthPickerOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.monthPickerSheet}>
          <View style={styles.monthPickerHeader}>
            <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
              <Text style={styles.monthPickerCancel}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.monthPickerTitle}>연도와 월 선택</Text>
            <TouchableOpacity onPress={applyMonthPicker}>
              <Text style={styles.monthPickerDone}>완료</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.monthPickerColumns}>
            <ScrollView ref={yearPickerRef} showsVerticalScrollIndicator={false} style={styles.monthPickerColumn}>
              {yearOptions.map((year) => {
                const isSelected = pickerYear === year;
                return (
                  <TouchableOpacity key={year} style={styles.monthPickerOption} onPress={() => setPickerYear(year)}>
                    <Text style={[styles.monthPickerOptionText, isSelected && styles.monthPickerOptionTextSelected]}>
                      {year}년
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <ScrollView ref={monthPickerRef} showsVerticalScrollIndicator={false} style={styles.monthPickerColumn}>
              {monthOptions.map((month) => {
                const isSelected = pickerMonth === month;
                return (
                  <TouchableOpacity key={month} style={styles.monthPickerOption} onPress={() => setPickerMonth(month)}>
                    <Text style={[styles.monthPickerOptionText, isSelected && styles.monthPickerOptionTextSelected]}>
                      {month + 1}월
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentPadding}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#4CAF50" />}
      >
        {renderSelectedDateDiaries()}

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
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <View style={styles.photoIconCircle}>
            <Camera size={28} color="#4CAF50" />
          </View>
          <Text style={styles.photoText}>오늘의 사진 추가</Text>
        </TouchableOpacity>

        {(selectedPhotos.length > 0 || existingPhotos.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoPreviewList}>
            {existingPhotos.map((photo) => (
              <View key={`existing-${photo.id}`} style={styles.photoPreviewItem}>
                <Image source={imageSource(photo.imageUrl)} style={styles.photoPreviewImage} />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => removeExistingPhoto(photo.id)}>
                  <Trash2 size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedPhotos.map((uri) => (
              <View key={uri} style={styles.photoPreviewItem}>
                <Image source={{ uri }} style={styles.photoPreviewImage} />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(uri)}>
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

        {!editMode && (
          <>
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
          </>
        )}
      </ScrollView>

      <View style={styles.saveButtonFooter}>
        <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSaveDiary} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{editMode ? '일지 수정 완료' : '일지 저장'}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  dateScroll: { gap: 8 },
  dateItem: { minWidth: 48, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dateItemNormal: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAEAEE' },
  dateItemLogged: { backgroundColor: '#4CAF50', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 },
  dateItemSelectedNormal: { backgroundColor: '#4CAF50', borderWidth: 1, borderColor: '#4CAF50' },
  dateItemSelectedLogged: { borderWidth: 2, borderColor: '#1B5E20' },
  dateText: { fontSize: 16, fontWeight: '600' },
  dateTextNormal: { color: '#000' },
  dateTextSelected: { color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  calendarModal: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, elevation: 20, position: 'absolute', alignSelf: 'center', top: '18%' },
  calendarModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  calendarTitleButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F1F8E9', borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.25)', borderRadius: 18, paddingVertical: 8, paddingLeft: 14, paddingRight: 10 },
  calendarModalTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayHeader: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#888', fontWeight: '600', paddingVertical: 8 },
  calendarCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  calendarCellText: { fontSize: 14, color: '#333' },
  calendarCellTextSelected: { fontWeight: 'bold', color: '#4CAF50' },
  logDot: { position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#4CAF50' },
  monthPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  monthPickerSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 28 },
  monthPickerHeader: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#EAEAEE' },
  monthPickerCancel: { fontSize: 15, color: '#777', fontWeight: '600' },
  monthPickerTitle: { fontSize: 16, color: '#111', fontWeight: '700' },
  monthPickerDone: { fontSize: 15, color: '#4CAF50', fontWeight: '700' },
  monthPickerColumns: { height: 216, flexDirection: 'row', paddingHorizontal: 32, paddingTop: 12, gap: 16 },
  monthPickerColumn: { flex: 1 },
  monthPickerOption: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  monthPickerOptionText: { fontSize: 18, color: '#777', fontWeight: '500' },
  monthPickerOptionTextSelected: { color: '#111', fontSize: 22, fontWeight: '800' },
  mainContent: { flex: 1, backgroundColor: '#FAFAFA' },
  mainContentPadding: { padding: 24, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 12 },
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
  notesInput: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EAEAEE', borderRadius: 20, padding: 16, height: 120, fontSize: 15, color: '#000', marginBottom: 12 },
  saveButtonFooter: { backgroundColor: '#FAFAFA', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#EAEAEE' },
  saveButton: { height: 56, backgroundColor: '#4CAF50', borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 4 },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  selectedDiarySection: { marginBottom: 12 },
  diarySection: { marginTop: 12 },
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
