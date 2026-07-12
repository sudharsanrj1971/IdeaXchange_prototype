import { useApiClient } from './client';

export interface Idea {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  author: { _id: string; displayName: string; avatarUrl?: string };
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'archived';
  upvotes: number;
  upvotedBy: string[];
  contributionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaListResponse {
  ideas: Idea[];
  total: number;
  page: number;
  pages: number;
}

export interface IdeaFilters {
  page?: number;
  limit?: number;
  tags?: string;
  status?: string;
  search?: string;
  sort?: 'newest' | 'top' | 'trending';
}

export function useIdeasApi() {
  const api = useApiClient();

  const listIdeas = (filters: IdeaFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return api.get<IdeaListResponse>(`/api/ideas${qs ? `?${qs}` : ''}`);
  };

  const getIdea = (id: string) => api.get<Idea>(`/api/ideas/${id}`);

  const createIdea = (data: {
    title: string;
    description: string;
    tags?: string[];
  }) => api.post<Idea>('/api/ideas', data);

  const updateIdea = (
    id: string,
    data: Partial<{ title: string; description: string; tags: string[]; status: string }>,
  ) => api.put<Idea>(`/api/ideas/${id}`, data);

  const deleteIdea = (id: string) => api.del<null>(`/api/ideas/${id}`);

  const upvoteIdea = (id: string) => api.post<Idea>(`/api/ideas/${id}/upvote`, {});

  const getMyIdeas = () => api.get<Idea[]>('/api/ideas/mine');

  return { listIdeas, getIdea, createIdea, updateIdea, deleteIdea, upvoteIdea, getMyIdeas };
}
