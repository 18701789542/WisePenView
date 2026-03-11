import React from 'react';
import { Modal, Button } from 'antd';
import type { MoveToFolderModalProps } from '../index.type';
import styles from './style.module.less';

const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  open,
  onCancel,
  onSuccess,
  target,
}) => {
  const handleSubmit = () => {
    // TODO: 实现移动逻辑
    onSuccess?.();
    onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  const displayName =
    target?.type === 'file'
      ? target.data.resourceName || '未命名'
      : (target?.data.tagName?.split('/').pop() ?? '');

  return (
    <Modal
      title="移动到文件夹"
      open={open && !!target}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleSubmit}>
          确定
        </Button>,
      ]}
      width={400}
    >
      <div className={styles.wrapper}>
        <div className={styles.targetName}>即将移动：{displayName}</div>
        {/* TODO: 添加目标文件夹选择 UI */}
      </div>
    </Modal>
  );
};

export default MoveToFolderModal;
