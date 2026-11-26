import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import guideCss from "../paratha/guide.css?url";
import { CONFIG, FONTS_HREF, GUIDE_BODY, GUIDE_JSONLD } from "../paratha/content.gen";
import { init as initCommon } from "../paratha/common";

const SITE = "https://parathaland.com";
const URL = `${SITE}/best-paratha-langley`;
const TITLE = "Best Parathas in Langley, BC | Paratha Land — Fresh Paratha Delivery";
const DESC =
  "Langley's paratha kitchen: fresh aloo, paneer, gobi & plain parathas with curd and pickle. Order online for pickup or delivery and earn rewards on every order.";

export const Route = createFileRoute("/best-paratha-langley")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "geo.region", content: "CA-BC" },
      { name: "geo.placename", content: "Langley" },
      { name: "theme-color", content: "#3d0a12" },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "Paratha Land" },
      {
        property: "og:title",
        content: "Best Parathas in Langley, BC | Paratha Land — Fresh Paratha Delivery",
      },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:image", content: `${SITE}/brand/logo.jpg` },
      { property: "og:locale", content: "en_CA" },
      { property: "article:published_time", content: "2026-11-25" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONTS_HREF },
      { rel: "stylesheet", href: guideCss },
    ],
    scripts: [{ type: "application/ld+json", children: GUIDE_JSONLD }],
  }),
  component: Guide,
});

function Guide() {
  useEffect(() => {
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      (window as unknown as { PL: unknown }).PL = structuredClone(CONFIG);
      initCommon(ac.signal);
    }, 0);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: GUIDE_BODY }} />;
}
