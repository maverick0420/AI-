import React from 'react';
import { Modal, Row, Col, Card, Button, message } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import styles from './GiftPanel.module.css';

interface GiftPanelProps {
  visible: boolean;
  onClose: () => void;
  onSendGift: (giftId: string) => void;
}

const gifts = [
  { id: '1', name: '鲜花', price: 1, icon: '🌹' },
  { id: '2', name: '蛋糕', price: 5, icon: '🎂' },
  { id: '3', name: '火箭', price: 100, icon: '🚀' },
  { id: '4', name: '皇冠', price: 500, icon: '👑' },
];

const GiftPanel: React.FC<GiftPanelProps> = ({ visible, onClose, onSendGift }) => {
  const { user } = useAuth();

  const handleSendGift = (gift: typeof gifts[0]) => {
    if (!user) {
      message.error('请先登录');
      return;
    }
    if (user.balance < gift.price) {
      message.error('余额不足，请先充值');
      return;
    }
    onSendGift(gift.id);
    message.success(`成功赠送${gift.name}`);
  };

  return (
    <Modal
      title="赠送礼物"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        {gifts.map(gift => (
          <Col span={12} key={gift.id}>
            <Card hoverable className={styles.giftCard}>
              <div className={styles.giftIcon}>{gift.icon}</div>
              <div className={styles.giftName}>{gift.name}</div>
              <div className={styles.giftPrice}>{gift.price} 币</div>
              <Button 
                type="primary" 
                onClick={() => handleSendGift(gift)}
              >
                赠送
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default GiftPanel; 