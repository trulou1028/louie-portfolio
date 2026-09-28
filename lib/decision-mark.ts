/**
 * A decision mark: an amber redline drawn over a real screenshot, naming the
 * decision the image shows (Plan 037).
 *
 * Geometry is in percent of the image's own box, so a mark stays on its
 * target at every rendered size. The label must restate something the case
 * study, caption, or alt text already says. A mark points at evidence; it
 * never adds a claim.
 */
export type DecisionMarkSpec = {
  /** Left edge, percent of image width. */
  x: number;
  /** Top edge, percent of image height. */
  y: number;
  /** Width, percent of image width. */
  w: number;
  /** Height, percent of image height. */
  h: number;
  label: string;
};
