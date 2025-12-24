import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { dexieService } from '@/lib/dexieDb';
import { toast } from 'sonner';

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

    const loadFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            const local = await dexieService.getAllFavorites();
            setFavorites(local);
        } catch (error) {
            console.error("Failed to load favorites:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const toggleFavorite = useCallback(async (id: string) => {
        try {
            const isFav = favorites.includes(id);
            if (isFav) {
                await dexieService.removeFavorite(id);
                setFavorites(prev => prev.filter(f => f !== id));
            } else {
                await dexieService.addFavorite(id);
                setFavorites(prev => [id, ...prev]);
            }
        } catch (error) {
            toast.error("Failed to update favorites");
            console.error(error);
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
            await dexieService.clearFavorites();
            setFavorites([]);
            toast.success("Favorites cleared");
        } catch (error) {
            toast.error("Failed to clear favorites");
        }
    }, []);

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
