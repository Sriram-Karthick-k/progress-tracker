// Width of the reading column in the Notebook. It grows with the window instead of
// staying a narrow strip on the left: the article and its "On this page" rail are
// centred as one group (see NoteArticle / the index page), so spare space is split
// evenly on both sides. Whiteboard notes (boards) keep their own width: their diagrams are scaled to the full
// column width, so a wider column would just make small diagrams huge. Full class strings so Tailwind sees them.
export const ARTICLE_WIDTH = "max-w-[46rem] xl:max-w-[52rem] 2xl:max-w-[58rem] min-[1800px]:max-w-[64rem]";
export const BOARD_WIDTH = "max-w-[64rem]";
