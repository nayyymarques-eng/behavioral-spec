# Decisions

The product decisions: choices the team made on purpose, so nobody flags them as errors and nobody has to ask again. A decision can come from user research, a market insight, the business strategy or a technical limit. None may go against an official rule in `sources/`.

There is one log for the whole product, even for a decision made while one flow was written, because a decision made for one flow often holds for others. "Applies to" names the flows and screens it touches, so a search finds it from either side. A decision that replaces another says so, and the old one stays, marked "replaced".

| ID | Decision | Why | Decided by | Applies to | Date |
|---|---|---|---|---|---|
| D-01 | The product does not send answers to the person. The privacy lead sends them from the shop's own email and marks the request as answered, with the date sent. | The person wrote to that address, and the shop keeps one channel. Known effect: the product records the date the lead enters, not proof of delivery. | Product designer, with the privacy lead | answer-a-request, request | 2026-10-01 |
| D-02 | A request past its due date stays at the top of the list, marked "overdue", until someone closes it. It never leaves the list on its own. | A request nobody closed is still open. | Product designer | answer-a-request, request | 2026-10-01 |
| D-03 | The Extend button stays disabled until the lead writes the reason, which goes into the letter to the person. | The person must be told the reasons (PRIV-03). | Product designer | request | 2026-10-08 |
| D-04 | A request is extended once, always by the full two months. | One letter, one new date. The law allows up to two more months (PRIV-02). | Product designer, with the privacy lead | answer-a-request, request | 2026-11-13 |
| D-05 | While the lead waits for proof of identity, the due date does not move. | Nobody has answered Q-01 yet. Keeping the earlier date is the safe reading. | Product designer | answer-a-request, request | 2026-11-13 |
| D-06 | A request is "due soon" from 7 days before its due date. | The lead needs a week to gather the data and write the answer (G-02). | Product designer | request | 2026-11-13 |
