import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dexieService } from '@/lib/dexieDb';

interface FavoritesContextType {
    favorites: string[];
    isLoading: boolean;
    toggleFavorite: (id: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
    getFavorites: () => string[];
    clearFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
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
                } else {
                    // Migrate from localStorage if Dexie is empty
                    const saved = localStorage.getItem("favorites");
                    if (saved) {
                        const localFavorites: string[] = JSON.parse(saved);
                        setFavorites(localFavorites);
                        await dexieService.syncFavoritesFromLocalStorage();
                    }
                }
            } catch (error) {
                console.error('Failed to load favorites:', error);
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

    const toggleFavorite = useCallback(async (id: string) => {
        try {
            const isFav = favorites.includes(id);

            // Optimistic update
            const newFavorites = isFav
                ? favorites.filter(favId => favId !== id)
                : [...favorites, id];

            setFavorites(newFavorites);

            // Persist
            if (isFav) {
                await dexieService.removeFavorite(id);
            } else {
                await dexieService.addFavorite(id);
            }

            // Sync localStorage (legacy/backup)
            localStorage.setItem("favorites", JSON.stringify(newFavorites));

        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            // Revert state on error if needed, but for simple favs usually okay to drift slightly or just log error
        }
    }, [favorites]);

    const isFavorite = useCallback((id: string) => {
        return favorites.includes(id);
    }, [favorites]);

    const getFavorites = useCallback(() => {
        return favorites;
    }, [favorites]);

    const clearFavorites = useCallback(async () => {
        try {
            setFavorites([]);
            await Promise.all(favorites.map(id => dexieService.removeFavorite(id)));
            localStorage.setItem("favorites", JSON.stringify([]));
        } catch (error) {
            console.error('Failed to clear favorites:', error);
        }
    }, [favorites]);

    return (
        <FavoritesContext.Provider value={{
            favorites,
            isLoading,
            toggleFavorite,
            isFavorite,
            getFavorites,
            clearFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
