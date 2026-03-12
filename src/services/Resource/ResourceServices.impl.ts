import type { ResourceListPage } from '@/types/resource';
import type {
  GetGroupResourceRequest,
  GetUserResourcesRequest,
  RenameResourceRequest,
  UpdateResourcePathRequest,
  UpdateResourceTagsRequest,
} from './index.type';
import type { IResourceService } from './index.type';
import Axios from '@/utils/Axios';
import { checkResponse } from '@/utils/response';
import type { ApiResponse } from '@/types/api';

const getUserResources = async (
  params: GetUserResourcesRequest | GetGroupResourceRequest
): Promise<ResourceListPage> => {
  const res = (await Axios.post('/resource/list', params)) as ApiResponse<ResourceListPage>;
  checkResponse(res);
  return res.data ?? { list: [], total: 0, page: params.page, size: params.size, totalPage: 0 };
};

const renameResource = async (params: RenameResourceRequest): Promise<void> => {
  const res = (await Axios.post('/resource/rename', params)) as ApiResponse;
  checkResponse(res);
};

const deleteResource = async (resourceId: string): Promise<void> => {
  const res = (await Axios.post('/resource/delete', { resourceId })) as ApiResponse;
  checkResponse(res);
};

const updateResourcePath = async (params: UpdateResourcePathRequest): Promise<void> => {
  const res = (await Axios.post('/resource/move', params)) as ApiResponse;
  checkResponse(res);
};

const updateResourceTags = async (params: UpdateResourceTagsRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tags', params)) as ApiResponse;
  checkResponse(res);
};

export const ResourceServicesImpl: IResourceService = {
  getUserResources,
  renameResource,
  deleteResource,
  updateResourcePath,
  updateResourceTags,
};
