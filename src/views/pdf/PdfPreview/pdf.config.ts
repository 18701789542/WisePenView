/**
 * PDF Viewer 功能开关配置
 *
 * true = 启用（默认），false = 禁用
 * 禁用父级会连带禁用所有子级（如禁用 'annotation' 则高亮、下划线等均不可用）
 *
 * @see https://www.embedpdf.com/docs/react/viewer/customizing-ui
 */
const PDF_FEATURE_CONFIG: Record<string, boolean> = {
  // ── 缩放 ──────────────────────────────────────
  zoom: true,
  // 'zoom-in': true,
  // 'zoom-out': true,
  // 'zoom-fit-page': true,
  // 'zoom-fit-width': true,
  // 'zoom-marquee': true,
  // 'zoom-level': true,

  // ── 插入 ──────────────────────────────────────
  insert: false,
  // 'insert-image': false,
  // 'insert-text': false,
  // 'insert-table': false,
  // 'insert-chart': false,
  // 'insert-shape': false,
  // 'insert-link': false,
  // 'insert-comment': false,
  // 'insert-annotation': false,

  // ── 批注（标记类）──────────────────────────────
  annotation: false,
  // 'annotation-markup': true,
  // 'annotation-highlight': true,
  // 'annotation-underline': true,
  // 'annotation-strikeout': true,
  // 'annotation-squiggly': true,
  // 'annotation-ink': true,
  // 'annotation-text': true,
  // 'annotation-stamp': true,

  // ── 批注（形状类）──────────────────────────────
  'annotation-shape': false,
  // 'annotation-rectangle': true,
  // 'annotation-circle': true,
  // 'annotation-line': true,
  // 'annotation-arrow': true,
  // 'annotation-polygon': true,
  // 'annotation-polyline': true,

  // ── 表单 ──────────────────────────────────────
  form: false,
  // 'form-textfield': true,
  // 'form-checkbox': true,
  // 'form-radio': true,
  // 'form-select': true,
  // 'form-listbox': true,
  // 'form-fill-mode': true,

  // ── 密文 ──────────────────────────────────────
  redaction: false,
  // 'redaction-area': true,
  // 'redaction-text': true,
  // 'redaction-apply': true,
  // 'redaction-clear': true,

  // ── 文档操作 ──────────────────────────────────
  'document-open': false,
  'document-close': false,
  'document-print': false,
  'document-capture': true,
  'document-export': false,
  'document-fullscreen': true,
  'document-protect': false,

  // ── 页面 ──────────────────────────────────────
  page: true,
  // 'spread': true,
  // 'rotate': true,
  // 'scroll': true,
  // 'navigation': true,

  // ── 面板 ──────────────────────────────────────
  panel: true,
  // 'panel-sidebar': true,
  // 'panel-search': true,
  // 'panel-comment': true,

  // ── 工具 ──────────────────────────────────────
  tools: false,
  // 'pan': true,
  // 'pointer': true,
  // 'capture': true,

  // ── 选区与复制 ─────────────────────────────────
  selection: true,
  'selection-copy': false,

  // ── 历史（撤销/重做）──────────────────────────
  history: true,
  // 'history-undo': true,
  // 'history-redo': true,
};

/** 从开关配置中计算需禁用的分类列表 */
const getDisabledCategories = (): string[] =>
  Object.entries(PDF_FEATURE_CONFIG)
    .filter(([, enabled]) => !enabled)
    .map(([category]) => category);

/** PDFViewer 组件的完整 config */
export const PDF_VIEWER_CONFIG = {
  tabBar: 'never' as const,
  documentManager: { maxDocuments: 5 },
  disabledCategories: getDisabledCategories(),
};
