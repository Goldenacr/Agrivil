import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useBrowserNotification = () => {
    const { toast } = useToast();
    const [permission, setPermission] = useState(Notification.permission);

    const requestPermission = useCallback(() => {
        if (!("Notification" in window)) {
            toast({
                variant: "destructive",
                title: "Unsupported Browser",
                description: "This browser does not support desktop notifications."
            });
            return;
        }

        Notification.requestPermission().then(permissionResult => {
            setPermission(permissionResult);
            if (permissionResult === 'granted') {
                toast({
                    title: "Permissions Granted!",
                    description: "You will now receive browser notifications.",
                });
            } else if (permissionResult === 'denied') {
                 toast({
                    variant: "destructive",
                    title: "Permissions Denied",
                    description: "You have blocked notifications. To enable them, check your browser settings.",
                });
            } else {
                 toast({
                    title: "Permissions Not Granted",
                    description: "You will not receive browser notifications until you grant permission.",
                });
            }
        });
    }, [toast]);
    
    const sendNotification = useCallback((title, options) => {
        if (permission === 'granted') {
            const notification = new Notification(title, {
                ...options,
                icon: '/logo.png', // Assuming a logo exists in the public folder
                badge: '/logo.png',
            });
            return notification;
        }
    }, [permission]);

    return { requestPermission, sendNotification, permission };
};