import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, message } from 'antd';
import { TagServices } from '@/services/Tag';
import type { TagTreeNode } from '@/services/Tag';
import { ResourceServices } from '@/services/Resource';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import TagTree from '@/components/Common/TagTree';
import type { AddTagModalProps } from './index.type';

/** 递归收集 tagName -> tagId 映射（用户可见 tag） */
const buildTagNameToIdMap = (nodes: TagTreeNode[], map: Map<string, string>): void => {
  for (const n of nodes) {
    const name = (n.tagName ?? '').trim();
    if (name) map.set(name, n.tagId);
    if (n.children?.length) buildTagNameToIdMap(n.children, map);
  }
};

const AddTagModal: React.FC<AddTagModalProps> = ({ open, onCancel, onSuccess, file }) => {
  const [selectedTag, setSelectedTag] = useState<TagTreeNode | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setSelectedTag(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleSubmit = async () => {
    if (!file || !selectedTag) {
      message.warning('请选择要添加的标签');
      return;
    }
    try {
      setLoading(true);
      const userTagTree = await TagServices.getUserTagTree();
      const nameToId = new Map<string, string>();
      buildTagNameToIdMap(userTagTree, nameToId);
      const existingNames = file.tagNames ?? [];
      const existingTagIds = existingNames
        .map((n) => nameToId.get(n))
        .filter((id): id is string => !!id);
      const newTagIds = [...new Set([...existingTagIds, selectedTag.tagId])];
      await ResourceServices.updateResourceTags({
        resourceId: file.resourceId,
        tagIds: newTagIds,
      });
      message.success('标签已添加');
      onSuccess?.();
      onCancel();
    } catch (err) {
      message.error(parseErrorMessage(err, '添加标签失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Modal
      title="添加标签"
      open={open && !!file}
      onCancel={handleCancel}
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
      <TagTree
        editable={false}
        selectedKey={selectedTag?.tagId}
        onSelect={(node) => setSelectedTag(node)}
        defaultExpandAll={false}
      />
    </Modal>
  );
};

export default AddTagModal;
