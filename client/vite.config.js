
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configure the React development server
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Forward API requests to the Express server
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      // Forward image requests to the Express server
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
