// src/services/projectService.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// jwt is passed in explicitly rather than read from localStorage — the app
// never persists it there (AuthContext keeps it in React state only), so
// the previous localStorage read always came back empty and every request
// here was silently unauthenticated (401).
export async function fetchProject(id: string, jwt: string | null) {
  const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}
