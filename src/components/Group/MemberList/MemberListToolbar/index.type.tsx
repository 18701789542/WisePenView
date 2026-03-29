/** Toolbar 依赖 GroupDisplayConfig 的动作权限 */
export interface MemberListToolbarProps {
  isEditMode: boolean;
  total: number;
  groupDisplayConfig: {
    canEnterEditMode: boolean;
    canModifyPermission: boolean;
    canAssignQuota: boolean;
    canRemoveMember: boolean;
  };
  selectedCount: number;
  onModifyPermission: () => void;
  onAssignQuota: () => void;
  onDelete: () => void;
  onToggleEditMode: () => void;
  onInviteUser: () => void;
}
