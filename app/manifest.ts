import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Desawer Result",
    short_name: "Desawer Result",
    description: "Live Desawer results and date-wise market record charts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f1f1",
    theme_color: "#33cc99"
  };
}
