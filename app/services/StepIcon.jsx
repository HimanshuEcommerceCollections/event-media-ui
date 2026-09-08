/**
 * The line icons the "how it works" steps use.
 *
 * The steps themselves are content and come from the API, but SVG paths are
 * markup, so each step carries an `iconKey` and the drawing stays here. Keys
 * are shared across service pages — "truck" is the same drawing on the party
 * rentals page as on the entertainers page.
 *
 * Only the inner shapes are returned: the caller owns the <svg> element and
 * its stroke attributes, which differ slightly between the reference pages.
 */

const SHAPES = {
  truck: (
    <>
      <rect x="1" y="6" width="13" height="10" rx="1" />
      <path d="M14 9h4l3 3v4h-7z" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2" />
    </>
  ),
  brush: (
    <>
      <path d="M4 20 9 8l7 7-12 5Z" />
      <path d="M14 4l1 2M18 6l-1.5 1.5M20 10l-2 .8" />
    </>
  ),
  box: (
    <>
      <path d="M4 8 12 4l8 4v8l-8 4-8-4V8Z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </>
  ),
  book: (
    <>
      <path d="M9 4h9a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9z" />
      <path d="M9 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3" />
      <path d="M12 8h4M12 12h4" />
    </>
  ),
  users: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M3 19a5 5 0 0 1 10 0M11 19a5 5 0 0 1 10 0" />
    </>
  ),
  star: <path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 20.7l-4.2 2 1.3-5.6L4.7 8.3l5.8-.5L12 3Z" />,
};

/**
 * An unknown key draws nothing rather than throwing: a step added to the
 * catalogue with a key this build does not know should still render its
 * number and copy.
 */
export default function StepIcon({ iconKey }) {
  return SHAPES[iconKey] ?? null;
}
