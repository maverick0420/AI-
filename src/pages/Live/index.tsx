import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Input, Button, List, Avatar, message, Space, Tag, Statistic } from 'antd';
import { SendOutlined, GiftOutlined } from '@ant-design/icons';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { Message, Gift, LiveStats } from '../../types';
import styles from './Live.module.css';
import GiftPanel from '../GiftPanel';

const Live: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const socket = useSocket(id!);
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewers, setViewers] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [stats, setStats] = useState<LiveStats | null>(null);
  
  // 视频播放器引用
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (socket) {
      // 监听消息
      socket.on('new-message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // 监听观众数量变化
      socket.on('viewers-update', (count: number) => {
        setViewers(count);
      });

      // 监听直播状态
      socket.on('stream-status', (status: boolean) => {
        setIsLive(status);
        if (!status) {
          message.info('直播已结束');
        }
      });

      // 监听礼物
      socket.on('gift-sent', (gift: Gift) => {
        message.success(`${gift.sender.username} 赠送了 ${gift.name}`);
      });

      // 添加统计数据监听
      socket.on('stats-update', (newStats: LiveStats) => {
        setStats(newStats);
      });
    }

    return () => {
      if (socket) {
        socket.off('new-message');
        socket.off('viewers-update');
        socket.off('stream-status');
        socket.off('gift-sent');
        socket.off('stats-update');
      }
    };
  }, [socket]);

  // 发送消息
  const sendMessage = (content: string) => {
    if (socket && content.trim()) {
      socket.emit('send-message', {
        content,
        roomId: id,
        type: 'text'
      });
    }
  };

  // 发送礼物
  const handleSendGift = (giftId: string) => {
    if (socket) {
      socket.emit('send-gift', {
        giftId,
        roomId: id
      });
      setShowGiftPanel(false);
    }
  };

  return (
    <div className={styles.liveContainer}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <span>直播画面</span>
                {isLive && <Tag color="red">直播中</Tag>}
                <span>观看人数: {viewers}</span>
              </Space>
            }
          >
            <video ref={videoRef} controls className={styles.videoPlayer} />
          </Card>
          
          {stats && (
            <Card title="直播数据" className={styles.statsCard}>
              <Statistic title="最高在线" value={stats.maxViewers} />
              <Statistic title="累计收益" value={stats.totalIncome} prefix="¥" />
              <Statistic title="互动消息" value={stats.messages} />
            </Card>
          )}
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title="聊天室"
            extra={
              <Button 
                type="primary" 
                icon={<GiftOutlined />}
                onClick={() => setShowGiftPanel(true)}
              >
                赠送礼物
              </Button>
            }
          >
            {/* 聊天消息列表和输入框 */}
          </Card>
        </Col>
      </Row>

      <GiftPanel
        visible={showGiftPanel}
        onClose={() => setShowGiftPanel(false)}
        onSendGift={handleSendGift}
      />
    </div>
  );
};

export default Live; 