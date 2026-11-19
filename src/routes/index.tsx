import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blank Canvas" },
      {
        name: "description",
        content: "A blank canvas — a clean, empty page ready to be shaped.",
      },
      { property: "og:title", content: "Blank Canvas" },
      {
        property: "og:description",
        content: "A blank canvas — a clean, empty page ready to be shaped.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen w-full bg-background">
      {/* A truly empty canvas — just the styled background.
          Start building here. */}
    </main>
  );
}
