import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import { SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { zh } from '@blocknote/core/locales';
import { filterSuggestionItems } from '@blocknote/core/extensions';
import { useMount, useUnmount } from 'ahooks';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

import { useImageService } from '@/contexts/ServicesContext';
import { useAppMessage } from '@/hooks/useAppMessage';
import { assertImageProxyUploadLimit } from '@/services/Image';
import { useNoteSelectionStore } from '@/store';
import type { CustomBlockNoteProps, NoteBodyEditorHandle } from './index.type';
import { useNoteCaptureKeyEvent } from './useNoteCaptureKeyEvent';
import { buildNoteSlashMenuItems } from './slashMenuConfig';
import { blockNoteSchema } from './blockNoteSchema';
import { inlineMathDollarExtension } from './LatexSupport/inlineMathDollarExtension';
import { stripEscapeCharExtension, stripEscapeEditorProps } from './stripEscapeCharExtension';
import styles from './style.module.less';

/** 笔记正文在 Y.Doc 中的 XmlFragment 名；需与后端 observeDeep 及 BlockNote 绑定名一致 */
const NOTE_YJS_DOCUMENT_FRAGMENT = 'document-store' as const;

type CreateBlockNoteOptions = NonNullable<Parameters<typeof useCreateBlockNote>[0]>;
type BlockNoteCollaborationConfig = NonNullable<CreateBlockNoteOptions['collaboration']>;

const CustomBlockNote = forwardRef<NoteBodyEditorHandle, CustomBlockNoteProps>(
  ({ resourceId, doc, provider, readOnly = false }, ref) => {
    const imageService = useImageService();
    const message = useAppMessage();
    const setSelectedText = useNoteSelectionStore((state) => state.setSelectedText);
    const clearSelectedText = useNoteSelectionStore((state) => state.clearSelectedText);

    const uploadFile = useCallback(
      async (file: File) => {
        // 只拦截图片：非图片文件让 BlockNote 走默认行为（或抛错以阻止插入）
        if (!file.type.startsWith('image/')) {
          throw new Error('仅支持插入图片文件');
        }
        try {
          assertImageProxyUploadLimit(file);
        } catch (error) {
          const text = error instanceof Error ? error.message : '图片上传失败';
          message.error(text);
          throw error;
        }
        const { publicUrl } = await imageService.uploadImage({
          file,
          scene: 'PRIVATE_IMAGE_FOR_NOTE',
          bizTag: `notes/${resourceId}`,
        });
        return publicUrl;
      },
      [imageService, message, resourceId]
    );

    const editor = useCreateBlockNote({
      schema: blockNoteSchema,
      dictionary: zh,
      trailingBlock: true,
      uploadFile,
      extensions: [stripEscapeCharExtension, inlineMathDollarExtension()],
      _tiptapOptions: {
        editorProps: stripEscapeEditorProps,
      },
      collaboration: {
        provider: provider as BlockNoteCollaborationConfig['provider'],
        fragment: doc.getXmlFragment(NOTE_YJS_DOCUMENT_FRAGMENT),
        user: {
          // 单人模式下使用固定身份，避免业务层传 userId/color
          name: '',
          color: '#4096ff',
        },
      },
    });

    const syncSelectedText = useCallback(() => {
      setSelectedText(resourceId, editor.getSelectedText());
    }, [editor, resourceId, setSelectedText]);

    useMount(() => {
      syncSelectedText();
    });
    useUnmount(() => {
      clearSelectedText(resourceId);
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          editor.focus();
        },
      }),
      [editor]
    );

    const onKeyDownCapture = useNoteCaptureKeyEvent(provider);

    return (
      <div className={styles.editorShell} onKeyDownCapture={onKeyDownCapture}>
        <BlockNoteView
          editor={editor}
          theme="light"
          slashMenu={false}
          editable={!readOnly}
          onSelectionChange={syncSelectedText}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) => {
              return filterSuggestionItems(buildNoteSlashMenuItems(editor), query);
            }}
          />
        </BlockNoteView>
      </div>
    );
  }
);

CustomBlockNote.displayName = 'CustomBlockNote';

export default CustomBlockNote;
