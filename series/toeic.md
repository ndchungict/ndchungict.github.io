---
layout: page
title: "Luyện thi TOEIC"
permalink: /series/docker/
---

<h5> Posts by Series : {{ page.title }} </h5>

<div class="card">
{% for post in site.posts%}
    {% if post.series == "toeic" %}
        <li class="category-posts"><span>{{ post.date | date_to_string }}</span> &nbsp; <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
{% endfor %}
</div>