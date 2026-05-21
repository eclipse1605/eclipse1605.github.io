---
layout: default
title: Home
---

<section class="hero fade-in">
  <p class="eyebrow">Google Summer of Code 2026</p>
  <h1>Advay Bhagwat</h1>
  <p class="lead">This site tracks my GSoC work: meeting notes, experiments, and what I am learning along the way.</p>
  <div class="hero-links">
    <a class="btn" href="https://summerofcode.withgoogle.com/programs/2026/projects/Tt5OTfGg">GSoC project</a>
    <a class="btn ghost" href="https://github.com/eclipse1605">GitHub</a>
    <a class="btn ghost" href="https://www.linkedin.com/in/advay-bhagwat/">LinkedIn</a>
  </div>
</section>

<section id="about" class="section">
  <div class="section-header">
    <h2>About Me</h2>
    <p>I am an incoming GSoC contributor focused on PrO posteriors and Wasserstein gradient flows. This blog is a running log of experiments, decisions, and reflections.</p>
  </div>
  <div class="about-grid">
    <div class="about-card">
      <img src="{{ '/imgs/misc/my%20photo.jpeg' | relative_url }}" alt="Advay Bhagwat">
    </div>
    <div class="about-card">
      <ul class="info-list">
        <li>
          <span>Name</span>
          Advay Bhagwat
        </li>
        <li>
          <span>Project</span>
          <a href="https://summerofcode.withgoogle.com/programs/2026/projects/Tt5OTfGg">GSoC project page</a>
        </li>
        <li>
          <span>GitHub</span>
          <a href="https://github.com/eclipse1605">github.com/eclipse1605</a>
        </li>
        <li>
          <span>LinkedIn</span>
          <a href="https://www.linkedin.com/in/advay-bhagwat/">linkedin.com/in/advay-bhagwat</a>
        </li>
        <li>
          <span>Email</span>
          <a href="mailto:advay.bhagwat@gmail.com">advay.bhagwat@gmail.com</a>
        </li>
      </ul>
    </div>
  </div>
</section>

<section id="blogs" class="section">
  <div class="section-header">
    <h2>Blogs</h2>
    <p>Posts are written in Markdown and published from the <code>_posts</code> folder.</p>
  </div>
  <div class="post-list stagger">
    {% for post in site.posts %}
      <article class="post-card" style="--stagger: {{ forloop.index }};">
        <p class="post-date">{{ post.date | date: "%B %d, %Y" }}</p>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        {% if post.summary %}
          <p>{{ post.summary }}</p>
        {% endif %}
        <a class="text-link" href="{{ post.url | relative_url }}">Read post -></a>
      </article>
    {% endfor %}
  </div>
</section>
