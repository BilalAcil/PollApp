import { Survey } from '../models/survey.model';

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
 * Number of full days left until a survey's deadline, rounded up.
 * Returns null if the survey has no deadline.
 */
export function daysRemaining(survey: Survey, now: Date = new Date()): number | null {
  if (!survey.deadline) {
    return null;
  }
  const remainingMs = new Date(survey.deadline).getTime() - now.getTime();
  return Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));
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
