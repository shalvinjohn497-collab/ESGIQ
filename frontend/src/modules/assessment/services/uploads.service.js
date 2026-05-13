/**
 * Uploads service — file upload logic
 */
export function validateFile(file) {
    const maxSize = 10 * 1024 * 1024;
    const allowed = ['xlsx', 'csv', 'pdf'];
    const ext = file.name.split('.').pop().toLowerCase();
    return { valid: file.size <= maxSize && allowed.includes(ext), ext, size: file.size };
}

export function processUpload(file, category) {
    return Promise.resolve({ success: true, fileName: file.name, category });
}
