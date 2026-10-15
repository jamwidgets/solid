import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

// Solid's browser build, so effects run as they do in an app.
export default defineConfig({
  plugins: [solid()],
  resolve: { conditions: ["browser", "development"] },
  // The primitives need no DOM; the plugin would otherwise pick jsdom.
  test: { environment: "node" },
});
