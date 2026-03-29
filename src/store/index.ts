/**
 * Store 统一入口
 *
 * - zustand/: 内存状态管理（UI 状态、临时数据）
 * - indexedDB/: 离线缓存（未同步的变更）
 */

// Zustand stores
export {
  useDrivePreferencesStore,
  usePendingVerifyEmailStore,
  usePdfPreviewProgressStore,
  useRecentFilesStore,
  getTreeDriveCwdStore,
  useTreeDriveCwdStore,
  type DriveViewMode,
  type PdfPreviewProgress,
  type RecentFileItem,
  type BreadcrumbItem,
} from './zustand';

// IndexedDB (离线缓存)
export {
  getDB,
  closeDB,
  appendPendingDeltas,
  getPendingDeltas,
  clearPendingDeltas,
} from './indexedDB';
