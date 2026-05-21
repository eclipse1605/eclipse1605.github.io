---
layout: misc
title: WGF Notes
math: true
permalink: /misc/notes-of-wgf/
summary: Working notes on Wasserstein gradient flows.
misc_type: markdown
source: /misc/notes-of-wgf.md
---

# WGF Notes

Below is the working note as a rendered page.

---

<div class="hero-links" style="margin:12px 0;">
  <a class="btn" href="/misc/notes%20of%20wgf.pdf" download>Download PDF — WGF notes</a>
  <a class="btn ghost" href="/misc/notes%20of%20wgf.pdf" target="_blank" rel="noopener">Open PDF</a>
</div>

wgf is gradient descent but for if a position is an entire probability distribution $\mu$.

basically if the thing you want to minimise is a functional $\mathcal{F}[\mu]$ that take a distribution as input and gives an output as a number

then can you write down a velocity for a distribution? can you flow downhill in the space of distributions?

for this 3 things are req
- notion of distance between distributions to define motion.
- notion of gradient of a functional $\mathcal{F}[\mu]$ so you know which direction is downhill.
- and the two things need to be compatible, i.e., the gradient must be defined with respect to the same geometry that the distance measures.

---
### why not use kl divergence for dist?

kl divergence is the most natural way to compare two distributions

$$\text{KL}(\mu \mid \nu) = \int \mu(x) \log \frac{\mu(x)}{\nu(x)} dx$$

its a weighted average of $\log(\mu/\nu)$, where the weights come from $\mu$ itself.

my understanding of it is just how different is $\mu$ from $\nu$.

so large values mean the two distributions are very different and $\text{KL}=0$ means $\mu = \nu$.

taking a trivial example of two dirac deltas, $\mu = \delta_0$ and $\nu = \delta_\varepsilon$. these two distributions look visually almost identical for small $\varepsilon$. for this what would be $\text{KL}(\mu \mid \nu)$?

the density of $\mu$ is zero everywhere except at 0, and the density of $\nu$ is zero everywhere except at $\varepsilon$.

so the ratio $\mu(x)/\nu(x)$ is undefined where one is zero and the other isnt.

so the integral is infinite. $\text{KL}(\delta_0 \mid \delta_\varepsilon) = +\infty$ for any $\varepsilon > 0$

now if you try to do gradient descent on a functional involving kl, the energy landscape would have infinite walls everywhere. you cant move a distribution even a lil without the energy blowing up.

so there is no smooth path from $\delta_0$ to $\delta_\varepsilon$, no gradient, no flow.

what should the distance actually say?

$\delta_0$ and $\delta_\varepsilon$ are close when $\varepsilon$ is small.

the distance distance should respects the underlying geometry of the space $\mathbb{R}^n$ in which the distributions live.

kl only looks at whether the density values match at each point, with no awareness that points can be near each other in space.

---
### wasserstein-2 distance

think of $\mu$ as a pile of sand shaped like one distribution, and $\nu$ as a pile of sand shaped like another. we want a number that measures the work req to rearrange the sand from the shape of $\mu$ into the shape of $\nu$.

work depends on two things:
- how much sand you move (mass)
- how far you move it (distance)

wasserstein-2 distance gives us this, formally defined as

$$W_2^2(\mu, \nu) = \inf_{\pi \in \Pi(\mu,\nu)} \int_{\mathbb{R}^n \times \mathbb{R}^n} \lvert x - y\rvert^2 , d\pi(x, y)$$

here
- $\pi(x, y)$ is a coupling. its a joint probability distribution on pairs $(x, y)$ where $x$ comes from the source and $y$ from the target.
  - we can think of $\pi(x, y)$ as a matrix (or  a joint density in the continuous case) where the entry at position $(x, y)$ tells us the amount of mass that was sitting at $x$ which gets moved to $y$.
- the constraints $\pi \in \Pi(\mu, \nu)$ say that $\pi$ must have the right marginals: $\int_y d\pi(x,y) = d\mu(x)$ and $\int_x d\pi(x,y) = d\nu(y)$.
  - first says: all the mass that leaves $x$ totals exactly what $\mu$ has at $x$
  - second says: the total mass arriving at $y$ is exactly what $\nu$ needs there.
- $\lvert x - y\rvert^2$ is the cost of moving a unit of mass from $x$ to $y$.
- so $\int \lvert x-y\rvert^2 d\pi(x,y)$ is the total cost of the transport plan $\pi$: add up cost times mass for every pair. the infimum over all valid $\pi$ picks the cheapest possible transport plan.

for the above dirac delta example, $W_2^2(\delta_0, \delta_\varepsilon)$ asks whats the cheapest way to move all the mass from 0 to $\varepsilon$? the only valid coupling is $\pi = \delta_{(0,\varepsilon)}$, that is, move everything from 0 to $\varepsilon$.  the cost is $\lvert 0 - \varepsilon\rvert^2 = \varepsilon^2$. so $W_2(\delta_0, \delta_\varepsilon) = \varepsilon$ and as $\varepsilon \to 0$, the distance goes to zero.

---
### how does the optimal plan look like?

in principle, $\pi$ could be stochastic meaning it could split the mass at $x$  and 40% goes to $y_1$ and 60% goes to $y_2$. but breniers theorem says a split is never req.

**theorem**: if $\mu$ is absolutely continuous (has a density, no point masses), then the unique optimal transport plan is deterministic, meaning, there exists a convex function $\psi: \mathbb{R}^n \to \mathbb{R}$ such that the optimal $\pi$ is supported on the graph of $T = \nabla\psi$, i.e.,

$$\pi = (\text{id}, T)_{\#}\mu, \qquad T = \nabla\psi$$

the map $T$ sends each point $x$ to exactly one point $T(x)$. every grain of sand at location $x$ goes to location $T(x)$ without splitting.

the total cost is $\int \lvert x - T(x)\rvert^2 d\mu(x)$, which is just the sum up squared distances traveled, weighted by mass.

the interesting part is that $T$ must be a gradient of a convex function.

why does convexity matters? (v beautiful)

the condition that $T = \nabla\psi$ for convex $\psi$ is equivalent to saying the transport map is cyclically monotone. so the transport paths never cross each other.

for example in 1D the optimal way to move from $\mu$ to $\nu$ is to sort them and match them

now in higher dimensions, the same non crossing condition is equivalent to $T$ being a subdifferential of a convex function.

why should we even care that $T = \nabla\psi$?

because it means the velocity field that particles follow during transport has zero curl, its purely a gradient field -> no rotation -> no wasted motion.

every particle moves in the most direct way possible given the constraint that all particles together transform $\mu$ into $\nu$.

the function $\psi$ is called the kantorovich potential or transport potential.

its like a pressure field that drives the motion. particles move from regions of high $\psi$ to low $\psi$ along its gradient.

---
### distance as kinetic energy

now we have a distance $W_2(\mu, \nu)$ between two distributions. but for a gradient flow, we need to talk about curves of distributions and their speed.

in riemannian geometry, the length of a curve $\gamma(t)$ from time 0 to time 1 is $\int_0^1 \lvert\dot{\gamma}(t)\rvert dt$, and the distance between two points is the length of the shortest curve connecting them.

we need something analogous to this for wasserstein.

the benamou-brenier formula says

$$W_2^2(\mu_0, \mu_1) = \inf_{(\mu_t, v_t)} \int_0^1 \int_{\mathbb{R}^n} \lvert v_t(x)\rvert^2 , d\mu_t(x) , dt$$

where the infimum is over all pairs $(\mu_t, v_t)$ satisfying the continuity equation:

$$\partial_t \mu_t + \text{div}(v_t \mu_t) = 0$$

this is prolly the most important part of this whole thing.

here,
- $\mu_t$ is a curve of probability distributions parameterised by time $t \in [0,1]$.
- $v_t(x)$ is a velocity field at time $t$. it assigns to each location $x$ a velocity vector $v_t(x) \in \mathbb{R}^n$
- the continuity equation $\partial_t \mu_t + \text{div}(v_t \mu_t) = 0$ is the mathematical statement of mass conservation (basically just gauss's law from electromagnetism).
  - the term $\partial_t \mu_t$ is the rate of change of density at each point (how fast mass is accumulating or depleting at $x$).
  - the term $\text{div}(v_t \mu_t)$ measures how much mass is flowing out of each point ($v_t \mu_t$ is the mass flux (mass times velocity = flow rate))
  - the divergence measures how much is spreading out versus converging.
  - the equation says these two cancel meaning density increases exactly when flux converges, decreases when flux diverges.

the quantity $\int \lvert v_t(x)\rvert^2 d\mu_t(x)$ is the instantaneous kinetic energy of the entire distribution at time $t$. it implies fast particles or many particles moving at once both contribute more energy.

the formula says that the squared wasserstein distance equals the minimum total kinetic energy accumulated over all mass-conserving flows from $\mu_0$ to $\mu_1$. sending $\mu_0$ to $\mu_1$ cheaply means finding a flow that uses as little kinetic energy as possible.

now, the optimal flow in benamou-brenier moves each particle in a straight line at constant velocity ($x_t = (1-t)x + tT(x)$, where $T = \nabla\psi$ is the brenier map).

straight lines minimise the kinetic energy because any detour would mean particles travel farther and accumulate more energy.

this frmula casts the wasserstein distance as the length of the shortest path through the space of probability distributions, which is exactly like riemannian arc length. the curve $\mu_t$ that achieves the minimum is the geodesic between $\mu_0$ and $\mu_1$.

---
### the space of distributions is riemannian

need to understand riemannian manifold.

a riemannian manifold is a space $M$ where at each point $p$, there is a tangent space $T_p M$ of directions you can move, and a smoothly varying inner product $g_p(\cdot, \cdot)$ on that tangent space.

the inner product tells you the length of a tangent vector and the angle between two tangent vectors.

grom the inner product, you get lengths of curves: $L(\gamma) = \int_0^1 \sqrt{g_{\gamma(t)}(\dot{\gamma}(t), \dot{\gamma}(t))} , dt$.

and from lengths of curves, you get distances: $d(p, q) = \inf_\gamma L(\gamma)$.

otto observed that the space of probability distributions $\mathcal{P}_2(\mathbb{R}^n)$ has exactly this structure, with the following identifications:
- the point at each moment of the flow is a probability distribution $\mu$.
- the tangent space at $\mu$ consists of all vector fields $\nabla\phi$ for smooth functions $\phi$.
- the metric on the tangent space is $g_\mu(\nabla\phi, \nabla\psi) = \int_{\mathbb{R}^n} \nabla\phi(x) \cdot \nabla\psi(x) , d\mu(x)$.

why are tangent vectors gradient fields?

a tangent vector at $\mu$ should be the velocity of some curve of distributions passing through $\mu$ at time 0.

so if $\mu_t$ is such a curve, its velocity is $\partial_t \mu_t \rvert_{t=0}$, which is some signed measure (it tells you where mass is being added and where its being removed).

then the continuity equation says $\partial_t \mu_t = -\text{div}(v_t \mu_t)$, so every velocity of a distribution curve corresponds to some velocity field $v_t$.

now, (imp) for any velocity field $v_t$, the kinetic energy $\int \lvert v_t\rvert^2 d\mu_t$ is minimised when $v_t$ is curl-free, i.e, when $v_t = \nabla\phi_t$ for some scalar potential $\phi_t$.

the rotational part of $v_t$ contributes kinetic energy but doesnt move the distribution (swirling doesnt translate mass).

so the minimum energy representative of each direction of change is always a gradient field. this is why the tangent space consists of gradient fields.

like in fluid mechanics, helmholtz decomposition says any vector field splits into a curl-free part ($\nabla\phi$) and a divergence-free part ($\nabla \times A$). the divergence-free part represents circulation (it moves fluid around without compressing or expanding it).

for  mass transport purposes, circulation wastes energy without doing useful work. The efficient part is always $\nabla\phi$.

but why is the metric $g_\mu(\nabla\phi, \nabla\psi) = \int \nabla\phi \cdot \nabla\psi , d\mu$?

from the B-B formula, squared speed of the curve $\mu_t$ at time $t$ must equal $\frac{d}{ds}^2 W_2^2(\mu_t, \mu_{t+s})\rvert_{s=0}$  (infinitesimal kinetic energy).

but the formula  says the kinetic energy of a curve with velocity field $v_t = \nabla\phi_t$ is $\int \lvert v_t\rvert^2 d\mu_t = \int \lvert\nabla\phi_t\rvert^2 d\mu_t$.

this is exactly the squared norm $g_\mu(\nabla\phi, \nabla\phi)$ under the metric above.

soo the metric is precisely what makes benamou-brenier into a riemannian arc length formula.

the metric $g_\mu$ is a weighted $L^2$ inner product. what does this even mean though

$\int \nabla\phi \cdot \nabla\psi , d\mu$ weights the pointwise dot product $\nabla\phi(x) \cdot \nabla\psi(x)$ by the mass $d\mu(x)$ at each location $x$.

so regions with more mass contribute more to the inner product. a velocity field pointing in a direction where theres lots of mass moves the distribution more than one pointing into a region with little mass.

---
### the derivative of a functional

how to differentiate a even functional.

in normal calc, the derivative of $f: \mathbb{R}^n \to \mathbb{R}$ at $x$ in direction $v$ is:

$$Df(x)[v] = \lim_{\varepsilon \to 0} \frac{f(x + \varepsilon v) - f(x)}{\varepsilon}$$

so for a functional $\mathcal{F}[\mu]$ that takes a distribution and gives a number, we perturb $\mu$ by a tiny signed measure $\sigma$ (add a little mass somewhere and remove a little elsewhere), and ask how $\mathcal{F}$ responds:

$$D\mathcal{F}[\mu][\sigma] = \lim_{\varepsilon \to 0} \frac{\mathcal{F}[\mu + \varepsilon\sigma] - \mathcal{F}[\mu]}{\varepsilon}$$

if $\mathcal{F}$ is nice enough, this linear functional of $\sigma$ can be represented as an inner product:

$$D\mathcal{F}[\mu][\sigma] = \int \frac{\delta\mathcal{F}}{\delta\mu}(x) , d\sigma(x)$$

the function $\frac{\delta\mathcal{F}}{\delta\mu}(x)$ is called the first variation of $\mathcal{F}$ at $\mu$.

its a function of position $x$. its value at $x$ tells you: if i add a tiny dirac delta of mass at location $x$, how much does $\mathcal{F}[\mu]$ change?

its the price of placing mass at $x$.
- expensive locations (high $\delta\mathcal{F}/\delta\mu$) are ones where adding mass increases the energy a lot.
- cheap locations are where adding mass barely changes the energy.

computing for two examples.

entropy: $\mathcal{F}[\mu] = \int \mu(x) \log \mu(x) , dx$.

perturb: $\mathcal{F}[\mu + \varepsilon\sigma] = \int (\mu+\varepsilon\sigma)\log(\mu+\varepsilon\sigma) dx$.

expand using $\log(\mu+\varepsilon\sigma) \approx \log\mu + \varepsilon\sigma/\mu$ for small $\varepsilon$:

$$\mathcal{F}[\mu + \varepsilon\sigma] \approx \int (\mu+\varepsilon\sigma)(\log\mu + \varepsilon\sigma/\mu) dx \approx \mathcal{F}[\mu] + \varepsilon\int\sigma\log\mu , dx + \varepsilon\int\sigma , dx$$

since $\sigma$ is a signed measure with $\int \sigma = 0$ (youre not changing the total mass), the last term vanishes.

so

$$D\mathcal{F}[\mu][\sigma] = \int \sigma(x) \log\mu(x) , dx + \int\sigma , dx = \int \sigma(x)(\log\mu(x) + 1) , dx$$

therefore $\frac{\delta\mathcal{F}}{\delta\mu}(x) = \log\mu(x) + 1$.

this means the price of adding mass at location $x$ under the entropy functional is $\log\mu(x) + 1$ which is proportional to the log of the current density.
- adding mass where density is already high is expensive (large $\log\mu$).
- adding mass where density is low is cheap (small $\log\mu$, possibly negative).

this also makes sense cuz entropy wants mass spread out, so it penalises adding more to already dense regions.

second example is potential energy: $\mathcal{F}[\mu] = \int V(x) \mu(x) , dx$.

perturb: $\mathcal{F}[\mu+\varepsilon\sigma] = \int V(x)(\mu+\varepsilon\sigma) dx = \mathcal{F}[\mu] + \varepsilon\int V\sigma , dx$.

therefore $\frac{\delta\mathcal{F}}{\delta\mu}(x) = V(x)$.

this just means that adding mass to a high potential region costs more. which makes sense

---
### where does steepest descent point?

in a riemannian manifold, the gradient $\text{grad}_{g}\mathcal{F}$ at a point $\mu$ is defined by the identity: for every tangent vector $\nabla\phi$,

$$g_\mu(\text{grad}_W \mathcal{F}, \nabla\phi) = D\mathcal{F}[\mu][\text{direction corresponding to }\nabla\phi]$$

the rhs side is the directional derivative of $\mathcal{F}$ in the direction $\nabla\phi$. and the lhs defines the gradient as the unique tangent vector whose inner product with any direction equals the directional derivative in that direction.

this is exactly how gradients are defined in any inner product space.

understanding rhs:
if $\mu_t$ is a curve with velocity field $v_t = \nabla\phi$ (so its tangent at $t=0$ is $\nabla\phi$), then by the continuity equation, $\partial_t\mu_t = -\text{div}(\mu_t \nabla\phi)$. The directional derivative is:

$$D\mathcal{F}[\mu][-\text{div}(\mu\nabla\phi)] = \int \frac{\delta\mathcal{F}}{\delta\mu}(x) \cdot (-\text{div}(\mu\nabla\phi)) , dx$$

so we have $-\text{div}(\mu\nabla\phi)$ as the perturbation $\sigma$. integration by parts (shifting the derivative from the divergence onto the first variation) gives

$$\int \frac{\delta\mathcal{F}}{\delta\mu} \cdot (-\text{div}(\mu\nabla\phi)) , dx = \int \nabla\left(\frac{\delta\mathcal{F}}{\delta\mu}\right) \cdot \nabla\phi , d\mu$$

here we have the integral $\int f \cdot (-\text{div}(\mathbf{g})) dx$ where $f = \delta\mathcal{F}/\delta\mu$ and $\mathbf{g} = \mu\nabla\phi$.

the integration by parts identity for this situation is $\int f(-\text{div},\mathbf{g}) dx = \int \nabla f \cdot \mathbf{g} , dx = \int \nabla f \cdot \nabla\phi , d\mu$.

this is the vector calc identity $\int f \text{div},\mathbf{g} = -\int \nabla f \cdot \mathbf{g}$ (with boundary terms vanishing for distributions that decay at infinity).

so the directional derivative becomes $\int \nabla(\delta\mathcal{F}/\delta\mu) \cdot \nabla\phi , d\mu$.

now understanding lhs:

$$g_\mu(\text{grad}_W\mathcal{F}, \nabla\phi) = \int \text{grad}_W\mathcal{F} \cdot \nabla\phi , d\mu$$

comparing with the right-hand side:

$$\int \underbrace{\text{grad}_W\mathcal{F}(x)}_{\text{what we want}} \cdot \nabla\phi(x) , d\mu(x) = \int \underbrace{\nabla\left(\frac{\delta\mathcal{F}}{\delta\mu}(x)\right)}_{\text{what we computed}} \cdot \nabla\phi(x) , d\mu(x)$$

since this must hold for _every_ $\nabla\phi$, the two integrands must match:

$$\boxed{\text{grad}_{W_2}\mathcal{F}\mu = \nabla\left(\frac{\delta\mathcal{F}}{\delta\mu}\right)(x)}$$

this means the wasserstein gradient is not $\delta\mathcal{F}/\delta\mu$ itself but the spatial gradient of $\delta\mathcal{F}/\delta\mu$.

imp:
- $\delta\mathcal{F}/\delta\mu(x)$ is a scalar function (it tells you the energy price of placing mass at position $x$).
- gradient $\nabla(\delta\mathcal{F}/\delta\mu)(x)$ is a vector it tells you in which direction the price is increasing most steeply at $x$.

the first variation $\delta\mathcal{F}/\delta\mu$ is like a pressure field so particles naturally flow from high pressure to low pressure, which means they move in the direction of $-\nabla(\delta\mathcal{F}/\delta\mu)$. omg this is gradient descent!

---
### assembling the equation of motion

now we have the wassserstein gradient. writing the gradient flow is ez now. following the negative gradient:

$$\frac{d\mu_t}{dt} = -\text{grad}_{W_2}\mathcal{F}[\mu_t] \quad \text{in the riemannian sense}$$

means via the continuity equation that the distribution moves with velocity $-\text{grad}_{W_2}\mathcal{F} = -\nabla(\delta\mathcal{F}/\delta\mu)$:

$$\partial_t \mu_t = -\text{div}\left(\mu_t \cdot \left(-\nabla\left(\frac{\delta\mathcal{F}}{\delta\mu_t}\right)\right)\right) = \text{div}\left(\mu_t \cdot \nabla\left(\frac{\delta\mathcal{F}}{\delta\mu_t}\right)\right)$$

this says the density $\mu_t$ at position $x$ changes because mass is flowing.

the flux of mass at $x$ is $J_t(x) = \mu_t(x) \cdot \nabla(\delta\mathcal{F}/\delta\mu_t)(x)$ (its the amount of mass at $x$ times the velocity each particle at $x$ has).

the divergence $\text{div}(J_t)$ is the net flow of mass out of each point. so wen $\text{div}(J_t)$ is positive, mass is leaving (density decreases) and wen its negative, mass is accumulating (density increases).

particles move in the direction $\nabla(\delta\mathcal{F}/\delta\mu)$ meaning they flow up the gradient of the first variation, away from where the energy price is low, toward where its high?

wait what?

the gradient flow moves in the direction of negative gradient, so particles actually move in direction $-\nabla(\delta\mathcal{F}/\delta\mu)$,

but notice in the pde above, we have $+\text{div}(\mu \nabla(\delta\mathcal{F}/\delta\mu))$, not minus.

wasserstein gradient is $\nabla(\delta\mathcal{F}/\delta\mu)$.

the negative wasserstein gradient is $-\nabla(\delta\mathcal{F}/\delta\mu)$.

following the negative gradient means velocity $v_t = -\nabla(\delta\mathcal{F}/\delta\mu_t)$.

the continuity equation is $\partial_t\mu_t = -\text{div}(\mu_t v_t) = -\text{div}(\mu_t \cdot (-\nabla(\delta\mathcal{F}/\delta\mu_t))) = +\text{div}(\mu_t \nabla(\delta\mathcal{F}/\delta\mu_t))$.

so the sign is correct. mass flows in the direction $-\nabla(\delta\mathcal{F}/\delta\mu)$ (downhill on first variation)

which means it accumulates where the divergence of the flux is negative, i.e., where the flow converges.

regions of high $\delta\mathcal{F}/\delta\mu$ emit mass, and regions of low $\delta\mathcal{F}/\delta\mu$ receive mass.

so the distribution essentially redistributes itself to lower the energy $\mathcal{F}$.

---
### complete example of entropy

entropy: $\mathcal{F}[\mu] = \int \mu(x)\log\mu(x) , dx$.

we already computed $\delta\mathcal{F}/\delta\mu = \log\mu + 1$.

wasserstein gradient: $\nabla(\log\mu + 1) = \nabla\log\mu = \frac{\nabla\mu}{\mu}$.

plug into the gradient flow pde:

$$\partial_t\mu_t = \text{div}\left(\mu_t \cdot \frac{\nabla\mu_t}{\mu_t}\right) = \text{div}(\nabla\mu_t) = \Delta\mu_t$$

this is literally the heat equation

the velocity of each particle is $v_t = -\nabla\log\mu_t = -\nabla\mu_t/\mu_t$.

the speed is proportional to the steepness of the log density gradient. (near a peak of $\mu$, the gradient is steep, particles rush out quickly. near a flat region, the gradient is small, particles barely move).

in brownian motion, particles drift from dense regions to sparse regions.

the continuity equation converts this particle motion into an equation for the density, and the result is $\partial_t\mu = \Delta\mu$ - heat spreads out.

what about entropy tho?

the heat equation maximises entropy over time (2nd law of thermo (h-theorem))

it drives any distribution toward the uniform distribution (in a bounded domain) or toward a gaussian (in $\mathbb{R}^n$ with appropriate rescaling), which are the maximum entropy distributions.

the wgf of entropy is exactly the pde that realises this maximisation.

---
### fokker-planck eqn

free energy: $\mathcal{F}[\mu] = \underbrace{\int\mu\log\mu , dx}_{\text{entropy}} + \underbrace{\int V(x)\mu(x) , dx}_{\text{potential energy}}$.

first variation: $\frac{\delta\mathcal{F}}{\delta\mu} = \log\mu + 1 + V$.

wasserstein gradient: $\nabla(\log\mu + 1 + V) = \frac{\nabla\mu}{\mu} + \nabla V$.

gradient flow:

$$\partial_t\mu_t = \text{div}\left(\mu_t\left(\frac{\nabla\mu_t}{\mu_t} + \nabla V\right)\right) = \text{div}(\nabla\mu_t) + \text{div}(\mu_t\nabla V) = \Delta\mu_t + \text{div}(\mu_t\nabla V)$$

- $\Delta\mu_t$ is diffusion
- $\text{div}(\mu_t\nabla V)$ is the effect of the potential.
  - $\nabla V(x)$ is the gradient of the potential at $x$ (it points uphill on $V$).
  - the particle velocity from this term is $-\nabla V(x)$ (we follow the negative gradient of $\delta\mathcal{F}/\delta\mu$, and $V$ contributes $\nabla V$ to the wasserstein gradient).
  - so particles move in the direction $-\nabla V$ (downhill on $V$).
  - obv because a potential $V$ creates a force $F = -\nabla V$ that pushes particles downhill.

so the fp eqn describes a population of particles that are simultaneously:
1. diffusing randomly due to thermal fluctuations (the $\Delta\mu$ term)
2. being pushed by an external force field $-\nabla V$ (the $\text{div}(\mu\nabla V)$ term) (brownian motion in a potential well).

for eqm, the flow stops when $\partial_t\mu = 0$, which requires both terms to cancel.

setting $\text{div}(\nabla\mu + \mu\nabla V) = 0$, one can show the solution is $\mu^* \propto e^{-V(x)}$.

if
$$
\mu^* = \frac{e^{-V}}{Z},
$$
then
$$
\nabla \mu^*
= \nabla\!\left(\frac{e^{-V}}{Z}\right)
= -\frac{e^{-V}}{Z}\,\nabla V
= -\mu^* \nabla V.
$$

so
$$
\nabla \mu^* + \mu^* \nabla V
= -\mu^* \nabla V + \mu^* \nabla V
= 0.
$$

hence the flux vanishes everywhere:
$$
J = -\bigl(\nabla \mu^* + \mu^* \nabla V\bigr)=0.
$$

sys has reached equilibrium.

$\mu^* = e^{-V}/Z$ is gibbs/boltzmann distribution the

this tells us that particles accumulate in low energy regions (small $V$), with exponentially smaller probability of being in high energy regions.

this connection between langevin dynamics (the sde $dX_t = -\nabla V(X_t) dt + \sqrt{2} dB_t$) and the fp equation is nice.
- the sde describes individual particle trajectories.
- the fp describes how the probability density evolves.
- wgf is the bridge: the density evolves by minimising free energy, and this minimisation corresponds exactly to the stochastic particle dynamics.

this is the foundation of mcmc

---
### how to make this computable?

$\partial_t\mu_t = \text{div}(\mu_t\nabla(\delta\mathcal{F}/\delta\mu_t))$ is hard to use computationally because its a nonlinear pde.

discretising it with explicit time stepping requires extremely small steps (the cfl condition: $\tau \leq C\Delta x^2$) to avoid numerical instability.

for fine spatial grids, this means many many many time steps.

we use jko scheme to avoids this by using implicit time stepping in wasserstein space.

explicit euler: $x_{k+1} = x_k - \tau\nabla f(x_k)$. we evaluate the gradient at the current point and step forward.

implicit euler: $x_{k+1} = x_k - \tau\nabla f(x_{k+1})$.

we evaluate the gradient at the new point.

this is implicit because $x_{k+1}$ appears on both sides.

solving it is eq to:

$$x_{k+1} = \underset{x}{\arg\min}; f(x) + \frac{1}{2\tau}\lvert x - x_k\rvert^2$$

in this ot we want to decrease $f(x)$, but we dont wanna move v far from $x_k$ (the penalty $\lvert x-x_k\rvert^2/2\tau$).

the parameter $\tau$ controls the tradeoff: large $\tau$ means the penalty is weak, you can take big steps; small $\tau$ means you can only move a little.

we replace $x \in \mathbb{R}^n$ with $\mu \in \mathcal{P}_2(\mathbb{R}^n)$, replace $f$ with $\mathcal{F}$, and replace $\lvert x-x_k\rvert^2$ with $W_2^2(\mu, \mu_k)$:

$$\mu_{k+1} = \underset{\mu \in \mathcal{P}_2}{\arg\min}; \mathcal{F}[\mu] + \frac{1}{2\tau}W_2^2(\mu, \mu_k)$$

we want to find the distribution $\mu$ that minimises the sum of two competing terms:
- $\mathcal{F}[\mu]$ pulls $\mu$ toward the minimum of the energy. it wants $\mu$ to be as close to the equilibrium distribution as possible.
- $\frac{1}{2\tau}W_2^2(\mu, \mu_k)$ is the wasserstein dist squared from the current distribution $\mu_k$, divided by $2\tau$. its like a trust region (it penalises moving too far from $\mu_k$ in one step).
  - the smaller $\tau$, the more expensive its to move, so the smaller the step.

theres a balance  b/w these two forces to determines $\mu_{k+1}$: move as far as possible toward the energy minimum without straying too far from the current position.

why is this automatically energy stable though?

at the optimal $\mu_{k+1}$, we have:

$$\mathcal{F}[\mu_{k+1}] + \frac{1}{2\tau}W_2^2(\mu_{k+1}, \mu_k) \leq \mathcal{F}[\mu_k] + \frac{1}{2\tau}W_2^2(\mu_k, \mu_k) = \mathcal{F}[\mu_k]$$

the inequality holds because $\mu_{k+1}$ is the minimiser (it beats any competitor, including $\mu_k$ itself (which gives the rhs, since $W_2(\mu_k, \mu_k) = 0$)).

so

$$\mathcal{F}[\mu_{k+1}] \leq \mathcal{F}[\mu_k] - \frac{1}{2\tau}W_2^2(\mu_{k+1}, \mu_k)$$

the energy decreases by at least $\frac{1}{2\tau}W_2^2(\mu_{k+1},\mu_k)$ at every step, regardless of how large $\tau$ is

---
### recovering the pde from the jko step

at the minimiser $\mu_{k+1}$, first order optimality requires that the variation of the objective with respect to $\mu$ vanishes.

the variation of $\mathcal{F}[\mu]$ gives $\delta\mathcal{F}/\delta\mu$.

the variation of $W_2^2(\mu, \mu_k)$ with respect to $\mu$ at the minimiser is the negative kantorovich potential $-\phi$ from the optimal transport from $\mu_{k+1}$ to $\mu_k$ (this comes from the envelope theorem applied to the dual formulation of optimal transport).

the optimality condition is:

$$\frac{\delta\mathcal{F}}{\delta\mu}\bigg\rvert_{\mu_{k+1}} - \frac{\phi}{\tau} = \text{constant on supp}(\mu_{k+1})$$

where $\nabla\phi$ is the optimal transport map from $\mu_{k+1}$ to $\mu_k$ (by Brenier, $\nabla\phi$ pushes $\mu_{k+1}$ forward to $\mu_k$).

this says that at the optimal next distribution, the gradient of the energy $\delta\mathcal{F}/\delta\mu$ must equal $\phi/\tau$ plus a constant, everywhere that theres mass.

rearranging: $\phi = \tau(\delta\mathcal{F}/\delta\mu - c)$. So $\nabla\phi = \tau\nabla(\delta\mathcal{F}/\delta\mu)$ (constant vanishes in gradient).

and the optimal transport map is $\nabla\phi: x \mapsto x + \nabla\phi(x) = x + \tau\nabla(\delta\mathcal{F}/\delta\mu)(x)$.

but $\nabla\phi$ pushes $\mu_{k+1}$ to $\mu_k$.

so each particle at $x$ in $\mu_{k+1}$ came from location $x + \tau\nabla(\delta\mathcal{F}/\delta\mu)(x)$ in $\mu_k$.

meaning particles moved from $\mu_k$ to $\mu_{k+1}$ by shifting from $x + \tau\nabla(\delta\mathcal{F}/\delta\mu)$ to $x$, i.e., each particle moved in the direction $-\tau\nabla(\delta\mathcal{F}/\delta\mu)$.

the velocity is $-\nabla(\delta\mathcal{F}/\delta\mu)$, exactly minus the wasserstein gradient.

now, the continuity equation for this particle motion gives:

$$\frac{\mu_{k+1} - \mu_k}{\tau} = \text{div}\left(\mu_{k+1}\nabla\left(\frac{\delta\mathcal{F}}{\delta\mu_{k+1}}\right)\right) + O(\tau)$$

as $\tau \to 0$, this converges to:

$$\partial_t\mu_t = \text{div}\left(\mu_t\nabla\left(\frac{\delta\mathcal{F}}{\delta\mu_t}\right)\right)$$

this is the continuous wgf.

---
### where does the flow stop?

the flow is at rest when $\partial_t\mu_t = 0$. this requires $\text{div}(\mu_t\nabla(\delta\mathcal{F}/\delta\mu_t)) = 0$, which (under appropriate conditions) means $\nabla(\delta\mathcal{F}/\delta\mu_t) = 0$ on the support of $\mu_t$.

$\nabla(\delta\mathcal{F}/\delta\mu) = 0$ means the first variation is constant on the support of $\mu$ (there are no spatial gradients of the energy price.)

every location in the support has the same energy price.

theres no incentive to move mass from anywhere to anywhere else, the pressure field is flat.

this is the wasserstein analogue of $\nabla f = 0$ at a minimum.

the speed at which the flow converges to equilibrium is governed by the geometry of the energy landscape around $\mu^*$

by the log-sobolev inequality for the potential $V$, if $V$ is strongly convex, the log-sobolev inequality holds, and the flow converges exponentially fast.

this is the content of bakry-emery theory, which is the wasserstein-space analogue of how strong convexity guarantees fast convergence in finite dimensional optimisation.

---
### summary time

we have a functional $\mathcal{F}[\mu]$ on the space of probability distribution and we want to minimise it using gradient descent.

to run gradient descent, we need a geometry on the space of distributions.

the natural geometry is given by the cost of transporting mass: the wasserstein-2 geometry.

two distributions are close if you can transform one into the other by moving mass a small total distance.

this geometry has a riemannian structure meaning at each distribution $\mu$, tangent vectors are gradient fields $\nabla\phi$, and the metric is the $L^2(\mu)$ inner product of these fields.

in this geometry, the gradient of $\mathcal{F}$ at $\mu$ is $\nabla(\delta\mathcal{F}/\delta\mu)$
- take the first variation (the energy price at each location),
- then take its spatial gradient (the force on each particle).

following the negative gradient gives the gradient flow pde $\partial_t\mu_t = \text{div}(\mu_t\nabla(\delta\mathcal{F}/\delta\mu_t))$.

to make this computable we use the jko scheme.

at each time step, instead of solving the pde, we solve a variational problem that balances decreasing the energy against not straying too far in wasserstein distance from the previous distribution.

this is is the proximal point algorithm in wasserstein space.

wow
