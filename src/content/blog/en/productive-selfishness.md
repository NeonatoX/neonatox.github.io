---
title: "Productive Selfishness: Git, Linux and Some Reflections on Neonatox"
description: "How 'productive selfishness' inspired this Linux distro, just like Git and Linux were born from solving own problems."
pubDate: 2026-06-20
lang: en
tags: ["Free Software", "Neonatox", "Linux", "Development"]
---

Hello, how are you?

A few days ago I was reading again about the history of Git. Although today it seems like an indispensable tool for any developer, the reality is that it was born from a quite concrete need. When the Linux kernel development lost access to BitKeeper, Linus Torvalds needed a tool that could handle the kernel's workflow. He evaluated some alternatives, but none did exactly what he needed.

So he did what many of us programmers end up doing sooner or later: he wrote his own. But more interesting than Git, a phrase from Linus always caught my attention:

> "I'm a terrible selfish person; I write programs to solve my own problems."

It may sound a bit strange the first time you read it, but if we observe the history of free software we discover that many of the most important projects were born exactly like this.

- Linux was born because Linus wanted a Unix-like system for his computer.
- Git was born because he needed a distributed version control tool.
- And a huge number of projects we use every day exist simply because someone had a problem and decided to solve it.

Thinking about that, I realized that much of Neonatox was born in the same way.

I never sat down in front of a computer with the idea of creating a distribution to compete with other distributions. In fact, many of the tools that are now part of Neonatox appeared simply because I needed them at some point.

## One of the first was Nhopkg

When I started building my own LFS, I was looking for a way to manage packages that adapted to my way of working. Over time new needs appeared and the project grew. Binary packages, building from sources, repositories arrived, in addition to many other features that have been incorporated little by little.

There was no master plan, a problem simply appeared and the tool evolved to solve it.

## Something similar happened with Neonatox Live Boot

I've always liked to understand how a Linux system boot really works. Many modern tools do an excellent job automating processes, but they also hide much of what happens behind the scenes. Out of simple curiosity I started experimenting with boot scripts, device detection, OverlayFS and other components. What started as a series of tests ended up becoming Neonatox Live Boot over time.

## The same happened with Mkinitramfs

I wanted something simple, something that I could completely understand months later without having to study hundreds of lines of code again. Something that did its job without trying to solve absolutely all possible problems and that's how it ended up being born.

## Bootstrap had a slightly different story

Unlike other tools that appeared more organically, Bootstrap was born with a quite concrete objective. The idea is to complement the environment provided by Neonatox Live Boot and allow installation from repositories using the existing infrastructure.

While the installer was initially designed to deploy a complete Live system by copying the SquashFS, Bootstrap should allow building the system directly from the packages available in the repositories. Over time it incorporated new functions, such as user configuration, desktop profiles, boot loader installation and other post-installation tasks, but the main idea was always the same: to work together with Live Boot to facilitate system construction from the network, whether a complete live boot or a minimal one.

## And something similar happened with the installer

At first the idea was that the work would be quite simple: copy the system from a Live image, configure some basic parameters and leave a functional installation, for that reason, it contains auxiliary tools to manage users, partitions, time zones, boot configurations and other tasks. The curious thing is that many of them ended up being useful even outside the installer itself. And now the idea arises to incorporate Bootstrap later as another way to install Neonatox.

Looking back, I notice that all these projects share some characteristics:

- They try to be simple.
- They try to be transparent.
- They try to have few dependencies.
- Above all, they try to solve real problems rather than follow fads or trends.

For years I have been thinking and developing these tools without thinking too much about it. A need simply appears, I try to solve it and if the solution works it ends up becoming part of the project. Seen separately they seem like independent tools, they can even work as such, but observing them together, they all share the same origin: solving real problems that I encountered along the way.

Perhaps that's why Git's history feels so familiar to me. Not because Neonatox aims to compare itself with projects like Linux or Git, but because the initial motivation was very similar.

I've never seen Neonatox as a competition for other distributions. I've always seen it more as a laboratory where I can experiment, learn how things work and build tools adapted to my own needs. And of course, if any of those tools ends up helping someone else, even better.

In the end, that phrase from Linus still makes a lot of sense:

> "I'm a terrible selfish person; I write programs to solve my own problems."

Maybe that kind of selfishness isn't a bad thing after all, because many times the best tools are born exactly like this:

- Someone has a problem.
- They solve it.
- They share the solution.

And without realizing it, they end up helping other people too.

Regards.

Happy hacking!
