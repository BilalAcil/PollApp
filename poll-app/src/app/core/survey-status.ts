import { Survey } from '../models/survey.model';

/**
 * Ab wie vielen Tagen Restlaufzeit eine Umfrage als "bald endend" gilt.
 * Zentral hier definiert, damit der Wert an einer Stelle änderbar bleibt.
 */
export const ENDING_SOON_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Umfragen ohne Deadline laufen unbegrenzt und sind nie beendet. */
export function isClosed(survey: Survey, now: Date = new Date()): boolean {
  if (!survey.deadline) {
    return false;
  }
  return new Date(survey.deadline).getTime() <= now.getTime();
}

/** Laufend, aber Deadline innerhalb der nächsten ENDING_SOON_DAYS Tage. */
export function isEndingSoon(survey: Survey, now: Date = new Date()): boolean {
  if (!survey.deadline || isClosed(survey, now)) {
    return false;
  }
  const remainingMs = new Date(survey.deadline).getTime() - now.getTime();
  return remainingMs <= ENDING_SOON_DAYS * MS_PER_DAY;
}

/**
 * Sortiert nach Enddatum, frühestes Ende zuerst.
 * Umfragen ohne Deadline landen am Ende der Liste.
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
