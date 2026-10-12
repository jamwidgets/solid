import { fetchSiteConfig, POWERED_BY_URL, resolveConfig } from "@jamwidgets/core";
import { type Accessor, createSignal, onCleanup, onMount, Show } from "solid-js";

export interface PoweredByProps {
  /** Site key - optional if <meta name="jamwidgets-site-key"> is set */
  siteKey?: string;
  endpoint?: string;
  class?: string;
}

/**
 * True when the site's plan requires the "Powered by Jamwidgets" footer.
 * Stays false until `/api/v1/site` answers, and on any failure, so a paying
 * site is never branded.
 */
export function createPoweredBy(options: Omit<PoweredByProps, "class"> = {}): Accessor<boolean> {
  const [show, setShow] = createSignal(false);
  onMount(() => {
    let config;
    try {
      config = resolveConfig(options);
    } catch {
      return;
    }
    let active = true;
    onCleanup(() => {
      active = false;
    });
    void fetchSiteConfig(config).then((site) => {
      if (active) setShow(site?.showPoweredBy === true);
    });
  });
  return show;
}

/**
 * The "Powered by Jamwidgets" footer. The primitives render no UI, so Free
 * sites must place this under the widgets they build; it renders nothing on
 * Team.
 */
export function PoweredBy(props: PoweredByProps) {
  const show = createPoweredBy(props);
  return (
    <Show when={show()}>
      <div class={["jamwidgets-powered-by", props.class].filter(Boolean).join(" ")}>
        <a href={POWERED_BY_URL} target="_blank" rel="noopener noreferrer">
          Powered by Jamwidgets
        </a>
      </div>
    </Show>
  );
}
