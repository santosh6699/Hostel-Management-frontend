import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  withCredentials: true,
  withXSRFToken: true,
  timeout: 8000,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { 'Content-Type': 'application/json' },
});

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return error.response.data.message as string;
    if (error.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.response?.status === 403) return 'You do not have permission to do that.';
    if (!error.response) return 'Cannot reach the server. Check that the backend is running.';
  }
  return 'Something went wrong. Please try again.';
}
