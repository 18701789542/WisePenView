import type { ApiResponse } from '@/types/api';
import Axios from '@/utils/Axios';
import { checkResponse } from '@/utils/response';
import type {
  TagTreeResponse,
  TagCreateRequest,
  TagUpdateRequest,
  TagDeleteRequest,
  TagMoveRequest,
  GetGroupTagTreeRequest,
} from './index.type';
import type { ITagService } from './index.type';

// 不传groupId获取用户标签树
const getUserTagTree = async (): Promise<TagTreeResponse[]> => {
  const res = (await Axios.get('/resource/tag/getTagTree')) as ApiResponse<TagTreeResponse[]>;
  checkResponse(res);
  return res.data ?? [];
};

// 传groupId获取组标签树
const getGroupTagTree = async (params: GetGroupTagTreeRequest): Promise<TagTreeResponse[]> => {
  const res = (await Axios.get('/resource/tag/getTagTree', { params })) as ApiResponse<
    TagTreeResponse[]
  >;
  checkResponse(res);
  return res.data ?? [];
};

const updateTag = async (params: TagUpdateRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tag/changeTag', params)) as ApiResponse;
  checkResponse(res);
};

const addTag = async (params: TagCreateRequest): Promise<string> => {
  const res = (await Axios.post('/resource/tag/addTag', params)) as ApiResponse<string>;
  checkResponse(res);
  return res.data ?? '';
};

const deleteTag = async (params: TagDeleteRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tag/removeTag', params)) as ApiResponse;
  checkResponse(res);
};

const moveTag = async (params: TagMoveRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tag/moveTag', params)) as ApiResponse;
  checkResponse(res);
};

export const TagServicesImpl: ITagService = {
  getUserTagTree,
  getGroupTagTree,
  updateTag,
  addTag,
  deleteTag,
  moveTag,
};
