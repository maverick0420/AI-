import React, { useEffect, useState } from 'react';
import { Tabs, Card, Button, message } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { Gift } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import request from '../../utils/request';
import socketClient from '../../utils/socket';
import styles from './GiftPanel.module.css';

interface GiftPanelProps {
  roomId: string;
  hostId: string;
}

const GiftPanel: React.FC<GiftPanelProps> = ({ roomId, hostId }) => {
  const { user } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await request.get('/gifts');
      setGifts(response.gifts);
    } catch (error) {
      console.error('获取礼物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendGift = async (gift: Gift) => {
    if (!user) {
      message.error('请先登录');
      return;
    }

    try {
      await request.post('/gifts/send', {
        giftId: gift.id,
        roomId,
        receiverId: hostId
      });

      socketClient.sendGift(roomId, gift, user);
      message.success('赠送成功');
    } catch (error) {
      message.error('赠送失败，余额不足');
    }
  };

  return (
    <div className={styles.giftPanel}>
      <Tabs
        defaultActiveKey="popular"
        items={[
          {
            key: 'popular',
            label: '热门礼物',
            children: (
              <div className={styles.giftGrid}>
                {gifts.map(gift => (
                  <Card
                    key={gift.id}
                    hoverable
                    className={styles.giftCard}
                    onClick={() => handleSendGift(gift)}
                  >
                    <div className={styles.giftIcon}>
                      <img src={gift.icon} alt={gift.name} />
                    </div>
                    <div className={styles.giftInfo}>
                      <div className={styles.giftName}>{gift.name}</div>
                      <div className={styles.giftPrice}>
                        <GiftOutlined /> {gift.price}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          }
        ]}
      />
      {!user && (
        <div className={styles.loginTip}>
          <Button type="primary" onClick={() => message.info('请先登录')}>
            登录后赠送礼物
          </Button>
        </div>
      )}
    </div>
  );
};

export default GiftPanel; 