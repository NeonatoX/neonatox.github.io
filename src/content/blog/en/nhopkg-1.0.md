---
title: "nhopkg 1.0 is finally here"
description: "Neonatox's package manager reaches its first stable release: a private BusyBox + zstd PATH, GPG repository signing, nhouser, and much more."
pubDate: 2026-09-15
lang: en
author: "Carlos Sánchez"
tags: ["Neonatox", "nhopkg", "release", "announcement"]
---

Hi.

If you've been reading me for a while, you'll know I'm one of those people who prefer to understand how things really work, even if that means getting your hands dirty tweaking configurations. And one of the things I've tweaked the most over the last few years is **nhopkg**, Neonatox's package manager — the one that compiles everything from source because learning means getting your boots muddy.

Well, after quite a lot of work, we can finally say it for real: **nhopkg 1.0 is a reality**. Like any first stable release, this isn't just a number bump: it's the release where we think things finally hold up for the day-to-day of a rolling release system without headaches.

And who is this for? For curious people like us — the ones who aren't satisfied with installing packages, but want to know *how* they get installed. If you come from LFS and wanted more, if you dream of building your own distro from scratch, or if you just wanted to understand what a package manager does under the hood, this is for you. nhopkg is one of those projects where the code can be read, understood, and learned from: no magic binaries, no black boxes, just bash, tar, and zstd nicely unpacked.

![nhopkg 1.0](/screenshots/nhopkg-1.0.png)

Of everything it brings, what excites me the most is the **BusyBox + zstd private PATH**: static binaries built with musl-gcc during the build, so when you update the system's C library — yes, those updates that break even the most seasoned package manager — nhopkg keeps working as if nothing happened.

But that's not all:

- **nhouser**: user and group management with a dual backend (shadow-utils or BusyBox, detected on the fly). Essential when `useradd` ends up broken after an update.
- **GPG repository signing**: `nhopkg-repos` rewritten with signing, verification, key management, and signed repo metadata.
- **Transparent `--root`**: pre/post-install scripts run inside the chroot using private mount namespaces.
- **Metapackages**: create a package that groups a whole set, resolved straight from the repo metadata.
- **`# Replaces:`**: retire a package cleanly, without stomping on headers or breaking other builds.

And to top it off: the **Russian translation** of all the documentation, parallel dependency downloads, and a solid batch of changes so everything works *identically* on GNU and BusyBox systems.

## A sneak peek at the changelog

Here's a sample of what just landed in the [changelog-1.0.md](https://github.com/NeonatoX/neonatox-nhopkg/releases/tag/1.0):

> Stable: 60 commits across 103 files since 2026.3.
> - Static BusyBox 1.37.0 + zstd 1.5.7 (musl-gcc) for the private PATH that survives glibc/musl updates.
> - Runtime detection of shadow-utils vs BusyBox for users and groups, with flag translation between backends.
> - `nhopkg-repos`: `sign`, `sign-all`, `verify`, `keygen`, `import-key`, … with signature verified on every update.
> - `ns_exec_in()` with a private mount namespace for `--root` execution.
> - Metapackages via `nhopkg-src --init --meta`.
> - Parallel dependency downloads (`NHOPKG_DOWNLOAD_JOBS`, default 4).

If you want to see the full list of changes, I invite you to check out the release:

https://github.com/NeonatoX/neonatox-nhopkg/releases/tag/1.0

I hope you find it useful and that you give it a try. You know these things always teach you something new.

Happy hacking.