import React, { useState } from 'react';
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

import profileImage from '../assets/image.png'; // 실제 경로에 맞게 주석 해제

interface LogbookScreenProps {
  navigation: any;
}

export function LogbookScreen({ navigation }: LogbookScreenProps) {
  const [selectedDate, setSelectedDate] = useState(15);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tasks, setTasks] = useState({
    watered: false,
    fertilized: false,
    weeded: false,
    pruned: false,
  });
  const [notes, setNotes] = useState('');

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const loggedDays = [5, 10, 15, 20, 25, 28];
  const calendarDays = Array.from({ length: 31 }, (_, i) => ({
    date: i + 1,
    hasLog: loggedDays.includes(i + 1),
  }));

  const pastLogs = [
    { id: 1, date: '5월 28일', preview: '오늘은 토마토에 물을 듬뿍 주었다. 잎이 싱싱해 보인다...', thumbnail: '🍅' },
    { id: 2, date: '5월 25일', preview: '비료를 주었더니 상추가 많이 자랐다. 내일 수확해야겠다...', thumbnail: '🥬' },
    { id: 3, date: '5월 20일', preview: '새로운 방울토마토 모종을 심었다. 햇빛이 좋아서...', thumbnail: '🌱' },
  ];

  const taskButtons = [
    { id: 'watered', label: '물 주기', icon: Droplets },
    { id: 'fertilized', label: '비료 주기', icon: Plus },
    { id: 'weeded', label: '잡초 제거', icon: Wind },
    { id: 'pruned', label: '가지치기', icon: Cloud },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
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

      {/* Date Selector Section */}
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

        {/* Horizontal Date Selector */}
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

      {/* Full Calendar Modal */}
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
            {/* Empty cells for month start (3 days) */}
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

        {/* Tasks Grid */}
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

        <TouchableOpacity style={styles.photoButton}>
          <View style={styles.photoIconCircle}>
            <Camera size={28} color="#4CAF50" />
          </View>
          <Text style={styles.photoText}>오늘의 사진 추가</Text>
        </TouchableOpacity>

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

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>일지 저장</Text>
        </TouchableOpacity>

        {/* Past Logs */}
        <View style={styles.pastLogsSection}>
          <Text style={styles.sectionTitle}>기록된 일지 보기</Text>
          {pastLogs.map((log) => (
            <TouchableOpacity key={log.id} style={styles.pastLogCard}>
              <View style={styles.pastLogEmoji}>
                <Text style={{ fontSize: 24 }}>{log.thumbnail}</Text>
              </View>
              <View style={styles.pastLogContent}>
                <Text style={styles.pastLogDate}>{log.date}</Text>
                <Text style={styles.pastLogPreview} numberOfLines={2}>{log.preview}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
});