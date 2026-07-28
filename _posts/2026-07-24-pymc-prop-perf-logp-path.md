---
layout: post
title: "Late July: cheaper post-sample packaging"
date: 2026-07-24
summary: "PR #15 speeds up ArviZ packaging; PR #16 (mirror WGF) is open for review."
---

Between the [midterm post]({{ '/blog/midterm-fuse-adaptive-step/' | relative_url }}) and now, one merge landed and one review is open. [PR #15](https://github.com/pymc-devs/pymc-prop/pull/15) (July 13) cuts wasted compile and eval work that showed up once FUSE and the ArviZ path were the default workflow. [PR #16](https://github.com/pymc-devs/pymc-prop/pull/16) (opened July 15) is the constrained-parameter / mirror WGF work still in review.

## What was slow for no good reason

Filling `log_likelihood` (and therefore `mixture_log_predictive`) was going through the full observed **logp + score** graph: elementwise \(\log p(y_i \mid \theta)\) **and** the observation jacobian. ArviZ only stores log densities. The scores belong on the drift path inside `compile_drift_for_logscore`, not on every post-sample packaging call.

Separately, `LogScore` was compiling the fused drift twice in places (`compile_wgf` then `compile_drift`), so startup paid for the same graph more than once.

## What #15 changed

The packaging path now compiles a **logp-only** batched function:

- `compile_batched_observed_logp` / `compile_batched_observed_logp_for_rv` in `pymc_prop/compile.py` build \(\log p(y_i \mid \theta)\) over particles without jacobians.
- `arviz.py` uses that for each observed RV when building `log_likelihood`.
- Drift still uses `compile_batched_observed_logp_score` / `compile_drift_for_logscore` unchanged.
- Shared helpers (`_try_vectorize_then_scan`, `_compile_particle_batch`) cleaned up the vectorize→scan fallback that every batched compiler was copy-pasting.
- `LogScore` compiles drift once.

If you only care about particle trajectories, you can still skip the packaging pass entirely with `include_log_likelihood=False`.

## Open: mirror WGF for constrained params

[PR #16](https://github.com/pymc-devs/pymc-prop/pull/16) closes [issue #6](https://github.com/pymc-devs/pymc-prop/issues/6): mirror-mapped Wasserstein gradient flow for elementwise constrained PyMC parameters (Gu & Kim), so variances / rates / similar transforms stop getting isotropic noise pushed across the boundary.

The design reuses PyMC's existing `default_transform` as the mirror map. Particles stay in dual `value_vars` space; drift uses the primal gradient; diffusion is scaled by \(\sigma = \exp(-\tfrac12\,\texttt{log\_jac\_det})\); ArviZ posterior values are packed back through `transform.backward`. Point-level APIs keep dual-coordinate grads; flat / batched / drift compilation applies the primal scaling. New coverage lives in `tests/test_mirror_wgf.py` and `examples/mirror_variance_mixture.ipynb`.