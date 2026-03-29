import React, { useState } from 'react';
import { Button, Tabs } from 'antd';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { LuTags } from 'react-icons/lu';
import FlatDrive from '@/components/Drive/FlatDrive';
import TreeDrive from '@/components/Drive/TreeDrive';
import { StickerManageModal } from '@/components/Drive/Modals';
import { useDrivePreferencesStore, type DriveViewMode } from '@/store';

import { UploadDocumentModal } from './UploadDocumentModal';
import styles from './style.module.less';

const VIEW_TABS: { key: DriveViewMode; label: string }[] = [
  { key: 'folder', label: '文件夹管理' },
  { key: 'flat', label: '按标签管理' },
];

const Drive: React.FC = () => {
  const viewMode = useDrivePreferencesStore((s) => s.viewMode);
  const setViewMode = useDrivePreferencesStore((s) => s.setViewMode);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [stickerManageOpen, setStickerManageOpen] = useState(false);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeaderWithActions}>
        <div>
          <h1 className={styles.pageTitle}>文档与云盘</h1>
          <span className={styles.pageSubtitle}>管理您的项目和文档</span>
        </div>
        <div className={styles.actionsRow}>
          <Button icon={<LuTags size={16} />} onClick={() => setStickerManageOpen(true)}>
            管理标签
          </Button>
          <Button
            type="primary"
            icon={<AiOutlineCloudUpload size={16} />}
            onClick={() => setUploadModalOpen(true)}
          >
            上传文件
          </Button>
        </div>
      </div>

      <div className={styles.tabsWithSearch}>
        <Tabs
          activeKey={viewMode}
          onChange={(k) => setViewMode(k as DriveViewMode)}
          items={VIEW_TABS}
          className={styles.tabsFlush}
        />
      </div>

      <div className={styles.previewContent}>
        {viewMode === 'flat' && <FlatDrive />}
        {viewMode === 'folder' && <TreeDrive />}
      </div>

      <UploadDocumentModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
      <StickerManageModal open={stickerManageOpen} onCancel={() => setStickerManageOpen(false)} />
    </div>
  );
};

export default Drive;
