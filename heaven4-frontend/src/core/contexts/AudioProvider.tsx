import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type SoundType = 'new_order' | 'preparing' | 'completed' | 'complaint' | 'waiter_call';

interface AudioContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (type: SoundType) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('heaven4_muted') === 'true';
    });

    const audioCtxRef = useRef<AudioContext | null>(null);

    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioCtxRef.current = new AudioContextClass();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
        }
        return audioCtxRef.current;
    }, []);

    // Auto-unlock Web Audio API context on first user click/tap
    useEffect(() => {
        const unlock = () => {
            getAudioContext();
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        window.addEventListener('touchstart', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
    }, [getAudioContext]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newVal = !prev;
            localStorage.setItem('heaven4_muted', String(newVal));
            return newVal;
        });
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (isMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            if (type === 'new_order') {
                // New Order: Bright Double Bell Tone (880Hz -> 1320Hz)
                [880, 1320].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                    gain.gain.setValueAtTime(0.3, now + idx * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.12);
                    osc.stop(now + idx * 0.12 + 0.45);
                });
            } else if (type === 'waiter_call') {
                // Waiter Call: Table Bell Ding-Dong (1046.5Hz C6 -> 1318.5Hz E6)
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(1046.5, now);
                gain1.gain.setValueAtTime(0.4, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.55);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1318.5, now + 0.18);
                gain2.gain.setValueAtTime(0.4, now + 0.18);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(now + 0.18);
                osc2.stop(now + 0.75);
            } else if (type === 'complaint') {
                // Complaint: Urgent Siren Alarm (880Hz / 587Hz alternating pulses)
                [880, 587.33, 880, 587.33].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.15);
                    gain.gain.setValueAtTime(0.2, now + idx * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.13);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.15);
                    osc.stop(now + idx * 0.15 + 0.14);
                });
            } else if (type === 'preparing') {
                // Preparing: Soft Chime Chord (440Hz -> 554.37Hz)
                [440, 554.37].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                    gain.gain.setValueAtTime(0.25, now + idx * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.1);
                    osc.stop(now + idx * 0.1 + 0.35);
                });
            } else if (type === 'completed') {
                // Completed: Victory Fanfare (C5 -> E5 -> G5 -> C6)
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                    gain.gain.setValueAtTime(0.3, now + idx * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.1);
                    osc.stop(now + idx * 0.1 + 0.45);
                });
            }
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }, [isMuted, getAudioContext]);

    return (
        <AudioContext.Provider value={{ isMuted, toggleMute, playSound }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudioAlerts() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudioAlerts must be used within an AudioProvider');
    }
    return context;
}
