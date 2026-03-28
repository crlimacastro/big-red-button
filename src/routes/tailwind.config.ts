import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,ts,js,svelte}"],
  theme: {
    extend: {
      colors: {
        dark: "rgba(var(--color-dark), <alpha-value>)",
        light: "rgba(var(--color-light), <alpha-value>)",
        primary: "rgba(var(--color-primary), <alpha-value>)",
        secondary: "rgba(var(--color-secondary), <alpha-value>)",
        tertiary: "rgba(var(--color-tertiary), <alpha-value>)",
        bg: "rgba(var(--color-bg), <alpha-value>)",
        text: "rgba(var(--color-text), <alpha-value>)",
      },
    },
  },
} satisfies Config;
