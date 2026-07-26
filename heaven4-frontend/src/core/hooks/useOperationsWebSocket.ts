import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAudioAlerts } from '@/core/contexts/AudioProvider';

/**
 * A custom hook to connect to the Heaven4 WebSocket broker and subscribe to the /topic/operations channel.
 * Pass a callback function that will be executed whenever a message is received.
 */
export function useOperationsWebSocket(onMessage: (message: any) => void) {
    const { playSound } = useAudioAlerts();

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8085/ws'),
            onConnect: () => {
                client.subscribe('/topic/operations', (msg) => {
                    if (msg.body) {
                        try {
                            const parsed = JSON.parse(msg.body);
                            
                            // Audio routing based on event type
                            if (parsed.type === 'NEW_ORDER') {
                                playSound('new_order');
                            } else if (parsed.type === 'ORDER_PREPARING') {
                                playSound('preparing');
                            } else if (parsed.type === 'ORDER_COMPLETED' || parsed.type === 'ORDER_READY') {
                                playSound('completed');
                            } else if (parsed.type === 'NEW_COMPLAINT') {
                                playSound('complaint');
                            } else if (parsed.type === 'WAITER_CALL') {
                                playSound('waiter_call');
                            }

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
    }, [onMessage, playSound]);
}
