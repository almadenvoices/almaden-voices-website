import { useEffect, useState } from "react";

// Same client id as the backend env. Public by design — PayPal client ids are
// safe to ship in the browser bundle.
export const PAYPAL_CLIENT_ID = "AXjQeGEP8yRg32Ze14iVZFB24aYw37Gp8M3udPPwRewK3etierQ7tmSGnU3LI8ZNskzhjpgJMgBWERoZ";

/**
 * Loads the PayPal JS SDK once per page and reports when it's ready.
 * Shared by the donate page and the 1-on-1 coaching booking flow, so the
 * script tag is only ever added once no matter which one renders first.
 */
export default function usePayPalScript() {
    const [loaded, setLoaded] = useState(Boolean(window.paypal));
    const [error, setError] = useState("");

    useEffect(() => {
        if (window.paypal) {
            setLoaded(true);
            return;
        }

        const src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;

        // Another component may already be waiting on the same script.
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener("load", () => setLoaded(true));
            existing.addEventListener("error", () => setError("PayPal SDK failed to load."));
            return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => {
            if (window.paypal) setLoaded(true);
            else setError("PayPal SDK failed to load.");
        };
        script.onerror = () => setError("PayPal SDK failed to load.");
        document.body.appendChild(script);
        // The script is intentionally left in place so it stays cached.
    }, []);

    return { loaded, error };
}
