import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, Select, message, Statistic, Row, Col } from 'antd';
import { UserOutlined, EyeOutlined, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import request from '../../utils/request';
import styles from './Studio.module.css';

const { Option } = Select;

interface LiveRoomForm {
  title: string;
  description: string;
  category: string;
}

interface StreamInfo {
  streamKey: string;
  streamUrl: string;
}

const Studio: React.FC = () => {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [stats, setStats] = useState({
    viewers: 0,
    likes: 0,
    gifts: 0
  });

  useEffect(() => {
    fetchStreamInfo();
    fetchRoomStats();
  }, []);

  const fetchStreamInfo = async () => {
    try {
      const response = await request.get('/rooms/stream-info');
      setStreamInfo(response.streamInfo);
      setIsLive(response.isLive);
    } catch (error) {
      console.error('获取推流信息失败:', error);
    }
  };

  const fetchRoomStats = async () => {
    try {
      const response = await request.get('/rooms/stats');
      setStats(response.stats);
    } catch (error) {
      console.error('获取直播间统计失败:', error);
    }
  };

  const handleStartLive = async (values: LiveRoomForm) => {
    try {
      await request.post('/rooms/start', values);
      setIsLive(true);
      message.success('开播成功');
    } catch (error) {
      message.error('开播失败');
    }
  };

  const handleEndLive = async () => {
    try {
      await request.post('/rooms/end');
      setIsLive(false);
      message.success('结束直播');
    } catch (error) {
      message.error('结束直播失败');
    }
  };

  return (
    <div className={styles.studio}>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="直播设置" extra={
            <Switch
              checked={isLive}
              onChange={handleEndLive}
              checkedChildren="直播中"
              unCheckedChildren="未开播"
            />
          }>
            <Form
              layout="vertical"
              onFinish={handleStartLive}
              initialValues={{
                category: 'chat'
              }}
            >
              <Form.Item
                name="title"
                label="直播标题"
                rules={[{ required: true, message: '请输入直播标题' }]}
              >
                <Input placeholder="请输入直播标题" />
              </Form.Item>

              <Form.Item
                name="description"
                label="直播简介"
              >
                <Input.TextArea placeholder="请输入直播简介" />
              </Form.Item>

              <Form.Item
                name="category"
                label="直播分类"
                rules={[{ required: true, message: '请选择直播分类' }]}
              >
                <Select>
                  <Option value="chat">聊天</Option>
                  <Option value="game">游戏</Option>
                  <Option value="music">音乐</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={isLive}>
                  开始直播
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {streamInfo && (
            <Card title="推流信息" className={styles.streamInfo}>
              <div className={styles.streamKey}>
                <div className={styles.label}>推流地址:</div>
                <div className={styles.value}>{streamInfo.streamUrl}</div>
              </div>
              <div className={styles.streamKey}>
                <div className={styles.label}>推流密钥:</div>
                <div className={styles.value}>{streamInfo.streamKey}</div>
              </div>
            </Card>
          )}
        </Col>

        <Col span={8}>
          <Card title="直播数据">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="观看人数"
                  value={stats.viewers}
                  prefix={<EyeOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="收到礼物"
                  value={stats.gifts}
                  prefix={<GiftOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="获得点赞"
                  value={stats.likes}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Studio; 