import { apiPost } from './client';

export async function uploadFile(file, category) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return apiPost('/uploads', formData);
}
