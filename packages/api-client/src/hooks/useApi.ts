import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        const message = error.response?.data?.message || error.message || 'An error occurred';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export function useApiMutation<T, P = any>(
  apiFunction: (params: P) => Promise<T>
): UseApiResult<T> & { mutate: (params: P) => Promise<T | null> } {
  const { data, loading, error, execute, reset } = useApi<T>(apiFunction);

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      return execute(params);
    },
    [execute]
  );

  return { data, loading, error, execute, reset, mutate };
}
