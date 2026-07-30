import { useApiClient } from './client';

export interface Project {
  _id: string;
  title: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  status: 'Submitted' | 'Collaborating' | 'Validating' | 'Certified';
  impactScore: number;
  tags: string[];
  createdAt: string;
}

export function useProjectsApi() {
  const api = useApiClient();

  // Matches server/src/routes/projects.js exactly — that router has no
  // search/sort/pagination query params, so filtering/sorting for the
  // dashboard happens client-side against the full list it returns.
  const listProjects = () => api.get<Project[]>('/api/projects');

  const getProject = (id: string) => api.get<Project>(`/api/projects/${id}`);

  const createProject = (data: { title: string; description: string; tags?: string[] }) =>
    api.post<Project>('/api/projects', data);

  const updateProject = (
    id: string,
    data: Partial<{ title: string; description: string; tags: string[]; status: string }>,
  ) => api.patch<Project>(`/api/projects/${id}`, data);

  return { listProjects, getProject, createProject, updateProject };
}
