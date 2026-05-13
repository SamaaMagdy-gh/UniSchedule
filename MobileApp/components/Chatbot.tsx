import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react-native';
import { API_URL } from '../constants/utils/constant';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'bot', text: 'Hi! I am UniSchedule AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newUserMsg = { id: Date.now().toString(), sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsOpen(true)}
        style={styles.fab}
      >
        <MessageCircle color="white" size={28} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
           
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Bot color="white" size={20} />
                <Text style={styles.headerText}>UniSchedule AI</Text>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X color="white" size={24} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messagesList}
              renderItem={({ item }) => (
                <View style={[
                  styles.messageBubble,
                  item.sender === 'user' ? styles.userBubble : styles.botBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    item.sender === 'user' ? styles.userText : styles.botText
                  ]}>
                    {item.text}
                  </Text>
                </View>
              )}
              ListFooterComponent={() => isTyping && (
                <View style={[styles.messageBubble, styles.botBubble, styles.typingContainer]}>
                  <ActivityIndicator size="small" color="#1a431e" />
                </View>
              )}
            />

           
            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask me anything..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                onPress={handleSend}
                disabled={!input.trim() || isTyping}
                style={[
                  styles.sendButton,
                  (!input.trim() || isTyping) && styles.sendButtonDisabled
                ]}
              >
                <Send color="white" size={20} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a431e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1a431e',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a431e',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#333',
  },
  typingContainer: {
    paddingVertical: 8,
    width: 60,
    alignItems: 'center',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a431e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
