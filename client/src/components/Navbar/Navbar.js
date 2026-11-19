import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MAIN_PAGES, sectionHref, visibleSections, pageForPath } from "../../data/siteNav";
import s from "./Navbar.module.css";

function Chevron({ open }) {
    return (
        <svg className={`${s.chevron} ${open ? s.chevronOpen : ""}`} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/**
 * One top-level page with its section dropdown (desktop).
 *
 * The page name is a real link, so clicking "About" goes to About. The menu
 * opens on hover, and on the chevron button for keyboard and touch-screen
 * laptops. Escape closes it and puts focus back on the chevron.
 */
function DesktopGroup({ page, current, openKey, setOpenKey }) {
    const open = openKey === page.key;
    const groupRef = useRef(null);
    const toggleRef = useRef(null);
    const closeTimer = useRef(null);
    const sections = visibleSections(page);
    const menuId = `nav-menu-${page.key}`;

    const show = () => {
        clearTimeout(closeTimer.current);
        setOpenKey(page.key);
    };
    const hideSoon = () => {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpenKey((k) => (k === page.key ? null : k)), 140);
    };
    useEffect(() => () => clearTimeout(closeTimer.current), []);

    const onKeyDown = (e) => {
        if (e.key === "Escape" && open) {
            setOpenKey(null);
            toggleRef.current?.focus();
        }
    };
    // Close when focus leaves the whole group (tabbing past the last item).
    const onBlur = (e) => {
        if (!groupRef.current?.contains(e.relatedTarget)) {
            setOpenKey((k) => (k === page.key ? null : k));
        }
    };

    return (
        <li
            ref={groupRef}
            className={s.group}
            onMouseEnter={show}
            onMouseLeave={hideSoon}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
        >
            <Link
                to={page.path}
                className={`${s.topLink} ${current ? s.topLinkCurrent : ""}`}
                aria-current={current ? "page" : undefined}
            >
                {page.label}
            </Link>
            <button
                ref={toggleRef}
                type="button"
                className={s.chevBtn}
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={`${page.label} sections`}
                onClick={() => setOpenKey(open ? null : page.key)}
            >
                <Chevron open={open} />
            </button>
            <ul id={menuId} className={s.menu} hidden={!open}>
                {sections.map((section) => (
                    <li key={section.id}>
                        <Link
                            to={sectionHref(page, section)}
                            className={s.menuLink}
                            onClick={() => setOpenKey(null)}
                        >
                            {section.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </li>
    );
}

/**
 * The phone and small-tablet menu. The menu button opens a panel; tapping a
 * page name opens its sections; tapping a section jumps there and closes the
 * whole menu.
 */
function MobileMenu({ open, onClose, currentKey }) {
    const [expanded, setExpanded] = useState(currentKey || null);

    useEffect(() => {
        if (open) setExpanded(currentKey || null);
    }, [open, currentKey]);

    return (
        <div id="mobile-menu" className={s.mobilePanel} hidden={!open}>
            <ul className={s.mobileList}>
                {MAIN_PAGES.map((page) => {
                    const isOpen = expanded === page.key;
                    const listId = `mobile-sections-${page.key}`;
                    return (
                        <li key={page.key} className={s.mobileGroup}>
                            <button
                                type="button"
                                className={`${s.mobileGroupBtn} ${currentKey === page.key ? s.mobileGroupCurrent : ""}`}
                                aria-expanded={isOpen}
                                aria-controls={listId}
                                onClick={() => setExpanded(isOpen ? null : page.key)}
                            >
                                {page.label}
                                <Chevron open={isOpen} />
                            </button>
                            <ul id={listId} className={s.mobileSections} hidden={!isOpen}>
                                {visibleSections(page).map((section) => (
                                    <li key={section.id}>
                                        <Link to={sectionHref(page, section)} className={s.mobileSectionLink} onClick={onClose}>
                                            {section.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    );
                })}
                <li className={s.mobileGroup}>
                    <NavLink to="/register" className={s.mobilePlainLink} onClick={onClose}>
                        Register
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}

export default function Navbar() {
    const location = useLocation();
    const [openKey, setOpenKey] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const headerRef = useRef(null);
    const menuBtnRef = useRef(null);
    const currentPage = pageForPath(location.pathname);

    // Any navigation closes every menu.
    useEffect(() => {
        setOpenKey(null);
        setMobileOpen(false);
    }, [location.pathname, location.hash, location.key]);

    // Escape closes the mobile panel; a tap outside the header closes either.
    useEffect(() => {
        if (!mobileOpen && !openKey) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape" && mobileOpen) {
                setMobileOpen(false);
                menuBtnRef.current?.focus();
            }
        };
        const onPointer = (e) => {
            if (!headerRef.current?.contains(e.target)) {
                setMobileOpen(false);
                setOpenKey(null);
            }
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
        };
    }, [mobileOpen, openKey]);

    return (
        <header ref={headerRef} className={s.header}>
            <div className={s.bar}>
                <Link to="/" className={s.brand} aria-label="Almaden Voices home">
                    <img src="/almaden_voices_logo_transparent.png" alt="" className={s.logo} />
                </Link>

                <nav aria-label="Main" className={s.desktopNav}>
                    <ul className={s.groups}>
                        {MAIN_PAGES.map((page) => (
                            <DesktopGroup
                                key={page.key}
                                page={page}
                                current={currentPage?.key === page.key}
                                openKey={openKey}
                                setOpenKey={setOpenKey}
                            />
                        ))}
                        <li>
                            <NavLink
                                to="/register"
                                className={({ isActive }) => `${s.topLink} ${s.registerLink} ${isActive ? s.topLinkCurrent : ""}`}
                            >
                                Register
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <Link to="/donate" className={s.donate}>
                    Donate
                </Link>

                <button
                    ref={menuBtnRef}
                    type="button"
                    className={s.menuBtn}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setMobileOpen((o) => !o)}
                >
                    <span className={s.menuIcon} aria-hidden="true">
                        <span /><span /><span />
                    </span>
                    {mobileOpen ? "Close" : "Menu"}
                </button>
            </div>

            <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} currentKey={currentPage?.key} />
        </header>
    );
}
