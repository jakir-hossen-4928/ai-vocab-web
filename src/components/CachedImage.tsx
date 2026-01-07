import React, { useState, useEffect } from "react";
import { dexieService } from "@/lib/dexieDb";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallback?: React.ReactNode;
}

export const CachedImage: React.FC<CachedImageProps> = ({
    src,
    fallback,
    className,
    alt = "",
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let objectUrl: string | null = null;

        const loadImage = async () => {
            if (!src) {
                setLoading(false);
                return;
            }

            try {
                // 1. Try to get from Dexie cache
                const cachedBlob = await dexieService.getImageFromCache(src);

                if (cachedBlob && isMounted) {
                    objectUrl = URL.createObjectURL(cachedBlob);
                    setImageSrc(objectUrl);
                    setLoading(false);
                    return;
                }

                // 2. If not in cache, fetch from network
                const response = await fetch(src);
                if (!response.ok) throw new Error("Failed to fetch image");

                const blob = await response.blob();

                // 3. Save to cache
                await dexieService.saveImageToCache(src, blob);

                if (isMounted) {
                    objectUrl = URL.createObjectURL(blob);
                    setImageSrc(objectUrl);
                    setLoading(false);
                }
            } catch (err) {
                console.warn(`Failed to load/cache image: ${src}`, err);
                if (isMounted) {
                    // Fallback to direct URL if caching fails
                    setImageSrc(src);
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center bg-muted animate-pulse", className)}>
                <LoadingSpinner className="h-4 w-4" fullPage={false} />
            </div>
        );
    }

    if (!imageSrc && fallback) {
        return <div className={className}>{fallback}</div>;
    }

    return (
        <img
            src={imageSrc || src}
            alt={alt}
            className={className}
            {...props}
        />
    );
};
