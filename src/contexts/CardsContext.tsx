import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { storage } from "@/src/utils/storage";

export type BarcodeType = "qr" | "ean13" | "ean8" | "code128" | "code39" | "upc" | "aztec" | "pdf417" | "none";

export type Card = {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  barcodeType: BarcodeType;
  barcodeValue?: string | null;
  frontImage?: string | null;
  backImage?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  isProtected?: boolean;
  useLetterLogo?: boolean;
  isFavorite?: boolean;
  phone?: string | null;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CardsState = {
  loading: boolean;
  cards: Card[];
  addCard: (c: Omit<Card, "id" | "createdAt" | "updatedAt">) => Promise<Card>;
  updateCard: (id: string, c: Partial<Omit<Card, "id" | "createdAt">>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  replaceAllCards: (next: Card[]) => Promise<void>;
};

const Ctx = createContext<CardsState | undefined>(undefined);

function userScopedKey(userId: string | undefined, name: string) {
  return `amc2.${userId || "anon"}.${name}`;
}

function uid() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function CardsProvider({ children }: { children: ReactNode }) {
  const uidKey = "local_user";

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      if (!uidKey) {
        setCards([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const saved = await storage.getItem<Card[]>(userScopedKey(uidKey, "cards"), []);
      if (!canceled) setCards(saved || []);
      setLoading(false);
    })();
    return () => { canceled = true; };
  }, [uidKey]);

  const persistCards = useCallback(async (next: Card[]) => {
    setCards(next);
    if (uidKey) await storage.setItem(userScopedKey(uidKey, "cards"), next);
  }, [uidKey]);

  const addCard = useCallback(async (c: Omit<Card, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newCard: Card = { ...c, id: uid(), createdAt: now, updatedAt: now };
    await persistCards([newCard, ...cards]);
    return newCard;
  }, [persistCards, cards]);

  const updateCard = useCallback(async (id: string, c: Partial<Omit<Card, "id" | "createdAt">>) => {
    await persistCards(cards.map((x) => x.id === id ? { ...x, ...c, updatedAt: new Date().toISOString() } : x));
  }, [persistCards, cards]);

  const deleteCard = useCallback(async (id: string) => {
    await persistCards(cards.filter((x) => x.id !== id));
  }, [persistCards, cards]);

  // Remplace l'intégralité du tableau de cartes en une seule opération
  // atomique (utilisé pour la restauration de sauvegarde) — évite les
  // problèmes de "stale closure" d'une boucle d'appels addCard/deleteCard.
  const replaceAllCards = useCallback(async (next: Card[]) => {
    await persistCards(next);
  }, [persistCards]);

  return (
    <Ctx.Provider value={{ loading, cards, addCard, updateCard, deleteCard, replaceAllCards }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCards() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCards must be used inside CardsProvider");
  return ctx;
}
