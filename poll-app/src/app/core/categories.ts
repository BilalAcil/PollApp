/** One selectable category: the stored value plus its display label. */
export interface CategoryOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Fixed list of survey categories, matching the check constraint on the
 * "surveys.category" column in supabase/schema.sql.
 */
export const CATEGORIES: readonly CategoryOption[] = [
  { value: 'Team Activities', label: 'Team Activities' },
  { value: 'Health & Wellness', label: 'Health & Wellness' },
  { value: 'Gaming & Entertainment', label: 'Gaming & Entertainment' },
  { value: 'Education & Learning', label: 'Education & Learning' },
  { value: 'Lifestyle & Preferences', label: 'Lifestyle & Preferences' },
  { value: 'Technology & Innovation', label: 'Technology & Innovation' },
];

/** Sentinel filter value that resets the category filter back to "All". */
export const ALL_CATEGORIES = 'all';

/** Display label for a stored category value, falling back to the raw value. */
export function categoryLabel(category: string): string {
  const match = CATEGORIES.find((option) => option.value === category);
  return match ? match.label : category;
}
