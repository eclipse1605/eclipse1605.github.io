---
layout: post
title: "Learning WGF"
date: 2026-05-22
summary: "Key steps that take the PrO objective to a working particle sampler."
---

I have been reading about Wasserstein Gradient Flows (WGF) because they are the computational bridge between the PrO objective and the sampler we actually need to implement. The theory is heavy, so I tried to structure the learning around the concrete steps that turn the PrO objective into an algorithm. If you want the longer working notes, I keep them here: [WGF notes]({{ '/misc/notes-of-wgf/' | relative_url }}).

## Step 0: the target lives in distribution space

PrO asks us to find a distribution $Q$ that minimises a functional of the predictive distribution (plus a KL term to the prior). That means the variable we are optimising is itself a probability measure. So the central question becomes: what does gradient descent mean when your parameter is a distribution?

The answer is WGF: define a geometry on the space of measures, define a gradient with respect to that geometry, and then run a flow that follows the negative gradient. The algorithm we implement is a discretisation of that flow after replacing the unknown distribution with a finite set of particles.

## Step 1: choose the right geometry

The geometry has to allow small changes in a distribution to be small. KL divergence is not suitable for defining a smooth flow: even moving a Dirac mass by an infinitesimal amount produces infinite KL. Wasserstein-2, on the other hand, measures the cost of transporting mass, so $\delta_0$ and $\delta_\varepsilon$ are close when $\varepsilon$ is small. This makes Wasserstein the right geometry for a smooth descent in the space of measures.

Formally, the Wasserstein-2 distance is

$$W_2^2(\mu, \nu) = \inf_{\pi \in \Pi(\mu,\nu)} \int |x-y|^2 \, d\pi(x,y).$$

That choice fixes the notion of distance, which then fixes the notion of gradient. The intuition I keep in mind is kinetic energy: the Benamou-Brenier formula shows that Wasserstein distance is the minimum kinetic energy over all mass-preserving flows that transport $\mu_0$ to $\mu_1$. If we want a notion of "steepest descent," it makes sense to measure speed and energy in exactly this geometry.

$$W_2^2(\mu_0, \mu_1) = \inf_{(\mu_t, v_t)} \int_0^1 \int |v_t(x)|^2 \, d\mu_t(x) \, dt,$$

subject to the continuity equation $\partial_t \mu_t + \mathrm{div}(v_t \mu_t) = 0$.

This continuity equation is not just a detail; it is the reason the flow is physically meaningful. It says that probability mass is conserved as it moves through space, which is exactly what we need when the variable is a distribution.

## Step 2: compute the functional derivative

The next ingredient is the first variation $\delta\mathcal{F}/\delta\mu$. This is the analogue of a gradient for functionals: it tells us how the objective changes when we add or remove an infinitesimal amount of mass at a point. For PrO, $\mathcal{F}$ includes a scoring-rule term and a KL term, so $\delta\mathcal{F}/\delta\mu$ has two conceptual pieces: a data-driven interaction term (from the scoring rule) and a prior/entropy term (from KL).

The definition is:

$$D\mathcal{F}[\mu][\sigma] = \lim_{\varepsilon \to 0} \frac{\mathcal{F}[\mu + \varepsilon\sigma] - \mathcal{F}[\mu]}{\varepsilon},$$

and when the functional is smooth enough, this can be represented as

$$D\mathcal{F}[\mu][\sigma] = \int \frac{\delta\mathcal{F}}{\delta\mu}(x) \, d\sigma(x).$$

That $\delta\mathcal{F}/\delta\mu$ is a scalar field: it tells you the "price" of placing mass at each point. The reason this matters for computation is that the particle updates only need the spatial gradient of this price.

Once we have $\delta\mathcal{F}/\delta\mu$, the Wasserstein gradient is simply its spatial gradient:

$$\nabla_W \mathcal{F}(\mu) = \nabla\left(\frac{\delta\mathcal{F}}{\delta\mu}\right).$$

This is the key step where the geometry matters: the gradient is not just the first variation, it is the spatial gradient of that first variation. It also makes the dynamics intuitive: a particle at position $x$ sees the “energy price” $\delta\mathcal{F}/\delta\mu(x)$ and flows in the direction of decreasing price.

Two concrete examples help fix intuition:

- If $\mathcal{F}[\mu] = \int \mu\log\mu$, then $\delta\mathcal{F}/\delta\mu = \log\mu + 1$, and the WGF is the heat equation $\partial_t\mu = \Delta\mu$.
- If $\mathcal{F}[\mu] = \int V(x)\mu(x)dx$, then $\delta\mathcal{F}/\delta\mu = V$, and the flow becomes drift down the potential.

The second example is especially useful because it connects WGF to classical Langevin dynamics. If we combine entropy with a potential, the flow becomes the Fokker-Planck equation. That is exactly the density evolution associated with overdamped Langevin SDEs, which means WGF has a direct computational interpretation as a stochastic particle system.

## Step 3: write the WGF PDE

With the Wasserstein gradient in hand, the gradient flow PDE is

$$\partial_t \mu_t = \mathrm{div}\left(\mu_t \, \nabla \frac{\delta \mathcal{F}}{\delta \mu_t}\right).$$

This is the continuous-time dynamics that push the distribution downhill in the Wasserstein geometry. The flow is still abstract at this point, but it tells us the direction each piece of mass should move at time $t$. In words: the density changes by transporting mass along the gradient of the first variation, and the continuity equation enforces conservation of mass.

For the PrO objective, the flow takes the generic form above, but the first variation is more complicated because the scoring rule is applied to the posterior predictive distribution $p_Q$. That is why the interaction term in the sampler depends on the full particle system, not just a single particle.

## Step 4: turn the PDE into particles

The PDE is not directly computable, so the next step is to approximate $\mu_t$ by a finite particle system. Each particle follows a mean-field Langevin dynamic whose drift depends on the current empirical distribution. Conceptually, the drift has two terms:

1. A scoring-rule interaction term (this is the hard part and depends on the specific scoring rule, like log-score or MMD).
2. A prior gradient term, which is familiar from standard Bayesian sampling.

This is where the PrO sampler starts to look like a standard particle system, except the interaction term comes from predictive scoring rather than log-likelihood alone. For log-score, the interaction term ends up involving ratios of predictive densities (which is why ratio clipping shows up in the implementation). For MMD, it becomes a kernel mean embedding interaction.

The mean-field approximation is conceptually important: we replace the unknown measure $Q_t$ with an empirical measure over particles, and every particle experiences the aggregate effect of all other particles. This is precisely where the algorithm becomes feasible.

## Step 5: discretise with Euler-Maruyama

The particle system is an SDE, so we discretise with Euler-Maruyama. This yields the actual algorithm: initialise particles, iterate the update, drop burn-in, and average the remaining iterates to approximate $Q$. This is the part that becomes code.

At a high level, each iteration looks like:

$$\vartheta_{k+1}^{(j)} = \vartheta_k^{(j)} - \epsilon\,\Bigl(\lambda_n\,\mathcal{W}(Q_k)[\vartheta_k^{(j)}] - \nabla\log\pi(\vartheta_k^{(j)})\Bigr) + \sqrt{2\epsilon}\,\xi_k^{(j)},$$

where $\mathcal{W}$ is the scoring-rule interaction term, $\pi$ is the prior, and $\xi_k^{(j)}$ is Gaussian noise. The details of $\mathcal{W}$ are exactly the math we need to get right to implement PrO correctly. This is the stage where numerical stability questions show up: how to compute ratios safely, how to avoid degeneracy when particles collapse, and how to tune the step size $\epsilon$.

There is also an alternative viewpoint through the JKO scheme (implicit Euler in Wasserstein space): each step solves a proximal problem that trades off decreasing $\mathcal{F}$ against staying close in Wasserstein distance to the previous iterate. In practice we still implement Euler-Maruyama, but the JKO lens explains why the algorithm is stable and why it really is descending the objective.

## Step 6: diagnostics and sanity checks

Because the interaction term is subtle and the dynamics are nonlinear, the earliest experiments should focus on sanity checks: do particles move away from random initialisation, do they find the right modes, do diagnostics stabilise, do predictive checks look sensible? This is why my first notebook focused so heavily on particle spread and posterior predictive checks rather than on tuning or scalability. If those basic behaviours are wrong, the rest of the theory is not going to save us.

Putting it all together, WGF gives a structured path from an objective on distributions to a workable particle sampler: pick the right geometry, compute the first variation, write the flow, approximate with particles, discretise, and validate with diagnostics. Once that path is clear, the remaining implementation questions are concrete: how to compute the interaction term efficiently, how to stabilise ratios, and how to detect convergence in practice. This is the mental map I am using as I will move from theory to code.
