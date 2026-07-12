// src/services/projectService.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function fetchProject(id: string) {
  const token = localStorage.getItem('jwt');
  const res = await fetch(`${BASE_URL}/api/ideas/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}
