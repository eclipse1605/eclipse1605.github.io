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
  <div class="misc-grid">
    {% assign misc_md = site.pages | where_exp: "p", "p.dir == '/misc/'" | where_exp: "p", "p.url != '/misc/'" | where_exp: "p", "p.misc_type == 'markdown'" %}
    {% assign misc_pages = site.pages | where_exp: "p", "p.dir == '/misc/'" | where_exp: "p", "p.url != '/misc/'" %}
    {% for item in misc_md %}
      <div class="about-card">
        <span class="tag">Markdown</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.summary | default: "Rendered from Markdown." }}</p>
        <div class="misc-actions">
          <a class="btn" href="{{ item.url | relative_url }}">Open</a>
          <a class="btn ghost" href="{{ item.path | relative_url }}">Raw file</a>
        </div>
        <p class="misc-note">Rendered pages support LaTeX via MathJax.</p>
      </div>
    {% endfor %}

    {% for page in misc_pages %}
      {% unless page.misc_type == "markdown" or page.url == '/misc/' %}
        <div class="about-card">
          {% if page.misc_type == 'pdf' %}
            <span class="tag">PDF</span>
            <h3>{{ page.title }}</h3>
            <p>Rendered inline on the PDF page, with a direct download link.</p>
            <div class="misc-actions">
              <a class="btn" href="{{ page.url | relative_url }}">Open</a>
              {% if page.source %}
                <a class="btn ghost" href="{{ page.source | relative_url }}">Download</a>
              {% endif %}
            </div>
            <p class="misc-note">If PDF rendering is blocked by the browser, use the direct link.</p>
          {% elsif page.misc_type == 'notebook' %}
            <span class="tag">Notebook</span>
            <h3>{{ page.title }}</h3>
            <p>Rendered inline on the notebook page, with download link.</p>
            <div class="misc-actions">
              <a class="btn" href="{{ page.url | relative_url }}">Open</a>
              {% if page.source %}
                <a class="btn ghost" href="{{ page.source | relative_url }}">Download</a>
              {% endif %}
            </div>
            <p class="misc-note">Notebook rendering happens client-side.</p>
          {% endif %}
        </div>
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
        {% if page.source %}
          <a href="{{ page.source | relative_url }}">{{ page.title }} (source)</a>
        {% endif %}
      {% endunless %}
    {% endfor %}
  </div>
</section>
