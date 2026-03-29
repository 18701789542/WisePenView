import React, { useCallback, useState } from 'react';
import { Modal, Input } from 'antd';
import { useStickerService } from '@/contexts/ServicesContext';
import { useAppMessage } from '@/hooks/useAppMessage';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import type { AddStickerModalProps } from './index.type';

const AddStickerModal: React.FC<AddStickerModalProps> = ({ open, onCancel, onSuccess }) => {
  const stickerService = useStickerService();
  const message = useAppMessage();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setName('');
    setLoading(false);
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [reset, onCancel]);

  const handleOk = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const tagId = await stickerService.addSticker({ stickerName: trimmed });
      onSuccess?.({ tagId, tagName: trimmed });
      reset();
      onCancel();
    } catch (err) {
      message.error(parseErrorMessage(err, '新增标签失败'));
      setLoading(false);
    }
  }, [name, stickerService, message, onSuccess, onCancel, reset]);

  return (
    <Modal
      title="新增标签"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okButtonProps={{ disabled: !name.trim() }}
      destroyOnClose
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onPressEnter={handleOk}
        placeholder="请输入标签名称"
        autoFocus
      />
    </Modal>
  );
};

export default AddStickerModal;
