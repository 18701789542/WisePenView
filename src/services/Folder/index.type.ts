import type { TagTreeNode } from '@/services/Tag';

/** FolderService 接口：供依赖注入使用 */
export interface IFolderService {
  renameFolder(folder: TagTreeNode, newName: string): Promise<void>;
  deleteFolder(folder: TagTreeNode): Promise<void>;
  createFolder(parentPath: string, folderName: string): Promise<void>;
}
