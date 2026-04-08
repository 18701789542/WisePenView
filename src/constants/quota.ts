/**
 * 小组成员 token 配额（changeTokenLimit / newTokenLimit）前端允许的最大值。
 * 与后端 int 范围对齐，避免溢出。
 */
export const GROUP_MEMBER_TOKEN_LIMIT_MAX = 100_000_000;
