
export interface ImageUploadResponse {
    url: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    deleteUrl?: string;
}

export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
        throw new Error("ImgBB API key is missing");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return {
        url: data.data.url,
        thumbnailUrl: data.data.thumb?.url,
        mediumUrl: data.data.medium?.url,
        deleteUrl: data.data.delete_url
    };
};
