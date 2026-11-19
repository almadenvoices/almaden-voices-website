import { useEffect } from "react";

const SITE = "Almaden Voices";

/**
 * Sets the browser tab title and the meta description for a page.
 * usePageMeta("Programs", "Free public speaking workshops...") gives
 * "Programs | Almaden Voices". Pass no title for the home page.
 */
export default function usePageMeta(title, description) {
    useEffect(() => {
        document.title = title ? `${title} | ${SITE}` : SITE;
        if (description) {
            let tag = document.querySelector('meta[name="description"]');
            if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("name", "description");
                document.head.appendChild(tag);
            }
            tag.setAttribute("content", description);
        }
    }, [title, description]);
}
