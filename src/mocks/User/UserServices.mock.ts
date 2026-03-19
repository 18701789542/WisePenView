import type { User } from '@/types/user';
import type { FudanUISVerifyStatusData, IUserService } from '@/services/User';
import type { GetUserInfoResponse } from '@/services/User';
import mockdata from './mockdata.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fullUserInfo = mockdata as GetUserInfoResponse;

const getUserInfo = async (_options?: { forceRefresh?: boolean }): Promise<User> => {
  await delay(200);
  const { userInfo } = fullUserInfo;
  return {
    id: userInfo.id ?? '',
    username: userInfo.username,
    nickname: userInfo.nickname ?? undefined,
    avatar: userInfo.avatar ?? undefined,
    identityType: userInfo.identityType,
  };
};

const getFullUserInfo = async (): Promise<GetUserInfoResponse> => {
  await delay(200);
  return fullUserInfo;
};

const sendEmailVerify = async (): Promise<void> => {
  await delay(200);
};

const initiateUISVerify = async (): Promise<void> => {
  await delay(200);
  mockUisPollCount = 0;
};

/** 模拟：前两次未完成，第三次 completed 且需扫码 */
let mockUisPollCount = 0;

const checkFudanUISVerify = async (): Promise<FudanUISVerifyStatusData> => {
  await delay(100);
  mockUisPollCount += 1;
  if (mockUisPollCount < 3) {
    return {
      completed: false,
      requireAction: false,
      actionPayload: '',
      message: '',
    };
  }
  return {
    completed: true,
    requireAction: true,
    actionPayload: 'https://example.com/mock-uis-qr-payload',
    message: 'Mock：请使用复旦 UIS 完成扫码',
  };
};

const pollFudanUISVerifyUntilComplete: IUserService['pollFudanUISVerifyUntilComplete'] = async (
  options
) => {
  const intervalMs = options?.intervalMs ?? 2000;
  const { signal } = options ?? {};
  for (;;) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const status = await checkFudanUISVerify();
    if (status.completed) {
      return status;
    }
    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(resolve, intervalMs);
      const onAbort = () => {
        window.clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      if (signal) {
        if (signal.aborted) {
          window.clearTimeout(t);
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      }
    });
  }
};

const confirmEmailVerify = async (): Promise<void> => {
  await delay(200);
};

const updateUserInfo = async (
  params: Parameters<IUserService['updateUserInfo']>[0]
): Promise<void> => {
  await delay(200);
  const { nickname, realName, ...profileParams } = params;
  Object.assign(fullUserInfo.userInfo, {
    ...(nickname !== undefined && { nickname }),
    ...(realName !== undefined && { realName }),
  });
  Object.assign(fullUserInfo.userProfile, profileParams);
};

const clearUserCache = (): void => {};

export const UserServicesMock: IUserService = {
  getFullUserInfo,
  getUserInfo,
  updateUserInfo,
  sendEmailVerify,
  initiateUISVerify,
  checkFudanUISVerify,
  pollFudanUISVerifyUntilComplete,
  confirmEmailVerify,
  clearUserCache,
};
