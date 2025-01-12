import React, { useEffect, useState, useRef } from 'react';
import { List, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { Message } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import socketClient from '../../utils/socket';
import styles from './ChatRoom.module.css';

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      socketClient.connect(localStorage.getItem('token') || '');
      socketClient.joinRoom(roomId);

      socketClient.onMessage((message: Message) => {
        setMessages(prev => [...prev, message]);
      });
    }

    return () => {
      socketClient.leaveRoom(roomId);
    };
  }, [roomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!inputValue.trim() || !user) return;

    socketClient.sendMessage(roomId, inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatRoom}>
      <div className={styles.messageList}>
        <List
          dataSource={messages}
          renderItem={message => (
            <List.Item className={styles.messageItem}>
              <div className={styles.messageContent}>
                <span className={styles.username}>
                  {message.sender?.username}:
                </span>
                <span className={styles.text}>{message.content}</span>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="发送消息..."
          disabled={!user}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!user}
        />
      </div>
    </div>
  );
};

export default ChatRoom; 