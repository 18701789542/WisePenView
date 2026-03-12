/**
 * Tag 树结构的纯工具函数
 * 不依赖 API 调用，仅对 TagTreeNode 做递归过滤与查找
 */

import type { TagTreeNode } from '@/services/Tag/index.type';

/** 判断是否为路径标签（以 / 开头的 tagName） */
export const isPathTag = (tagName: string): boolean => tagName.startsWith('/');

/** 递归过滤出非路径标签节点 */
export const filterNonPathTags = (nodes: TagTreeNode[]): TagTreeNode[] => {
  return nodes
    .filter((node) => !isPathTag(node.tagName ?? ''))
    .map((node) => ({
      ...node,
      children: node.children?.length ? filterNonPathTags(node.children) : undefined,
    }));
};

/** 递归过滤出仅路径标签节点 */
export const filterPathTagsOnly = (nodes: TagTreeNode[]): TagTreeNode[] => {
  return nodes
    .filter((node) => isPathTag(node.tagName ?? ''))
    .map((node) => ({
      ...node,
      children: node.children?.length ? filterPathTagsOnly(node.children) : undefined,
    }));
};

/** 在树中按路径查找节点（path 支持 '' 或 '/xxx' 格式） */
export const findNodeByPath = (nodes: TagTreeNode[], path: string): TagTreeNode | null => {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  for (const node of nodes) {
    if ((node.tagName ?? '') === normalized) return node;
    if (node.children?.length) {
      const found = findNodeByPath(node.children, normalized);
      if (found) return found;
    }
  }
  return null;
};
