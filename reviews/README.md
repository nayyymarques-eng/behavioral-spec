# Spec review, with a synthetic user

A synthetic user reads a feature in the spec before anyone builds it, as each role: its flow, its screens and their cases. It checks them against the official rules in `spec/sources/` and the persona sheets in `spec/personas/`, and it respects the decisions in `spec/decisions.md`. It is the second gate, after `npm run spec`: the spec check finds what is missing, and the synthetic user finds what is wrong.

The synthetic user comes from [grounded-synthetic-user](https://github.com/nayyymarques-eng/grounded-synthetic-user). It keeps no rules or persona sheets of its own: it reads them from this spec. To run it:

1. Install that kit in this project, as its README says. Its hook lets the agent read `spec/` and nothing else of the project.
2. Ask Claude Code: "Use the synthetic-user agent to review spec/flows/answer-a-request.md as privacy lead, in a spec review." Then: "Use the verifier on that report."

Reports go in this folder. No review of this example has been run yet.
