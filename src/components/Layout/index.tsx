import React from 'react';
import { Layout as AntLayout } from 'antd';
import Header from '../Header';
import styles from './Layout.module.css';

const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout className={styles.layout}>
      <Header />
      <Content className={styles.content}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout; 