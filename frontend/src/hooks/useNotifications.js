import { useEffect } from 'react';

export default function useNotifications() {
    useEffect(() => {
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('Browser notifications enabled');
                }
            } catch (error) {
                console.log('Notification permission error:', error.message);
            }
        };

        requestPermission();
    }, []);

    const sendNotification = (title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    };

    return { sendNotification };
}