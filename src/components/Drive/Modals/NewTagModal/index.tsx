import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from 'antd';
import { useTagService } from '@/contexts/ServicesContext';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import type { NewTagModalProps } from './index.type';
import { useAppMessage } from '@/hooks/useAppMessage';

import styles from './index.module.less';

const NewTagModal: React.FC<NewTagModalProps> = ({
  open,
  onCancel,
  onSuccess,
  groupId,
  parentTagId,
  parentDisplayName,
}) => {
  const tagService = useTagService();
  const message = useAppMessage();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      message.warning('请输入标签名称');
      return;
    }
    try {
      setLoading(true);
      await tagService.addTag({
        groupId,
        ...(parentTagId ? { parentId: parentTagId } : {}),
        tagName: trimmed,
      });
      message.success('新建成功');
      onSuccess?.();
      onCancel();
    } catch (err) {
      message.error(parseErrorMessage(err, '新建失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    onCancel();
  };

  const pathHint = parentTagId
    ? `将在「${parentDisplayName ?? '当前标签'}」下创建子标签`
    : '将创建顶级标签';

  return (
    <Modal
      title="新建标签"
      open={open}
      onCancel={handleCancel}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleSubmit} loading={loading}>
          创建
        </Button>,
      ]}
      width={420}
    >
      <div className={styles.pathHint}>{pathHint}</div>
      <Input
        placeholder="请输入标签名称"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onPressEnter={handleSubmit}
        autoFocus
        className={styles.input}
      />
    </Modal>
  );
};

export default NewTagModal;
