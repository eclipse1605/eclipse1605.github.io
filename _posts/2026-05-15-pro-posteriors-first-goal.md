---
layout: post
title: "PrO posteriors and the first goal"
date: 2026-05-15
summary: "Why we chose PrO posteriors as the starting milestone."
---

I had my first meeting with Yann, Osvaldo, Sameer, and Patrick. We spent most of the call talking through the shape of the project, the pace we should follow over the summer, and how much freedom we should leave ourselves to adjust course as the implementation develops. The plan for now is to keep the proposal timeline as a guide, while treating it as something flexible rather than fixed.

The project revolves around **Predictively Oriented (PrO) posteriors**, a recent statistical idea built around a simple but powerful shift in perspective: uncertainty should be expressed as a consequence of predictive ability. In the PrO paper, the predictive distribution becomes the main object of interest, and the posterior is chosen so that the predictive distribution it induces is as good as possible. The formal tool used to express this is a proper scoring rule \(s(p,y)\), where lower expected score means better predictive performance. If $Q$ is a posterior over parameters, then its induced posterior predictive distribution is

$$p_Q(y_{\text{new}}) = \int p(y_{\text{new}} \mid \theta)\,Q(d\theta)$$

and PrO asks us to choose $Q$ so that $p_Q$ itself is prediction optimal. The paper discusses several scoring rules in this framework, including the logarithmic score, CRPS, energy score, and squared MMD.

What makes that shift interesting is the way it behaves under model misspecification. In a well-specified model, posterior concentration is exactly what we want: as more data arrive, uncertainty should contract around the true parameter. Under misspecification, though, forcing everything into a single parameter value can produce poorly calibrated predictions. The PrO paper argues that this is the wrong target in that regime. Instead, the posterior should stabilise around a predictively optimal distribution, retaining irreducible uncertainty when the model cannot fully represent the data-generating process. The authors also show that PrO posteriors predictively dominate classical and generalised Bayes posterior predictives up to logarithmic factors.

That perspective is also why we agreed that the first milestone should be very concrete: sample from the correct posterior first. The computational side of the paper is built around Wasserstein gradient flows, where the PrO objective is descended in the space of probability measures. The exact flow depends on the unknown target measure, so the practical algorithm replaces that measure with a finite cloud of interacting particles and evolves them with a mean-field Langevin-type dynamics. The paper then discretises this flow, runs it for long enough to pass burn-in, and averages over the later iterates to approximate the PrO posterior. The authors explicitly note that the sampling machinery still needs further development before it becomes an off-the-shelf method, which makes this a very natural first target for the project.

For now, I want to understand the theory well enough to recognise when the particles are moving the right way, make the first sampler reliable, and use that as a foundation for everything that follows.