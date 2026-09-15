/** One selectable category: the stored value plus its translation key. */
export interface CategoryOption {
  readonly value: string;
  readonly labelKey: string;
}

/**
 * Fixed list of survey categories, matching the check constraint on the
 * "surveys.category" column in supabase/schema.sql.
 */
export const CATEGORIES: readonly CategoryOption[] = [
  { value: 'Team Activities', labelKey: 'category.teamActivities' },
  { value: 'Health & Wellness', labelKey: 'category.healthWellness' },
  { value: 'Gaming & Entertainment', labelKey: 'category.gamingEntertainment' },
  { value: 'Education & Learning', labelKey: 'category.educationLearning' },
  { value: 'Lifestyle & Preferences', labelKey: 'category.lifestylePreferences' },
  { value: 'Technology & Innovation', labelKey: 'category.technologyInnovation' },
];

/** Sentinel filter value that resets the category filter back to "All". */
export const ALL_CATEGORIES = 'all';
