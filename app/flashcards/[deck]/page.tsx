import { SEED_DECK_METAS, CUSTOM_META } from "@/lib/flashcards";
import { DeckView } from "./DeckView";

export function generateStaticParams() {
  const keys = [...SEED_DECK_METAS.map((m) => m.key), CUSTOM_META.key, "due", "all"];
  return keys.map((deck) => ({ deck }));
}

export default function FlashcardReviewPage({ params }: { params: { deck: string } }) {
  return <DeckView deckKey={params.deck} />;
}
