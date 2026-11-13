# Screen: Request

One request, opened from the privacy lead's list: the person's message, its due date, what to do next and what was done.

- Template: detail-page
- Roles: R-01, R-02
- Goals: G-01, G-02, G-03, G-04
- Never shows: €, fee, price

## Words

The words in braces come from the example row.

| Word | What it is |
|---|---|
| {due} | The Due column, as "3 Dec" |
| {in} | From Today to the Due column: "today", "tomorrow" or "in 5 days" |
| {asked} | The Proof asked on column, as "12 Nov" |
| {answered} | The Answered on column, as "28 Nov" |
| {received} | The Received column, as "3 Nov" |

## States

When two states could apply, the first one in this list wins.

### ST-06 Answered
- When: the privacy lead marked the request as answered
- Status: badge positive "Answered on {answered}"
- Banner: none
- Actions: none
- Says: "Sent from the shop's email on {answered}"
- Rules: BR-04
- Goals: G-01, G-03

### ST-08 Support agent's view
- When: a support agent opens a request that is not answered
- Status: badge none "With the privacy lead"
- Banner: none
- Actions: none
- Says: "Sent to the privacy lead on {received}"
- Rules: BR-08
- Goals: G-04

### ST-07 Extending, no reason yet
- When: the privacy lead clicked Extend and has not written the reason
- Status: badge info "Due on {due}"
- Banner: none
- Dialog: "Extend the due date by two months"
- Actions: Extend (primary, disabled), Cancel (tertiary)
- Says: "Reason, for the letter to the person"
- Rules: BR-02
- Goals: G-01

### ST-03 Overdue
- When: not answered, and today is after the due date
- Status: badge critical "Overdue since {due}"
- Banner: critical "This request is past its legal due date. It stays at the top of your list until you mark it as answered."
- Actions: Mark as answered (primary)
- Rules: BR-03, BR-02
- Goals: G-01, G-02

### ST-05 Waiting for proof of identity
- When: the privacy lead asked for proof of identity and has not received it
- Status: badge none "Waiting for proof of identity"
- Banner: info "You asked for proof of identity on {asked}. The due date does not move: {due}."
- Actions: Proof received (primary), Mark as answered (secondary)
- Rules: BR-05, BR-01
- Goals: G-01

### ST-02 Due soon
- When: not answered, and the due date is 7 days away or less
- Status: badge warning "Due {in}"
- Banner: none
- Actions: Mark as answered (primary), Extend (secondary) unless already extended, Ask for proof of identity (tertiary)
- Rules: BR-07, BR-01, BR-02, BR-05
- Goals: G-01, G-02

### ST-04 Extended
- When: the privacy lead extended the due date, and it is more than 7 days away
- Status: badge info "Extended to {due}"
- Banner: none
- Actions: Mark as answered (primary), Ask for proof of identity (tertiary)
- Rules: BR-02
- Goals: G-01, G-03

### ST-01 Open
- When: none of the above
- Status: badge info "Due on {due}"
- Banner: none
- Actions: Mark as answered (primary), Extend (secondary), Ask for proof of identity (tertiary)
- Rules: BR-01, BR-02, BR-05, BR-06
- Goals: G-01

## Examples

Each row is one case and one test. Viewer, Received, Extended on, Proof asked on, Answered on, Dialog and Today are the facts. Due, State and Actions are what the screen must show. A dash means none.

| Example | Viewer | Received | Extended on | Proof asked on | Answered on | Dialog | Today | Due | State | Actions |
|---|---|---|---|---|---|---|---|---|---|---|
| E-01 | R-01 | 2026-11-03 | - | - | - | - | 2026-11-10 | 2026-12-03 | ST-01 | Mark as answered, Extend, Ask for proof of identity |
| E-02 | R-01 | 2026-11-03 | - | - | - | - | 2026-11-28 | 2026-12-03 | ST-02 | Mark as answered, Extend, Ask for proof of identity |
| E-03 | R-01 | 2026-11-03 | - | - | - | - | 2026-12-04 | 2026-12-03 | ST-03 | Mark as answered |
| E-04 | R-01 | 2026-11-03 | 2026-11-20 | - | - | - | 2026-11-25 | 2027-02-03 | ST-04 | Mark as answered, Ask for proof of identity |
| E-05 | R-01 | 2026-11-03 | - | 2026-11-12 | - | - | 2026-11-20 | 2026-12-03 | ST-05 | Proof received, Mark as answered |
| E-06 | R-01 | 2026-11-03 | - | - | 2026-11-28 | - | 2026-12-10 | 2026-12-03 | ST-06 | - |
| E-07 | R-01 | 2026-11-03 | - | - | - | extend | 2026-11-20 | 2026-12-03 | ST-07 | Extend, Cancel |
| E-08 | R-02 | 2026-11-03 | - | - | - | - | 2026-11-20 | 2026-12-03 | ST-08 | - |
| E-09 | R-01 | 2026-01-31 | - | - | - | - | 2026-02-10 | 2026-02-28 | ST-01 | Mark as answered, Extend, Ask for proof of identity |
| E-10 | R-01 | 2026-11-03 | 2026-11-20 | - | - | - | 2027-01-30 | 2027-02-03 | ST-02 | Mark as answered, Ask for proof of identity |
| E-11 | R-01 | 2026-11-03 | 2026-11-20 | - | - | - | 2027-02-05 | 2027-02-03 | ST-03 | Mark as answered |
| E-12 | R-01 | 2026-11-03 | - | 2026-11-12 | - | - | 2026-12-05 | 2026-12-03 | ST-03 | Mark as answered |
| E-13 | R-01 | 2026-11-03 | - | - | - | - | 2026-12-03 | 2026-12-03 | ST-02 | Mark as answered, Extend, Ask for proof of identity |
| E-14 | R-02 | 2026-11-03 | - | - | 2026-11-28 | - | 2026-12-10 | 2026-12-03 | ST-06 | - |

E-09 is the month-end case (Q-02). E-12 shows the due date does not move while the lead waits for proof (BR-05): the request is overdue. E-13 is the due date itself: still due, not yet overdue. E-14 shows a support agent sees an answered request as answered.
