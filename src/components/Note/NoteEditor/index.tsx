import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import CustomBlockNote from '../CustomBlockNote';
import type { NoteEditorHandle, NoteEditorProps } from './index.type';
import { usePrepareConnection } from './usePrepareConnection';
import styles from './style.module.less';

const Editor = forwardRef<NoteEditorHandle, NoteEditorProps>(
  ({ resourceId, onSessionReady, onSessionError, onSessionStatusChange }, ref) => {
    const blockNoteRef = useRef<NoteEditorHandle>(null);

    // 准备YJS文档和Provider
    const { doc, provider } = usePrepareConnection({
      resourceId,
      onSessionReady,
      onSessionError,
      onSessionStatusChange,
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          blockNoteRef.current?.focus();
        },
        retrySession: () => {
          if (!provider) return;
          provider.disconnect();
          provider.connect();
        },
      }),
      [provider]
    );

    // 返回null，顶层组件如果发现NoteEditor返回null，则不渲染子组件，避免渲染一个未就绪的组件
    if (!doc || !provider) {
      return null;
    }

    // 确保doc和provider都准备好了，才渲染子组件
    return (
      <div className={styles.root}>
        <CustomBlockNote ref={blockNoteRef} resourceId={resourceId} doc={doc} provider={provider} />
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export default Editor;
