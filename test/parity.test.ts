import { existsSync } from "node:fs";

import { createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import type * as Parity from "../../jamwidgets-core/test/parity.js";
import {
  createAnnouncements,
  createComments,
  createFeedback,
  createForm,
  createPoll,
  createReactions,
  createSubscribe,
  createViews,
  createWaitlist,
} from "../src/index.js";

// The shared fixture lives in the monorepo. Standalone package mirrors
// don't have it, so they skip these suites.
const fixture = new URL("../../jamwidgets-core/test/parity.ts", import.meta.url);
const parity: typeof Parity | null = existsSync(fixture)
  ? await import(/* @vite-ignore */ fixture.pathname)
  : null;
const { CONFIG, expectRequest, PAGE, POLL, SERVER_ERROR, settle, stubApi, WIDGET_CASES } =
  parity ?? ({ WIDGET_CASES: [] } as unknown as typeof Parity);
type Widget = Parity.Widget;

interface Primitive {
  status: () => string;
  error: () => Error | null;
}

// Each widget's primitive, and the action a visitor takes (none for widgets that load on mount).
const SOLID: Record<Widget, { create: () => Primitive & Record<string, any>; act?: (p: any) => Promise<unknown> }> = {
  subscribe: { create: () => createSubscribe(CONFIG), act: (p) => p.subscribe("a@example.com") },
  form: { create: () => createForm({ ...CONFIG, formSlug: "contact" }), act: (p) => p.submit({ message: "Hi" }) },
  waitlist: { create: () => createWaitlist(CONFIG), act: (p) => p.join("a@example.com") },
  feedback: { create: () => createFeedback(CONFIG), act: (p) => p.submit("bug", "Broken") },
  comments: { create: () => createComments({ ...CONFIG, contentId: PAGE }) },
  reactions: { create: () => createReactions({ ...CONFIG, contentId: PAGE }) },
  views: { create: () => createViews({ ...CONFIG, pageId: PAGE }) },
  poll: { create: () => createPoll({ ...CONFIG, slug: POLL.slug }) },
  announcements: { create: () => createAnnouncements(CONFIG) },
};

const disposers: Array<() => void> = [];

async function mount(widget: Widget) {
  const primitive = createRoot((dispose) => {
    disposers.push(dispose);
    return SOLID[widget].create();
  });
  await SOLID[widget].act?.(primitive).catch(() => {});
  await settle(() => primitive.status() === "success" || primitive.status() === "error");
  return primitive;
}

afterEach(() => {
  for (const dispose of disposers.splice(0)) dispose();
  vi.unstubAllGlobals();
});

describe.skipIf(!parity)("Solid widget parity", () => {
  for (const testCase of WIDGET_CASES) {
    it(`${testCase.widget}: happy path`, async () => {
      const fetch = stubApi(testCase, true);
      const primitive = await mount(testCase.widget);
      expect(primitive.status()).toBe("success");
      expect(primitive.error()).toBeNull();
      expectRequest(fetch, testCase);
    });

    it(`${testCase.widget}: error path shows the server's message`, async () => {
      const fetch = stubApi(testCase, false);
      const primitive = await mount(testCase.widget);
      expect(primitive.status()).toBe("error");
      expect(primitive.error()?.message).toBe(SERVER_ERROR);
      expectRequest(fetch, testCase);
    });
  }
});
