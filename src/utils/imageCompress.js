import imageCompression from 'browser-image-compression';

const DEFAULT_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
};

export async function compressImage(file, options = {}) {
    try {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const compressedFile = await imageCompression(file, mergedOptions);
        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

export async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export async function compressAndConvert(file) {
    try {
        const compressed = await compressImage(file);
        const base64 = await fileToBase64(compressed);
        return base64;
    } catch (error) {
        console.error('Error processing image:', error);
        // Fallback: just convert to base64 without compression
        return await fileToBase64(file);
    }
}
