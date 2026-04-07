import React, { useMemo, useState } from 'react';
import { useMount, useRequest, useInterval, useUnmount } from 'ahooks';
import { Button, Empty, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDocumentService } from '@/contexts/ServicesContext';
import { useAppMessage } from '@/hooks/useAppMessage';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import type { PendingDocItem } from '@/services/Document';
import styles from './style.module.less';

const SYNC_INTERVAL_MS = 5000;
const TERMINAL_STATUS_SET = new Set(['SUCCESS', 'FAILED', 'CANCELED', 'CANCELLED']);

const normalizeStatus = (status: string): string => status.trim().toUpperCase();

const isTerminalStatus = (status: string): boolean =>
  TERMINAL_STATUS_SET.has(normalizeStatus(status));

const getStatusTag = (status: string): { color: string; label: string } => {
  const normalized = normalizeStatus(status);
  if (normalized === 'SUCCESS') return { color: 'success', label: '成功' };
  if (normalized === 'FAILED') return { color: 'error', label: '失败' };
  if (normalized === 'CANCELED' || normalized === 'CANCELLED')
    return { color: 'default', label: '已取消' };
  if (normalized === 'PENDING') return { color: 'processing', label: '处理中' };
  return { color: 'processing', label: status || '处理中' };
};

const formatTimeText = (value?: string): string => {
  if (value == null || value.trim() === '') return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const UploadQueueTab: React.FC = () => {
  const documentService = useDocumentService();
  const message = useAppMessage();
  const [list, setList] = useState<PendingDocItem[]>([]);
  const [pollingActive, setPollingActive] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const {
    run: runFetchPendingList,
    loading: listLoading,
    cancel: cancelPolling,
  } = useRequest(
    async (withSync: boolean) => {
      if (withSync) {
        const current = await documentService.listPendingDocs();
        const nonTerminalItems = current.filter((item) => !isTerminalStatus(item.status));
        await Promise.all(
          nonTerminalItems.map((item) => documentService.syncPendingDocStatus(item.documentId))
        );
      }
      return await documentService.listPendingDocs();
    },
    {
      manual: true,
      onSuccess: (nextList) => {
        setList(nextList);
        setPollingActive(nextList.some((item) => !isTerminalStatus(item.status)));
      },
      onError: (err) => {
        setPollingActive(false);
        message.error(parseErrorMessage(err, '获取上传队列失败'));
      },
    }
  );

  const { run: runRetryPendingDoc } = useRequest(
    async (documentId: string) => {
      await documentService.retryPendingDoc(documentId);
      return documentId;
    },
    {
      manual: true,
      onBefore: (params) => {
        setRetryingId(params[0] ?? null);
      },
      onSuccess: () => {
        message.success('已提交重试');
        runFetchPendingList(false);
      },
      onError: (err) => {
        message.error(parseErrorMessage(err, '重试失败'));
      },
      onFinally: () => {
        setRetryingId(null);
      },
    }
  );

  const { run: runCancelPendingDoc } = useRequest(
    async (documentId: string) => {
      await documentService.cancelPendingDoc(documentId);
      return documentId;
    },
    {
      manual: true,
      onBefore: (params) => {
        setCancelingId(params[0] ?? null);
      },
      onSuccess: () => {
        message.success('已取消处理');
        runFetchPendingList(false);
      },
      onError: (err) => {
        message.error(parseErrorMessage(err, '取消失败'));
      },
      onFinally: () => {
        setCancelingId(null);
      },
    }
  );

  useMount(() => {
    runFetchPendingList(false);
  });

  useInterval(
    () => {
      if (listLoading) return;
      runFetchPendingList(true);
    },
    pollingActive ? SYNC_INTERVAL_MS : undefined
  );

  useUnmount(() => {
    cancelPolling();
  });

  const columns = useMemo<ColumnsType<PendingDocItem>>(
    () => [
      {
        title: '文件名',
        dataIndex: 'filename',
        key: 'filename',
        render: (value: string) => <span className={styles.nameText}>{value || '未命名文档'}</span>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (value: string) => {
          const tag = getStatusTag(value);
          return <Tag color={tag.color}>{tag.label}</Tag>;
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 220,
        render: (value: string | undefined, record: PendingDocItem) =>
          formatTimeText(value ?? record.createdAt),
      },
      {
        title: '失败原因',
        dataIndex: 'errorMessage',
        key: 'errorMessage',
        width: 260,
        render: (value?: string | null) => value ?? '-',
      },
      {
        title: '',
        key: 'action',
        width: 180,
        align: 'right',
        render: (_: unknown, record: PendingDocItem) => {
          const terminal = isTerminalStatus(record.status);
          return (
            <Space size={4}>
              <Button
                type="link"
                size="small"
                disabled={terminal}
                loading={retryingId === record.documentId}
                onClick={() => runRetryPendingDoc(record.documentId)}
              >
                重试
              </Button>
              <Button
                type="link"
                size="small"
                danger
                disabled={terminal}
                loading={cancelingId === record.documentId}
                onClick={() => runCancelPendingDoc(record.documentId)}
              >
                取消
              </Button>
            </Space>
          );
        },
      },
    ],
    [retryingId, cancelingId, runRetryPendingDoc, runCancelPendingDoc]
  );

  return (
    <div className={styles.wrapper}>
      <main className={styles.listArea}>
        <Table<PendingDocItem>
          rowKey="documentId"
          dataSource={list}
          columns={columns}
          loading={listLoading}
          pagination={false}
          locale={{ emptyText: <Empty description="暂无上传队列" /> }}
        />
      </main>
    </div>
  );
};

export default UploadQueueTab;
