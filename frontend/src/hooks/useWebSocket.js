import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';

const useWebSocket = (user) => {
    const [client, setClient] = useState(null);
    const [connected, setConnected] = useState(false);

    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            setConnected(true);

            // Subscribe to role-specific notifications
            const topic = user.role === 'DRIVER' ? `/topic/driver/${user.id}` : `/topic/passenger/${user.id}`;
            stompClient.subscribe(topic, (message) => {
                console.log('Topic Message:', message.body);
                try {
                    const notification = JSON.parse(message.body);
                    setLastMessage(notification);
                    toast.info(notification.message || 'New notification received');
                } catch (e) {
                    console.error('Error parsing notification:', e);
                    setLastMessage({ type: 'TEXT_NOTIFICATION', message: message.body });
                    toast.info(message.body || 'New notification received');
                }
            });

            // Subscribe to global ride updates
            stompClient.subscribe('/topic/rides', (message) => {
                console.log('Global Update:', message.body);
                try {
                    const notification = JSON.parse(message.body);
                    setLastMessage(notification);
                } catch (e) {
                    setLastMessage({ type: 'GLOBAL_UPDATE', content: message.body });
                }
            });
        };

        stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        stompClient.activate();
        setClient(stompClient);

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [user?.id, user?.role]);

    const sendMessage = useCallback((destination, body) => {
        if (client && connected) {
            client.publish({
                destination,
                body: JSON.stringify(body),
            });
        }
    }, [client, connected]);

    return { connected, sendMessage, lastMessage };
};

export default useWebSocket;
