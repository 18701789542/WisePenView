import React, { useMemo, useState } from 'react';
import { useMount, useRequest, useInterval, useUnmount } from 'ahooks';
import { Button, Empty, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDocumentService } from '@/contexts/ServicesContext';
import { DOCUMENT_PROCESS_STATUS, DOCUMENT_PROCESS_STATUS_LABELS } from '@/constants/document';
import { useAppMessage } from '@/hooks/useAppMessage';
import { formatSize } from '@/utils/format';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import type { DocumentStatusCode, PendingDocItem } from '@/services/Document';
import styles from './style.module.less';

const SYNC_INTERVAL_MS = 5000;
const TERMINAL_STATUS_SET = new Set<DocumentStatusCode>([
  DOCUMENT_PROCESS_STATUS.READY,
  DOCUMENT_PROCESS_STATUS.TRANSFER_TIMEOUT,
  DOCUMENT_PROCESS_STATUS.REGISTERING_RES_TIMEOUT,
  DOCUMENT_PROCESS_STATUS.FAILED,
]);

const toStatusCode = (input: unknown): DocumentStatusCode | null => {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return Object.prototype.hasOwnProperty.call(DOCUMENT_PROCESS_STATUS_LABELS, input)
      ? (input as DocumentStatusCode)
      : null;
  }
  if (typeof input === 'string' && input.trim() !== '') {
    const parsed = Number(input);
    if (
      Number.isFinite(parsed) &&
      Object.prototype.hasOwnProperty.call(DOCUMENT_PROCESS_STATUS_LABELS, parsed)
    ) {
      return parsed as DocumentStatusCode;
    }
  }
  return null;
};

const isTerminalStatus = (status: unknown): boolean => {
  const normalizedStatus = toStatusCode(status);
  return normalizedStatus != null && TERMINAL_STATUS_SET.has(normalizedStatus);
};

const getStatusTag = (status: unknown): { color: string; label: string } => {
  const normalizedStatus = toStatusCode(status);
  if (normalizedStatus == null) return { color: 'default', label: '未知状态' };
  if (normalizedStatus === DOCUMENT_PROCESS_STATUS.READY) {
    return { color: 'success', label: DOCUMENT_PROCESS_STATUS_LABELS[normalizedStatus] };
  }
  if (normalizedStatus === DOCUMENT_PROCESS_STATUS.FAILED) {
    return { color: 'error', label: DOCUMENT_PROCESS_STATUS_LABELS[normalizedStatus] };
  }
  if (
    normalizedStatus === DOCUMENT_PROCESS_STATUS.TRANSFER_TIMEOUT ||
    normalizedStatus === DOCUMENT_PROCESS_STATUS.REGISTERING_RES_TIMEOUT
  ) {
    return { color: 'warning', label: DOCUMENT_PROCESS_STATUS_LABELS[normalizedStatus] };
  }
  return { color: 'processing', label: DOCUMENT_PROCESS_STATUS_LABELS[normalizedStatus] };
};

const formatFileType = (fileType: string): string => {
  const value = fileType.toUpperCase();
  return value === '' ? 'UNKNOWN' : value;
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
        const nonTerminalItems = current.filter(
          (item) => !isTerminalStatus(item.documentStatus.status)
        );
        await Promise.all(
          nonTerminalItems
            .filter((item) => item.documentId != null && item.documentId !== '')
            .map((item) => documentService.syncPendingDocStatus(item.documentId as string))
        );
      }
      return await documentService.listPendingDocs();
    },
    {
      manual: true,
      onSuccess: (nextList) => {
        setList(nextList);
        setPollingActive(nextList.some((item) => !isTerminalStatus(item.documentStatus.status)));
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
        dataIndex: ['uploadMeta', 'documentName'],
        key: 'filename',
        render: (value: string) => <span className={styles.nameText}>{value || '未命名文档'}</span>,
      },
      {
        title: '类型',
        dataIndex: ['uploadMeta', 'fileType'],
        key: 'fileType',
        width: 120,
        render: (value: string) => formatFileType(value),
      },
      {
        title: '大小',
        dataIndex: ['uploadMeta', 'size'],
        key: 'size',
        width: 120,
        render: (value: number) => formatSize(value),
      },
      {
        title: '状态',
        dataIndex: ['documentStatus', 'status'],
        key: 'status',
        width: 160,
        render: (value: unknown) => {
          const tag = getStatusTag(value);
          return <Tag color={tag.color}>{tag.label}</Tag>;
        },
      },
      {
        title: '',
        key: 'action',
        width: 180,
        align: 'right',
        render: (_: unknown, record: PendingDocItem) => {
          const terminal = isTerminalStatus(record.documentStatus.status);
          const disabled = terminal || record.documentId == null || record.documentId === '';
          return (
            <Space size={4}>
              <Button
                type="link"
                size="small"
                disabled={disabled}
                loading={retryingId === record.documentId}
                onClick={() => {
                  if (record.documentId) runRetryPendingDoc(record.documentId);
                }}
              >
                重试
              </Button>
              <Button
                type="link"
                size="small"
                danger
                disabled={disabled}
                loading={cancelingId === record.documentId}
                onClick={() => {
                  if (record.documentId) runCancelPendingDoc(record.documentId);
                }}
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
          rowKey={(record, index) =>
            record.documentId ??
            `${record.uploadMeta.documentName}-${record.uploadMeta.uploaderId ?? 'unknown'}-${String(index ?? 0)}`
          }
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
