---
title: "The Neonatox Sources Portal is here"
description: "Introducing the sources portal: nhoid metadata in Git, interconnected packages and a catalog generated straight from GitLab."
pubDate: 2026-11-26
lang: en
author: "Carlos Sánchez"
tags: ["Neonatox", "nhopkg", "nhoid", "sources", "GitLab", "announcement"]
---

For a long time, I had a clear idea in mind: create a friendly, accessible place that gathered all the information about Neonatox packages, both in source form (*sources*) and in binary form.

Today, that place is a reality. We're pleased to present the new **[Neonatox Sources Portal](https://neonatox-sources.gitlab.io/)**.

![Source package catalog in the Neonatox Sources Portal](/screenshots/portal-de-fuentes-catalogo.png)

### The inspiration: showing the guts, KISS-style

If there's something I've always found great and deeply human, it's the style of package browsers like Arch Linux's. Their philosophy is clear: tidy, clean, neat and simple. It shows the system's "guts" without unnecessary adornments, trusting the user's intelligence.

That's exactly the spirit we wanted to capture. Neonatox isn't a black box; it's a system designed to be understood. We wanted the experience of entering the portal to be so clear that anyone could say: *"Hey, I get this. It's really clear to me."*

### The technical journey: from local scripts to the single source of truth in Git

Getting here wasn't a straight path. At first, I tried solving the problem with Bash scripts that processed packages locally. But I hit a wall: the metadata wasn't always available consistently, and the local system was rarely in exactly the right state for the process to be 100% reliable.

The turning point came with a fundamental architectural decision: **migrating all metadata (`nhoid`) to Git**.

That decision changed the rules of the game. It allowed `nhopkg` to rely on Git as the "single source of truth" for building packages and assembling the distribution. As I defined the pipelines and GitLab CI/CD workflows, I figured out how to automate and scale the process. The result is the current static generator: a Python script that, with incremental caching and parallel processing, reads directly from the GitLab API, guaranteeing that what you see on the web is exactly what's in the repository — always up to date and without friction.

### An interconnected experience, not islands of information

The greatest value of this new portal isn't just that it's nice to look at — it **gives context**.

Before, packages could feel like a bunch of individual repositories with isolated recipes. Now they're intertwined. From the portal, you can inspect a package and, with a single click, navigate directly to its dependencies, examine the structure of its binary, or understand how it's split into subpackages (`splitpackages`).

![A package page in the Neonatox Sources Portal](/screenshots/portal-de-fuentes-paquete.png)

The goal is for you to stop seeing loose commands and start seeing the whole ecosystem. We want you to feel at home, with the same clarity and confidence that many of us felt when we first discovered Linux through communities that value transparency.

### An orderly home to build together

For now, our focus is on polishing and improving what we've already achieved. The foundation is solid: news, RSS feeds, efficient caching and a clear structure. Later on, we'll explore features like dependency graphs or real-time search.

But the most important thing this tool represents for Neonatox's future is **order**.

Anyone who wants to be part of the project — whether to report a bug, improve an `nhoid` recipe or propose a new feature — will now find "the orderly house". There's a clear starting point, accessible documentation and a defined workflow. No secrets, just code and willingness to collaborate.

### One last thought

To anyone reading this who feels curious about trying Neonatox, checking out an `nhoid` or joining the development, I just want to say this:

> *"When you love what you do and you have the chance, do it and take it to its final consequence. You'll be surprised how far you can get with a good idea and a little help."*

The map is here. The tools are ready. We invite you to start building with us.

---
*Want to explore the code? Visit the [portal repository](https://gitlab.com/neonatox-sources/neonatox-sources.gitlab.io) or dive straight into the [package catalog](https://neonatox-sources.gitlab.io/packages/).*
