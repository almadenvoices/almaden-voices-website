import React, { useEffect, useMemo, useRef, useState } from "react";
import s from "./TestimonialsGridSlider.module.css";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay, Navigation, Pagination} from "swiper/modules";
import {motion} from "framer-motion";

// Render 0..5 stars (supports halves)
function Stars({ value = 0 }) {
    const full = Math.floor(value);
    const half = value % 1 >= 0.25 && value % 1 < 0.75;
    const empty = 5 - full - (half ? 1 : 0);
    return (
        <div className={s.stars} aria-label={`Rating ${value} out of 5`}>
            {Array.from({ length: full }).map((_, i) => <StarIcon key={`f${i}`} fontSize="small" />)}
            {half && <StarHalfIcon fontSize="small" />}
            {Array.from({ length: empty }).map((_, i) => <StarBorderIcon key={`e${i}`} fontSize="small" />)}
        </div>
    );
}

// Items-per-view based on width
function usePerView() {
    const calc = () => (window.innerWidth >= 1200 ? 3 : window.innerWidth >= 900 ? 2 : 1);
    const [pv, setPv] = useState(calc);
    useEffect(() => {
        const onResize = () => setPv(calc());
        window.addEventListener("resize", onResize, { passive: true });
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return pv;
}

export default function TestimonialsGridSlider({
                                                   title = "What Parents Are Saying",
                                                   subTitle="",
                                                   items = [],
                                                   autoplay = true,
                                                   intervalMs = 5000,
                                                   loop = true,
                                                   variant = "compact", // "compact" or "default"
                                               }) {
    // ---- state/refs/helpers (these were missing in your file) ----
    const perView = usePerView();
    const pageCount = useMemo(
        () => Math.max(1, Math.ceil((items?.length || 0) / perView)),
        [items?.length, perView]
    );
    const [page, setPage] = useState(0);
    const wrapRef = useRef(null);
    const timerRef = useRef(null);

    const prev = () => setPage((p) => (p - 1 + pageCount) % pageCount);
    const next = () => setPage((p) => (p + 1) % pageCount);

    // autoplay
    useEffect(() => {
        if (!autoplay || (items?.length || 0) <= perView) return;
        timerRef.current = setInterval(() => setPage((p) => (p + 1) % pageCount), intervalMs);
        return () => timerRef.current && clearInterval(timerRef.current);
    }, [autoplay, intervalMs, items?.length, perView, pageCount]);

    // pause on hover
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const pause = () => timerRef.current && clearInterval(timerRef.current);
        const resume = () => {
            if (!autoplay || (items?.length || 0) <= perView) return;
            timerRef.current = setInterval(() => setPage((p) => (p + 1) % pageCount), intervalMs);
        };
        el.addEventListener("mouseenter", pause);
        el.addEventListener("mouseleave", resume);
        return () => {
            el.removeEventListener("mouseenter", pause);
            el.removeEventListener("mouseleave", resume);
        };
    }, [autoplay, intervalMs, items?.length, perView, pageCount]);

    if (!items?.length) return null;

    return (

        //     <Swiper
        //         modules={[Pagination, Autoplay, Navigation]}
        //         spaceBetween={30}
        //         slidesPerView={1}
        //         loop
        //         autoplay={{ delay: 4000, disableOnInteraction: false }}
        //         pagination={{ clickable: true }}
        //         navigation
        //         breakpoints={{
        //             600: { slidesPerView: 1 },
        //             900: { slidesPerView: 2 },
        //             1200: { slidesPerView: 3 }
        //         }}
        //         style={{ maxWidth: 1200, margin: '0 auto' }}
        //     >
        //         {testimonials.map((t) => (
        //             <SwiperSlide key={t.id}>
        //                 <motion.div
        //                     initial={{ opacity: 0, y: 30 }}
        //                     animate={{ opacity: 1, y: 0 }}
        //                     transition={{ duration: 0.6 }}
        //                 >
        //
        //                 </motion.div>
        //             </SwiperSlide>
        //         ))}
        //     </Swiper>
        <section className={s.section}>
            <div className="container">
                <div className={s.head} >
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "#111827" }}>{title}</Typography>
                    <Typography variant="body1" sx={{ color: "#6B7280", lineHeight: 1.8, mt: 2 }}>{subTitle}</Typography>
                </div>

                <div className={s.slider} ref={wrapRef}>
                    {pageCount > 1 && (
                        <>
                            <button className={`${s.nav} ${s.prev}`} onClick={prev} aria-label="Previous">
                                <ArrowBackIosNewIcon fontSize="small" />
                            </button>
                            <button className={`${s.nav} ${s.next}`} onClick={next} aria-label="Next">
                                <ArrowForwardIosIcon fontSize="small" />
                            </button>
                        </>
                    )}

                    {/* Track holds full-width pages */}
                    <div
                        className={s.track}
                        style={{
                            transform: `translate3d(${-(page * 100)}%,0,0)`,
                            gridTemplateColumns: `repeat(${pageCount}, 100%)`,
                        }}
                    >
                        {Array.from({ length: pageCount }).map((_, pageIndex) => {
                            // Build items for this page
                            const pageItems = Array.from({ length: perView }).map((__, i) => {
                                const idx = loop
                                    ? ((pageIndex * perView) + i) % items.length
                                    : Math.min((pageIndex * perView) + i, items.length - 1);
                                return items[idx];
                            });

                            return (
                                <div className={s.page} key={`p${pageIndex}`} style={{ gridTemplateColumns: `repeat(${perView}, 1fr)` }}>
                                    {pageItems.map((t, i) => (
                                        <article className={`card ${s.card} ${variant === "compact" ? s.compact : ""}`} key={`${pageIndex}-${i}`}>
                                            <div className={s.headerRow}>
                                                {t.avatar && <Box component="img" src={t.avatar} alt={t.name} className={s.avatar} />}
                                                <div className={s.meta}>
                                                    <div className={s.name}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t.name}</Typography>
                                                    </div>
                                                    {t.sessionType && <div className={s.role}>{t.sessionType}</div>}
                                                    {typeof t.rating === "number" && <Stars value={t.rating} />}
                                                </div>
                                            </div>
                                            {t.title && <div className={s.title}><Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t.title}</Typography></div>}
                                            <p className={s.review}>“{t.review}”</p>
                                        </article>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {pageCount > 1 && (
                    <div className={s.dots}>
                        {Array.from({ length: pageCount }).map((_, i) => (
                            <button
                                key={i}
                                className={`${s.dot} ${i === page ? s.active : ""}`}
                                onClick={() => setPage(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
