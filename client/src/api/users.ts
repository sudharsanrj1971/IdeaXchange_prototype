import { useApiClient } from './client';

export interface UserProfile {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  reputation: number;
  ideasCount: number;
  contributionsCount: number;
  joinedAt: string;
}

export function useUsersApi() {
  const api = useApiClient();

  const getMe = () => api.get<UserProfile>('/api/users/me');

  const getUser = (id: string) => api.get<UserProfile>(`/api/users/${id}`);

  const updateMe = (data: Partial<{ displayName: string; bio: string; avatarUrl: string }>) =>
    api.put<UserProfile>('/api/users/me', data);

  const getLeaderboard = () => api.get<UserProfile[]>('/api/users/leaderboard');

  return { getMe, getUser, updateMe, getLeaderboard };
}
