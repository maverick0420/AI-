import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Switch, message, Upload, Avatar } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import request from '../../utils/request';
import styles from './Settings.module.css';

const { TabPane } = Tabs;

interface ProfileForm {
  username: string;
  bio: string;
  email: string;
}

interface StreamSettings {
  quality: 'auto' | '1080p' | '720p' | '480p';
  lowLatency: boolean;
  chatDelay: number;
}

const Settings: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    quality: 'auto',
    lowLatency: true,
    chatDelay: 0
  });

  useEffect(() => {
    fetchStreamSettings();
  }, []);

  const fetchStreamSettings = async () => {
    try {
      const response = await request.get('/users/stream-settings');
      setStreamSettings(response.settings);
    } catch (error) {
      console.error('获取直播设置失败:', error);
    }
  };

  const handleProfileSubmit = async (values: ProfileForm) => {
    setLoading(true);
    try {
      await request.put('/users/profile', values);
      message.success('个人资料更新成功');
      checkAuth(); // 刷新用户信息
    } catch (error) {
      message.error('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamSettingChange = async (key: keyof StreamSettings, value: any) => {
    try {
      await request.put('/users/stream-settings', {
        [key]: value
      });
      setStreamSettings(prev => ({
        ...prev,
        [key]: value
      }));
      message.success('设置已更新');
    } catch (error) {
      message.error('设置更新失败');
    }
  };

  const handleAvatarUpload = async (info: any) => {
    if (info.file.status === 'done') {
      const { url } = info.file.response;
      try {
        await request.put('/users/profile', { avatar: url });
        message.success('头像更新成功');
        checkAuth();
      } catch (error) {
        message.error('头像更新失败');
      }
    }
  };

  return (
    <div className={styles.settings}>
      <Card className={styles.card}>
        <Tabs defaultActiveKey="profile">
          <TabPane tab="个人资料" key="profile">
            <div className={styles.avatarUpload}>
              <Upload
                name="avatar"
                action="/api/upload/avatar"
                showUploadList={false}
                onChange={handleAvatarUpload}
              >
                <Avatar
                  size={64}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                />
                <div className={styles.uploadText}>更换头像</div>
              </Upload>
            </div>

            <Form
              layout="vertical"
              initialValues={{
                username: user?.username,
                bio: user?.bio,
                email: user?.email
              }}
              onFinish={handleProfileSubmit}
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="个人简介"
                name="bio"
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="直播设置" key="stream">
            <div className={styles.streamSetting}>
              <div className={styles.settingItem}>
                <span className={styles.label}>画质设置</span>
                <div className={styles.value}>
                  <Button.Group>
                    <Button
                      type={streamSettings.quality === 'auto' ? 'primary' : 'default'}
                      onClick={() => handleStreamSettingChange('quality', 'auto')}
                    >
                      自动
                    </Button>
                    <Button
                      type={streamSettings.quality === '1080p' ? 'primary' : 'default'}
                      onClick={() => handleStreamSettingChange('quality', '1080p')}
                    >
                      1080P
                    </Button>
                    <Button
                      type={streamSettings.quality === '720p' ? 'primary' : 'default'}
                      onClick={() => handleStreamSettingChange('quality', '720p')}
                    >
                      720P
                    </Button>
                    <Button
                      type={streamSettings.quality === '480p' ? 'primary' : 'default'}
                      onClick={() => handleStreamSettingChange('quality', '480p')}
                    >
                      480P
                    </Button>
                  </Button.Group>
                </div>
              </div>

              <div className={styles.settingItem}>
                <span className={styles.label}>低延迟模式</span>
                <Switch
                  checked={streamSettings.lowLatency}
                  onChange={value => handleStreamSettingChange('lowLatency', value)}
                />
              </div>

              <div className={styles.settingItem}>
                <span className={styles.label}>聊天延迟</span>
                <div className={styles.value}>
                  <Button.Group>
                    <Button
                      type={streamSettings.chatDelay === 0 ? 'primary' : 'default'}
                      onClick={() => handleStreamSettingChange('chatDelay', 0)}
                    >
                      无延迟
                    </Button>
                    <Button
                      type={streamSettings.chatDelay === 3 ? 'primary' : 'default'}
                      onClick={() => handleStreamSettingChange('chatDelay', 3)}
                    >
                      3秒
                    </Button>
                    <Button
                      type={streamSettings.chatDelay === 5 ? 'primary' : 'default'}
                      onClick={() => handleStreamSettingChange('chatDelay', 5)}
                    >
                      5秒
                    </Button>
                  </Button.Group>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings; 