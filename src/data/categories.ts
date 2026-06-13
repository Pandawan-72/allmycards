export type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "loyalty",   label: "Fidélité",        icon: "Gift",        color: "#F59E0B" },
  { id: "transport", label: "Transport",        icon: "Train",       color: "#3B82F6" },
  { id: "sport",     label: "Sport & Loisirs",  icon: "Dumbbell",    color: "#10B981" },
  { id: "health",    label: "Santé",            icon: "Heart",       color: "#EF4444" },
  { id: "identity",  label: "Identité",         icon: "IdCard",      color: "#6366F1" },
  { id: "bank",      label: "Banque",           icon: "CreditCard",  color: "#111827" },
  { id: "library",   label: "Bibliothèque",     icon: "BookOpen",    color: "#8B5CF6" },
  { id: "other",     label: "Autre",            icon: "Tag",         color: "#9CA3AF" },
];

export function findCategory(id: string): Category {
  return DEFAULT_CATEGORIES.find((c) => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}
