import React from "react";
import { OTHER_REVIEWS, REVIEW_COUNT, AVERAGE_RATING, sessionLabel } from "../data/parentReviews";
import s from "./ParentReviewList.module.css";

/**
 * Every parent review except the four on the homepage, as a plain reading
 * list in two columns on wide screens. The Stories page
 * will reuse this as its "Parent reviews" section.
 */
export default function ParentReviewList({ id = "parent-reviews" }) {
    return (
        <section id={id} className={s.section} aria-labelledby={`${id}-title`}>
            <div className={s.inner}>
                <h2 id={`${id}-title`} className={s.title}>Parent reviews</h2>
                <p className={s.lead}>
                    After every session we ask parents what changed. They've given us an average of{" "}
                    {AVERAGE_RATING} out of 5 across {REVIEW_COUNT} reviews. Four of them are on our
                    homepage. These are the rest, word for word.
                </p>
                <ul className={s.list}>
                    {OTHER_REVIEWS.map((r, i) => (
                        <li key={`${r.name}-${r.sessionType}-${i}`} className={s.item}>
                            <blockquote className={s.quote}>{r.review}</blockquote>
                            <p className={s.who}>
                                {r.name}, parent, {sessionLabel(r)}
                                <span className={s.rating}>
                                    {" "}· {r.rating} out of 5
                                </span>
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
