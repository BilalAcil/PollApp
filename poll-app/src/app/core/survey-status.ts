import { Survey } from '../models/survey.model';

/** Remaining days below which a running survey counts as ending soon. */
export const ENDING_SOON_DAYS = 7;

/** Number of milliseconds in a single day. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Tells whether a survey has passed its deadline.
 * A survey without a deadline runs indefinitely and is never closed.
 */
export function isClosed(survey: Survey, now: Date = new Date()): boolean {
  if (!survey.deadline) {
    return false;
  }
  return new Date(survey.deadline).getTime() <= now.getTime();
}

/**
 * Tells whether a survey is still running but ends within ENDING_SOON_DAYS days.
 */
export function isEndingSoon(survey: Survey, now: Date = new Date()): boolean {
  if (!survey.deadline || isClosed(survey, now)) {
    return false;
  }
  const remainingMs = new Date(survey.deadline).getTime() - now.getTime();
  return remainingMs <= ENDING_SOON_DAYS * MS_PER_DAY;
}

/**
 * Comparator that sorts surveys by deadline, earliest first.
 * Surveys without a deadline end up at the bottom of the list.
 */
export function byDeadlineAscending(a: Survey, b: Survey): number {
  if (!a.deadline) {
    return b.deadline ? 1 : 0;
  }
  if (!b.deadline) {
    return -1;
  }
  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
}
