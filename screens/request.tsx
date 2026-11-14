// Screen: Request. Spec: spec/screens/request.md. Built with ai-ready-design-system, from the detail page template.
// The behaviour lives in src/request.ts; this file only shows it. The root carries data-state, so the checks know
// which state the screen thinks it is in.
import { DetailPage, NavRail, Badge, Banner, Button, Card, Dialog, Field, List, ListItem, Section, Stack } from 'ai-ready-design-system/src';
import { actionsFor, daysBetween, dueDate, short, stateOf, type Request, type View } from '../src/request';

export const title = 'Request';

export function RequestScreen({ request: r, view: v }: { request: Request; view: View }) {
  const state = stateOf(r, v);
  const due = short(dueDate(r));
  const left = daysBetween(v.today, dueDate(r));
  const inDays = left === 0 ? 'today' : left === 1 ? 'tomorrow' : `in ${left} days`;
  const actions = actionsFor(r, v);

  const status = {
    'ST-01': <Badge tone="info">Due on {due}</Badge>,
    'ST-02': <Badge tone="warning">Due {inDays}</Badge>,
    'ST-03': <Badge tone="critical">Overdue since {due}</Badge>,
    'ST-04': <Badge tone="info">Extended to {due}</Badge>,
    'ST-05': <Badge>Waiting for proof of identity</Badge>,
    'ST-06': <Badge tone="positive">Answered on {short(r.answeredOn ?? v.today)}</Badge>,
    'ST-07': <Badge tone="info">Due on {due}</Badge>,
    'ST-08': <Badge>With the privacy lead</Badge>,
  }[state];

  const buttons = actions.map(a => <Button key={a.label} variant={a.variant} disabled={a.disabled}>{a.label}</Button>);
  const inDialog = state === 'ST-07';

  const history = [
    `Sent to the privacy lead on ${short(r.received)}`,
    r.proofAskedOn ? `Proof of identity asked for on ${short(r.proofAskedOn)}` : null,
    r.extendedOn ? `Extended on ${short(r.extendedOn)}` : null,
    r.answeredOn ? `Sent from the shop's email on ${short(r.answeredOn)}` : null,
  ].filter((h): h is string => h !== null);

  return (
    <div data-state={state}>
      <DetailPage
        nav={<NavRail brand="Privacy inbox" items={[{ label: 'Requests', href: '#', current: true }, { label: 'Settings', href: '#' }]} />}
        title="Request to see their data"
        status={status}
        actions={!inDialog && buttons.length ? buttons : undefined}
        main={
          <Stack>
            {state === 'ST-03' ? <Banner tone="critical"><p>This request is past its legal due date. It stays at the top of your list until you mark it as answered.</p></Banner> : null}
            {state === 'ST-05' ? <Banner><p>You asked for proof of identity on {short(r.proofAskedOn ?? v.today)}. The due date does not move: {due}.</p></Banner> : null}
            <Section title="The person's message" titleId="message">
              <Card><p>Hello, I would like a copy of the personal data your shop holds about me, and to know who you shared it with. My last order was in September. Thank you, Alex Romero</p></Card>
            </Section>
          </Stack>
        }
        aside={
          <Stack>
            <Section title="About the request" titleId="about">
              <List>
                <ListItem label="Kind" value="See their data" />
                <ListItem label="From" value="alex@example.com" />
                <ListItem label="Order" value="#10482" />
                <ListItem label="Received" value={short(r.received)} />
                <ListItem label="Due date" value={due} />
                {r.extendReason ? <ListItem label="Reason for the extension" value={r.extendReason} /> : null}
                {r.proofDoubt ? <ListItem label="Reason for asking for proof" value={r.proofDoubt} /> : null}
              </List>
            </Section>
            <Section title="History" titleId="history">
              <List>{history.map(h => <ListItem key={h}>{h}</ListItem>)}</List>
            </Section>
          </Stack>
        }
      />
      {inDialog ? (
        <Dialog id="extend" title="Extend the due date by two months" open actions={buttons}>
          <Field id="reason" label="Reason, for the letter to the person" hint="The new due date will be in the letter, with this reason." />
        </Dialog>
      ) : null}
    </div>
  );
}

/** A sample to preview: E-02 in the spec. */
export default function Sample() {
  return <RequestScreen request={{ received: '2026-11-03' }} view={{ viewer: 'R-01', today: '2026-11-28' }} />;
}

/** The screen, for the checks. */
export const Screen = RequestScreen;

/** Turns one example row of the spec into the screen's props. */
export function fromExample(row: Record<string, string>): { request: Request; view: View } {
  const v = (k: string) => (row[k] && row[k] !== '-' ? row[k] : undefined);
  return {
    request: {
      received: row.Received,
      extendedOn: v('Extended on'),
      extendReason: v('Extended on') ? 'Your request covers five years of orders kept in two systems.' : undefined,
      proofAskedOn: v('Proof asked on'),
      proofDoubt: v('Proof asked on') ? 'The email is not the one on the order.' : undefined,
      answeredOn: v('Answered on'),
    },
    view: { viewer: row.Viewer as View['viewer'], today: row.Today, dialog: v('Dialog') === 'extend' ? 'extend' : undefined },
  };
}

/** What the code alone decides, before anything is drawn. */
export function behaviour({ request, view }: { request: Request; view: View }) {
  return { due: dueDate(request), state: stateOf(request, view), actions: actionsFor(request, view).map(a => a.label) };
}
