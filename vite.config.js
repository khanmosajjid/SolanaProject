import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const processBrowser = require.resolve("process/browser");
const bufferPolyfill = require.resolve("buffer");
const utilPolyfill = require.resolve("util");
const eventsPolyfill = require.resolve("events");
const streamPolyfill = require.resolve("stream-browserify");
const cryptoPolyfill = require.resolve("crypto-browserify");

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: [
      { find: /^process$/, replacement: processBrowser },
      { find: /^process\/$/, replacement: processBrowser },
      { find: /^node:process$/, replacement: processBrowser },

      { find: /^buffer$/, replacement: bufferPolyfill },
      { find: /^buffer\/$/, replacement: bufferPolyfill },
      { find: /^node:buffer$/, replacement: bufferPolyfill },

      { find: /^util$/, replacement: utilPolyfill },
      { find: /^util\/$/, replacement: utilPolyfill },
      { find: /^node:util$/, replacement: utilPolyfill },

      { find: /^events$/, replacement: eventsPolyfill },
      { find: /^events\/$/, replacement: eventsPolyfill },
      { find: /^node:events$/, replacement: eventsPolyfill },

      { find: /^stream$/, replacement: streamPolyfill },
      { find: /^node:stream$/, replacement: streamPolyfill },
      { find: /^crypto$/, replacement: cryptoPolyfill },
      { find: /^node:crypto$/, replacement: cryptoPolyfill },
    ],
  },

  define: {
    global: "globalThis",
  },

  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "util",
      "events",
      "stream-browserify",
      "crypto-browserify",
    ],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [],
    },
  },
});
