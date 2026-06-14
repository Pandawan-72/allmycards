// Bridge en mémoire pour transmettre le résultat du scanner (code-barre / photo)
// vers l'écran "card" lorsque la carte n'est pas encore enregistrée (pas d'id).
// Le scanner écrit ici juste avant router.back(), et card.tsx lit + vide au focus.

export type PendingBarcodeResult = {
  type: "barcode";
  value: string;
  barcodeType: string;
};

export type PendingPhotoResult = {
  type: "photo";
  side: "front" | "back";
  uri: string;
};

export type PendingScanResult = PendingBarcodeResult | PendingPhotoResult;

let pending: PendingScanResult | null = null;

export function setPendingScanResult(result: PendingScanResult) {
  pending = result;
}

export function consumePendingScanResult(): PendingScanResult | null {
  const r = pending;
  pending = null;
  return r;
}
