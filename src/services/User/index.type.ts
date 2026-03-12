import type { User } from '@/types/user';

/** UserService 接口：供依赖注入使用 */
export interface IUserService {
  /** 获取用户信息（带缓存，信息为空或 forceRefresh 时重新拉取） */
  getUserInfo(options?: { forceRefresh?: boolean }): Promise<User>;
  /** 全量拉取用户信息（含敏感字段），不缓存，需展示 realName/campusNo 等时调用 */
  getFullUserInfo(): Promise<GetUserInfoResponse>;
  sendEmailVerify(params: SendEmailVerifyRequest): Promise<void>;
  confirmEmailVerify(params: ConfirmEmailVerifyRequest): Promise<void>;
  updateUserProfile(params: UpdateUserProfileRequest): Promise<GetUserInfoResponse>;
  /** 退出登录时清理缓存 */
  clearUserCache(): void;
}

/** 确认邮箱验证请求参数 */
export interface ConfirmEmailVerifyRequest {
  token: string;
}

/** 发起邮箱验证请求参数 */
export interface SendEmailVerifyRequest {
  /** 0 -> @m.fudan.edu.cn；1 -> @fudan.edu.cn */
  suffixType: number;
}

/** 更新用户档案请求参数（仅基本档案可编辑字段） */
export interface UpdateUserProfileRequest {
  nickname?: string;
  realName?: string;
  sex?: number;
  university?: string | null;
  college?: string;
  major?: string;
  className?: string;
  enrollmentYear?: string;
  degreeLevel?: number;
  academicTitle?: string;
}

/** 获取用户信息接口的响应 data 类型 */
export interface GetUserInfoResponse {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  identityType: number;
  realName?: string;
  campusNo?: string;
  academicTitle?: string;
  className?: string;
  college?: string;
  createTime?: string;
  degreeLevel?: number;
  email?: string;
  enrollmentYear?: string;
  major?: string;
  mobile?: string;
  password?: string | null;
  sex?: number;
  status?: number;
  university?: string | null;
}
