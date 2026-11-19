import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { pageByKey, sectionHref, visibleSections } from "../../data/siteNav";
import s from "./SubNav.module.css";

/**
 * The sticky "on this page" bar. It stays out of the way until the page
 * header has scrolled off the top, then pins to the top of the window with
 * the page's sections, the one you're reading marked.
 *
 * On a phone the bar scrolls sideways and keeps the current section in view.
 * Tapping a section jumps there (the nav's ScrollManager does the scrolling).
 *
 * Needs an element with id="page-header" on the page to know when to appear.
 */
export default function SubNav({ pageKey }) {
    const page = pageByKey(pageKey);
    const sections = page ? visibleSections(page) : [];
    const [visible, setVisible] = useState(false);
    const [current, setCurrent] = useState(sections[0]?.id);
    const listRef = useRef(null);

    // Appear once the page header is gone.
    useEffect(() => {
        const header = document.getElementById("page-header");
        if (!header || typeof IntersectionObserver === "undefined") return undefined;
        const observer = new IntersectionObserver(([entry]) => {
            setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
        observer.observe(header);
        return () => observer.disconnect();
    }, []);

    // Mark the section that holds the line just under the bar.
    useEffect(() => {
        const ids = sections.map((sec) => sec.id);
        const onScroll = () => {
            const line = 120;
            let active = ids[0];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) active = id;
            }
            setCurrent(active);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
        // The section list is fixed per page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageKey]);

    // Keep the current item in view when the bar is scrolled sideways.
    useEffect(() => {
        const item = listRef.current?.querySelector(`[data-id="${current}"]`);
        const list = listRef.current;
        if (!item || !list || !visible) return;
        const left = item.offsetLeft - 16;
        const right = item.offsetLeft + item.offsetWidth + 16;
        if (left < list.scrollLeft) list.scrollLeft = left;
        else if (right > list.scrollLeft + list.clientWidth) list.scrollLeft = right - list.clientWidth;
    }, [current, visible]);

    if (!page) return null;

    return (
        <nav
            aria-label={`${page.label}: on this page`}
            className={`${s.bar} ${visible ? s.barVisible : ""}`}
            aria-hidden={visible ? undefined : true}
        >
            <div className={s.inner}>
                <span className={s.pageName}>{page.label}</span>
                <ul ref={listRef} className={s.list}>
                    {sections.map((section) => (
                        <li key={section.id} data-id={section.id}>
                            <Link
                                to={sectionHref(page, section)}
                                className={`${s.link} ${current === section.id ? s.linkCurrent : ""}`}
                                aria-current={current === section.id ? "location" : undefined}
                                tabIndex={visible ? undefined : -1}
                            >
                                {section.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
