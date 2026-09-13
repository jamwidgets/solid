import "@jamwidgets/core/gallery-elements";

export interface GalleryProps {
  siteKey: string;
  slug: string;
  endpoint?: string;
  tag?: string;
}

export function Gallery(props: GalleryProps) {
  return <jamwidgets-gallery site-key={props.siteKey} slug={props.slug} endpoint={props.endpoint} tag={props.tag} />;
}

export interface GalleryIndexProps {
  siteKey: string;
  endpoint?: string;
  deepLink?: boolean;
}

export function GalleryIndex(props: GalleryIndexProps) {
  return <jamwidgets-gallery-index site-key={props.siteKey} endpoint={props.endpoint} deep-link={props.deepLink ? "" : undefined} />;
}

export interface RandomPhotoProps extends GalleryProps { seed?: string }

export function RandomPhoto(props: RandomPhotoProps) {
  return <jamwidgets-random-photo site-key={props.siteKey} slug={props.slug} endpoint={props.endpoint} tag={props.tag} seed={props.seed} />;
}

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "jamwidgets-gallery": Record<string, unknown>;
      "jamwidgets-gallery-index": Record<string, unknown>;
      "jamwidgets-random-photo": Record<string, unknown>;
    }
  }
}
