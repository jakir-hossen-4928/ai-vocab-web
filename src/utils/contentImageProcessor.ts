
import { uploadImage } from "@/services/imageService";

/**
 * Extracts base64 images from HTML content, uploads them to ImgBB,
 * and replaces the base64 sources with the uploaded image URLs.
 *
 * @param htmlContent The HTML content string from the rich text editor
 * @returns The processed HTML string with remote image URLs
 */
export const processContentImages = async (htmlContent: string): Promise<string> => {
    if (!htmlContent) return "";

    // Create a DOM parser to handle the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const images = doc.getElementsByTagName('img');

    // Convert HTMLCollection to array to iterate
    const imageElements = Array.from(images);
    let modified = false;

    // Process each image sequentially to avoid overwhelming the uploader
    for (const img of imageElements) {
        const src = img.getAttribute('src');

        // Check if the source is a base64 data URL
        if (src && src.startsWith('data:image')) {
            try {
                // Convert base64 to Blob
                const response = await fetch(src);
                const blob = await response.blob();

                // Create a File object from the Blob (ImgBB service expects a File)
                // Generate a random filename or use a timestamp
                const filename = `content_image_${Date.now()}_${Math.random().toString(36).substring(7)}.${blob.type.split('/')[1]}`;
                const file = new File([blob], filename, { type: blob.type });

                // Upload to ImgBB
                const uploadResponse = await uploadImage(file);

                // Replace the source with optimized URL (medium if available for speed)
                img.setAttribute('src', uploadResponse.mediumUrl || uploadResponse.url);
                // Store full URL just in case we need it later (e.g. lightbox)
                img.setAttribute('data-full-url', uploadResponse.url);
                // Add performance attributes
                img.setAttribute('loading', 'lazy');
                img.setAttribute('decoding', 'async');
                modified = true;
            } catch (error) {
                console.error("Failed to process inline image:", error);
                // If upload fails, we keep the original base64 (or handle error as preferred)
                // Keeping base64 might still cause the same size error, but better than broken image
            }
        }
    }

    // Return the serialized HTML if modified, otherwise original
    return modified ? doc.body.innerHTML : htmlContent;
};
