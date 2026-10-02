import { request } from './api';

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string; width?: number; height?: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('myboard_auth_token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

    const response = await fetch(`${API_BASE_URL}/assets/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      // Fallback: convert to base64 DataURL client-side if offline or local server not yet up
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    return response.json();
  },
};
