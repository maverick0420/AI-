import React from 'react';
import { Card, Row, Col, Tag, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';
import styles from './Home.module.css';

// 模拟数据
const mockRooms = [
  {
    id: '1',
    title: '测试直播间1',
    coverImage: 'https://via.placeholder.com/300x200',
    status: 'live',
    host: {
      username: '主播1',
      avatar: 'https://via.placeholder.com/100'
    },
    viewers: 1000
  },
  {
    id: '2',
    title: '测试直播间2',
    coverImage: 'https://via.placeholder.com/300x200',
    status: 'live',
    host: {
      username: '主播2',
      avatar: 'https://via.placeholder.com/100'
    },
    viewers: 500
  }
];

const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      <div className={styles.banner}>
        <h1>ATY直播</h1>
        <p>高清赛事直播平台</p>
      </div>

      <div className={styles.content}>
        <h2>热门直播</h2>
        <Row gutter={[16, 16]}>
          {mockRooms.map(room => (
            <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
              <Link to={`/live/${room.id}`}>
                <Card
                  hoverable
                  cover={
                    <div className={styles.roomCover}>
                      <img alt={room.title} src={room.coverImage} />
                      {room.status === 'live' && (
                        <Tag color="error" className={styles.liveTag}>
                          直播中
                        </Tag>
                      )}
                      <div className={styles.viewers}>
                        <EyeOutlined /> {room.viewers}
                      </div>
                    </div>
                  }
                >
                  <Card.Meta
                    avatar={<Avatar icon={<UserOutlined />} src={room.host.avatar} />}
                    title={room.title}
                    description={room.host.username}
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home; 