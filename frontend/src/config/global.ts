export const globalConfig = {
  site: {
    name: "Shahal's Portfolio",
    author: "MD Shahadat Hossain Shahal",
    description: "Portfolio of MD Shahadat Hossain Shahal — Research Assistant in Machine Learning & Astrophysics, Blockchain Developer, and Astrophotographer.",
    url: "https://shahadathshahal.vercel.app"
  },
  navigation: {
    aria: "Main Navigation",
    items: [
      {
        title: "Home",
        href: "/"
      },
      {
        title: "Projects",
        href: "/projects"
      },
      {
        title: "Gallery",
        href: "/gallery"
      },
      {
        title: "Posts",
        href: "/posts"
      },
      {
        title: "About",
        href: "/about"
      }
    ]
  },
  footer: {
    aria: "Footer Navigation",
    copyright: "© 2026 MD Shahadat Hossain Shahal. All rights reserved ",
    social: {
      twitter: "#",
      github: "https://github.com/shahal-dev",
      email: "shahadatw6@gmail.com"
    }
  }
} as const; 