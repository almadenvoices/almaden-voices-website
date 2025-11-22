import React from "react";
import s from "./VisionMission.module.css";

/**
 * VisionMission
 * - Plain React + CSS Modules (no Tailwind/MUI)
 * - Mobile → XL desktop responsive
 * - Data-driven (pass your own content via props if you want)
 */
export default function VisionMission({
                                          eyebrow = "Why We Exist",
                                          title = "Our Vision & Mission",
                                          intro = "We help young students find their voice through joyful practice, expert coaching, and a supportive community. Confidence in speaking becomes confidence in life.",
                                          vision = {
                                              title: "Vision",
                                              text:
                                                  "A community where every child speaks with clarity, courage, and kindness — in the classroom, on stage, and throughout life.",
                                              highlights: ["Confidence for life", "Belonging & empathy", "Leadership mindset"],
                                          },
                                          mission = {
                                              title: "Mission",
                                              text:
                                                  "To deliver accessible, high-impact speech programs that turn fear into growth. We focus on active practice, specific coaching, and celebration of progress.",
                                              highlights: ["Active practice", "Specific feedback", "Real showcases"],
                                          },
                                          pillars = [
                                              { icon: "🎤", title: "Confidence", text: "Comfort on stage, clear voice, steady breathing." },
                                              { icon: "🤝", title: "Communication", text: "Structure, storytelling, and audience connection." },
                                              { icon: "🦁", title: "Courage", text: "Try, iterate, and speak up — without fear of mistakes." },
                                          ],
                                          stats = [
                                              { value: "4 Weeks", label: "Core Program" },
                                              { value: "3 Pillars", label: "Confidence • Communication • Courage" },
                                              { value: "100%", label: "Students Present a Final Talk" },
                                          ],
                                          sideImage = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop",
                                      }) {
    return (
        <section className={s.section} id="vision-mission">
            <div className="container">
                <div className={s.wrap}>
                    {/* Left: copy */}
                    <div className={s.left}>
                        <p className={s.eyebrow}>{eyebrow}</p>
                        <h2 className={s.title}>{title}</h2>
                        <p className={s.lead}>{intro}</p>

                        <div className={s.cards}>
                            <article className={s.card}>
                                <header className={s.cardHead}>
                                    <span className={s.tag}>Vision</span>
                                    <h3>{vision.title}</h3>
                                </header>
                                <p className={s.cardBody}>{vision.text}</p>
                                <ul className={s.list}>
                                    {vision.highlights.map((h, i) => (
                                        <li key={i}>• {h}</li>
                                    ))}
                                </ul>
                            </article>

                            <article className={s.card}>
                                <header className={s.cardHead}>
                                    <span className={`${s.tag} ${s.tagAlt}`}>Mission</span>
                                    <h3>{mission.title}</h3>
                                </header>
                                <p className={s.cardBody}>{mission.text}</p>
                                <ul className={s.list}>
                                    {mission.highlights.map((h, i) => (
                                        <li key={i}>• {h}</li>
                                    ))}
                                </ul>
                            </article>
                        </div>

                        <div className={s.pillars}>
                            {pillars.map((p, i) => (
                                <div className={s.pillar} key={i}>
                                    <div className={s.pIcon} aria-hidden="true">{p.icon}</div>
                                    <div className={s.pContent}>
                                        <h4 className={s.pTitle}>{p.title}</h4>
                                        <p className={s.pText}>{p.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={s.stats}>
                            {stats.map((st, i) => (
                                <div className={s.stat} key={i}>
                                    <div className={s.statValue}>{st.value}</div>
                                    <div className={s.statLabel}>{st.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: image */}
                    <div className={s.right}>
                        <div className={s.frame}>
                            <img src={sideImage} alt="Students practicing public speaking" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
