import type {
  INoteService,
  SyncTitleRequest,
  CreateNoteRequest,
  CreateNoteResponse,
  DeleteNoteRequest,
} from './index.type';
import Axios from '@/utils/Axios';
import { checkResponse } from '@/utils/response';
import type { ApiResponse } from '@/types/api';

// syncTitle是一个resource的工作，但是语义上属于note服务
const syncTitle = async (params: SyncTitleRequest): Promise<void> => {
  const { resourceId, newName } = params;
  const res = (await Axios.post('/resource/item/renameRes', {
    resourceId,
    newName,
  })) as ApiResponse;
  checkResponse(res);
};

const createNote = async (params: CreateNoteRequest): Promise<CreateNoteResponse> => {
  const res = (await Axios.post('/addNote', params)) as ApiResponse<string>;
  checkResponse(res);
  return {
    resourceId: res.data || undefined,
  };
};

const deleteNote = async (params: DeleteNoteRequest): Promise<void> => {
  const res = (await Axios.post('/removeNote', null, { params })) as ApiResponse;
  checkResponse(res);
};

export const NoteServicesImpl: INoteService = {
  syncTitle,
  createNote,
  deleteNote,
};
