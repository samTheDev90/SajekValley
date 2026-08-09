import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Sajek Valley – Trip Planner",
        short_name: "Sajek Trip",
        description: "Shared budget & itinerary planner for the Sajek Valley trip.",
        theme_color: "#1C3B2E",
        background_color: "#EAF1EC",
        display: "standalone",
        start_url: "/SajekValley/",
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,10 90,90 10,90' fill='%231C3B2E'/><polygon points='50,30 75,80 25,80' fill='%23EAF1EC'/></svg>",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,10 90,90 10,90' fill='%231C3B2E'/><polygon points='50,30 75,80 25,80' fill='%23EAF1EC'/></svg>",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"]
      }
    })
  ],
  base: "/SajekValley/",
});
