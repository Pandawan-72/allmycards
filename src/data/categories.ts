export type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "loyalty",   label: "loyalty",        icon: "Gift",        color: "#F59E0B" },
  { id: "transport", label: "transport",        icon: "Train",       color: "#3B82F6" },
  { id: "sport",     label: "sport",  icon: "Dumbbell",    color: "#10B981" },
  { id: "health",    label: "health",            icon: "Heart",       color: "#EF4444" },
  { id: "identity",  label: "identity",         icon: "IdCard",      color: "#6366F1" },
  { id: "businesscard", label: "businesscard",  icon: "Contact",     color: "#0EA5E9" },
  { id: "bank",      label: "bank",           icon: "CreditCard",  color: "#92400E" },
  { id: "library",   label: "library",     icon: "BookOpen",    color: "#8B5CF6" },
  { id: "other",     label: "other",            icon: "Tag",         color: "#9CA3AF" },
];

export function findCategory(id: string): Category {
  return DEFAULT_CATEGORIES.find((c) => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}
