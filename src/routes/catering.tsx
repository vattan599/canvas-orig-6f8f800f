import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import cateringCss from "../paratha/catering.css?url";
import { CAT_BODY, CAT_JSONLD, CONFIG, FONTS_HREF } from "../paratha/content.gen";
import { init as initCommon } from "../paratha/common";

const SITE = "https://parathaland.com";
const OG_IMAGE =
  "https://vibe.filesafe.space/1795068409232920594/assets/4d74c7ff-273e-4b5a-ab9e-40dc3b632cd2.jpg";
const TITLE = "Indian Catering & Food Truck in Langley, BC | Paratha Land";
const DESC =
  "Vegetarian Punjabi catering for birthdays, office lunches and family functions, plus the Paratha Land food truck for concerts, festivals, melas and corporate events. Request a quote.";

export const Route = createFileRoute("/catering")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "geo.region", content: "CA-BC" },
      { name: "geo.placename", content: "Langley" },
      { name: "theme-color", content: "#3d0a12" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Paratha Land" },
      { property: "og:title", content: "Paratha Land catering & food truck" },
      {
        property: "og:description",
        content:
          "Fresh parathas, curries and rice for your party, office or festival, delivered as catering or cooked on-site from our food truck.",
      },
      { property: "og:url", content: `${SITE}/catering` },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:locale", content: "en_CA" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/catering` },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONTS_HREF },
      { rel: "stylesheet", href: cateringCss },
    ],
    scripts: [{ type: "application/ld+json", children: CAT_JSONLD }],
  }),
  component: Catering,
});

function Catering() {
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

  return <div dangerouslySetInnerHTML={{ __html: CAT_BODY }} />;
}
