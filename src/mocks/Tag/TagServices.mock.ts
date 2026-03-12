import type { ITagService, TagTreeNode } from '@/services/Tag';
import type { FolderListByPathResponse } from '@/types/folder';
import mockdata from './mockdata.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const tagTree = mockdata.tagTree as TagTreeNode[];
const listByPath = mockdata.listByPath as FolderListByPathResponse;

const getUserTagTree = async (
  _params?: Parameters<ITagService['getUserTagTree']>[0]
): Promise<TagTreeNode[]> => {
  await delay(200);
  return tagTree;
};

const getPathTagTree = async (): Promise<TagTreeNode[]> => {
  await delay(200);
  return tagTree;
};

const getPathTagNode = async (path: string): Promise<TagTreeNode | null> => {
  await delay(100);
  const find = (nodes: TagTreeNode[], p: string): TagTreeNode | null => {
    for (const n of nodes) {
      if (n.tagName === p) return n;
      if (n.children?.length) {
        const found = find(n.children, p);
        if (found) return found;
      }
    }
    return null;
  };
  return find(tagTree, path);
};

const getListByPath = async (
  _params: Parameters<ITagService['getListByPath']>[0]
): Promise<FolderListByPathResponse> => {
  await delay(200);
  return listByPath;
};

const updateTag = async (): Promise<void> => {
  await delay(150);
};

const addTag = async (): Promise<string> => {
  await delay(150);
  return 'tag-new-id';
};

const changeTag = async (): Promise<void> => {
  await delay(150);
};

const removeTag = async (): Promise<void> => {
  await delay(150);
};

const moveTag = async (): Promise<void> => {
  await delay(150);
};

export const TagServicesMock: ITagService = {
  getUserTagTree,
  getPathTagTree,
  getPathTagNode,
  getListByPath,
  updateTag,
  addTag,
  changeTag,
  removeTag,
  moveTag,
};
