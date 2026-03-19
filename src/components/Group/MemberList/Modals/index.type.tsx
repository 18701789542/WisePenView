import type { GroupMember } from '@/types/group';
import type { PermissionConfig } from '../PermissionConfig';

export interface InviteUserModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  inviteCode?: string;
}

export interface EditPermissionModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  groupId: string;
  memberIds: string[];
  members: GroupMember[];
  permissionConfig: Pick<PermissionConfig, 'editableRoles' | 'canModifyPermission'>;
}

export interface DeleteMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  memberIds: string[];
  members: GroupMember[];
  groupId: string;
  permissionConfig: Pick<PermissionConfig, 'editableRoles'>;
}

export interface AssignQuotaModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  groupId: string;
  memberIds: string[];
  members: GroupMember[];
  permissionConfig: Pick<PermissionConfig, 'editableRolesForQuota'>;
}
