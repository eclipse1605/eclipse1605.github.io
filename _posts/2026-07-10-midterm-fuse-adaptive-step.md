---
layout: post
title: "Midterm: passing evaluation and shipping FUSE"
date: 2026-07-10
summary: "GSoC midterm cleared—and the sampler no longer needs a hand-tuned step size."
---

Midterm evaluations came back this week: I passed with an amazing feedback from the mentors. Huge thanks to them for helping out all the way. 

That is the checkpoint that says the first half of the coding period actually shipped something mentors can use—`sample_pro` with prior init, ArviZ `DataTree` output, mixture PPC, and a particle loop that matches the paper's log-score picture. The [previous post]({{ '/blog/pymc-prop-after-first-pr/' | relative_url }}) covered most of that scaffolding; the piece that closed the midterm stretch was making step size stop being a free parameter you guess wrong.

## Adaptive step size (FUSE)

[PR #14](https://github.com/pymc-devs/pymc-prop/pull/14) landed on July 6 and closes [issue #5](https://github.com/pymc-devs/pymc-prop/issues/5). By default, `sample_pro(..., step_size=None)` now runs the functional upper bound step size estimator (FUSE) from Sharrock & Nemeth (2025)—a tuning-free schedule on the space of particle measures. Pass a positive float if you still want fixed Euler–Maruyama.

The schedule lives in `pymc_prop/fuse.py` and plugs into the simulation loop in `sampler.py`. After an initial step that freezes a reference half-step cloud at floor \(r_\varepsilon\) (API: `r_eps`, default `1e-5`), later steps follow the forward-flow update

$$
\eta_t = \frac{\bar{r}_t}{\sqrt{G_t}},
\qquad
G_t = \sum_{s=1}^{t} g_s^2,
\qquad
\bar{r}_t = \max\!\bigl(r_\varepsilon,\; \max_{1\le s\le t} d_s\bigr).
$$

Gradient energy \(g_s^2\) is the mean squared **raw** drift \(\zeta = \text{wgf\_grad} - \text{prior\_grad}\) (no `learning_rate`). Particle motion and the half-step clouds still use the **scaled** drift \(\lambda_n\cdot\text{wgf\_grad} - \text{prior\_grad}\). That split matters: the schedule tracks the geometry of the flow field, while `learning_rate` stays the paper's \(\lambda_n\) on the interaction term alone.

Diagnostics land in `sample_stats` as `fuse_step_size`, `fuse_gradient_energy`, and `fuse_half_step_distance_sq`, so you can plot how \(\eta_t\) moved without digging into internal state. The bimodal Gaussian notebook was rerun with FUSE as the default path; `tests/test_fuse.py` covers the schedule bookkeeping.

```python
# adaptive (default)
dt = sample_pro(n_particles=32, n_steps=500, tune=200, random_seed=0)

# fixed step still available
dt = sample_pro(..., step_size=1e-3)
```

One naming caveat carries over from the `tune` rename: `tune` is still discard-only warmup. Adaptation of \(\eta_t\) now happens **throughout** the run via FUSE when `step_size=None`; it is not a PyMC-style dual averaging phase confined to the first `tune` steps.

## Where midterm leaves the project

Relative to the midterm proposal goals, the public surface is in good shape for unconstrained continuous models. The next half of GSoC will be more about the hard edges—constrained parameters / mirror WGF ([issue #6](https://github.com/pymc-devs/pymc-prop/issues/6)), scoring-rule breadth, and making the compiled graphs cheaper so larger models are pleasant to run.