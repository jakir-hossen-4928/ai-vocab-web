import { useEffect } from 'react';
import { toast } from 'sonner';
import { WifiOff, Wifi } from 'lucide-react';

export const NetworkStatus = () => {
    useEffect(() => {
        const handleOnline = () => {
            toast.success("You are back online!", {
                icon: <Wifi className="h-4 w-4" />,
            });
        };

        const handleOffline = () => {
            toast.error("You are offline. Some features may be limited.", {
                icon: <WifiOff className="h-4 w-4" />,
                duration: Infinity, // Keep it visible until online
                id: "offline-toast"
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return null;
};
