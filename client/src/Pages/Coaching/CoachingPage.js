import React from "react";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CoachingSlots from "../../components/CoachingSlots";
// Same page frame and hero as the Register page, so the two look like siblings.
import s from "../Register/Register.module.css";

/**
 * One-on-one coaching: pick a slot and pay with PayPal. This is the booking
 * that used to sit on the Register page; the component is unchanged.
 */
export default function CoachingPage() {
    return (
        <div className={s.page}>
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroBadgeWrap}>
                        <div className={s.heroBadge}>
                            <RecordVoiceOverIcon fontSize="small" /> One-on-one coaching
                        </div>
                    </div>
                    <h1 className={s.heroTitle}>Book a coaching session</h1>
                    <p className={s.heroSub}>
                        Choose a slot below. We&apos;ll email you to set a time that works.
                    </p>
                </div>
            </section>

            <div className="container">
                <section id="coaching-signup" style={{ padding: "8px 0 48px", scrollMarginTop: "90px" }}>
                    <CoachingSlots />
                </section>
            </div>
        </div>
    );
}
