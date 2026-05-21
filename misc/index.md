---
layout: default
title: Misc
math: true
---

<section class="section">
  <div class="section-header">
    <h2>Misc</h2>
    <p>A place for notes, notebooks, and documents that I reference in posts.</p>
  </div>
  <div class="vertical-card-list">
    {% assign misc_pages = site.pages | where: "layout", "misc" | sort: 'date' | reverse %}
    {% for page in misc_pages %}
      {% unless page.url == '/misc/' %}
        <article class="post-card">
          {% if page.misc_type %}
            <span class="tag">{{ page.misc_type | capitalize }}</span>
          {% endif %}
          <h3><a href="{{ page.url | relative_url }}">{{ page.title }}</a></h3>
          <p>{{ page.summary | default: page.excerpt | default: "" }}</p>
          <div class="misc-actions">
            <a class="btn" href="{{ page.url | relative_url }}">Open</a>
            {% if page.source %}
              <a class="btn ghost" href="{{ page.source | relative_url }}">Download</a>
            {% endif %}
          </div>
        </article>
      {% endunless %}
    {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section-header">
    <h2>Quick Links</h2>
    <p>Use these URLs when linking in blog posts.</p>
  </div>
  <div class="misc-nav">
    {% for page in misc_pages %}
      {% unless page.url == '/misc/' %}
        <a href="{{ page.url | relative_url }}">{{ page.title }}</a>
      {% endunless %}
    {% endfor %}
  </div>
</section>
