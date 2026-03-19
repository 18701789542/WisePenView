// 只存储需要的用户字段；id 用 string 避免大数精度丢失
export interface User {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  identityType: number;
  realName?: string;
  campusNo?: string;
}
