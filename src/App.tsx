import React from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import zhCN from 'antd/locale/zh_CN';

import { ServicesProvider } from '@/contexts/ServicesContext';
import appTheme from './theme';

const App: React.FC = () => {
  return (
    <ServicesProvider>
      <ConfigProvider
        locale={zhCN}
        theme={appTheme} // 2. 在这里直接传入对象
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </ServicesProvider>
  );
};

export default App;
