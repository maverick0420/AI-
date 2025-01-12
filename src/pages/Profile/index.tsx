import React, { useEffect, useState } from 'react';
import { Card, Avatar, Tabs, List, Button, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import request from '../../utils/request';
import styles from './Profile.module.css';

const { TabPane } = Tabs;

interface Room {
  id: string;
  title: string;
  coverImage: string;
  status: 'preparing' | 'live' | 'ended';
  viewers: number;
  host: {
    username: string;
  };
}

interface GiftRecord {
  id: string;
  gift: {
    name: string;
    icon: string;
    price: number;
  };
  receiver: {
    username: string;
  };
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [followingRooms, setFollowingRooms] = useState([]);
  const [giftRecords, setGiftRecords] = useState([]);

  useEffect(() => {
    if (user) {
      fetchFollowingRooms();
      fetchGiftRecords();
    }
  }, [user]);

  const fetchFollowingRooms = async () => {
    try {
      const response = await request.get('/users/following-rooms');
      setFollowingRooms(response.rooms);
    } catch (error) {
      console.error('获取关注直播间失败:', error);
    }
  };

  const fetchGiftRecords = async () => {
    try {
      const response = await request.get('/users/gift-records');
      setGiftRecords(response.records);
    } catch (error) {
      console.error('获取礼物记录失败:', error);
    }
  };

  const handleAvatarUpload = async (info: any) => {
    if (info.file.status === 'done') {
      const { url } = info.file.response;
      try {
        await request.put('/users/profile', { avatar: url });
        message.success('头像更新成功');
        checkAuth(); // 刷新用户信息
      } catch (error) {
        message.error('头像更新失败');
      }
    }
  };

  if (!user) return null;

  return (
    <div className={styles.profile}>
      <Card className={styles.userInfo}>
        <Upload
          name="avatar"
          action="/api/upload/avatar"
          showUploadList={false}
          onChange={handleAvatarUpload}
        >
          <Avatar
            size={64}
            src={user.avatar}
            icon={<UserOutlined />}
            className={styles.avatar}
          />
        </Upload>
        <h2>{user.username}</h2>
        <p>余额: {user.balance}</p>
      </Card>

      <Card className={styles.content}>
        <Tabs defaultActiveKey="following">
          <TabPane tab="关注的直播间" key="following">
            <List
              dataSource={followingRooms}
              renderItem={(room: Room) => (
                <List.Item className={styles.roomItem}>
                  <img
                    src={room.coverImage}
                    alt={room.title}
                    className={styles.roomCover}
                  />
                  <div className={styles.roomInfo}>
                    <div className={styles.roomTitle}>{room.title}</div>
                    <div className={styles.roomStatus}>
                      <span>主播: {room.host.username}</span>
                      <span>
                        状态: {
                          {
                            preparing: '未开播',
                            live: '直播中',
                            ended: '已结束'
                          }[room.status]
                        }
                      </span>
                      {room.status === 'live' && (
                        <span>观看人数: {room.viewers}</span>
                      )}
                    </div>
                  </div>
                  <Button type="link" href={`/live/${room.id}`}>
                    进入直播间
                  </Button>
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab="礼物记录" key="gifts">
            <List
              dataSource={giftRecords}
              renderItem={(record: GiftRecord) => (
                <List.Item className={styles.giftRecord}>
                  <img
                    src={record.gift.icon}
                    alt={record.gift.name}
                    className={styles.giftIcon}
                  />
                  <div className={styles.giftInfo}>
                    <div>
                      赠送给 {record.receiver.username} 的
                      {record.gift.name}
                    </div>
                    <div className={styles.giftTime}>
                      {new Date(record.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles.giftPrice}>
                    <GiftOutlined /> {record.gift.price}
                  </div>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile; 