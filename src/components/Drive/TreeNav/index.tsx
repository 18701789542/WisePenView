import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tree, Spin, Empty } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { LuChevronDown } from 'react-icons/lu';
import { useFolderService, useTagService } from '@/contexts/ServicesContext';
import type { TagTreeNode } from '@/services/Tag/index.type';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import { useAppMessage } from '@/hooks/useAppMessage';
import type { TreeNavProps, NodeMap } from './index.type';
import {
  ROOT_DISPLAY,
  createFolderDataNode,
  buildFolderChildNodes,
  replaceNodeChildren,
} from './folderUtil';
import { tagToDataNode } from './tagUtil';
import styles from './style.module.less';

const TreeNav: React.FC<TreeNavProps> = ({
  mode,
  groupId,
  onChange,
  refreshTrigger = 0,
  tagInitialCheckedIds,
}) => {
  const folderService = useFolderService();
  const tagService = useTagService();
  const message = useAppMessage();

  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  const nodeMapRef = useRef<NodeMap>(new Map());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const tagInitialCheckKey = useMemo(() => {
    if (tagInitialCheckedIds === undefined) return '';
    return [...tagInitialCheckedIds].sort().join('\u0001');
  }, [tagInitialCheckedIds]);

  // folder模式下加载数据
  useEffect(() => {
    if (mode !== 'folder') return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      nodeMapRef.current.clear();

      try {
        const root = await folderService.getFolderTree({ groupId });
        if (cancelled) return;

        const childNodes = await buildFolderChildNodes(root, nodeMapRef.current, folderService);
        if (cancelled) return;

        const rootNode: DataNode = {
          ...createFolderDataNode(root, nodeMapRef.current, ROOT_DISPLAY),
          children: childNodes,
        };

        setTreeData([rootNode]);
        setSelectedKeys([]);
        onChangeRef.current?.([]);
      } catch (err) {
        if (cancelled) return;
        message.error(parseErrorMessage(err, '获取文件夹树失败'));
        setTreeData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, groupId, refreshTrigger, folderService, message]);

  // tag模式下加载数据
  useEffect(() => {
    if (mode !== 'tag') return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      nodeMapRef.current.clear();

      try {
        const nodes = await tagService.getTagTree(groupId);
        if (cancelled) return;

        const dataNodes = nodes
          .map((n) => tagToDataNode(n, nodeMapRef.current))
          .filter((n): n is DataNode => n != null);

        setTreeData(dataNodes);
        const initialIds = (tagInitialCheckedIds ?? []).filter((id) => nodeMapRef.current.has(id));
        setCheckedKeys(initialIds);
        const selectedNodes = initialIds
          .map((k) => nodeMapRef.current.get(String(k)))
          .filter((n): n is TagTreeNode => n != null);
        onChangeRef.current?.(selectedNodes);
      } catch (err) {
        if (cancelled) return;
        message.error(parseErrorMessage(err, '获取标签树失败'));
        setTreeData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    mode,
    groupId,
    refreshTrigger,
    tagService,
    message,
    tagInitialCheckKey,
    tagInitialCheckedIds,
  ]);

  //展开文件夹时，异步加载目标文件夹的子节点
  const handleLoadData = useCallback(
    async (node: DataNode) => {
      if (mode !== 'folder') return;

      const key = String(node.key);
      const folder = folderService.getFolderById(key, groupId);
      if (!folder) return;

      const childNodes = await buildFolderChildNodes(folder, nodeMapRef.current, folderService);

      // 替换节点子节点为获取到的子节点列表
      setTreeData((prev) => replaceNodeChildren(prev, key, childNodes));
    },
    [mode, groupId, folderService]
  );

  // folder模式下的选择
  const handleSelect = useCallback((keys: React.Key[]) => {
    setSelectedKeys(keys);
    if (keys.length === 0) {
      onChangeRef.current?.([]);
    } else {
      const node = nodeMapRef.current.get(String(keys[0]));
      onChangeRef.current?.(node ? [node] : []);
    }
  }, []);

  // tag模式下的选择
  const handleCheck = useCallback(
    (checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
      const keys = Array.isArray(checked) ? checked : checked.checked;
      setCheckedKeys(keys);
      const nodes = keys
        .map((k) => nodeMapRef.current.get(String(k)))
        .filter((n): n is TagTreeNode => n != null);
      onChangeRef.current?.(nodes);
    },
    []
  );

  if (loading && treeData.length === 0) {
    return (
      <div className={styles.wrapper}>
        <Spin />
      </div>
    );
  }

  if (!loading && treeData.length === 0) {
    return (
      <div className={styles.wrapper}>
        <Empty description={mode === 'tag' ? '暂无标签' : '暂无内容'} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.treeArea}>
        <Tree
          treeData={treeData}
          className={styles.tree}
          blockNode
          checkable={mode === 'tag'}
          checkStrictly={mode === 'tag'}
          selectable={mode === 'folder'}
          selectedKeys={mode === 'folder' ? selectedKeys : []}
          checkedKeys={mode === 'tag' ? checkedKeys : []}
          onSelect={mode === 'folder' ? handleSelect : undefined}
          onCheck={mode === 'tag' ? handleCheck : undefined}
          loadData={mode === 'folder' ? handleLoadData : undefined}
          defaultExpandAll={mode === 'tag'}
          defaultExpandedKeys={mode === 'folder' && treeData.length > 0 ? [treeData[0].key] : []}
          switcherIcon={
            <span>
              <LuChevronDown size={14} />
            </span>
          }
        />
      </div>
    </div>
  );
};

export default TreeNav;
