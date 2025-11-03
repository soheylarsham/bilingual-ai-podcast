
// Helper to convert a File object to a base64 string for API calls
export const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // remove data:mime/type;base64, part
    };
    reader.onerror = error => reject(error);
});

// Helper to convert a File object to a full data URL for embedding or canvas preview
export const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});
