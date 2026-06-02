/**
 * @jamwidgets/solid - SolidJS primitives for Jamwidgets
 *
 * @example Subscribe form
 * ```tsx
 * import { createSubscribe } from '@jamwidgets/solid';
 *
 * function Newsletter() {
 *   const { subscribe, status, error } = createSubscribe({
 *     siteKey: 'your-site-key',
 *   });
 *
 *   const handleSubmit = (e: SubmitEvent) => {
 *     e.preventDefault();
 *     const email = new FormData(e.currentTarget as HTMLFormElement).get('email') as string;
 *     subscribe(email);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="email" name="email" required />
 *       <button disabled={status() === 'loading'}>
 *         {status() === 'loading' ? 'Subscribing...' : 'Subscribe'}
 *       </button>
 *       {status() === 'success' && <p>Thanks for subscribing!</p>}
 *       {status() === 'error' && <p>Error: {error()?.message}</p>}
 *     </form>
 *   );
 * }
 * ```
 */

import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";
import {
  SubscribeController,
  FormController,
  ReactionsController,
  CommentsController,
  WaitlistController,
  ViewCountsController,
  FeedbackController,
  PollController,
  AnnouncementsController,
  resolveConfig,
  type JamWidgetsConfig,
  type SubscribeState,
  type FormState,
  type ReactionsState,
  type CommentsState,
  type WaitlistState,
  type ViewCountsState,
  type FeedbackState,
  type PollState,
  type AnnouncementsState,
  type Comment,
  type Announcement,
  type PollWithResults,
  type FeedbackType,
  type ControllerStatus,
} from "@jamwidgets/core";

// Re-export types from core
export type {
  JamWidgetsConfig,
  SubscribeState,
  FormState,
  ReactionsState,
  CommentsState,
  WaitlistState,
  ViewCountsState,
  FeedbackState,
  PollState,
  AnnouncementsState,
  Comment,
  Announcement,
  PollWithResults,
  FeedbackType,
  ReactionCounts,
  JamwidgetsPost,
  SeriphPost, // deprecated alias
  FetchPostsOptions,
  FetchPostOptions,
  ControllerStatus,
} from "@jamwidgets/core";

// Re-export API functions and helpers from core
export {
  fetchPosts,
  fetchPost,
  fetchSiteConfig,
  type SiteConfig,
  POWERED_BY_URL,
  POWERED_BY_LABEL,
  getConfigFromMeta,
  resolveConfig,
  DEFAULT_ENDPOINT,
  API_PATH,
} from "@jamwidgets/core";

// =============================================================================
// Config types - siteKey is optional when using meta tag fallback
// =============================================================================

type OptionalSiteKey<T extends JamWidgetsConfig> = Omit<T, "siteKey"> & {
  /** Site key - optional if <meta name="jamwidgets-site-key"> is set */
  siteKey?: string;
};

// ============================================================================
// createSubscribe
// ============================================================================

export interface CreateSubscribeOptions extends OptionalSiteKey<JamWidgetsConfig> {}

export interface CreateSubscribeReturn {
  status: Accessor<ControllerStatus>;
  message: Accessor<string | null>;
  error: Accessor<Error | null>;
  subscribe: (email: string) => Promise<void>;
  reset: () => void;
}

/**
 * Primitive for handling email subscriptions.
 *
 * @example
 * ```tsx
 * // With explicit siteKey:
 * const { subscribe, status } = createSubscribe({ siteKey: 'your-key' });
 *
 * // Or with meta tag (add to document head):
 * // <meta name="jamwidgets-site-key" content="your-key" />
 * const { subscribe, status } = createSubscribe({});
 * ```
 */
export function createSubscribe(options: CreateSubscribeOptions): CreateSubscribeReturn {
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [message, setMessage] = createSignal<string | null>(null);
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new SubscribeController(config);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: SubscribeState) => {
      setStatus(state.status);
      setMessage(state.message);
      setError(state.error);
    });

    onCleanup(unsubscribe);
  });

  const subscribe = async (email: string) => {
    await controller.submit(email);
  };

  const reset = () => {
    controller.reset();
  };

  return { status, message, error, subscribe, reset };
}

// ============================================================================
// createForm
// ============================================================================

export interface CreateFormOptions extends OptionalSiteKey<JamWidgetsConfig> {
  /** Form slug/identifier */
  formSlug: string;
}

export interface CreateFormReturn {
  status: Accessor<ControllerStatus>;
  message: Accessor<string | null>;
  error: Accessor<Error | null>;
  submit: (data: Record<string, unknown>) => Promise<void>;
  reset: () => void;
}

/**
 * Primitive for handling form submissions.
 *
 * @example
 * ```tsx
 * const { submit, status, error } = createForm({
 *   siteKey: 'your-site-key', // optional with meta tag
 *   formSlug: 'contact',
 * });
 *
 * const handleSubmit = (e: SubmitEvent) => {
 *   e.preventDefault();
 *   const formData = new FormData(e.currentTarget as HTMLFormElement);
 *   submit(Object.fromEntries(formData));
 * };
 * ```
 */
export function createForm(options: CreateFormOptions): CreateFormReturn {
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [message, setMessage] = createSignal<string | null>(null);
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new FormController(config, options.formSlug);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: FormState) => {
      setStatus(state.status);
      setMessage(state.message);
      setError(state.error);
    });

    onCleanup(unsubscribe);
  });

  const submit = async (data: Record<string, unknown>) => {
    await controller.submit(data);
  };

  const reset = () => {
    controller.reset();
  };

  return { status, message, error, submit, reset };
}

// ============================================================================
// createReactions
// ============================================================================

export interface CreateReactionsOptions extends OptionalSiteKey<JamWidgetsConfig> {
  /** Content identifier (e.g., post slug) */
  contentId: string;
  /** Auto-fetch reactions on mount (default: true) */
  autoFetch?: boolean;
}

export interface CreateReactionsReturn {
  counts: Accessor<Record<string, number>>;
  userReactions: Accessor<string[]>;
  status: Accessor<ControllerStatus>;
  error: Accessor<Error | null>;
  addReaction: (type: string) => Promise<void>;
  removeReaction: (type: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Primitive for handling reactions (likes, claps, etc.).
 *
 * @example
 * ```tsx
 * const { counts, userReactions, addReaction, removeReaction } = createReactions({
 *   contentId: 'my-post-slug',
 * });
 *
 * <button onClick={() => addReaction('like')}>
 *   Like ({counts().like || 0})
 * </button>
 * ```
 */
export function createReactions(options: CreateReactionsOptions): CreateReactionsReturn {
  const [counts, setCounts] = createSignal<Record<string, number>>({});
  const [userReactions, setUserReactions] = createSignal<string[]>([]);
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new ReactionsController(config, options.contentId);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: ReactionsState) => {
      setCounts(state.counts);
      setUserReactions(state.userReactions);
      setStatus(state.status);
      setError(state.error);
    });

    // Auto-fetch on mount (default: true)
    if (options.autoFetch !== false) {
      controller.fetch();
    }

    onCleanup(unsubscribe);
  });

  const addReaction = async (type: string) => {
    await controller.add(type);
  };

  const removeReaction = async (type: string) => {
    await controller.remove(type);
  };

  const refresh = async () => {
    await controller.fetch();
  };

  return { counts, userReactions, status, error, addReaction, removeReaction, refresh };
}

// ============================================================================
// createComments
// ============================================================================

export interface CreateCommentsOptions extends OptionalSiteKey<JamWidgetsConfig> {
  /** Content identifier (e.g., post slug) */
  contentId: string;
  /** Auto-fetch comments on mount (default: true) */
  autoFetch?: boolean;
}

export interface CreateCommentsReturn {
  comments: Accessor<Comment[]>;
  status: Accessor<ControllerStatus>;
  error: Accessor<Error | null>;
  postComment: (author: string, content: string, options?: { authorEmail?: string; parentId?: string }) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Primitive for handling comments.
 *
 * @example
 * ```tsx
 * const { comments, status, postComment } = createComments({
 *   contentId: 'my-post-slug',
 * });
 *
 * <For each={comments()}>
 *   {(comment) => (
 *     <div>
 *       <strong>{comment.authorName}</strong>: {comment.content}
 *     </div>
 *   )}
 * </For>
 *
 * <button onClick={() => postComment('Anonymous', 'Great post!')}>
 *   Add Comment
 * </button>
 * ```
 */
export function createComments(options: CreateCommentsOptions): CreateCommentsReturn {
  const [comments, setComments] = createSignal<Comment[]>([]);
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new CommentsController(config, options.contentId);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: CommentsState) => {
      setComments(state.comments);
      setStatus(state.status);
      setError(state.error);
    });

    // Auto-fetch on mount (default: true)
    if (options.autoFetch !== false) {
      controller.fetch();
    }

    onCleanup(unsubscribe);
  });

  const postComment = async (author: string, content: string, options?: { authorEmail?: string; parentId?: string }) => {
    await controller.post(author, content, options);
  };

  const refresh = async () => {
    await controller.fetch();
  };

  return { comments, status, error, postComment, refresh };
}

// ============================================================================
// createWaitlist
// ============================================================================

export interface CreateWaitlistOptions extends OptionalSiteKey<JamWidgetsConfig> {}

export interface CreateWaitlistReturn {
  status: Accessor<ControllerStatus>;
  message: Accessor<string | null>;
  position: Accessor<number | null>;
  error: Accessor<Error | null>;
  join: (email: string, options?: { name?: string; source?: string }) => Promise<void>;
  reset: () => void;
}

/**
 * Primitive for handling waitlist signups.
 *
 * @example
 * ```tsx
 * const { join, status, position } = createWaitlist({});
 *
 * <button onClick={() => join('user@example.com')}>Join Waitlist</button>
 * {status() === 'success' && <p>You're #{position()} on the list!</p>}
 * ```
 */
export function createWaitlist(options: CreateWaitlistOptions): CreateWaitlistReturn {
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [message, setMessage] = createSignal<string | null>(null);
  const [position, setPosition] = createSignal<number | null>(null);
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new WaitlistController(config);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: WaitlistState) => {
      setStatus(state.status);
      setMessage(state.message);
      setPosition(state.position);
      setError(state.error);
    });

    onCleanup(unsubscribe);
  });

  const join = async (email: string, opts?: { name?: string; source?: string }) => {
    await controller.join(email, opts);
  };

  const reset = () => {
    controller.reset();
  };

  return { status, message, position, error, join, reset };
}

// ============================================================================
// createViews
// ============================================================================

export interface CreateViewsOptions extends OptionalSiteKey<JamWidgetsConfig> {
  /** Page identifier (e.g., slug or URL path) */
  pageId: string;
  /** Auto-record view on mount (default: true) */
  autoRecord?: boolean;
}

export interface CreateViewsReturn {
  views: Accessor<number>;
  uniqueVisitors: Accessor<number>;
  status: Accessor<ControllerStatus>;
  error: Accessor<Error | null>;
  record: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Primitive for tracking and displaying page views.
 *
 * @example
 * ```tsx
 * const { views, uniqueVisitors } = createViews({
 *   pageId: '/blog/my-post',
 * });
 *
 * <span>{views()} views ({uniqueVisitors()} unique)</span>
 * ```
 */
export function createViews(options: CreateViewsOptions): CreateViewsReturn {
  const [views, setViews] = createSignal(0);
  const [uniqueVisitors, setUniqueVisitors] = createSignal(0);
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new ViewCountsController(config, options.pageId);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: ViewCountsState) => {
      setViews(state.views);
      setUniqueVisitors(state.uniqueVisitors);
      setStatus(state.status);
      setError(state.error);
    });

    // Auto-record view on mount (default: true)
    if (options.autoRecord !== false) {
      controller.record();
    }

    onCleanup(unsubscribe);
  });

  const record = async () => {
    await controller.record();
  };

  const refresh = async () => {
    await controller.fetch();
  };

  return { views, uniqueVisitors, status, error, record, refresh };
}

// ============================================================================
// createFeedback
// ============================================================================

export interface CreateFeedbackOptions extends OptionalSiteKey<JamWidgetsConfig> {}

export interface CreateFeedbackReturn {
  status: Accessor<ControllerStatus>;
  message: Accessor<string | null>;
  error: Accessor<Error | null>;
  submit: (type: FeedbackType, content: string, options?: { email?: string; pageUrl?: string }) => Promise<void>;
  reset: () => void;
}

/**
 * Primitive for handling feedback submissions.
 *
 * @example
 * ```tsx
 * const { submit, status } = createFeedback({});
 *
 * <button onClick={() => submit('feature', 'Add dark mode!')}>
 *   Submit Feedback
 * </button>
 * ```
 */
export function createFeedback(options: CreateFeedbackOptions): CreateFeedbackReturn {
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [message, setMessage] = createSignal<string | null>(null);
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new FeedbackController(config);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: FeedbackState) => {
      setStatus(state.status);
      setMessage(state.message);
      setError(state.error);
    });

    onCleanup(unsubscribe);
  });

  const submit = async (type: FeedbackType, content: string, opts?: { email?: string; pageUrl?: string }) => {
    await controller.submit(type, content, opts);
  };

  const reset = () => {
    controller.reset();
  };

  return { status, message, error, submit, reset };
}

// ============================================================================
// createPoll
// ============================================================================

export interface CreatePollOptions extends OptionalSiteKey<JamWidgetsConfig> {
  /** Poll slug */
  slug: string;
  /** Auto-fetch poll on mount (default: true) */
  autoFetch?: boolean;
}

export interface CreatePollReturn {
  poll: Accessor<PollWithResults | null>;
  status: Accessor<ControllerStatus>;
  error: Accessor<Error | null>;
  vote: (selectedOptions: string[]) => Promise<void>;
  hasVoted: Accessor<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Primitive for displaying and voting on polls.
 *
 * @example
 * ```tsx
 * // With meta tag: <meta name="jamwidgets-site-key" content="your-key" />
 * const { poll, vote, hasVoted } = createPoll({ slug: 'favorite-framework' });
 *
 * <Show when={poll()}>
 *   {(p) => (
 *     <div>
 *       <h3>{p().question}</h3>
 *       <For each={p().options}>
 *         {(opt) => (
 *           <button onClick={() => vote([opt.id])} disabled={hasVoted()}>
 *             {opt.text} ({p().results[opt.id] || 0} votes)
 *           </button>
 *         )}
 *       </For>
 *     </div>
 *   )}
 * </Show>
 * ```
 */
export function createPoll(options: CreatePollOptions): CreatePollReturn {
  const [poll, setPoll] = createSignal<PollWithResults | null>(null);
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new PollController(config, options.slug);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: PollState) => {
      setPoll(state.poll);
      setStatus(state.status);
      setError(state.error);
    });

    // Auto-fetch on mount (default: true)
    if (options.autoFetch !== false) {
      controller.fetch();
    }

    onCleanup(unsubscribe);
  });

  const vote = async (selectedOptions: string[]) => {
    await controller.vote(selectedOptions);
  };

  const refresh = async () => {
    await controller.fetch();
  };

  const hasVoted = () => controller.hasVoted();

  return { poll, status, error, vote, hasVoted, refresh };
}

// ============================================================================
// createAnnouncements
// ============================================================================

export interface CreateAnnouncementsOptions extends OptionalSiteKey<JamWidgetsConfig> {
  /** Auto-fetch announcements on mount (default: true) */
  autoFetch?: boolean;
}

export interface CreateAnnouncementsReturn {
  announcements: Accessor<Announcement[]>;
  status: Accessor<ControllerStatus>;
  error: Accessor<Error | null>;
  dismiss: (announcementId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Primitive for displaying site announcements.
 *
 * @example
 * ```tsx
 * // With meta tag: <meta name="jamwidgets-site-key" content="your-key" />
 * const { announcements, dismiss } = createAnnouncements({});
 *
 * <For each={announcements()}>
 *   {(ann) => (
 *     <div class={`announcement-${ann.announcementType}`}>
 *       {ann.content}
 *       {ann.isDismissible && (
 *         <button onClick={() => dismiss(ann.id)}>Dismiss</button>
 *       )}
 *     </div>
 *   )}
 * </For>
 * ```
 */
export function createAnnouncements(options: CreateAnnouncementsOptions): CreateAnnouncementsReturn {
  const [announcements, setAnnouncements] = createSignal<Announcement[]>([]);
  const [status, setStatus] = createSignal<ControllerStatus>("idle");
  const [error, setError] = createSignal<Error | null>(null);

  const config = resolveConfig(options);
  const controller = new AnnouncementsController(config);

  createEffect(() => {
    const unsubscribe = controller.subscribe((state: AnnouncementsState) => {
      // Only show non-dismissed announcements
      setAnnouncements(controller.getVisibleAnnouncements());
      setStatus(state.status);
      setError(state.error);
    });

    // Auto-fetch on mount (default: true)
    if (options.autoFetch !== false) {
      controller.fetch();
    }

    onCleanup(unsubscribe);
  });

  const dismiss = async (announcementId: number) => {
    await controller.dismiss(announcementId);
  };

  const refresh = async () => {
    await controller.fetch();
  };

  return { announcements, status, error, dismiss, refresh };
}
