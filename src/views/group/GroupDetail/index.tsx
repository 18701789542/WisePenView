/**
 * 小组详情：展示/ Tab / 小组盘只读等由 getGroupDisplayConfig（如 showWalletTabs、driveReadOnlyMode）驱动。
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Button, Spin, Tabs } from 'antd';
import { AiOutlineEdit, AiOutlineDelete, AiOutlineLogout } from 'react-icons/ai';
import FolderDrive from '@/components/Drive/TreeDrive/FolderDrive';
import TagDrive from '@/components/Drive/TreeDrive/TagDrive';
import MemberList from '@/components/Group/MemberList';
import ComputeWallet from '@/components/Wallet/ComputeWallet';
import OwnerGroupTokenTransfer from '@/components/Group/OwnerGroupTokenTransfer';
import { getGroupDisplayConfig } from '@/components/Group/GroupDisplayConfig';
import {
  EditGroupInfoModal,
  DissolveGroupModal,
  ExitGroupModal,
} from '@/components/Group/GroupModals';
import { useGroupService } from '@/contexts/ServicesContext';
import type { Group } from '@/types/group';
import { GROUP_TYPE } from '@/constants/group';
import { WALLET_TARGET_TYPE } from '@/constants/wallet';
import layout from '../style.module.less';
import page from './style.module.less';
import { useAppMessage } from '@/hooks/useAppMessage';
import type { GroupResConfig } from '@/types/group';

const GroupDetail: React.FC = () => {
  const groupService = useGroupService();
  const message = useAppMessage();
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('MEMBER');
  const [loading, setLoading] = useState(true);
  const [resConfig, setResConfig] = useState<GroupResConfig | null>(null);
  const loadGroup = useCallback(async () => {
    if (!id) {
      setGroup(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [groupData, role, resConfig] = await Promise.all([
        groupService.fetchGroupInfo(id),
        groupService.fetchMyRoleInGroup(id),
        groupService.fetchGroupResConfig(id),
      ]);
      setGroup(groupData);
      setCurrentUserRole(role);
      setResConfig(resConfig);
    } catch {
      message.error('获取小组详情失败');
      setGroup(null);
      setResConfig(null);
    } finally {
      setLoading(false);
    }
  }, [groupService, id, message]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  /** 仅关闭弹窗；解散/退出后会 navigate 离开本页，不应再拉详情（否则多一次失败请求） */
  const handleModalCloseOnly = () => {
    setEditGroupModalOpen(false);
    setDissolveGroupModalOpen(false);
    setExitGroupModalOpen(false);
  };

  /** 编辑成功后留在详情页，需重新拉取小组与角色 */
  const handleEditSuccess = () => {
    handleModalCloseOnly();
    void loadGroup();
  };

  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [dissolveGroupModalOpen, setDissolveGroupModalOpen] = useState(false);
  const [exitGroupModalOpen, setExitGroupModalOpen] = useState(false);
  /** 组长完成 Token 划拨后递增，传给 ComputeWallet.syncRevision 以静默刷新「token明细」Tab 内余额与流水 */
  const [walletSyncRevision, setWalletSyncRevision] = useState(0);
  /** Tabs 受控，避免 items 因 syncRevision 更新而重置当前选中的 Tab */
  const [detailTabKey, setDetailTabKey] = useState<string>('files');

  const groupDisplayConfig = useMemo(
    () => (group ? getGroupDisplayConfig(group.groupType, currentUserRole) : null),
    [group, currentUserRole]
  );

  /**
   * Tabs 配置必须在任意 early return 之前计算，以符合 Hooks 规则。
   * group/groupDisplayConfig 为空时返回空数组（加载中或无效态不会渲染到 Tabs）。
   */
  const tabItems = useMemo(() => {
    if (!group || !groupDisplayConfig) {
      return [];
    }
    const gid = group.groupId || id || '';
    const { groupName: name, groupDesc: desc } = group;
    const items = [
      {
        key: 'files',
        label: '文件',
        children: (
          <div className={layout.tabPane}>
            {resConfig?.fileOrgLogic === 'FOLDER' ? (
              <FolderDrive
                groupId={gid}
                readOnlyMode={groupDisplayConfig.driveReadOnlyMode}
                allowUpload={!groupDisplayConfig.driveReadOnlyMode}
                fileOrgLogic={resConfig.fileOrgLogic}
              />
            ) : (
              <TagDrive groupId={gid} readOnlyMode={groupDisplayConfig.driveReadOnlyMode} />
            )}
          </div>
        ),
      },
      {
        key: 'members',
        label: '成员列表',
        children: (
          <div className={layout.tabPane}>
            <MemberList
              groupDisplayConfig={groupDisplayConfig}
              groupId={gid}
              inviteCode={group.inviteCode}
              pagination={{
                defaultPageSize: 10,
                pageSizeOptions: [5, 10, 20, 50],
                showSizeChanger: true,
              }}
            />
          </div>
        ),
      },
    ];
    if (groupDisplayConfig.showWalletTabs) {
      items.push({
        key: 'wallet',
        label: 'token 明细',
        children: (
          <div className={layout.tabPane}>
            <ComputeWallet
              targetType={WALLET_TARGET_TYPE.GROUP}
              targetId={gid}
              canRecharge
              groupDisplayName={name}
              showOperatorColumn
              syncRevision={walletSyncRevision}
            />
          </div>
        ),
      });
      items.push({
        key: 'token-transfer',
        label: 'token 划拨',
        children: (
          <div className={layout.tabPane}>
            <OwnerGroupTokenTransfer
              groupId={gid}
              onTransferSuccess={() => setWalletSyncRevision((k) => k + 1)}
            />
          </div>
        ),
      });
    }
    items.push({
      key: 'description',
      label: '描述',
      children: (
        <div className={layout.tabPane}>
          <p className={layout.sectionContent}>{desc || '暂无描述'}</p>
        </div>
      ),
    });
    return items;
  }, [group, id, groupDisplayConfig, walletSyncRevision, resConfig?.fileOrgLogic]);

  const detailTabKeys = useMemo(() => tabItems.map((item) => String(item.key)), [tabItems]);

  useEffect(() => {
    if (detailTabKeys.length === 0) return;
    if (!detailTabKeys.includes(detailTabKey)) {
      setDetailTabKey(detailTabKeys[0] ?? 'files');
    }
  }, [detailTabKeys, detailTabKey]);

  if (loading) {
    return (
      <div className={`${layout.pageContainer} ${page.loadingWrap}`}>
        <Spin size="large" />
      </div>
    );
  }

  if (!group) {
    return <div className={layout.pageContainer}>小组不存在</div>;
  }

  const { groupName, ownerInfo, groupDesc: description, groupCoverUrl: cover, createTime } = group;
  const groupId = group.groupId || id || '';

  return (
    <div className={layout.pageContainer}>
      <div className={layout.pageHeader}>
        <h1 className={layout.pageTitle}>{groupName}</h1>
        <div className={layout.headerMeta}>
          {ownerInfo && (
            <div className={layout.headerMetaItem}>
              <Avatar
                size={24}
                src={ownerInfo.avatar}
                alt={ownerInfo.nickname || ownerInfo.realName || '创建者'}
              >
                {(ownerInfo.nickname || ownerInfo.realName || '?').charAt(0).toUpperCase()}
              </Avatar>
              <span>
                创建者：
                {group.groupType === GROUP_TYPE.NORMAL
                  ? ownerInfo.nickname
                  : ownerInfo.realName || ownerInfo.nickname}
              </span>
            </div>
          )}
          <span>创建日期：{createTime ?? '暂无'}</span>
        </div>
      </div>

      <Tabs
        className={layout.detailTabs}
        activeKey={detailTabKey}
        onChange={setDetailTabKey}
        items={tabItems}
      />

      <div className={layout.actionsBar}>
        {currentUserRole === 'OWNER' ? (
          <div className={layout.actionsRow}>
            <Button icon={<AiOutlineEdit size={16} />} onClick={() => setEditGroupModalOpen(true)}>
              编辑小组信息
            </Button>
            <Button
              danger
              icon={<AiOutlineDelete size={16} />}
              onClick={() => setDissolveGroupModalOpen(true)}
            >
              解散小组
            </Button>
          </div>
        ) : (
          <Button
            danger
            icon={<AiOutlineLogout size={16} />}
            onClick={() => setExitGroupModalOpen(true)}
          >
            退出小组
          </Button>
        )}
      </div>

      <EditGroupInfoModal
        open={editGroupModalOpen}
        onCancel={() => setEditGroupModalOpen(false)}
        groupName={groupName}
        description={description}
        cover={cover}
        groupId={groupId}
        groupType={group.groupType}
        onSuccess={handleEditSuccess}
      />
      <DissolveGroupModal
        open={dissolveGroupModalOpen}
        onCancel={() => setDissolveGroupModalOpen(false)}
        groupName={groupName}
        groupId={groupId}
        onSuccess={handleModalCloseOnly}
      />
      <ExitGroupModal
        open={exitGroupModalOpen}
        onCancel={() => setExitGroupModalOpen(false)}
        groupName={groupName}
        groupId={groupId}
        onSuccess={handleModalCloseOnly}
      />
    </div>
  );
};

export default GroupDetail;
