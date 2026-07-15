import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * A custom hook to connect to the Heaven4 WebSocket broker and subscribe to the /topic/operations channel.
 * Pass a callback function that will be executed whenever a message is received.
 */
export function useOperationsWebSocket(onMessage: (message: any) => void) {
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8085/ws'),
            onConnect: () => {
                client.subscribe('/topic/operations', (msg) => {
                    if (msg.body) {
                        try {
                            const parsed = JSON.parse(msg.body);
                            onMessage(parsed);
                        } catch (e) {
                            onMessage(msg.body);
                        }
                    } else {
                        onMessage(null);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        client.activate();

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [onMessage]);
}
