import Axios from '@/utils/Axios';
import { checkResponse } from '@/utils/response';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';
import type {
  ConfirmEmailVerifyRequest,
  GetUserInfoResponse,
  SendEmailVerifyRequest,
  UpdateUserProfileRequest,
} from './index.type';
import type { IUserService } from './index.type';

/** 仅缓存展示用字段和id，不含 realName、campusNo 等敏感信息 */
type CachedUserSafe = Pick<User, 'id' | 'username' | 'nickname' | 'avatar' | 'identityType'>;

const toUserSafe = (data: GetUserInfoResponse): CachedUserSafe => {
  const { userInfo } = data;
  return {
    id: userInfo.id ?? 0,
    username: userInfo.username,
    nickname: userInfo.nickname ?? undefined,
    avatar: userInfo.avatar ?? undefined,
    identityType: userInfo.identityType,
  };
};

/** 模块级缓存，仅存非敏感展示字段，退出登录时通过 clearUserCache 清理 */
let cachedUserInfo: CachedUserSafe | null = null;

const getUserInfo = async (options?: { forceRefresh?: boolean }): Promise<User> => {
  const forceRefresh = options?.forceRefresh ?? false;
  if (!forceRefresh && cachedUserInfo) {
    return cachedUserInfo;
  }
  const data = await getFullUserInfo();
  cachedUserInfo = toUserSafe(data);
  return cachedUserInfo;
};

/** 全量拉取，含敏感信息，不缓存 */
const getFullUserInfo = async (): Promise<GetUserInfoResponse> => {
  const res = (await Axios.get('/user/getUserInfo')) as ApiResponse<GetUserInfoResponse>;
  checkResponse(res);
  return res.data;
};

const clearUserCache = (): void => {
  cachedUserInfo = null;
};

const sendEmailVerify = async (params: SendEmailVerifyRequest): Promise<void> => {
  const res = (await Axios.post('/user/verify/email', null, {
    params: { suffixType: params.suffixType },
  })) as ApiResponse;
  checkResponse(res);
};

const confirmEmailVerify = async (params: ConfirmEmailVerifyRequest): Promise<void> => {
  const res = (await Axios.get('/user/verify/check', {
    params: { token: params.token },
  })) as ApiResponse;
  checkResponse(res);
};

const updateUserProfile = async (
  params: UpdateUserProfileRequest
): Promise<GetUserInfoResponse> => {
  const res = (await Axios.put('/user/info', params)) as ApiResponse<GetUserInfoResponse>;
  checkResponse(res);
  if (cachedUserInfo) {
    cachedUserInfo = { ...cachedUserInfo, ...toUserSafe(res.data) };
  }
  return res.data;
};

export const UserServicesImpl: IUserService = {
  getUserInfo,
  getFullUserInfo,
  sendEmailVerify,
  confirmEmailVerify,
  updateUserProfile,
  clearUserCache,
};
