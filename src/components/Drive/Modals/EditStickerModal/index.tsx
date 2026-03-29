import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Modal, Tag, Spin, Divider } from 'antd';
import { LuPlus } from 'react-icons/lu';
import { useStickerService } from '@/contexts/ServicesContext';
import type { Sticker } from '@/services/Sticker';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import AddStickerModal from '@/components/Drive/FlatDrive/FileFilter/AddStickerModal';
import type { EditStickerModalProps } from './index.type';
import { useAppMessage } from '@/hooks/useAppMessage';
import styles from './index.module.less';

const EditStickerModal: React.FC<EditStickerModalProps> = ({ open, onCancel, onSuccess, file }) => {
  const stickerService = useStickerService();
  const message = useAppMessage();

  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [stickerLoading, setStickerLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!open || !file) return;
    let cancelled = false;
    const load = async () => {
      setStickerLoading(true);
      try {
        const list = await stickerService.getStickerList();
        if (cancelled) return;
        setStickers(list);
        const initial = file.currentTags ? Object.keys(file.currentTags) : [];
        setSelectedIds(initial);
      } catch (err) {
        if (!cancelled) {
          message.error(parseErrorMessage(err, '获取标签列表失败'));
          setStickers([]);
          setSelectedIds([]);
        }
      } finally {
        if (!cancelled) setStickerLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, file, stickerService, message]);

  const handleToggle = useCallback((tagId: string) => {
    setSelectedIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAddSuccess = useCallback((sticker: Sticker) => {
    setStickers((prev) => [...prev, sticker]);
    setSelectedIds((prev) => [...prev, sticker.tagId]);
  }, []);

  const { unselected, selected } = useMemo(() => {
    const idSet = new Set(selectedIds);
    return {
      unselected: stickers.filter((s) => !idSet.has(s.tagId)),
      selected: stickers.filter((s) => idSet.has(s.tagId)),
    };
  }, [stickers, selectedIds]);

  const handleSubmit = useCallback(async () => {
    if (!file?.resourceId) return;
    setSubmitLoading(true);
    try {
      await stickerService.updateResourceStickers({
        resourceId: file.resourceId,
        stickerIds: selectedIds,
      });
      message.success('标签已更新');
      onSuccess?.();
      onCancel();
    } catch (err) {
      message.error(parseErrorMessage(err, '更新标签失败'));
    } finally {
      setSubmitLoading(false);
    }
  }, [file, selectedIds, stickerService, message, onSuccess, onCancel]);

  return (
    <>
      <Modal
        title="编辑标签"
        open={open && !!file}
        onOk={handleSubmit}
        onCancel={onCancel}
        confirmLoading={submitLoading}
        okButtonProps={{ disabled: stickerLoading }}
        destroyOnHidden
        width={400}
      >
        <div className={styles.wrapper}>
          {stickerLoading ? (
            <div className={styles.stickerLoading}>
              <Spin size="small" />
            </div>
          ) : (
            <>
              <div className={styles.stickerList}>
                {unselected.map(({ tagId, tagName }) => (
                  <Tag
                    key={tagId}
                    variant="outlined"
                    className={styles.stickerTag}
                    onClick={() => handleToggle(tagId)}
                  >
                    {tagName}
                  </Tag>
                ))}
                {stickers.length > 0 && unselected.length === 0 && (
                  <span className={styles.allPickedHint}>所有标签均已选中</span>
                )}
                <Tag className={styles.addTag} onClick={() => setAddModalOpen(true)}>
                  <LuPlus size={14} />
                </Tag>
              </div>

              {selected.length > 0 && (
                <>
                  <Divider />
                  <div className={styles.stickerList}>
                    {selected.map(({ tagId, tagName }) => (
                      <Tag
                        key={tagId}
                        variant="outlined"
                        className={clsx(styles.stickerTag, styles.stickerTagPicked)}
                        onClick={() => handleToggle(tagId)}
                      >
                        {tagName}
                      </Tag>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal>

      <AddStickerModal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
};

export default EditStickerModal;
