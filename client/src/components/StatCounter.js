import React, { useEffect, useRef, useState } from "react";

const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * A number that counts up from zero once, the first time it scrolls into
 * view. It's the homepage's one piece of motion. With reduced motion on, or
 * without IntersectionObserver, it shows the final number straight away.
 *
 * Screen readers get the final number only (the ticking digits are hidden
 * from them).
 */
export default function StatCounter({ value, duration = 1400, className }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(() =>
        reducedMotion() || typeof IntersectionObserver === "undefined" ? value : 0
    );

    useEffect(() => {
        if (shown === value) return undefined;
        const node = ref.current;
        let frame;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                const start = performance.now();
                const tick = (now) => {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3);
                    setShown(Math.round(eased * value));
                    if (t < 1) frame = requestAnimationFrame(tick);
                };
                frame = requestAnimationFrame(tick);
            },
            { threshold: 0.6 }
        );
        observer.observe(node);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
        // Runs once: the counter never replays.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <span ref={ref} className={className}>
            <span aria-hidden="true">{shown.toLocaleString("en-US")}</span>
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                {value.toLocaleString("en-US")}
            </span>
        </span>
    );
}
