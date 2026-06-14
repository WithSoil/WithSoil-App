import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Send, Image as ImageIcon, Clock, X } from 'lucide-react-native';
import profileImage from '../assets/image.png';
import { aiApi } from '../apis/ai';

interface ChatbotScreenProps {
  navigation: any;
}

export function ChatbotScreen({ navigation }: ChatbotScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 💡 AI 응답 대기 상태 추가
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: '안녕하세요! 저는 초보 농부를 위한 AI 비서입니다. 오늘 어떤 도움이 필요하신가요?',
    },
  ]);

  const chatHistory = [
    { id: 1, title: '토마토 잎이 노랗게 변했어요', date: '2026년 5월 28일' },
    { id: 2, title: '물 주기 주기 상담', date: '2026년 5월 27일' },
    { id: 3, title: '비료 추천 부탁드립니다', date: '2026년 5월 25일' },
    { id: 4, title: '병해충 진단 결과 확인', date: '2026년 5월 23일' },
  ];

  const suggestions = [
    '내일 비 오는데 물 줘야 해?',
    '토마토 잎이 노랗게 변했어',
    '처음 키우기 좋은 작물은?',
    '비료는 언제 주는 게 좋아?',
  ];

  // ⭐️ 찐 서버 통신용 비동기 전송 함수로 리팩토링
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiApi.sendChatQuery(userMessage);
      
      if (response && response.answer) {
        setMessages((prev) => [...prev, { role: 'ai', content: response.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: '응답 형식이 올바르지 않습니다.' }]);
      }
    } catch (error) {
      console.error('AI API 통신 에러:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '죄송합니다. 서버와 통신 중 연결이 고르지 못했습니다. 잠시 후 다시 시도해 주세요.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>초보 농부 비서</Text>
          </View>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.iconButton}>
            <Clock size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* History Modal */}
        <Modal visible={showHistory} transparent={true} animationType="slide" onRequestClose={() => setShowHistory(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.historySheet}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>지난 대화 내역</Text>
                <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.iconButton}>
                  <X size={20} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.historyList}>
                {chatHistory.map((chat) => (
                  <TouchableOpacity key={chat.id} style={styles.historyItem}>
                    <Text style={styles.historyItemTitle}>{chat.title}</Text>
                    <Text style={styles.historyItemDate}>{chat.date}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Message List */}
        <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent}>
          {messages.map((message, idx) => (
            <View key={idx} style={[styles.messageRow, message.role === 'user' ? styles.messageRowUser : styles.messageRowAI]}>
              {message.role === 'ai' && (
                <View style={styles.avatar}>
                  <Image source={profileImage} style={styles.avatarImage} />
                </View>
              )}
              <View style={[styles.messageBubble, message.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                <Text style={[styles.messageText, message.role === 'user' && styles.messageTextUser]}>
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageRow, styles.messageRowAI]}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 20 }}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.bubbleAI, { paddingVertical: 8, paddingHorizontal: 12 }]}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>추천 질문</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {suggestions.map((suggestion, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => !isLoading && setInputValue(suggestion)} 
                  style={styles.suggestionBadge}
                  disabled={isLoading}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton}>
              <ImageIcon size={20} color="#666" />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={isLoading ? "AI가 생각하는 중입니다..." : "무엇이든 물어보세요..."}
                placeholderTextColor="#999"
                onSubmitEditing={handleSend}
                editable={!isLoading} // 💡 로딩 중에는 입력창 잠금
              />
            </View>

            <TouchableOpacity 
              onPress={handleSend} 
              style={[styles.sendButton, isLoading && { backgroundColor: '#A5D6A7' }]}
              disabled={isLoading} // 💡 로딩 중에는 버튼 클릭 방지
            >
              <Send size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEE',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: { flex: 1, paddingHorizontal: 24 },
  messageListContent: { paddingVertical: 24, gap: 16 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAI: { justifyContent: 'flex-start', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8F5E9',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  messageText: { fontSize: 14, lineHeight: 20, color: '#333' },
  messageTextUser: { color: '#FFFFFF' },
  inputSection: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 12 : 24, backgroundColor: '#F1F8E9' },
  suggestionsContainer: { marginBottom: 12 },
  suggestionsLabel: { fontSize: 12, color: '#666', marginBottom: 8, fontWeight: '500' },
  suggestionsScroll: { gap: 8 },
  suggestionBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  suggestionText: { fontSize: 14, color: '#4CAF50', fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attachButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  textInput: { flex: 1, fontSize: 14, color: '#000' },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  historySheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    padding: 24,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  historyTitle: { fontSize: 20, fontWeight: '600' },
  historyList: { marginBottom: 20 },
  historyItem: {
    backgroundColor: '#F9FBE7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  historyItemTitle: { fontWeight: '600', marginBottom: 4, color: '#333' },
  historyItemDate: { fontSize: 12, color: '#888' },
});