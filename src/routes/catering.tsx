import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import cateringCss from "../paratha/catering.css?url";
import { CAT_BODY, CAT_JSONLD, CONFIG, FONTS_HREF } from "../paratha/content.gen";
import { init as initCommon } from "../paratha/common";

const SITE = "https://parathaland.com";
const OG_IMAGE =
  "https://vibe.filesafe.space/1795068409232920594/assets/4d74c7ff-273e-4b5a-ab9e-40dc3b632cd2.jpg";
const TITLE = "Paratha Land | Fresh Paratha Delivery in Langley, BC — Catering & Food Truck";
const DESC =
  "Langley's paratha kitchen: fresh aloo, paneer, gobi & plain parathas with curd and pickle. Order online for pickup or delivery and earn rewards on every order.";

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
      {
        property: "og:title",
        content: "Paratha Land | Fresh Paratha Delivery in Langley, BC — Catering & Food Truck",
      },
      {
        property: "og:description",
        content:
          "Langley's paratha kitchen: fresh aloo, paneer, gobi & plain parathas with curd and pickle. Order online for pickup or delivery and earn rewards on every order.",
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
