import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card } from 'antd';
import { LiveRoom as ILiveRoom } from '../../types';
import LivePlayer from '../../components/LivePlayer';
import ChatRoom from '../../components/ChatRoom';
import GiftPanel from '../../components/GiftPanel';
import request from '../../utils/request';
import styles from './Live.module.css';

const Live: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<ILiveRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const response = await request.get(`/rooms/${id}`);
      setRoom(response.room);
    } catch (error) {
      console.error('获取直播间详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!room) {
    return <div>直播间不存在</div>;
  }

  return (
    <div className={styles.live}>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Card title={room.title} bordered={false}>
            <LivePlayer room={room} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className={styles.rightPanel}>
            <ChatRoom roomId={room.id} />
            <GiftPanel roomId={room.id} hostId={room.host.id} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Live; 