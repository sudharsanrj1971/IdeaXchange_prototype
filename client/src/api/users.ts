import { useApiClient } from './client';

// Matches server/src/models/user.js and the fields GET /api/users/me /
// GET /api/users/:id actually return — no displayName/bio/avatarUrl/
// ideasCount/contributionsCount fields exist on the backend.
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'expert' | 'admin';
  reputationScore: number;
  createdAt: string;
}

export function useUsersApi() {
  const api = useApiClient();

  const getMe = () => api.get<UserProfile>('/api/users/me');

  const getUser = (id: string) => api.get<UserProfile>(`/api/users/${id}`);

  // PATCH /api/users/me only accepts `name` (see server/src/routes/users.js)
  const updateMe = (data: Partial<{ name: string }>) =>
    api.patch<UserProfile>('/api/users/me', data);

  return { getMe, getUser, updateMe };
}
