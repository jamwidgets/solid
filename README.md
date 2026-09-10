# @jamwidgets/solid

> **Note:** This repo is a read-only mirror. Source lives in a private monorepo.
> For issues/PRs, please open them here and we'll sync changes back.

SolidJS primitives for [Jamwidgets](https://jamwidgets.com) widgets - comments, reactions, forms, subscriptions, and more.

## Installation

```bash
npm install @jamwidgets/solid
```

Works with SolidJS 1.8+. Compatible with SolidStart, Astro, and standalone apps.

## Primitives

### createSubscribe

Email subscription form:

```tsx
import { createSubscribe } from "@jamwidgets/solid";

function SubscribeForm() {
  const [email, setEmail] = createSignal("");
  const { submit, status, message, error } = createSubscribe({
    siteKey: "your-key",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(email());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email()}
        onInput={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />
      <button disabled={status() === "loading"}>
        {status() === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      <Show when={status() === "success"}>
        <p>{message()}</p>
      </Show>
      <Show when={status() === "error"}>
        <p>{error()?.message}</p>
      </Show>
    </form>
  );
}
```

### createReactions

Reaction buttons (like, love, clap, etc.):

```tsx
import { createReactions } from "@jamwidgets/solid";

function LikeButton() {
  const { counts, userReactions, add, remove, status } = createReactions({
    siteKey: "your-key",
    pageId: "my-page",
  });

  const hasLiked = () => userReactions().includes("like");

  return (
    <button onClick={() => (hasLiked() ? remove("like") : add("like"))}>
      {hasLiked() ? "Unlike" : "Like"} ({counts().like || 0})
    </button>
  );
}
```

### createComments

Threaded comments:

```tsx
import { createComments } from "@jamwidgets/solid";

function Comments() {
  const { comments, post, status, error } = createComments({
    siteKey: "your-key",
    pageId: "my-page",
  });

  return (
    <div>
      <For each={comments()}>
        {(comment) => (
          <div>
            <strong>{comment.authorName}</strong>
            <p>{comment.content}</p>
          </div>
        )}
      </For>
    </div>
  );
}
```

### createForm

Contact forms with spam protection:

```tsx
import { createForm } from "@jamwidgets/solid";

function ContactForm() {
  const { submit, status, message } = createForm({
    siteKey: "your-key",
    formSlug: "contact",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await submit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
      <Show when={status() === "success"}>
        <p>{message()}</p>
      </Show>
    </form>
  );
}
```

### createWaitlist

Waitlist signups:

```tsx
import { createWaitlist } from "@jamwidgets/solid";

function WaitlistForm() {
  const { join, status, message, position } = createWaitlist({
    siteKey: "your-key",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await join(email(), { name: name(), source: "homepage" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <button type="submit">Join Waitlist</button>
      <Show when={status() === "success"}>
        <p>{message()}</p>
      </Show>
    </form>
  );
}
```

### createFeedback

Feedback forms:

```tsx
import { createFeedback } from "@jamwidgets/solid";

function FeedbackWidget() {
  const { submit, status, message } = createFeedback({
    siteKey: "your-key",
  });

  const handleSubmit = async (type, content) => {
    await submit(type, content, { email: email(), pageUrl: window.location.href });
  };

  // ...
}
```

### createPoll

Polls and voting:

```tsx
import { createPoll } from "@jamwidgets/solid";

function Poll() {
  const { poll, vote, hasVoted, status } = createPoll({
    siteKey: "your-key",
    pollId: 123,
  });

  return (
    <Show when={poll()} fallback={<div>Loading...</div>}>
      <div>
        <h3>{poll().question}</h3>
        <For each={poll().options}>
          {(option) => (
            <button onClick={() => vote([option.id])} disabled={hasVoted()}>
              {option.text} ({poll().results?.[option.id] || 0})
            </button>
          )}
        </For>
      </div>
    </Show>
  );
}
```

### createAnnouncements

Site announcements:

```tsx
import { createAnnouncements } from "@jamwidgets/solid";

function AnnouncementBanner() {
  const { announcements, dismiss, status } = createAnnouncements({
    siteKey: "your-key",
  });

  const visible = () => announcements().filter((a) => !a.dismissed);

  return (
    <For each={visible()}>
      {(announcement) => (
        <div>
          <p>{announcement.content}</p>
          <Show when={announcement.isDismissible}>
            <button onClick={() => dismiss(announcement.id)}>Dismiss</button>
          </Show>
        </div>
      )}
    </For>
  );
}
```

### createViewCounts

Page view tracking:

```tsx
import { createViewCounts } from "@jamwidgets/solid";
import { onMount } from "solid-js";

function PageViews() {
  const { views, uniqueVisitors, record, status } = createViewCounts({
    siteKey: "your-key",
    pageId: "my-page",
  });

  // Record view on mount
  onMount(() => {
    record();
  });

  return (
    <span>
      {views()} views ({uniqueVisitors()} unique)
    </span>
  );
}
```

## All Primitives

| Primitive | Purpose |
|-----------|---------|
| `createSubscribe` | Email subscriptions |
| `createReactions` | Page reactions |
| `createComments` | Threaded comments |
| `createForm` | Form submissions |
| `createWaitlist` | Waitlist signups |
| `createFeedback` | Feedback forms |
| `createPoll` | Polls and voting |
| `createAnnouncements` | Site announcements |
| `createViewCounts` | Page view tracking |

## License

MIT
