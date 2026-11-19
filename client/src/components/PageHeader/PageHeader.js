import React from "react";
import s from "./PageHeader.module.css";

/**
 * The top of each main page: a big title and a short intro, with an
 * optional photo. Carries id="page-header", which the sticky sub-nav watches.
 */
export default function PageHeader({ title, intro, photo, tone = "plain" }) {
    return (
        <header id="page-header" className={`${s.header} ${s[tone] || ""} ${photo ? s.withPhoto : ""}`}>
            <div className={s.inner}>
                <div className={s.text}>
                    <h1 className={s.title}>{title}</h1>
                    {intro && <p className={s.intro}>{intro}</p>}
                </div>
                {photo && (
                    <figure className={s.figure}>
                        <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} className={s.img} />
                        {photo.caption && <figcaption className={s.caption}>{photo.caption}</figcaption>}
                    </figure>
                )}
            </div>
        </header>
    );
}
