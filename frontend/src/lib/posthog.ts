import posthog from "posthog-js";

export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? "";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "";

export function initPostHog() {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    persistence: "localStorage+cookie",
    // Session replay
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
    loaded: (ph) => {
      ph.register({ app: "fpv-compass" });
    },
  });
}

export default posthog;
