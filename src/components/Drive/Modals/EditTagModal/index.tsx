import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Button } from 'antd';
import type { TagTreeNode } from '@/services/Tag/index.type';
import { useResourceService } from '@/contexts/ServicesContext';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import TreeNav from '@/components/Drive/TreeNav';
import { useAppMessage } from '@/hooks/useAppMessage';
import type { EditTagModalProps } from './index.type';
import styles from './index.module.less';

const EditTagModal: React.FC<EditTagModalProps> = ({
  open,
  onCancel,
  onSuccess,
  groupId,
  target,
}) => {
  const resourceService = useResourceService();
  const message = useAppMessage();
  const [selectedNodes, setSelectedNodes] = useState<TagTreeNode[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isFile = target?.type === 'file';
  const resourceId = isFile ? target.data.resourceId : undefined;

  const tagInitialCheckedIds = useMemo(() => {
    if (!open || target?.type !== 'file') return undefined;
    return Object.keys(target.data.currentTags ?? {});
  }, [open, target]);

  useEffect(() => {
    if (!open) setSelectedNodes([]);
  }, [open]);

  const handleTreeChange = useCallback((selected: TagTreeNode[]) => {
    setSelectedNodes(selected);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!resourceId) return;

    setSubmitting(true);
    try {
      await resourceService.updateResourceTags({
        resourceId,
        tagIds: selectedNodes.map((n) => n.tagId),
        ...(groupId ? { groupId } : {}),
      });
      message.success('标签已更新');
      onSuccess?.();
      onCancel();
    } catch (err) {
      message.error(parseErrorMessage(err, '更新标签失败'));
    } finally {
      setSubmitting(false);
    }
  }, [resourceService, resourceId, selectedNodes, groupId, onSuccess, onCancel, message]);

  const handleCancel = useCallback(() => {
    setSelectedNodes([]);
    onCancel();
  }, [onCancel]);

  const displayName = isFile ? target.data.resourceName || '未命名' : '';

  return (
    <Modal
      title="编辑标签"
      open={open && !!target && isFile}
      onCancel={handleCancel}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!isFile}
        >
          确定
        </Button>,
      ]}
      width={480}
    >
      <div className={styles.wrapper}>
        {!isFile && target != null && <div className={styles.hint}>仅支持编辑文件的标签</div>}
        {isFile && (
          <>
            <div className={styles.fileName}>文件：{displayName}</div>
            <div className={styles.hint}>勾选或取消勾选以调整该文件关联的标签</div>
            <div className={`${styles.treeSection} ${styles.treeNav}`}>
              <TreeNav
                mode="tag"
                groupId={groupId}
                tagInitialCheckedIds={tagInitialCheckedIds}
                onChange={handleTreeChange}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default EditTagModal;
