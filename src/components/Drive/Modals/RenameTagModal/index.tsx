import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from 'antd';
import { useTagService } from '@/contexts/ServicesContext';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import type { RenameTagModalProps } from './index.type';
import { useAppMessage } from '@/hooks/useAppMessage';

const RenameTagModal: React.FC<RenameTagModalProps> = ({
  open,
  onCancel,
  onSuccess,
  tag,
  groupId,
}) => {
  const tagService = useTagService();
  const message = useAppMessage();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tag) {
      setName(tag.tagName ?? '');
    }
  }, [open, tag]);

  const handleSubmit = async () => {
    if (!tag?.tagId) return;
    const trimmed = name.trim();
    if (!trimmed) {
      message.warning('请输入标签名称');
      return;
    }
    try {
      setLoading(true);
      await tagService.updateTag({
        groupId: tag.groupId ?? groupId,
        targetTagId: tag.tagId,
        tagName: trimmed,
      });
      message.success('重命名成功');
      onSuccess?.();
      onCancel();
    } catch (err) {
      message.error(parseErrorMessage(err, '重命名失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    onCancel();
  };

  return (
    <Modal
      title="重命名标签"
      open={open && !!tag}
      onCancel={handleCancel}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleSubmit} loading={loading}>
          确定
        </Button>,
      ]}
      width={400}
    >
      <Input
        placeholder="请输入新名称"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onPressEnter={handleSubmit}
        autoFocus
      />
    </Modal>
  );
};

export default RenameTagModal;
