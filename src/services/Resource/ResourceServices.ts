import type { ResourceListPage } from '@/types/resource';
import type {
  GetUserResourcesRequest,
  RenameResourceRequest,
  UpdateResourcePathRequest,
  UpdateResourceTagsRequest,
} from './index.type';
import {
  getUserResourcesMock,
  updateResourcePathMock,
  updateResourceTagsMock,
  renameFileMock,
  deleteFileMock,
} from '@/services/mock/folderView';

const USE_RESOURCE_MOCK = true;

const getUserResources = async (params: GetUserResourcesRequest): Promise<ResourceListPage> => {
  if (USE_RESOURCE_MOCK) return getUserResourcesMock(params);
  return {
    list: [],
    total: 0,
    page: params.page,
    size: params.size,
    totalPage: 0,
  };
};

const renameResource = async (params: RenameResourceRequest): Promise<void> => {
  if (USE_RESOURCE_MOCK) {
    await renameFileMock(params.resourceId, params.newName);
    return;
  }
};

const deleteResource = async (resourceId: string): Promise<void> => {
  if (USE_RESOURCE_MOCK) {
    await deleteFileMock(resourceId);
    return;
  }
};

const updateResourcePath = async (params: UpdateResourcePathRequest): Promise<void> => {
  if (USE_RESOURCE_MOCK) {
    await updateResourcePathMock(params.resourceId, params.path);
    return;
  }
};

const updateResourceTags = async (params: UpdateResourceTagsRequest): Promise<void> => {
  if (USE_RESOURCE_MOCK) {
    await updateResourceTagsMock(params.resourceId, params.tagIds);
    return;
  }
};

export const ResourceServices = {
  getUserResources,
  renameResource,
  deleteResource,
  updateResourcePath,
  updateResourceTags,
};
