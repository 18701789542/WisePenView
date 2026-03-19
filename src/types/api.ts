/** 标准 API 返回体：code === 200 表示成功（与 `checkResponse` 一致） */
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}
