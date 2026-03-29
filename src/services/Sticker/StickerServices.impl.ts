import { TagServicesImpl } from '@/services/Tag/TagServices.impl';
import { ResourceServicesImpl } from '@/services/Resource/ResourceServices.impl';
import type {
  IStickerService,
  Sticker,
  AddStickerRequest,
  UpdateStickerRequest,
  DeleteStickerRequest,
  UpdateResourceStickersRequest,
} from './index.type';

const getStickerList = async (): Promise<Sticker[]> => {
  const raw = await TagServicesImpl.getUserTagTree();
  // 过滤掉路径标签, 忽略叶子节点，同时简化数据结构
  const stickers = raw
    .filter((node) => node.tagName !== '/')
    .map((node) => ({ tagId: node.tagId, tagName: node.tagName }));
  return stickers;
};

const addSticker = async (params: AddStickerRequest): Promise<string> => {
  return TagServicesImpl.addTag({
    tagName: params.stickerName,
  });
};

const updateSticker = async (params: UpdateStickerRequest): Promise<void> => {
  await TagServicesImpl.updateTag({
    targetTagId: params.stickerId,
    tagName: params.stickerName,
  });
};

const deleteSticker = async (params: DeleteStickerRequest): Promise<void> => {
  await TagServicesImpl.deleteTag({
    targetTagId: params.stickerId,
  });
};

const updateResourceStickers = async (params: UpdateResourceStickersRequest): Promise<void> => {
  await ResourceServicesImpl.updateResourceTags({
    resourceId: params.resourceId,
    tagIds: params.stickerIds,
  });
};

export const StickerServicesImpl: IStickerService = {
  getStickerList,
  addSticker,
  updateSticker,
  deleteSticker,
  updateResourceStickers,
};
