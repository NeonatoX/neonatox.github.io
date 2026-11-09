---
title: "From admiring a project to contributing to it: a small free software story"
description: "A 2025 Pull Request, a 'You're wrong' and a 'thank you for this idea, implemented' a year later: how I ended up contributing to Linux Live Kit."
pubDate: 2026-11-09
lang: en
author: "Carlos Sánchez"
tags: ["Free Software", "Linux Live Kit", "Neonatox", "Upstream"]
---

Hello.

Sometimes free software has a rather peculiar sense of humor. 😂

## The problem: `xz` was there, but nobody saw it

In July 2025 I opened a Pull Request on **Linux Live Kit**, Thomas M.'s project.

The reason? I had found a problem while testing Live system builds: the Linux Live scripts did not correctly detect the presence of `xz`, even when it was installed.

I ran into this behavior on Ubuntu, Arch Linux and Linux From Scratch. And, of course, it also affected NeonatoX.

The issue was that the scripts tried to determine XZ availability by parsing the output of `xz --help` and looking for the word "Compress". It was a fragile check: it depended on the language and the format of the help text, so in practice it could fail even with `xz` installed. What was needed was simply to verify the presence of the executable.

## "You're wrong."

During the review, `crim50n` pointed out something technically correct: SquashFS has supported XZ compression since 2011, so it made no sense to check whether `mksquashfs` offered that capability. Modern versions already included it. The problem was that the feature could not be used if the `xz` executable was not installed.

His initial reply was quite direct:

> "You're wrong."

I acknowledged the clarification and explained that my problem was not SquashFS's XZ compatibility, but that Linux Live Kit failed to detect `xz` on systems where it was in fact installed.

The conversation stopped there. My initial proposal was not integrated and the practical problem I had identified remained unsolved.

## From frustration to NeonatoX Live Boot

It was an experience that, among other things, ended up pushing me to develop my own tool: **NeonatoX Live Boot**.

During that time, Linux Live Kit seemed to enter a period of relative inactivity. However, my admiration for Thomas's work never disappeared. Some of the ideas from his project even influenced the design of my own tools, such as `nhopkg`.

## A year later: "thank you for this idea, implemented"

And here comes the truly curious part.

Yesterday I was talking about Linux Live Kit, its new 2.13 release, the adoption of GRUB 2 and the influence it had on my projects. I was even joking that Thomas was now our competition.

Today I discover that Thomas has picked up that proposal and incorporated a solution into the official repository.

The change is simple and more robust: instead of parsing the output of `xz --help`, it now checks directly for the existence of the executable using `command -v xz`.

```diff
 # check for xz
-if [ "$(xz --help 2>&1 | grep -i "Compress")" = "" ]; then
-   echo "xz not found or cannot compress"
-   echo "you may consider installing xz-tools package"
+if ! command -v xz >/dev/null; then
+   echo "xz not found"
+   echo "Install XZ Utils before building your Live Kit"
    exit 1
 fi
```

When closing the Pull Request, Thomas left this comment:

> "thank you for this idea, implemented."

After more than a year, that small proposal finally found its place in Linux Live Kit.

## What it means

It is not a huge contribution, nor is it meant to be. It is a small improvement, but it has a special meaning for me.

Because behind those few lines there is a story of learning, of my own projects, of technical exchange and, above all, of free software.

Today I can say that a project I admire did not only inspire me: it also has a small contribution of mine.

Thank you, Thomas.

And yes, we are still competition... but now we are also upstream! 😂

---

**References:**

- Pull Request #290: https://github.com/Tomas-M/linux-live/pull/290
- Integrated commit: https://github.com/Tomas-M/linux-live/commit/cfd4b95eec8e8c761dc3a74fabed6f29d99aee2a
- Linux Live Kit 2.13: https://github.com/Tomas-M/linux-live/releases/tag/v2.13
- NeonatoX Live Boot: https://github.com/NeonatoX/neonatox-live-boot
