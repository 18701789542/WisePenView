interface RetryStrategyInput {
  retryCount: number;
  lastDelay: number | undefined;
}

export type RetryDelayStrategy = (input: RetryStrategyInput) => number | null;

export type RetryStrategy = {
  /**
   * 允许的静默自恢复重试次数，超过该次数后暴露 `reconnecting` 状态。
   */
  allowSelfRecoverCount?: number;
  delay: RetryDelayStrategy;
};

export const RetryStrategies = {
  // 指数退避
  exponential: (
    base = 1000,
    max = 30000,
    maxRetries = 5,
    allowSelfRecoverCount = 0
  ): RetryStrategy => ({
    allowSelfRecoverCount,
    delay: ({ retryCount }) => {
      if (retryCount >= maxRetries) return null;
      return Math.min(base * 2 ** retryCount, max);
    },
  }),

  // 斐波那契退避
  fibonacci: (base = 1000, maxRetries = 8, allowSelfRecoverCount = 0): RetryStrategy => {
    const fib = (n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2));
    return {
      allowSelfRecoverCount,
      delay: ({ retryCount }) => {
        if (retryCount >= maxRetries) return null;
        return base * fib(retryCount + 1);
      },
    };
  },

  // 固定间隔重试
  polling: (interval = 3000, maxRetries = 10, allowSelfRecoverCount = 0): RetryStrategy => ({
    allowSelfRecoverCount,
    delay: ({ retryCount }) => (retryCount >= maxRetries ? null : interval),
  }),
} as const;
