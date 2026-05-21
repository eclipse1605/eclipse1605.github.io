---
layout: default
title: Blogs
---

<section class="section">
  <div class="section-header">
    <h2>Blogs</h2>
  </div>
  <div class="vertical-card-list">
    {% for post in site.posts %}
      <article class="post-card">
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
