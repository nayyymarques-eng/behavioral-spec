# Flow: Answer a request

From the email a person sends to the shop to the answer. One flow per job a role comes to do, drawn before any screen: each step says who acts, what happens, and which screen and state it lands on. A screen state that no step reaches is a gap, in the flow or in the screen.

- Trigger: a person writes to the shop asking for a copy of their personal data
- Roles: R-02, R-01
- Goals: G-01, G-04
- Ends: the person has the answer

## Steps

| Step | Who | What happens | Screen | States | Next |
|---|---|---|---|---|---|
| F-01 | R-02 | The support agent reads the email and sends it to the privacy lead | request | ST-08 | F-02 |
| F-02 | R-01 | The privacy lead opens the request and sees its due date | request | ST-01, ST-02 | F-03, or F-08 when the due date passes |
| F-03 | R-01 | Is it clear who the person is? | - | - | yes: F-05; no: F-04 |
| F-04 | R-01 | Asks for proof of identity, and waits | request | ST-05 | F-05 when the proof arrives, or F-08 when the due date passes |
| F-05 | R-01 | Can the answer go out by the due date? | - | - | yes: F-07; no: F-06 |
| F-06 | R-01 | Extends the due date by two months, with a reason for the person | request | ST-07, ST-04 | F-07, or F-08 when the new due date passes |
| F-07 | R-01 | Sends the answer and marks the request as answered | request | ST-06 | end |
| F-08 | R-01 | The due date passes with no answer | request | ST-03 | F-07 |
