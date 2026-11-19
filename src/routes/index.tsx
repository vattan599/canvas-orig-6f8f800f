import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blank Canvas" },
      {
        name: "description",
        content: "A clean, empty starting canvas — ready for your next idea.",
      },
      { property: "og:title", content: "Blank Canvas" },
      {
        property: "og:description",
        content: "A clean, empty starting canvas — ready for your next idea.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlankCanvas,
});

function BlankCanvas() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-background font-body text-foreground" />
  );
}
