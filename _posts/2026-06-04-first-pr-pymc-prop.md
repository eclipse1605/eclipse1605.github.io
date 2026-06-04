---
layout: post
title: "First PR on pymc-prop"
date: 2026-06-04
summary: "Shipping the log-score particle engine and sample_pro entry point into pymc-prop."
---

After trying things out in notebooks and writing notes, the official coding period started on May 25th. The first big step was [PR #1](https://github.com/pymc-devs/pymc-prop/pull/1) to [pymc-prop](https://github.com/pymc-devs/pymc-prop), which merged on June 4th and brought in 1,800 lines of code.

This PR introduces a PyTensor-based engine to run log-score WGF directly from standard PyMC models. It implements an inference method that uses a mean-field, Langevin-discretized particle system in the unconstrained space of PyMC’s `value_vars`, to approximate the PrO posterior. All drift and prior-gradient computations are batched and vectorized in a single PyTensor graph, integrated with PyMC’s coordinate handling and log-probability graphs.

## What the PR adds

In short, the design focused on building a core inference engine that integrates seamlessly with PyMC while enabling mean-field particle-based approximation of the PrO posterior, all accessible through familiar conventions.

The public API is `sample_pro`:

```python
import pymc as pm
import numpy as np
from pymc_prop import sample_pro

with pm.Model() as model:
    mu = pm.Normal("mu", mu=0.0, sigma=1.0)
    pm.Normal("y", mu=mu, sigma=1.0, observed=y)

    result = sample_pro(n_particles=32, n_steps=500, random_seed=0)
```

`result.particles` has shape `(n_samples, n_particles, n_params)`. Each retained slice is one empirical particle measure $\widehat{Q}[t_i] = \frac{1}{p}\sum_{j=1}^p \delta_{\vartheta_{t_i}^{(j)}}$, kept after `burn_in` every `thinning` steps along a fixed `n_steps` horizon.

Under the hood, each time step applies

$$\vartheta^{(j)} \leftarrow \vartheta^{(j)} - \varepsilon\bigl(\lambda_n \cdot \text{wgf\_grad}^{(j)} - \nabla_\vartheta \log \pi(\vartheta^{(j)})\bigr) + \sqrt{2\varepsilon}\,\xi^{(j)},$$

where `learning_rate` is the paper's $\lambda_n$, `step_size` is $\varepsilon$, and the WGF interaction comes from the log-score leave-one-out mixture weights over particles.

## Architecture

The split I wanted was:

- Outer loop (NumPy): burn-in, thinning, particle storage, Gaussian noise.
- Inner physics (compiled once from PyMC logp graphs): prior score, per-observation likelihood scores, and the full batched log-score drift.

For log-score, the expensive part is `compile_drift_for_logscore` in `pymc_prop/compile.py`. It builds one graph that, for a batch of shape `(p, d)`, returns both the interaction drift and the prior gradient. The log-score interaction uses leave-one-out mixture densities $q_{-j}(x_i)$; we compute them in log-space with log-sum-exp, form importance weights $w_j(x_i) = p_{\vartheta^{(j)}}(x_i) / q_{-j}(x_i)$, clip $\log w_j$ for stability, and sum

$-\sum_i \tilde{w}_{j}(x_i)\,\nabla_{\vartheta} \log p(y_{i} \mid \vartheta^{(j)})$

over observations. Batching uses `pt.vectorize` over per-particle cores, with a `scan` fallback when vectorisation fails on a particular model graph.

The main coordination happens in `pymc_prop/sampler.py`. It compiles the drift function one time at the start, then runs it in a loop, each time, it passes the computed gradients to `time_step` in `pymc_prop/particles.py` to update the particles. For handling particle representations, `pymc_prop/points.py` includes utilities like `PointMapper` and `DictToArrayBijection` to convert between flat arrays (used in the engine) and PyMC's `value_vars`, keeping everything matched up with how PyMC organizes unconstrained parameter values.

## Tests and the example walkthrough

This PR includes a suite of regression tests checking core behaviors: batched compilation, correctness of the prior gradient computation, log-score WGF mechanics, and a quick smoke test with a Gaussian sampler to ensure end-to-end execution. For hands-on exploration, the showcase example is [examples/bimodal_gaussian.ipynb](https://github.com/pymc-devs/pymc-prop/blob/main/examples/bimodal_gaussian.ipynb). In this notebook, we generate data from a bimodal Gaussian mixture, then intentionally fit it with a simple (misspecified) unimodal location model using `sample_pro`. The goal is to visualize if the PrO posterior predictive can rediscover the underlying multimodal structure.

Establishing clear naming conventions and sensible defaults is challenging, but investing the effort early will make future milestones (ArviZ `InferenceData` integration, expanding to other scoring rules, and supporting constrained parameters) much smoother. Ultimately, this also helps ensure the library is accessible and intuitive for regular PyMC users.

## What did we achieve?

This PR is the milestone from [PrO posteriors and the first goal]({{ '/blog/pro-posteriors-first-goal/' | relative_url }}): **sample from the correct posterior first**, but now inside the project repo mentors and collaborators can actually run. Everything after this assumes a trustworthy log-score particle loop on arbitrary continuous models.

If you want to try it: checkout [pymc-devs/pymc-prop](https://github.com/pymc-devs/pymc-prop).