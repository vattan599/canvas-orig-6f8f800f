import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";

const DESK_IMG =
  "https://vibe.filesafe.space/1795068409232920594/assets/ef00cd7f-426a-4acd-a040-c61f5b9e9248.png";
const HANDS_IMG =
  "https://vibe.filesafe.space/1795068409232920594/assets/33a6ce00-055a-49a7-b802-0b00cd674879.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Folio — A Quieter Place to Write" },
      {
        name: "description",
        content:
          "Folio is a calm, focused writing studio for essays, notes, and ideas. No noise, no clutter — just you and the page.",
      },
      { property: "og:title", content: "Folio — A Quieter Place to Write" },
      {
        property: "og:description",
        content:
          "Folio is a calm, focused writing studio for essays, notes, and ideas. No noise, no clutter — just you and the page.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: DESK_IMG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DESK_IMG },
    ],
  }),
  component: Index,
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background font-body text-foreground">
      {/* ── Nav ───────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2">
            <span className="font-display text-2xl leading-none tracking-tight">Folio</span>
            <span className="h-1.5 w-1.5 rounded-full bg-rust" />
          </a>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#manifesto" className="transition-colors hover:text-foreground">
              Manifesto
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Practice
            </a>
            <a href="#voices" className="transition-colors hover:text-foreground">
              Voices
            </a>
          </div>
          <a
            href="#begin"
            className="rounded-full border border-foreground/20 px-5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
          >
            Start writing
          </a>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <section
        id="top"
        ref={heroRef}
        className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-16 pt-32"
      >
        <motion.div
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 -z-10"
        >
          <img
            src={DESK_IMG}
            alt="A sunlit writing desk with an open notebook and fountain pen"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-6xl"
        >
          <motion.p
            variants={fadeUp}
            className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            <span className="h-px w-10 bg-rust" />A quieter place to write
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="max-w-4xl font-display text-[clamp(3.5rem,11vw,9rem)] font-normal leading-[0.92] tracking-tight"
          >
            Write less,
            <br />
            <span className="italic text-rust">mean more.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            Folio is a calm writing studio for essays, notes, and the slow shaping of ideas. No
            feeds, no metrics, no noise — just you and the page.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#begin"
              className="group inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Begin a draft
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#manifesto"
              className="text-sm font-medium text-foreground underline decoration-rust decoration-2 underline-offset-4 transition-opacity hover:opacity-70"
            >
              Read the manifesto
            </a>
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-6 right-6 hidden text-xs uppercase tracking-[0.3em] text-muted-foreground lg:block">
          Scroll ↓
        </div>
      </section>

      {/* ── Manifesto ─────────────────────────────────── */}
      <section id="manifesto" className="border-t border-border/60 px-6 py-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12"
        >
          <motion.div variants={fadeUp} className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-rust">01 — Manifesto</p>
            <h2 className="mt-6 font-display text-5xl leading-tight md:text-6xl">
              We make space for the long thought.
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="md:col-span-6 md:col-start-7">
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                Most writing tools reward speed and volume — the quick post, the half-formed reply,
                the endless scroll of other people's certainty. Folio turns the other way.
              </p>
              <p>
                It is a single, quiet room for your own ideas to find their shape. A page that
                waits. A cursor that doesn't nudge. A library that belongs to you, not to an
                algorithm.
              </p>
              <p className="font-display text-2xl italic text-foreground">
                "The first draft of anything is just you, finding out what you actually think."
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Practice / Features ────────────────────────── */}
      <section id="features" className="border-t border-border/60 px-6 py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-rust">02 — The practice</p>
          <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight md:text-6xl">
            Three small habits, kept gently.
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto mt-16 grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3"
        >
          {[
            {
              n: "i.",
              title: "A page that waits",
              body: "Open Folio and you are met with one thing: the line you were last writing. No inbox, no badges, no one else's work asking for your attention.",
            },
            {
              n: "ii.",
              title: "Drafts, not posts",
              body: "Everything begins as a draft and stays one until you say otherwise. Publish to a quiet corner of the web, or keep it between you and the page — forever.",
            },
            {
              n: "iii.",
              title: "A library you own",
              body: "Your writing lives in plain text, exportable in a breath. No lock-in, no extraction, no model training on the things you chose to keep private.",
            },
          ].map((f) => (
            <motion.div
              key={f.n}
              variants={fadeUp}
              className="flex flex-col gap-5 bg-background p-10 transition-colors hover:bg-card"
            >
              <span className="font-display text-3xl italic text-rust">{f.n}</span>
              <h3 className="font-display text-2xl">{f.title}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Split showcase ─────────────────────────────── */}
      <section className="border-t border-border/60 px-6 py-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2"
        >
          <motion.div
            variants={fadeUp}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl"
          >
            <img
              src={HANDS_IMG}
              alt="Hands writing with a fountain pen in a cloth-bound notebook"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <motion.div variants={fadeUp} className="md:pl-8">
            <p className="text-xs uppercase tracking-[0.3em] text-rust">03 — The room</p>
            <h2 className="mt-6 font-display text-5xl leading-tight md:text-6xl">
              Designed to disappear.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Folio's editor is a single column of warm paper and ink-black type. Typography tuned
              for long reading. Keyboard-first, so your hands never leave the page. Nothing flashes,
              nothing pings, nothing asks to be shared.
            </p>
            <ul className="mt-8 space-y-3 text-base text-foreground">
              {[
                "Focus mode that fades everything but the sentence",
                "Daily notes that build into a body of work",
                "Offline-first — write on the train, sync when you land",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Voices ────────────────────────────────────── */}
      <section
        id="voices"
        className="border-t border-border/60 bg-foreground px-6 py-28 text-background"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-rust">
            04 — Voices
          </motion.p>
          <motion.blockquote
            variants={fadeUp}
            className="mt-8 font-display text-4xl leading-snug md:text-6xl"
          >
            "I came for a distraction-free editor. I stayed because, for the first time in years, my
            notes feel like they belong to me."
          </motion.blockquote>
          <motion.p
            variants={fadeUp}
            className="mt-8 text-sm uppercase tracking-[0.2em] text-background/60"
          >
            Mara Okafor — essayist & Folio writer since 2024
          </motion.p>
        </motion.div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section id="begin" className="border-t border-border/60 px-6 py-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-rust">
            05 — Begin
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-6 font-display text-6xl leading-[0.95] md:text-8xl"
          >
            The page is
            <br />
            <span className="italic">already open.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            Start your first draft in under a minute. Free forever for one notebook — no card, no
            trial clock ticking down.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#top"
              className="group inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-base font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Open a new page
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <span className="text-sm text-muted-foreground">No sign-up to look around.</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-border/60 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-foreground">Folio</span>
            <span className="h-1.5 w-1.5 rounded-full bg-rust" />
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#manifesto" className="transition-colors hover:text-foreground">
              Manifesto
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Practice
            </a>
            <a href="#voices" className="transition-colors hover:text-foreground">
              Voices
            </a>
            <a href="#begin" className="transition-colors hover:text-foreground">
              Begin
            </a>
          </div>
          <p className="font-display italic">Made for the long thought.</p>
        </div>
      </footer>
    </main>
  );
}
