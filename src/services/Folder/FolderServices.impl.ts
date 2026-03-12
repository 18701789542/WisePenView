import { TagServicesImpl } from '@/services/Tag/TagServices.impl';
import type { TagTreeNode } from '@/services/Tag';
import type { IFolderService } from './index.type';

const renameFolder = async (folder: TagTreeNode, newName: string): Promise<void> => {
  const tagName = (folder.tagName ?? '').trim();
  if (!tagName || tagName === '/') return;
  const parts = tagName.split('/').filter(Boolean);
  parts[parts.length - 1] = newName.trim();
  const newPath = '/' + parts.join('/');
  await TagServicesImpl.changeTag({
    targetTagId: folder.tagId,
    tagName: newPath,
  });
};

const deleteFolder = async (folder: TagTreeNode): Promise<void> => {
  await TagServicesImpl.removeTag({ targetTagId: folder.tagId });
};

const createFolder = async (parentPath: string, folderName: string): Promise<void> => {
  const parentNode = await TagServicesImpl.getPathTagNode(parentPath);
  if (!parentNode?.tagId) {
    throw new Error('父路径不存在');
  }
  const newPath =
    parentPath === '/' || !parentPath ? `/${folderName}` : `${parentPath}/${folderName}`;
  await TagServicesImpl.addTag({
    parentId: parentNode.tagId,
    tagName: newPath,
  });
};

export const FolderServicesImpl: IFolderService = {
  renameFolder,
  deleteFolder,
  createFolder,
};
