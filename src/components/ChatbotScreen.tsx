import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Alert,
} from 'react-native';
import { ArrowLeft, Send, Image as ImageIcon, Clock, X, Plus, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import profileImage from '../assets/image.png';
import { AiChatSummaryResponseDto, aiApi } from '../apis/ai';

interface ChatbotScreenProps {
  navigation: any;
}

type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
  imageUri?: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: 'ai',
    content: '안녕하세요! 저는 초보 농부를 위한 AI 비서입니다. 오늘 어떤 도움이 필요하신가요?',
  },
];

const suggestions = [
  '내일 비 오는데 물 줘야 해?',
  '토마토 잎이 노랗게 변했어',
  '처음 키우기 좋은 작물은?',
  '비료는 언제 주는 게 좋아?',
];

const formatDate = (dateTime?: string | null) => {
  if (!dateTime) {
    return '날짜 정보 없음';
  }

  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) {
    return dateTime;
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const getImageFileName = (imageUri: string) => {
  const uriWithoutQuery = imageUri.split('?')[0];
  return uriWithoutQuery.split('/').pop() || 'chat_image.jpg';
};

const getImageContentType = (fileName: string, fallback?: string) => {
  if (fallback) {
    return fallback;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'webp') {
    return 'image/webp';
  }
  if (extension === 'heic') {
    return 'image/heic';
  }
  return 'image/jpeg';
};

const appendImageFile = async (formData: FormData, imageUri: string) => {
  const fileName = getImageFileName(imageUri);

  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const contentType = getImageContentType(fileName, blob.type);
    const file = new File([blob], fileName, { type: contentType });

    formData.append('file', file);
    return;
  }

  formData.append('file', {
    uri: imageUri,
    name: fileName,
    type: getImageContentType(fileName),
  } as any);
};

export function ChatbotScreen({ navigation }: ChatbotScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('새 대화');
  const [chatHistories, setChatHistories] = useState<AiChatSummaryResponseDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const loadChatHistories = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const histories = await aiApi.getChatHistories();
      setChatHistories(histories);
    } catch (error) {
      console.error('AI 채팅방 목록 조회 에러:', error);
      setHistoryError('지난 대화 내역을 불러오지 못했습니다.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const openHistory = () => {
    setShowHistory(true);
    loadChatHistories();
  };

  const handleStartNewChat = () => {
    setCurrentChatId(null);
    setCurrentChatTitle('새 대화');
    setMessages(initialMessages);
    setInputValue('');
    setSelectedImageUri(null);
    setShowHistory(false);
  };

  const handleSelectHistory = async (chatId: number) => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const detail = await aiApi.getChatHistory(chatId);
      const loadedMessages = detail.messages.map((message) => ({
        role: message.role === 'USER' ? 'user' : 'ai',
        content: message.content,
      })) as ChatMessage[];

      setCurrentChatId(detail.chatId);
      setCurrentChatTitle(detail.title || '지난 대화');
      setMessages(loadedMessages.length > 0 ? loadedMessages : initialMessages);
      setShowHistory(false);
    } catch (error) {
      console.error('AI 채팅방 상세 조회 에러:', error);
      setHistoryError('선택한 대화방을 불러오지 못했습니다.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = (chatId: number) => {
    Alert.alert(
      '대화 삭제',
      '선택한 대화 내역을 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await aiApi.deleteChatHistory(chatId);
              setChatHistories((prev) => prev.filter((chat) => chat.chatId !== chatId));

              if (currentChatId === chatId) {
                handleStartNewChat();
              }
            } catch (error) {
              console.error('AI 채팅방 삭제 에러:', error);
              Alert.alert('삭제 실패', '대화 내역을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.');
            }
          },
        },
      ],
    );
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImageUri) || isLoading) {
      return;
    }

    const userMessage = inputValue.trim() || '이 사진을 보고 알려줘.';
    const attachedImageUri = selectedImageUri;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, imageUri: attachedImageUri ?? undefined },
    ]);
    setInputValue('');
    setSelectedImageUri(null);
    setIsLoading(true);

    try {
      let response;

      if (attachedImageUri) {
        const formData = new FormData();
        formData.append('query', userMessage);
        if (currentChatId) {
          formData.append('chatId', String(currentChatId));
        }
        await appendImageFile(formData, attachedImageUri);
        response = await aiApi.sendChatQueryWithImage(formData);
      } else {
        response = await aiApi.sendChatQuery(userMessage, currentChatId ?? undefined);
      }

      if (response && response.answer) {
        setCurrentChatId(response.chatId);
        setCurrentChatTitle(response.title || userMessage);
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

  const handleAttachPress = async () => {
    if (isLoading) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('이미지 선택 에러:', error);
      Alert.alert('이미지 선택 실패', '이미지를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
            <View style={styles.titleGroup}>
              <Text style={styles.headerTitle}>초보 농부 비서</Text>
              <Text numberOfLines={1} style={styles.headerSubtitle}>{currentChatTitle}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleStartNewChat} style={styles.iconButton}>
              <Plus size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openHistory} style={styles.iconButton}>
              <Clock size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showHistory} transparent animationType="slide" onRequestClose={() => setShowHistory(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.historySheet}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={styles.historyTitle}>지난 대화 내역</Text>
                  <Text style={styles.historySubTitle}>대화를 선택하면 이어서 질문할 수 있어요.</Text>
                </View>
                <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.iconButton}>
                  <X size={20} color="#000" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleStartNewChat} style={styles.newChatButton}>
                <Plus size={18} color="#4CAF50" />
                <Text style={styles.newChatButtonText}>새 대화 시작</Text>
              </TouchableOpacity>

              {historyLoading ? (
                <View style={styles.historyState}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={styles.historyStateText}>대화 내역을 불러오는 중입니다.</Text>
                </View>
              ) : historyError ? (
                <View style={styles.historyState}>
                  <Text style={styles.historyStateText}>{historyError}</Text>
                  <TouchableOpacity onPress={loadChatHistories} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : chatHistories.length === 0 ? (
                <View style={styles.historyState}>
                  <Text style={styles.historyStateText}>아직 저장된 대화가 없습니다.</Text>
                </View>
              ) : (
                <ScrollView style={styles.historyList}>
                  {chatHistories.map((chat) => (
                    <View key={chat.chatId} style={styles.historyItem}>
                      <TouchableOpacity
                        style={styles.historyItemContent}
                        onPress={() => handleSelectHistory(chat.chatId)}
                      >
                        <Text numberOfLines={1} style={styles.historyItemTitle}>{chat.title}</Text>
                        <Text numberOfLines={1} style={styles.historyItemPreview}>
                          {chat.lastMessage || '대화 내용 없음'}
                        </Text>
                        <Text style={styles.historyItemDate}>
                          {formatDate(chat.lastMessageDateTime || chat.chatDateTime)}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteHistory(chat.chatId)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={18} color="#9E9E9E" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        >
          {messages.map((message, idx) => (
            <View key={`${message.role}-${idx}`} style={[styles.messageRow, message.role === 'user' ? styles.messageRowUser : styles.messageRowAI]}>
              {message.role === 'ai' && (
                <View style={styles.avatar}>
                  <Image source={profileImage} style={styles.avatarImage} />
                </View>
              )}
              <View style={[styles.messageBubble, message.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                <Text style={[styles.messageText, message.role === 'user' && styles.messageTextUser]}>
                  {message.content}
                </Text>
                {message.imageUri && (
                  <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
                )}
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageRow, styles.messageRowAI]}>
              <View style={styles.avatar}>
                <Image source={profileImage} style={styles.avatarImage} />
              </View>
              <View style={[styles.messageBubble, styles.bubbleAI, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>답변을 작성하고 있어요.</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputSection}>
          {selectedImageUri && (
            <View style={styles.selectedImagePreview}>
              <Image source={{ uri: selectedImageUri }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImageUri(null)}
              >
                <X size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>추천 질문</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
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
            <TouchableOpacity style={styles.attachButton} onPress={handleAttachPress}>
              <ImageIcon size={20} color="#666" />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={isLoading ? 'AI가 생각하는 중입니다...' : '무엇이든 물어보세요...'}
                placeholderTextColor="#999"
                onSubmitEditing={handleSend}
                editable={!isLoading}
                returnKeyType="send"
              />
            </View>

            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendButton, (isLoading || (!inputValue.trim() && !selectedImageUri)) && styles.sendButtonDisabled]}
              disabled={isLoading || (!inputValue.trim() && !selectedImageUri)}
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
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleGroup: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerSubtitle: { marginTop: 2, fontSize: 12, color: '#777' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    maxWidth: '78%',
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
  messageImage: {
    width: 160,
    height: 120,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#E8F5E9',
  },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: '#666' },
  inputSection: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    backgroundColor: '#F1F8E9',
  },
  selectedImagePreview: {
    width: 96,
    height: 96,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#E8F5E9',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  sendButtonDisabled: { backgroundColor: '#A5D6A7' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  historySheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    padding: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  historySubTitle: { marginTop: 6, fontSize: 13, color: '#777' },
  newChatButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.35)',
    backgroundColor: '#F8FFF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  newChatButtonText: { color: '#4CAF50', fontWeight: '700' },
  historyList: { marginBottom: 8 },
  historyItem: {
    backgroundColor: '#F9FBE7',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemContent: { flex: 1, padding: 16 },
  historyItemTitle: { fontWeight: '700', marginBottom: 6, color: '#333', fontSize: 15 },
  historyItemPreview: { fontSize: 13, color: '#666', marginBottom: 8 },
  historyItemDate: { fontSize: 12, color: '#888' },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  historyState: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  historyStateText: { color: '#666', fontSize: 14, textAlign: 'center' },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
  },
  retryButtonText: { color: '#FFF', fontWeight: '700' },
});
