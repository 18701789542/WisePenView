import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMount } from 'ahooks';
import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { baseURL } from '@/utils/Axios';
import { PDF_VIEWER_CONFIG } from './pdf.config';
import styles from './style.module.less';

interface DocumentManagerApi {
  openDocumentUrl(options: {
    url: string;
    documentId: string;
    mode?: string;
    requestOptions?: RequestInit;
    permissions?: Record<string, boolean>;
  }): Promise<void>;
}

interface PdfViewerHandle {
  registry: Promise<{
    getPlugin(name: string): { provides(): DocumentManagerApi } | undefined;
  }>;
}

const PdfPreview: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const viewerRef = useRef<PdfViewerHandle | null>(null);

  const loadDocument = async () => {
    if (!resourceId || !viewerRef.current) return;

    try {
      const registry = await viewerRef.current.registry;
      const docManager = registry.getPlugin('document-manager')?.provides();
      await docManager?.openDocumentUrl({
        url: `${baseURL}document/getDocPreview?resourceId=${resourceId}`,
        documentId: `doc-${resourceId}`,
        mode: 'range-request',
        requestOptions: {
          credentials: 'include',
        },
        permissions: {
          canPrint: false,
          canCopy: false,
        },
      });
    } catch (error) {
      console.error('[PdfPreview] 文档加载失败:', error);
    }
  };

  useMount(() => {
    loadDocument();
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.root}>
          <PDFViewer
            ref={viewerRef as React.RefObject<never>}
            config={PDF_VIEWER_CONFIG}
            className={styles.viewer}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfPreview;
