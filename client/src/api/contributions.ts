import { useApiClient } from './client';

export interface Contribution {
  _id: string;
  ideaId: string;
  author: { _id: string; displayName: string; avatarUrl?: string };
  type: 'code' | 'design' | 'research' | 'feedback' | 'other';
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export function useContributionsApi() {
  const api = useApiClient();

  const listContributions = (ideaId: string) =>
    api.get<Contribution[]>(`/api/ideas/${ideaId}/contributions`);

  const createContribution = (
    ideaId: string,
    data: { type: Contribution['type']; content: string },
  ) => api.post<Contribution>(`/api/ideas/${ideaId}/contributions`, data);

  const updateContribution = (
    ideaId: string,
    contributionId: string,
    data: { content?: string; type?: Contribution['type'] },
  ) =>
    api.put<Contribution>(
      `/api/ideas/${ideaId}/contributions/${contributionId}`,
      data,
    );

  const deleteContribution = (ideaId: string, contributionId: string) =>
    api.del<null>(`/api/ideas/${ideaId}/contributions/${contributionId}`);

  const approveContribution = (ideaId: string, contributionId: string) =>
    api.post<Contribution>(
      `/api/ideas/${ideaId}/contributions/${contributionId}/approve`,
      {},
    );

  const rejectContribution = (ideaId: string, contributionId: string) =>
    api.post<Contribution>(
      `/api/ideas/${ideaId}/contributions/${contributionId}/reject`,
      {},
    );

  const upvoteContribution = (ideaId: string, contributionId: string) =>
    api.post<Contribution>(
      `/api/ideas/${ideaId}/contributions/${contributionId}/upvote`,
      {},
    );

  return {
    listContributions,
    createContribution,
    updateContribution,
    deleteContribution,
    approveContribution,
    rejectContribution,
    upvoteContribution,
  };
}
