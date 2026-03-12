import type { ResourceItem } from '@/types/resource';
import type { FolderListByPathResponse } from '@/types/folder';
import type { ApiResponse } from '@/types/api';
import Axios from '@/utils/Axios';
import { checkResponse } from '@/utils/response';
import { ResourceServicesImpl } from '@/services/Resource/ResourceServices.impl';
import { RESOURCE_SORT_BY, RESOURCE_SORT_DIR } from '@/services/Resource/index.type';
import { filterNonPathTags, filterPathTagsOnly, findNodeByPath } from '@/utils/tagTree';
import type {
  GetTagTreeRequest,
  GetListByPathRequest,
  TagTreeNode,
  AddTagRequest,
  ChangeTagRequest,
  RemoveTagRequest,
  UpdateTagRequest,
  MoveTagRequest,
} from './index.type';
import type { ITagService } from './index.type';

const getTagTree = async (params?: GetTagTreeRequest): Promise<TagTreeNode[]> => {
  const res = (await Axios.get('/resource/tag/getTagTree', {
    params: params?.groupId != null ? { groupId: params.groupId } : undefined,
  })) as ApiResponse<TagTreeNode[]>;
  checkResponse(res);
  return res.data ?? [];
};

const getUserTagTree = async (params?: GetTagTreeRequest): Promise<TagTreeNode[]> => {
  const raw = await getTagTree(params);
  return filterNonPathTags(raw);
};

const getPathTagTree = async (): Promise<TagTreeNode[]> => {
  const raw = await getTagTree();
  return filterPathTagsOnly(raw);
};

const getPathTagNode = async (path: string): Promise<TagTreeNode | null> => {
  const pathTree = await getPathTagTree();
  return findNodeByPath(pathTree, path);
};

const getListByPath = async (params: GetListByPathRequest): Promise<FolderListByPathResponse> => {
  const pathTree = await getPathTagTree();
  const node = findNodeByPath(pathTree, params.path);
  const folders = node?.children ?? [];
  const filePage = params.filePage ?? 1;
  const filePageSize = params.filePageSize ?? 20;
  const tagId = node?.tagId;

  let files: ResourceItem[] = [];
  let totalFiles = 0;

  if (tagId != null) {
    const res = await ResourceServicesImpl.getUserResources({
      page: filePage,
      size: filePageSize,
      sortBy: RESOURCE_SORT_BY.UPDATE_TIME,
      sortDir: RESOURCE_SORT_DIR.DESC,
      tagIds: [tagId],
      tagQueryLogicMode: 'AND',
    });
    files = res.list;
    totalFiles = res.total;
  }

  return { folders, files, totalFiles };
};

const updateTag = async (params: UpdateTagRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tag/changeTag', params)) as ApiResponse;
  checkResponse(res);
};

const addTag = async (params: AddTagRequest): Promise<string> => {
  const res = (await Axios.post('/resource/tag/addTag', params)) as ApiResponse<string>;
  checkResponse(res);
  return res.data ?? '';
};

const changeTag = async (params: ChangeTagRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tag/changeTag', params)) as ApiResponse;
  checkResponse(res);
};

const removeTag = async (params: RemoveTagRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tag/removeTag', params)) as ApiResponse;
  checkResponse(res);
};

const moveTag = async (params: MoveTagRequest): Promise<void> => {
  const res = (await Axios.post('/resource/tag/moveTag', params)) as ApiResponse;
  checkResponse(res);
};

export const TagServicesImpl: ITagService = {
  getUserTagTree,
  getPathTagTree,
  getPathTagNode,
  getListByPath,
  updateTag,
  addTag,
  changeTag,
  removeTag,
  moveTag,
};
