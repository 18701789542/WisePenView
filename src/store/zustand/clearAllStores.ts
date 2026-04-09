import { clearDrivePreferencesStore } from './useDrivePreferencesStore';
import { clearChatModelPreferenceStore } from './useChatModelPreferenceStore';
import { clearChatPanelStore } from './useChatPanelStore';
import { clearNoteSelectionStore } from './useNoteSelectionStore';
import { clearPdfPreviewProgressStore } from './usePdfPreviewProgressStore';
import { clearRecentFilesStore } from './useRecentFilesStore';
import { clearTrashTagStore } from './useTrashTagStore';
import { clearPendingVerifyEmailStore } from './usePendingVerifyEmailStore';
import { clearTreeDriveCwdStores } from './useTreeDriveCwdStore';

export function clearAllZustandStores(): void {
  clearChatModelPreferenceStore();
  clearChatPanelStore();
  clearRecentFilesStore();
  clearPdfPreviewProgressStore();
  clearDrivePreferencesStore();
  clearNoteSelectionStore();
  clearTrashTagStore();
  clearPendingVerifyEmailStore();
  clearTreeDriveCwdStores();
}
