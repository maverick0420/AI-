import React, { useState } from 'react';
import { Card, Radio, InputNumber, Button, message, Row, Col } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import request from '../../utils/request';
import styles from './Recharge.module.css';

const RECHARGE_OPTIONS = [
  { value: 10, label: '10元' },
  { value: 50, label: '50元' },
  { value: 100, label: '100元' },
  { value: 500, label: '500元' },
  { value: 1000, label: '1000元' }
];

const Recharge: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    if (!amount || amount <= 0) {
      message.error('请输入有效的充值金额');
      return;
    }

    setLoading(true);
    try {
      const response = await request.post('/payments/recharge', { amount });
      // 这里应该跳转到支付页面或显示支付二维码
      window.location.href = response.paymentUrl;
    } catch (error) {
      message.error('充值失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.recharge}>
      <Card title="账户充值" className={styles.card}>
        <div className={styles.balance}>
          <WalletOutlined className={styles.icon} />
          <div className={styles.text}>
            <div className={styles.label}>当前余额</div>
            <div className={styles.value}>{user?.balance || 0} 元</div>
          </div>
        </div>

        <div className={styles.amountSelect}>
          <div className={styles.label}>选择充值金额</div>
          <Radio.Group
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={styles.options}
          >
            <Row gutter={[16, 16]}>
              {RECHARGE_OPTIONS.map(option => (
                <Col span={8} key={option.value}>
                  <Radio.Button
                    value={option.value}
                    className={styles.option}
                  >
                    {option.label}
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>

          <div className={styles.custom}>
            <div className={styles.label}>自定义金额</div>
            <InputNumber
              min={1}
              max={10000}
              value={amount}
              onChange={value => setAmount(value || 0)}
              addonBefore="￥"
              className={styles.input}
            />
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleRecharge}
          className={styles.button}
        >
          立即充值
        </Button>

        <div className={styles.tips}>
          <h4>充值说明：</h4>
          <ul>
            <li>充值金额将实时到账</li>
            <li>充值金额可用于购买礼物</li>
            <li>充值金额一经使用，不予退还</li>
            <li>如遇到问题，请联系客服</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Recharge; 