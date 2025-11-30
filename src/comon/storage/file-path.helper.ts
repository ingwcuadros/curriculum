
export function extractFileName(filePath: string): string {
    if (!filePath) return '';
    // Si es una URL (S3), extrae la última parte después de "/"
    return filePath.split('/').pop() || '';
}
