import React from 'react';
import { Row, Col, Card, Tag, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const liveRooms = [
    {
      id: '1',
      title: '测试直播间1',
      description: '这是一个测试直播间',
      coverImage: 'https://via.placeholder.com/300x200',
      host: '主播1',
      viewers: 100,
      isLive: true,
    },
    {
      id: '2',
      title: '测试直播间2',
      description: '游戏直播',
      coverImage: 'https://via.placeholder.com/300x200',
      host: '主播2',
      viewers: 250,
      isLive: true,
    },
    {
      id: '3',
      title: '测试直播间3',
      description: '音乐直播',
      coverImage: 'https://via.placeholder.com/300x200',
      host: '主播3',
      viewers: 180,
      isLive: false,
    }
  ];

  return (
    <div className={styles.home}>
      <div className={styles.banner}>
        <h1>欢迎来到 ATY 直播</h1>
        <p>发现精彩直播，分享快乐时光</p>
      </div>
      
      <div className={styles.content}>
        <h2>热门直播</h2>
        <Row gutter={[16, 16]}>
          {liveRooms.map(room => (
            <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
              <Card
                hoverable
                cover={
                  <div className={styles.roomCover}>
                    <img alt={room.title} src={room.coverImage} />
                    {room.isLive && (
                      <Tag color="red" className={styles.liveTag}>
                        直播中
                      </Tag>
                    )}
                    <div className={styles.viewers}>
                      <UserOutlined /> {room.viewers}
                    </div>
                  </div>
                }
              >
                <Card.Meta
                  title={room.title}
                  description={
                    <>
                      <p>{room.description}</p>
                      <p>主播：{room.host}</p>
                    </>
                  }
                />
                <Button type="primary" block style={{ marginTop: 16 }}>
                  进入直播间
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home; 