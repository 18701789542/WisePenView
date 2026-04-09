import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import { useChatPanelStore } from '@/store';
import styles from './SystemLayout.module.less';

const { Content, Sider } = Layout;

const SystemLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const chatPanelCollapsed = useChatPanelStore((state) => state.chatPanelCollapsed);
  const setChatPanelCollapsed = useChatPanelStore((state) => state.setChatPanelCollapsed);
  const safeChatPanelCollapsed = chatPanelCollapsed;

  return (
    <Layout className={styles.root}>
      {/* 左侧 Sidebar */}
      <Sider className={styles.leftSider} width={308} theme="light" collapsed={sidebarCollapsed}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </Sider>

      {/* 中间布局 */}
      <Layout className={styles.middleLayout}>
        <Content className={styles.middleContent}>
          <Outlet />
        </Content>
      </Layout>

      {/* 右侧 AI Panel */}
      <Sider
        className={styles.rightSider}
        width={400}
        theme="light"
        collapsed={safeChatPanelCollapsed}
        collapsedWidth={0}
        trigger={null}
      >
        <div className={styles.rightSiderInner}>
          <ChatPanel
            collapsed={safeChatPanelCollapsed}
            onToggle={() => setChatPanelCollapsed(true)}
          />
        </div>
      </Sider>
    </Layout>
  );
};

export default SystemLayout;
