# The official rules

The rules your users work under, from outside the team: laws, regulator guidance and contracts. Each rule points to its official text. They are written once, here, at the product level of the spec. Business rules in `rules.md` cite them by ID, the synthetic user reads them before it answers, and the rules watch keeps them current. This is not a copy of the law: it holds only the rules the product depends on. A long list can be split into one file per topic, such as deadlines or fees; it is still one set of rules.

## One rule, one row

| ID | Rule | Source | Applies | Checked on | Mark | Check again on |
|---|---|---|---|---|---|---|
| PRIV-01 | One rule, in plain words | The official text, article and address | Jurisdiction, from (and until) | Date and who read it | checked or to confirm | Date |

- **ID**: a short code that stays the same when the wording changes. Business rules, reports and eval cases cite it, so a rule change finds every business rule and every review that used it.
- **Applies**: the jurisdiction and the date the rule takes effect. When a newer version replaces it, the old row gets the date it ends and stays on the page, because work from before the change may still follow it.
- **Checked on**: the date a person read the official text, and who. Empty until then.
- **Mark**: `to confirm` or `checked`. Agents add rules as `to confirm`. Only a person marks a rule `checked`; the hook refuses any agent edit that does.
- **Check again on**: when the rule must be read again. For a value the authority updates on a known date, that date. For the rest, the interval your business sets (see below).

## Who changes what

| Who | What they may do |
|---|---|
| The synthetic user | Add a missing rule it read in the official text, marked `to confirm` |
| The rules watch | Turn a rule back to `to confirm` when its source changed or its date passed, and add the new version next to it |
| A person | Read the official text, mark a rule `checked`, set the end date of an old version |

The official rules live in your repository, so every change shows in a pull request.

## Set for your business

- **Official sources the agents may open**: list them here, with their addresses. A rule from a source an agent cannot open (behind a login, on paper) stays a gap until a person reads it.
- **Interval for "check again on"**: for example, six months after a person checks it.

## The example

`privacy-requests.md` holds the official rules of a made-up product. Replace it with your own.
