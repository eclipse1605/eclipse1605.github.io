---
layout: post
title: "Accepted into GSoC"
date: 2026-05-14
summary: "Initial reflections on joining GSoC and what I hope to learn."
---

I have been contributing to [PyMC](https://www.pymc.io/) since December 2025, and my first PR was a feature implementation of [logprob support for leaky-ReLU switch transforms](https://github.com/pymc-devs/pymc/pull/7995). That contribution was my first real introduction to the project and to probabilistic programming more broadly.

The work immediately caught my interest, but what really convinced me to stay was the community. The PyMC community was incredibly welcoming from the start. As a relatively new contributor, I spent plenty of time being confused, asking beginner questions, and making mistakes, but people were always patient and generous with their feedback. Reviews never felt intimidating. At one point I was even invited to the PyMC developers' Discord as a recurring contributor, which was a surprisingly meaningful moment for me.

Over the following months, I started considering applying for [Google Summer of Code](https://summerofcode.withgoogle.com/) (GSoC). When I went through the project ideas, one proposal immediately stood out to me: **Predictively Oriented (PrO) Posteriors**. Traditional Bayesian inference seeks to approximate the true posterior distribution implied by a model and dataset. PrO takes a different approach, constructing posterior approximations that are optimized for predictive performance rather than posterior fidelity alone. The idea seems to be motivated by a simple observation: in many practical applications, what we ultimately care about is not recovering the exact posterior, but making good predictions. That shift in perspective was fascinating to me because it challenges assumptions that are often taken for granted in Bayesian statistics.

I spent several weeks understanding the background, writing my proposal, and getting feedback. After a number of revisions and reviews, I finally submitted it and began the familiar waiting game.

You can read the proposal here: [Project proposal]({{ '/misc/proposal/' | relative_url }}).

When the results were announced on 30th April, my proposal was rejected.

Naturally, I was disappointed. I had invested a significant amount of time into the proposal and felt that it was one of the strongest pieces of technical writing I had produced. Later, I learned that the situation was largely due to organizational constraints: PyMC had received fewer slots than it had requested.

Fortunately, that was not the end of the story.

The mentors still wanted to pursue the project, and I was interested in continuing regardless of the official outcome. I had already become genuinely invested in the problem itself. Then, on 14th May, something completely unexpected happened. I woke up to an email from Google Summer of Code informing me that my proposal had been accepted. After double-checking both the dashboard and the official website several times to convince myself it was real, it finally sank in:

**I had become a GSoC 2026 contributor.**

The project itself is an implementation of **[Predictively Oriented Posteriors (PrO)](https://arxiv.org/pdf/2510.01915)**, a recently proposed approach to probabilistic inference. Traditional Bayesian methods are designed to approximate the posterior distribution as accurately as possible, but in practice we often care more about the quality of the predictions produced by that posterior. PrO starts from that observation and asks a simple question: *what if we directly optimized our posterior approximations for predictive performance?* Despite sounding like a small change in perspective, it leads to a surprisingly different way of thinking about inference.

What attracted me to the project is that it is both highly theoretically motivated and novel in practice, tackling questions about how we can build probabilistic methods that remain computationally efficient without sacrificing predictive quality. More broadly, PrO is part of a growing body of work exploring alternatives and extensions to traditional Bayesian inference, making it an exciting area of current research.

For this project, I will be working with [Yann](https://yannmclatchie.github.io/), the first author of the PrO paper, and Osvaldo, one of PyMC's GSoC mentors. In addition, two students from UCL, Sameer and Patrick, will be joining the effort and working alongside Yann on related aspects of the project. Having the opportunity to learn directly from the researcher developing these ideas really excites me.

You can find the official GSoC project page here: [Predictively Oriented Posteriors for PyMC](https://summerofcode.withgoogle.com/programs/2026/projects/Tt5OTfGg).

Although I missed part of the official community bonding period due to the unusual circumstances surrounding my acceptance, I do not think that will be much of a problem. The conversations I had with the mentors while preparing my proposal helped establish a strong working relationship, and I already have a much clearer understanding of the project's goals than I did a few weeks ago. For now, I am spending my time strengthening my understanding of the theoretical foundations behind PrO so that I can hit the ground running when the coding period begins.

I'm looking forward to the months ahead.
