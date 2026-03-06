import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/creators", "/manifesto", "/api/og/"],
        disallow: ["/api/", "/my/", "/register/"],
      },
    ],
    sitemap: "https://tipz.cash/sitemap.xml",
  }
}
