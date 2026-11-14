# Business rules

What the product must do, one rule per row, each with the sources it comes from: the official rules (PRIV-, in `sources/`), the decisions (D-), the goals (G-), the roles (R-) and the open questions (Q-). Where says which screens apply it.

| ID | Rule | Sources | Where |
|---|---|---|---|
| BR-01 | The due date is one month after the day the request reached the shop, not the day the privacy lead opened it. | PRIV-01, Q-02 | request |
| BR-02 | The privacy lead can extend the due date once, before it passes, by two more months, and only after writing the reason that goes into the letter to the person. | PRIV-02, PRIV-03, D-03, D-04 | request |
| BR-03 | A request past its due date and not answered is overdue, and says so until someone closes it. | PRIV-01, D-02 | request |
| BR-04 | The privacy lead marks a request as answered with the date the answer was sent. The product sends nothing to the person. | PRIV-04, D-01 | request |
| BR-05 | The privacy lead asks for proof of identity only with a reasonable doubt, written down. The due date does not move while the lead waits. | PRIV-07, D-05, Q-01 | request |
| BR-06 | Answering is free, and the product never charges for a copy. No screen shows a fee or a price. | PRIV-06, PRIV-08 | request |
| BR-07 | A request is due soon from 7 days before its due date. | D-06, G-02 | request |
| BR-08 | A support agent sees who has the request, and nothing they can change. | R-02 | request |
