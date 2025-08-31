import type iro from '@jaames/iro';
import { useEffect } from 'react';

type BlockerHandler = (e: Event) => void;

interface UseIroBlockerOptions {
    targetRef: React.MutableRefObject<iro.ColorPicker | null>;
    events: string[];
    allowRef: React.MutableRefObject<boolean>;
    isWheel: boolean;
}

export function useIroEventBlocker({ targetRef, events, allowRef, isWheel }: UseIroBlockerOptions): void {
    useEffect(() => {
        const el = (targetRef.current?.base as HTMLElement)?.children[0];
        if (!el || !isWheel) {
            return;
        }

        const handlers: BlockerHandler[] = [];

        events.forEach(evt => {
            const handler: BlockerHandler = e => {
                if (!allowRef.current) {
                    e.stopImmediatePropagation();
                    console.log(`🚫 ${evt} blockiert`);
                } else {
                    console.log(`✅ ${evt} durchgelassen`);
                }
            };

            el.addEventListener(evt, handler, true);
            handlers.push(handler);
        });

        console.log('🛡️ Event-Blocker aktiv');

        return () => {
            events.forEach((evt, i) => {
                el.removeEventListener(evt, handlers[i], true);
            });

            console.log('🧹 Event-Blocker entfernt');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetRef, events, isWheel]); // allowRef ist stabil → keine Abhängigkeit nötig
}
