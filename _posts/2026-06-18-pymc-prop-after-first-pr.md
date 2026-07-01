---
layout: post
title: "After the first PR: DataTree, init, and posterior predictive"
date: 2026-06-18
summary: "Turning sample_pro into a PyMC-native workflow—ArviZ output, prior draws per particle, and mixture posterior predictive checks."
---

The [first PR]({{ '/blog/first-pr-pymc-prop/' | relative_url }}) landed a working log-score particle loop. The next stretch of work was less about new physics and more about making the sampler feel like PyMC: sensible initialization, an output object you can plot with ArviZ, and posterior predictive checks that respect what a particle mixture actually is.

## Prior draws, one per particle

[PR #7](https://github.com/pymc-devs/pymc-prop/pull/7) replaced ad-hoc jitter around a single start point with independent prior samples. Each particle now comes from `make_initial_point_fn(..., default_strategy="prior")`, mapped into unconstrained `value_vars` space—the same picture as Sec. 5 in McLatchie et al. If the joint logp is non-finite, we resample with a fresh seed (up to a small retry budget) and fall back to `model.check_start_vals` on hard failures.

That matters in practice: on misspecified models the particle cloud should start spread out, not clustered around one lucky draw. The Gaussian regression tests in `tests/test_sampler_gaussian.py` now check that initialization actually samples from the prior.

## ArviZ DataTree instead of a raw ndarray

[PR #8](https://github.com/pymc-devs/pymc-prop/pull/8) was the biggest API shift. `sample_pro` no longer returns `result.particles`; it returns an ArviZ `DataTree` with the usual groups:

```python
dt = sample_pro(n_particles=32, n_steps=500, tune=200, random_seed=0)

# final empirical measure Q̂ at the last retained step
dt.posterior.isel(draw=-1)

# particle j at retained index i
dt.posterior.isel(draw=i, chain=j)
```

The dimension convention mirrors PyMC's `sample_dims`, but the meaning is PrO-specific:

- `chain` indexes particles (not HMC chains).
- `draw` indexes retained simulation steps after warmup.
- `step` stores the actual simulation step number (`tune + draw`).

`pymc_prop/arviz.py` handles the conversion: flat arrays go through `PointMapper`, log-likelihood is batched across the retained cloud, and `sample_stats` carries PrO diagnostics like `particle_spread`, `mean_log_score`, and `se_log_score`. The bimodal Gaussian example notebook was updated to use ArviZ plotting throughout.

## `tune` instead of `burn_in`, no thinning

[PR #12](https://github.com/pymc-devs/pymc-prop/pull/12) cleaned up naming to align with `pm.sample`: `burn_in` became `tune`, and `thinning` was dropped. The loop now runs `tune + n_steps` Euler–Maruyama steps and retains every step after warmup, so `n_steps` is literally the number of draws in the output.

One caveat worth stating explicitly: unlike `pm.sample`, `tune` here is discard-only—there is no adaptation phase during warmup yet. Adaptive step sizes are tracked separately in [PR #14](https://github.com/pymc-devs/pymc-prop/pull/14).

## Mixture log predictive and native PPC

The object PrO actually optimises is the predictive distribution induced by the empirical particle measure

$$\hat{Q}_t = \frac{1}{p}\sum_{j=1}^{p} \delta_{\vartheta_t^{(j)}}.$$

At observed data that is the mixture log predictive $\log p_{\hat{Q}_t}(y_i)$, computed in `arviz.py` with log-sum-exp over the `chain` dimension and exposed as the `mixture_log_predictive` group (no `chain` dim). `sample_stats.mixture_log_predictive_total` sums it over observations—this is the scalar PrO targets, distinct from `mean_log_score`, which averages per-particle log-score sums.

Posterior predictive checks need the same mixture semantics. Calling `pm.sample_posterior_predictive` on a PrO `DataTree` with default `sample_dims` mis-pairs multi-draw traces: you can end up mixing parameters from different retained times. [PR #13](https://github.com/pymc-devs/pymc-prop/pull/13) adds `sample_posterior_predictive_pro`, which:

1. Runs `pm.sample_posterior_predictive` on the full `(draw, chain)` grid.
2. Remixes it into draw-aligned mixture PPC draws by independently resampling a particle index per observation element at each retained snapshot.

The result lands in `posterior_predictive` with shape `(draw, *obs)`—a marginal mixture at each $Q_t$, not a joint draw from a single $\vartheta$. `sample_pro(..., include_posterior_predictive=True)` calls this automatically when the model has observed RVs.
