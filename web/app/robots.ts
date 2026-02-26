import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/creators", "/manifesto"],
        disallow: ["/api/", "/my/", "/register/"],
      },
    ],
    sitemap: "https://tipz.cash/sitemap.xml",
  }
}
