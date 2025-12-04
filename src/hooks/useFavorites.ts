import { useState, useEffect, useCallback } from 'react';
import { dexieService } from '@/lib/dexieDb';

/**
 * Hook for managing favorites with Dexie caching
 * Migrates from localStorage to Dexie for better performance
 */
export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load favorites from Dexie on mount
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                // Try to load from Dexie first
                const dexieFavorites = await dexieService.getAllFavorites();

                if (dexieFavorites.length > 0) {
                    setFavorites(dexieFavorites);
                    console.log(`[Dexie] Loaded ${dexieFavorites.length} favorites from cache`);
                } else {
                    // Migrate from localStorage if Dexie is empty
                    const saved = localStorage.getItem("favorites");
                    if (saved) {
                        const localFavorites: string[] = JSON.parse(saved);
                        setFavorites(localFavorites);

                        // Sync to Dexie
                        await dexieService.syncFavoritesFromLocalStorage();
                        console.log(`[Dexie] Migrated ${localFavorites.length} favorites from localStorage`);
                    }
                }
            } catch (error) {
                console.error('Failed to load favorites:', error);
                // Fallback to localStorage
                const saved = localStorage.getItem("favorites");
                if (saved) {
                    setFavorites(JSON.parse(saved));
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, []);

    // Toggle favorite
    const toggleFavorite = useCallback(async (id: string) => {
        try {
            const isFav = favorites.includes(id);

            if (isFav) {
                // Remove from favorites
                await dexieService.removeFavorite(id);
                setFavorites(prev => prev.filter(favId => favId !== id));
                console.log(`[Dexie] Removed favorite: ${id}`);
            } else {
                // Add to favorites
                await dexieService.addFavorite(id);
                setFavorites(prev => [...prev, id]);
                console.log(`[Dexie] Added favorite: ${id}`);
            }

            // Also update localStorage for backward compatibility
            const newFavorites = isFav
                ? favorites.filter(favId => favId !== id)
                : [...favorites, id];
            localStorage.setItem("favorites", JSON.stringify(newFavorites));
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    }, [favorites]);

    // Check if a vocabulary is favorited
    const isFavorite = useCallback((id: string) => {
        return favorites.includes(id);
    }, [favorites]);

    // Get all favorite IDs
    const getFavorites = useCallback(() => {
        return favorites;
    }, [favorites]);

    // Clear all favorites
    const clearFavorites = useCallback(async () => {
        try {
            // Clear from Dexie
            const allFavorites = await dexieService.getAllFavorites();
            await Promise.all(allFavorites.map(id => dexieService.removeFavorite(id)));

            setFavorites([]);
            localStorage.setItem("favorites", JSON.stringify([]));
            window.dispatchEvent(new Event('storage'));

            console.log('[Dexie] Cleared all favorites');
        } catch (error) {
            console.error('Failed to clear favorites:', error);
        }
    }, []);

    return {
        favorites,
        isLoading,
        toggleFavorite,
        isFavorite,
        getFavorites,
        clearFavorites,
    };
};
