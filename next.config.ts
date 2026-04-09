import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? 'setsen-fr',
  project: process.env.SENTRY_PROJECT ?? 'javascript-nextjs',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  disableLogger: true,
  // Delete source maps from the build output after uploading to Sentry
  // so they are not publicly accessible in the deployed bundle.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  autoInstrumentServerFunctions: true,
  tunnelRoute: '/monitoring',
});
