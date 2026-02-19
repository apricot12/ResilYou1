const site_url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const site = {
  name: "ResilYou",
  description: "A modern SaaS platform built with Next.js, Drizzle, and Better Auth",
  url: site_url,
  ogImage: `${site_url}/og.jpg`,
  logo: "/logo.svg",
  mailSupport: "hello@resilyou.com", // Support email address
  mailFrom: process.env.MAIL_FROM || "noreply@resilyou.com", // Transactional email address
  links: {
    twitter: "https://twitter.com/resilyou",
    github: "https://github.com/resilyou",
    linkedin: "https://www.linkedin.com/company/resilyou/",
  }
} as const;