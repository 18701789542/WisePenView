import type { IFolderService } from '@/services/Folder';
import type { TagTreeNode } from '@/services/Tag';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const renameFolder = async (_folder: TagTreeNode, _newName: string): Promise<void> => {
  await delay(150);
};

const deleteFolder = async (_folder: TagTreeNode): Promise<void> => {
  await delay(150);
};

const createFolder = async (_parentPath: string, _folderName: string): Promise<void> => {
  await delay(150);
};

export const FolderServicesMock: IFolderService = {
  renameFolder,
  deleteFolder,
  createFolder,
};
