---
layout: page
title: "Tổng hợp lượng từ trong tiếng Trung"
permalink: /series/tong-hop-luong-tu-trong-tieng-trung/
---

<h5> Posts by Category : {{ page.title }} </h5>

<div class="card">
{% for post in site.posts%}
    {% if post.series == "tong-hop-luong-tu-trong-tieng-trung" %}
        <li class="category-posts"><span>{{ post.date | date_to_string }}</span> &nbsp; <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
{% endfor %}
</div>