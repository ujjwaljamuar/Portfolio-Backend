export type JsonResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

type BuildJsonResponseInput<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const buildJsonResponse = <T = unknown>({
  success = true,
  message = "Request successful",
  data,
}: BuildJsonResponseInput<T> = {}): JsonResponse<T> => {
  return {
    success,
    message,
    ...(data !== undefined ? { data } : {}),
  };
};
