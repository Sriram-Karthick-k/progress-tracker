// Notes editing is ON by default (dev and your own builds). To publish a
// read-only public copy, set NEXT_PUBLIC_NOTES_READONLY=1 at build time.
export const NOTES_EDITABLE = process.env.NEXT_PUBLIC_NOTES_READONLY !== "1";
