// Core client
export { ApiClient, createApiClient, type ClientConfig } from './client';
export { AdminApiClient, createAdminApiClient } from './admin-client';

// Unified client
export {
  TarodanClient,
  createTarodanClient,
  createWebClient,
  createMobileClient,
} from './tarodan-client';

// Individual endpoints (for advanced use)
export * from './endpoints';

// React hooks
export { useApi, useApiMutation } from './hooks/useApi';
