function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfReady = null;

function ensureCsrfCookie() {
  if (!csrfReady) {
    csrfReady = fetch('/sanctum/csrf-cookie', { credentials: 'include' });
  }
  return csrfReady;
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  if (method !== 'GET') {
    await ensureCsrfCookie();
  }

  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const xsrfToken = readCookie('XSRF-TOKEN');
  if (xsrfToken) {
    headers['X-XSRF-TOKEN'] = xsrfToken;
  }

  const response = await fetch(path, {
    ...options,
    method,
    credentials: 'include',
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    error.errors = data?.errors || null;
    error.payload = data;
    throw error;
  }

  return data;
}
