// The request's behaviour, in one place: its due date, its state and the actions it offers.
// Each function cites the rules it applies. Spec: spec/screens/request.md, spec/rules.md.

export type Role = 'R-01' | 'R-02';
export type StateId = 'ST-01' | 'ST-02' | 'ST-03' | 'ST-04' | 'ST-05' | 'ST-06' | 'ST-07' | 'ST-08';
export type Action = { label: string; variant: 'primary' | 'secondary' | 'tertiary'; disabled?: boolean };

/** Dates are days, written YYYY-MM-DD. */
export type Request = {
  received: string;
  extendedOn?: string;
  extendReason?: string;
  proofAskedOn?: string;
  proofDoubt?: string;
  answeredOn?: string;
};

export type View = { viewer: Role; today: string; dialog?: 'extend'; reasonDraft?: string };

const DAY = 86_400_000;
const toDate = (d: string) => new Date(`${d}T00:00:00Z`);
const toDay = (d: Date) => d.toISOString().slice(0, 10);

/** The same day, n months later; the last day of that month when it has no such day (Q-02). */
export function addMonths(day: string, n: number): string {
  const d = toDate(day);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return toDay(target);
}

/** Days from one day to another: negative once the second day has passed. */
export const daysBetween = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY);

/** BR-01, BR-02: one month after the request reached the shop; three once extended. Proof of identity moves nothing (BR-05). */
export function dueDate(r: Request): string {
  return addMonths(r.received, r.extendedOn ? 3 : 1);
}

/** Which state the screen is in. The order is the spec's: the first state that applies wins. */
export function stateOf(r: Request, v: View): StateId {
  if (r.answeredOn) return 'ST-06';                          // BR-04
  if (v.viewer === 'R-02') return 'ST-08';                   // BR-08
  if (v.dialog === 'extend' && !v.reasonDraft?.trim()) return 'ST-07'; // BR-02
  const left = daysBetween(v.today, dueDate(r));
  if (left < 0) return 'ST-03';                              // BR-03
  if (r.proofAskedOn) return 'ST-05';                        // BR-05
  if (left <= 7) return 'ST-02';                             // BR-07
  if (r.extendedOn) return 'ST-04';                          // BR-02
  return 'ST-01';
}

/** The buttons the state offers, in order. */
export function actionsFor(r: Request, v: View): Action[] {
  const answer: Action = { label: 'Mark as answered', variant: 'primary' };
  const extend: Action = { label: 'Extend', variant: 'secondary' };
  const ask: Action = { label: 'Ask for proof of identity', variant: 'tertiary' };
  switch (stateOf(r, v)) {
    case 'ST-06': case 'ST-08': return [];
    case 'ST-07': return [{ label: 'Extend', variant: 'primary', disabled: true }, { label: 'Cancel', variant: 'tertiary' }];
    case 'ST-03': return [answer];                           // no Extend once the due date has passed (BR-02)
    case 'ST-05': return [{ label: 'Proof received', variant: 'primary' }, { ...answer, variant: 'secondary' }];
    case 'ST-04': return [answer, ask];                      // extended once (BR-02)
    case 'ST-02': return r.extendedOn ? [answer, ask] : [answer, extend, ask];
    default: return [answer, extend, ask];
  }
}

/** "3 Dec" */
export const short = (day: string) => toDate(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
