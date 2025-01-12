import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';
import styles from './Header.module.css';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, login, logout } = useAuth();

  return (
    <AntHeader className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">ATY直播</Link>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['1']}
        className={styles.menu}
      >
        <Menu.Item key="1">
          <Link to="/">首页</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/live">直播</Link>
        </Menu.Item>
      </Menu>
      <div className={styles.userArea}>
        {user ? (
          <>
            <span className={styles.username}>{user.username}</span>
            <Button onClick={logout}>退出</Button>
          </>
        ) : (
          <Button onClick={login}>登录</Button>
        )}
      </div>
    </AntHeader>
  );
};

export default Header; 