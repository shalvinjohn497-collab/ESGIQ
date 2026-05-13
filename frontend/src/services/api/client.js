
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;
      if (token) return token;
    }
  } catch {}
  return 'demo-token';
}

async function request(method, endpoint, data) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API Error ${res.status}`);
  return { data: json };
}

const client = {
  get:    (url)       => request('GET',    url),
  post:   (url, data) => request('POST',   url, data),
  put:    (url, data) => request('PUT',    url, data),
  delete: (url)       => request('DELETE', url),
};

export default client;