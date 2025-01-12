import React from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AntHeader className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">ATY直播</Link>
      </div>
      
      <Menu mode="horizontal" className={styles.menu}>
        <Menu.Item key="home">
          <Link to="/">首页</Link>
        </Menu.Item>
        <Menu.Item key="live">
          <Link to="/live">直播</Link>
        </Menu.Item>
      </Menu>

      <div className={styles.actions}>
        {user ? (
          <>
            <Button 
              type="primary" 
              icon={<VideoCameraOutlined />}
              onClick={() => navigate('/studio')}
            >
              开播
            </Button>
            <Avatar src={user.avatar} icon={<UserOutlined />} />
            <Menu mode="horizontal">
              <Menu.SubMenu 
                key="user" 
                title={user.username}
              >
                <Menu.Item key="profile">
                  <Link to="/profile">个人中心</Link>
                </Menu.Item>
                <Menu.Item key="settings">
                  <Link to="/settings">设置</Link>
                </Menu.Item>
                <Menu.Item key="logout" onClick={logout}>
                  退出登录
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          </>
        ) : (
          <>
            <Button onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </>
        )}
      </div>
    </AntHeader>
  );
};

export default Header; 