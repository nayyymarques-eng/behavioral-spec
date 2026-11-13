# Spec review, with a synthetic user

A synthetic user reads the spec before anyone builds the screen, as each role, and checks it against the rules and what real users said. It is the second gate, after `npm run spec`: the spec check finds what is missing, and the synthetic user finds what is wrong.

The synthetic user comes from [grounded-synthetic-user](https://github.com/nayyymarques-eng/grounded-synthetic-user), for the same made-up product. To run it on this spec:

1. Install that kit in this project, as its README says.
2. In its hook, `.claude/hooks/black-box.mjs`, set `SPECS` to `spec`, so the agent can read this folder and nothing else.
3. Ask Claude Code: "Use the synthetic-user agent to review spec/screens/request.md as privacy lead, in a spec review." Then: "Use the verifier on that report."

Reports go in this folder. No review of this example has been run yet.
