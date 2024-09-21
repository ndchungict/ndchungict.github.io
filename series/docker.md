---
layout: page
title: Docker
permalink: /series/docker/
---

<h5> Posts by Category : {{ page.title }} </h5>

<div class="card">
{% for post in site.posts%}
    {% if post.series == "docker" %}
        <li class="category-posts"><span>{{ post.date | date_to_string }}</span> &nbsp; <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
{% endfor %}
</div>