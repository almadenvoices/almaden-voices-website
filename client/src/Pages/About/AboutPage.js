import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import SubNav from "../../components/SubNav/SubNav";
import usePageMeta from "../../hooks/usePageMeta";
import { ourWork, featuredWork } from "../../data/ourWork";
import p from "../../styles/page.module.css";
import s from "./About.module.css";

// Turn on once there's press coverage to list. Also un-hide "press" in
// data/siteNav.js. Each item: { outlet, title, date, href }.
const SHOW_PRESS = false;
const PRESS = [];

const founder = {
    name: "Anjika Bansal",
    role: "Founder and CEO",
    photo: "/images/anjika-bansal.png",
    bio: [
        "Hi! I'm Anjika Bansal, founder of Almaden Voices. I want to help students grow into confident speakers.",
        "I've spent over 1,500 hours in public speaking through Leland Speech and Debate, ranked #1 in California and #5 in the nation. Across 32 tournaments I've reached elimination rounds at four nationally competitive ones, including Stanford, where I earned a bid to the Tournament of Champions, and I've been recognized with NSDA's Special Distinction Award.",
        "But none of that matters as much as the smile on a student's face when they give their very first speech.",
        "Growing up, I was lucky to feel confident speaking in front of others. I started Almaden Voices so every student could build that same confidence, discover their voice, and feel proud to use it.",
    ],
};

const boardMembers = [
    {
        name: "Amit Bansal",
        role: "Board director",
        intro: "Amit is a Staff Engineer at PayPal specializing in identity and access management. With nearly two decades of experience at companies like eBay, Oracle, and Cisco, he is passionate about crafting exceptional user experiences and frontend architecture. His belief in building confidence in young people through communication skills inspired him to join Almaden Voices.",
        photo: "/images/amit-bansal.png",
    },
    {
        name: "Aditi Bansal",
        role: "Board director",
        intro: "Aditi Bansal is an expert Web Developer and Engineering Leader based in New York. With a B.Tech in IT and a Master's in Business Management, she blends technical expertise with strategic oversight to deliver scalable, user-centric applications. She also volunteers at her local fire station and is passionate about giving back, which brought her to Almaden Voices.",
        photo: "/images/aditi-bansal.png",
    },
    {
        name: "Deepti Agrawal",
        role: "Board director",
        intro: "Deepti Agrawal is an entrepreneur and educator with more than 20 years leading technology and business initiatives across the U.S., India, and Singapore. Her move from a corporate career to a purpose-driven second chapter reflects her belief that leadership is about creating meaningful impact. Helping young people build confidence and recognize their potential is what brought her to Almaden Voices.",
        photo: "/images/deepti-agrawal.jpeg",
    },
];

// Volunteers, in the order their photos are numbered. Bios are their own
// words; only punctuation has been touched.
const volunteers = [
    {
        name: "Tara Sundaralingam",
        role: "Chapter/Outreach Lead, Workshop Coordinator",
        intro: "Hi! I'm Tara, a junior at Leland High School, and I'm passionate about speaking, volunteering, and making a difference in my community. I joined Almaden Voices because I truly believe that the power of public speaking is something incredibly crucial for everyone to learn, and I want to help make it more accessible to students everywhere. I'm especially looking forward to holding workshops and creating more national chapters. A fun fact about me: I love trying new food, and frequently try new restaurants!",
        photo: "/images/tara-s-volunteer-1.JPG",
    },
    {
        name: "Avika Chaudhary",
        role: "Global Outreach & Partnership Liaison, Newsletter Editor",
        intro: "Hey! I'm Avika, a junior at Leland High School who fell in love with debate in 8th grade and can't wait to help others do the same. I decided to join Almaden Voices because public speaking was my biggest struggle as a kid, and I would've loved a program that worked on building my confidence. I'm especially excited for the opportunity to lead some workshops and help kids develop their speaking voice. Fun fact: I've jumped off a boat before!",
        photo: "/images/avika-chaudhary-volunteer-2.JPG",
    },
    {
        name: "Saesha Pal",
        role: "Funding Volunteer & District Outreach Volunteer",
        intro: "Hi! My name is Saesha, and I'm a junior at Leland High School. I joined Almaden Voices because I love public speaking and working with other students. I'm really looking forward to connecting with my community and being more involved! Fun fact: I love crocheting gifts for other people!",
        photo: "/images/saesha-pal-volunteer-3.png",
    },
    {
        name: "Tina Kaul",
        role: "Fundraising & Outreach Lead",
        intro: "Hi! I'm Tina, a junior at Leland High School who loves to dance, bake, spend time with friends, and make meaningful impacts in the community. I joined Almaden Voices because I want to help make an impact all over the world through making public speaking classes more accessible. Additionally, I joined to be part of a positive community which I can learn from and collaborate with. I'm looking forward to organizing fundraisers and producing outreach posts to expand this nonprofit even further. Fun fact: I love to cook/bake, but I've literally burnt kraft mac n cheese before.",
        photo: "/images/tina-kaul-volunteer-5.png",
    },
    {
        name: "Diana Mistry",
        role: "Grant Researcher & Social Media Manager",
        intro: "Hello! I'm Diana, a junior at Leland High School who enjoys research, problem-solving, and debate. I joined Almaden Voices because I wanted to help students in my community find their voice and be more confident in who they are. I'm looking forward to raising money for the organization and helping create our first social media pages! Fun fact about me: I've hung sideways off of the fourth tallest building in Chicago!",
        photo: "/images/diana-mistry-volunteer-4.jpg",
    },
    {
        name: "Laya Arun",
        role: "Chapter Lead & Social Media Manager",
        intro: "Hi! I'm Laya, a junior at Leland High School. I'm on the Speech and Debate team at Leland, and I wanted to volunteer with Almaden Voices to help spread the skill of public speaking to kids who are just starting out. I'm excited to help kids build the confidence to speak up and find their own voice. Fun fact: I can say the alphabet backwards!",
        photo: "/images/laya-arun-volunteer-6.jpeg",
    },
    {
        name: "Samanvitha Sundaram",
        role: "New Jersey Chapter Lead & Workshops Manager",
        intro: "Hi, my name is Samanvitha and I am an 8th grader at Pond Road Middle School in NJ who loves singing, art, writing, and public speaking. I joined Almaden Voices because I want to be able to help kids who are afraid of speaking up find their voice. I'm definitely looking forward to teaching students and helping to run workshops and sessions. Fun fact: I am bilingual (working on being trilingual!)",
        photo: "/images/samanvitha-sundaram-volunteer-9.jpg?v=2",
    },
];

// "Deepti Agrawal" -> "DA". Used when someone has no photo yet.
const initialsOf = (name) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function Portrait({ person, className, missing, onMissing }) {
    if (!person.photo || missing) {
        return (
            <div className={`${className} ${s.initials}`} role="img" aria-label={person.name}>
                {initialsOf(person.name)}
            </div>
        );
    }
    return (
        <img
            src={person.photo}
            alt={`Portrait of ${person.name}`}
            className={className}
            loading="lazy"
            onError={onMissing}
        />
    );
}

function WorkItem({ item, flip }) {
    const photos = item.photos || [];
    const meta = (
        <p className={s.workMeta}>
            {item.date} · {item.place}
        </p>
    );

    // A set of photos gets a full-width row; one photo sits beside the text.
    if (photos.length > 1) {
        return (
            <article className={s.work}>
                <div className={s.workText}>
                    {meta}
                    <h3 className={p.h3}>{item.title}</h3>
                    <p className={s.workBody}>{item.body}</p>
                </div>
                <div className={s.gallery}>
                    {photos.map((photo) => (
                        <figure key={photo.src} className={s.photoBox}>
                            <div className={s.photoFrame}>
                                <img src={photo.src} alt={photo.alt} loading="lazy" />
                            </div>
                            {photo.caption && <figcaption className={p.caption}>{photo.caption}</figcaption>}
                        </figure>
                    ))}
                </div>
            </article>
        );
    }

    return (
        <article className={`${s.work} ${p.split} ${p.center} ${flip ? p.photoRight : ""}`}>
            {photos[0] ? (
                <figure className={s.photoBox}>
                    <div className={s.photoFrame}>
                        <img src={photos[0].src} alt={photos[0].alt} loading="lazy" />
                    </div>
                    {photos[0].caption && <figcaption className={p.caption}>{photos[0].caption}</figcaption>}
                </figure>
            ) : null}
            <div className={s.workText}>
                {meta}
                <h3 className={p.h3}>{item.title}</h3>
                <p className={s.workBody}>{item.body}</p>
            </div>
        </article>
    );
}

export default function AboutPage() {
    usePageMeta(
        "About",
        "How Almaden Voices started, where we've taught, and the students and board who run it. A San José 501(c)(3) teaching kids and teens public speaking for free."
    );
    const [missing, setMissing] = useState({});
    const markMissing = (name) => () => setMissing((prev) => ({ ...prev, [name]: true }));

    return (
        <>
            <PageHeader
                title="About us"
                intro="A nonprofit in San José, started by a high school debater, that teaches kids and teens to speak in front of an audience."
            />
            <SubNav pageKey="about" />

            {/* ---------- Our story: photo left, prose right ---------- */}
            <section id="our-story" className={p.section} aria-labelledby="our-story-title">
                <div className={`${p.inner} ${p.split} ${p.photoWide}`}>
                    <figure className={p.figure}>
                        <img
                            src="/images/s7-me-presenting.jpg"
                            alt="Anjika presents a slide at the front of a library community room while about twenty kids sit on the carpet listening."
                            width="1800"
                            height="959"
                            loading="lazy"
                        />
                        <figcaption className={p.caption}>
                            Anjika opening our April 2026 workshop at the Almaden library.
                        </figcaption>
                    </figure>
                    <div className={p.prose}>
                        <h2 id="our-story-title" className={p.h2}>Our story</h2>
                        <p>
                            Almaden Voices is a registered 501(c)(3) nonprofit in San José (EIN
                            39-4978818). We teach public speaking and debate to kids from kindergarten
                            through 9th grade, and our workshops are free.
                        </p>
                        <p>
                            Anjika Bansal started it in April 2025 with one eight-week class for
                            beginners in Almaden Valley. She'd spent years on the Leland Speech and
                            Debate team and wanted younger kids to have the same chance to get
                            comfortable in front of a room.
                        </p>
                        <p>
                            Through outreach, class sizes tripled. By summer 2026 we were teaching 52
                            students at two camp sessions at the Mexican Heritage Plaza in East San
                            José. We've also run workshops at the Almaden library, taught students
                            online in Canada, India and Singapore, and coached a university graduate in
                            Kenya for her first interview.
                        </p>
                        <p>
                            Volunteers and donations keep it running. Families and neighbors have given
                            $1,710 so far, and the fees from one-on-one coaching go back into the
                            workshops.
                        </p>
                        <p>
                            Now we're starting chapters, so students at other schools and in other
                            towns can run workshops of their own.{" "}
                            <Link to="/get-involved#start-a-chapter" className={p.textLink}>
                                Start a chapter
                            </Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* ---------- Where we've worked ---------- */}
            <section id="where-weve-worked" className={`${p.section} ${p.wash}`} aria-labelledby="work-title">
                <div className={p.inner}>
                    <h2 id="work-title" className={p.h2}>Where we've worked</h2>
                    <p className={p.lede}>
                        From a summer camp in East San José to students in five countries.
                    </p>

                    {/* The lead story, set in type until there's a photo. */}
                    <article className={s.feature}>
                        <div className={s.featureText}>
                            <p className={s.workMeta}>{featuredWork.kicker}</p>
                            <h3 className={s.featureTitle}>{featuredWork.title}</h3>
                            <p className={s.featureBody}>{featuredWork.body}</p>
                            <dl className={s.featureStats}>
                                {featuredWork.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <dt>{stat.label}</dt>
                                        <dd>{stat.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                        {featuredWork.photo ? (
                            <img src={featuredWork.photo} alt={featuredWork.photoAlt} className={s.featurePhoto} />
                        ) : (
                            <p className={s.featureNumber}>
                                <span>{featuredWork.bigNumber}</span>
                                {featuredWork.bigNumberLabel}
                            </p>
                        )}
                    </article>

                    <div className={s.workList}>
                        {ourWork.map((item, i) => (
                            <WorkItem key={item.id} item={item} flip={i % 2 === 1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- Our team ---------- */}
            <section id="our-team" className={p.section} aria-labelledby="team-title">
                <div className={p.inner}>
                    <h2 id="team-title" className={p.h2}>Our team</h2>

                    <div className={`${p.split} ${s.founder}`}>
                        <Portrait
                            person={founder}
                            className={s.founderPhoto}
                            missing={missing[founder.name]}
                            onMissing={markMissing(founder.name)}
                        />
                        <div className={p.prose}>
                            <h3 className={s.personName}>{founder.name}</h3>
                            <p className={s.personRole}>{founder.role}</p>
                            {founder.bio.map((para) => (
                                <p key={para.slice(0, 20)}>{para}</p>
                            ))}
                        </div>
                    </div>

                    <h3 id="board" className={s.groupTitle}>Board of directors</h3>
                    <div className={s.board}>
                        {boardMembers.map((m) => (
                            <article key={m.name} className={s.boardMember}>
                                <Portrait
                                    person={m}
                                    className={s.boardPhoto}
                                    missing={missing[m.name]}
                                    onMissing={markMissing(m.name)}
                                />
                                <div>
                                    <h4 className={s.personName}>{m.name}</h4>
                                    <p className={s.personRole}>{m.role}</p>
                                    <p className={s.bio}>{m.intro}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <h3 id="volunteers" className={s.groupTitle}>Student volunteers</h3>
                    <div className={s.volunteers}>
                        {volunteers.map((v) => (
                            <article key={v.name} className={s.volunteer}>
                                <Portrait
                                    person={v}
                                    className={s.volunteerPhoto}
                                    missing={missing[v.name]}
                                    onMissing={markMissing(v.name)}
                                />
                                <h4 className={s.volunteerName}>{v.name}</h4>
                                <p className={s.personRole}>{v.role}</p>
                                <p className={s.bio}>{v.intro}</p>
                            </article>
                        ))}
                    </div>
                    <p className={s.joinLine}>
                        Want to be on this page?{" "}
                        <Link to="/get-involved#volunteer" className={p.textLink}>See our volunteer roles</Link>
                    </p>
                </div>
            </section>

            {/* ---------- Press: hidden until there's coverage ---------- */}
            {SHOW_PRESS && PRESS.length > 0 && (
                <section id="press" className={`${p.section} ${p.ruled}`} aria-labelledby="press-title">
                    <div className={p.narrow}>
                        <h2 id="press-title" className={p.h2Small}>Press</h2>
                        <ul className={s.pressList}>
                            {PRESS.map((item) => (
                                <li key={item.href}>
                                    <a href={item.href} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                    <span className={p.small}> {item.outlet}, {item.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </>
    );
}
