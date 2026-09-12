import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HoneyChain — Blockchain Honey Traceability",
    short_name: "HoneyChain",
    description:
      "Scan a honey jar's QR code to see its full journey from hive to shop.",
    start_url: "/",
    display: "standalone",
    background_color: "#E4E4E4",
    theme_color: "#111111",
    icons: [
      {
        src: "/icon.png",
        sizes: "740x740",
        type: "image/png",
      },
    ],
  };
}
