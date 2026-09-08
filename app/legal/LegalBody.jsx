/**
 * Renders a legal document's body from the API's block model.
 *
 * The prose used to live here as JSX. It now arrives as data — see
 * backend/src/db/seed-data/legal.ts — which is why the shape is a small closed
 * set rather than HTML: serving markup would mean either trusting it with
 * dangerouslySetInnerHTML or parsing it, and neither is worth it for copy this
 * structured.
 *
 * A block is a paragraph or a list; its content is a run of inline pieces,
 * `{ text }` for copy and `{ text, href }` for a link, so a sentence with a
 * link in the middle keeps its own spacing.
 */

// Matches the reference documents' inline link styling, which had no class of
// its own to target from legal.css.
const LINK_STYLE = { color: "var(--txacc)", fontWeight: 600 };

function Inline({ pieces }) {
  return pieces.map((piece, i) =>
    piece.href ? (
      <a href={piece.href} style={LINK_STYLE} key={i}>
        {piece.text}
      </a>
    ) : (
      // A bare string, not a fragment: adjacent text pieces have to be able to
      // sit against a link without React inserting a break between them.
      piece.text
    ),
  );
}

export default function LegalBody({ blocks }) {
  return blocks.map((block, i) => {
    if (block.type === "ul") {
      return (
        <ul key={i}>
          {block.items.map((item, j) => (
            <li key={j}>
              <Inline pieces={item} />
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i}>
        <Inline pieces={block.content} />
      </p>
    );
  });
}
