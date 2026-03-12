import type { User } from '@/types/user';
import type { IUserService } from '@/services/User';
import type { GetUserInfoResponse } from '@/services/User';
import mockdata from './mockdata.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const userInfo = mockdata.userInfo as GetUserInfoResponse;

const getUserInfo = async (_options?: { forceRefresh?: boolean }): Promise<User> => {
  await delay(200);
  return userInfo;
};

const getFullUserInfo = async (): Promise<GetUserInfoResponse> => {
  await delay(200);
  return userInfo;
};

const sendEmailVerify = async (): Promise<void> => {
  await delay(200);
};

const confirmEmailVerify = async (): Promise<void> => {
  await delay(200);
};

const updateUserProfile = async (
  params: Parameters<IUserService['updateUserProfile']>[0]
): Promise<GetUserInfoResponse> => {
  await delay(200);
  return { ...userInfo, ...params };
};

const clearUserCache = (): void => {};

export const UserServicesMock: IUserService = {
  getUserInfo,
  getFullUserInfo,
  sendEmailVerify,
  confirmEmailVerify,
  updateUserProfile,
  clearUserCache,
};
