// Query keys for cache management
const all = ['clients'] as const;

export const clientQueryKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (filters: Record<string, any>) => [...all, 'list', filters] as const,
  details: () => [...all, 'detail'] as const,
  detail: (id: string) => [...all, 'detail', id] as const,
  stats: () => [...all, 'stats'] as const,
};