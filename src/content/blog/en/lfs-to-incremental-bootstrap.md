---
title: "From LFS Bootstrap to Incremental Self-Hosting"
description: "How NeonatoX 27 bootstraps itself: OverlayFS isolation with nhopkg-overlay, incremental rebuilds and a self-hosting package-based model."
pubDate: 2026-08-13
lang: en
author: "Carlos Sánchez"
tags: ["Neonatox", "Linux", "Bootstrap", "nhopkg"]
---

*The NeonatoX 27 bootstrap model with nhopkg-overlay*

## Abstract

NeonatoX originally used Linux From Scratch (LFS) as its bootstrap mechanism. The 2025 generation was built from an Archlinux host, while NeonatoX 2026 was bootstrapped from NeonatoX 2025 using LFS. For NeonatoX 27, the project introduces a different model: incremental bootstrap. An existing NeonatoX system is used as the build platform, nhopkg-overlay provides an OverlayFS-based isolated root during package construction, and the resulting NHO packages are installed into a completely separate root using `nhopkg --root`. Only components that need to change are rebuilt; compatible packages can be reused. This separates the build environment, package artifacts, and target system, allowing a new system generation to be assembled without modifying the previous installation.

## 1. Background and evolution

The bootstrap strategy of NeonatoX evolved across three generations:

- **NeonatoX 2025** — LFS bootstrap from an Archlinux host.
- **NeonatoX 2026** — LFS bootstrap from the previous NeonatoX generation.
- **NeonatoX 27** — incremental bootstrap from NeonatoX 2026 using `nhopkg-overlay` and `nhopkg`.

The important transition is that LFS remains the historical bootstrap foundation, but it is no longer required as the construction procedure for every subsequent generation. The existing distribution becomes the platform from which the next generation can be built.

## 2. Core idea

The method separates three roles that are often combined in traditional bootstrap workflows:

| Component          | Role                                          |
|--------------------|-----------------------------------------------|
| NeonatoX 2026      | Build platform / previous generation          |
| `nhopkg-overlay`   | Temporary isolated build environment          |
| `.nho` packages    | Persistent build artifacts                    |
| `$LFS`             | Independent target root for the new generation |
| `nhopkg --root`    | Package-based assembly of the target root     |

The central principle is: the previous system is used to build the next system, but it is not itself converted into the next system.

## 3. nhopkg-overlay

`nhopkg-overlay` creates an OverlayFS mount with the existing root filesystem as its lower layer and a dedicated upper and work directory. The build session therefore sees a filesystem that behaves like the host system, while modifications are redirected to the overlay layer.

The relevant layout is:

- `/var/lib/nhopkg-overlay/upper` — modified filesystem content.
- `/var/lib/nhopkg-overlay/work` — OverlayFS work directory.
- `/var/lib/nhopkg-overlay/root` — mounted isolated root.
- `/work` inside the overlay — bind-mounted host working directory.

The last point is important: generated `.nho` packages are written to the bind-mounted work directory and therefore survive teardown of the overlay. The overlay is ephemeral as a system modification layer, while the package artifacts are persistent.

## 4. Building normally inside the overlay

The package recipes do not require a special overlay-aware build system. They continue to run through the normal nhopkg build mechanism, for example:

> nhopkg -Cv binutils

This is significant because existing recipes can be reused with minimal changes. A recipe that installs files into `/` is effectively modifying the overlay's upper layer rather than the real NeonatoX 2026 root.

## 5. Toolchain bootstrap

The core of the NeonatoX 27 transition includes updated Linux API headers, binutils, glibc, and GCC. The actual NHO recipes declare their build dependencies and perform ordinary builds.

Example versions used in the demonstrated NeonatoX 27 environment:

- binutils 2.46.1
- glibc 2.44
- GCC 16.1.0

The GCC recipe uses the existing toolchain to build GCC 16.1.0, while binutils and glibc are updated as required. The recipes also support split packages and multilib components where required by the NeonatoX configuration.

## 6. Incremental reuse

Incremental bootstrap does not require rebuilding every package. A package may be reused when its version and compatibility remain appropriate for the target generation. Packages whose versions or requirements must change are rebuilt in the overlay.

Examples of packages present in NeonatoX 2026 include:

- bash 5.3
- bzip2 1.0.8
- gettext 0.26
- gmp 6.3.0

The demonstrated NeonatoX 27 package set includes:

- file 5.48
- GCC 16.1.0
- GCC development package 16.1.0
- glibc 2.44
- hwdata 0.409

Compatibility is evaluated using current LFS documentation, Archlinux references, and the NeonatoX package repository. In practice, a package is reused when its version in NeonatoX 2026 exactly matches the version required for NeonatoX 27, provided that the shared libraries it depends on (primarily glibc) maintain backward binary compatibility with the new system version. This is currently a pragmatic engineering decision; it does not imply that identical package versions alone guarantee binary (ABI) compatibility in all cases.

## 7. Creating the new root

The target root is represented by `$LFS`. It may be a normal directory or a dedicated filesystem/partition. Before package installation, the required filesystem hierarchy is created.

The hierarchy adapts to the libc family detected on the build system. For glibc, the layout includes `/usr/lib`, `/usr/lib32` and the corresponding compatibility links; for musl, a simpler layout is used. The configuration also establishes merged-/usr links such as `/bin → /usr/bin` and `/lib → /usr/lib`.

After the hierarchy exists, packages are installed directly into the target root:

> nhopkg --root="$LFS" -i package.nho

The new root is therefore assembled from packages rather than by copying the overlay's upper directory.

## 8. Completing the new system

A temporary BusyBox installation supplies basic filesystem utilities required during early assembly, including commands such as `ln`, `cp`, `mv` and `mkdir`.

Other system components are treated as normal NHO packages. Depending on compatibility and version requirements, the kernel, GRUB, networking components, systemd and BusyBox can either be rebuilt or reused.

System-specific state is then created manually or through scripts, including `fstab`, users and configuration files. This keeps package construction separate from machine-specific system configuration.

## 9. Validation

The resulting target root was tested after installation of the new toolchain. The observed versions were:

| Component            | Observed result                                |
|----------------------|------------------------------------------------|
| GCC                  | 16.1.0                                         |
| GNU ld               | 2.46.1                                         |
| GNU libc / ldd       | 2.44                                           |
| `/usr/bin/gcc`       | ELF 64-bit LSB PIE, x86-64, dynamically linked |
| `/bin/sh`            | symbolic link to bash                          |

A C program was compiled and executed successfully with the new toolchain. A second test using `stdio`, `stdlib` and `string` functionality, including `strdup()` and `free()`, also compiled and executed successfully. This validates compilation, linking, libc integration and runtime execution inside the new environment.

The current root did not yet contain `uname`, so `uname -a` was unavailable during this test. This is a state-of-construction limitation rather than a toolchain failure.

**Although the next generation (NeonatoX 28) has not yet been fully built, the packages we have compiled with the new toolchain versions (GCC 16.1.0, glibc 2.44, and binutils 2.46.1) have not shown compilation errors so far**, which reinforces the stability of the current toolchain and suggests that the transition to the next generation will be viable without major issues.

## 10. Comparison with the original LFS workflow

| Aspect              | Traditional bootstrap used historically | NeonatoX 27 incremental model          |
|---------------------|-----------------------------------------|----------------------------------------|
| Initial environment | External distribution / previous system | Previous NeonatoX generation           |
| System isolation    | Dedicated LFS build environment         | OverlayFS through `nhopkg-overlay`     |
| Rebuild scope       | Large bootstrap sequence                | Only changed/required components       |
| Artifact model      | Installations during build              | Persistent `.nho` packages             |
| Target root         | Built as part of bootstrap              | Independent `$LFS` assembled with nhopkg |
| Next generation     | Repeat bootstrap procedure              | Reuse current generation as builder    |

## 11. What the method is — and what it is not

The method should not be described as a universal replacement for the isolated toolchain bootstrap process performed in LFS, nor as an alternative to Canadian Cross. It is a distribution-specific incremental bootstrap architecture built around NeonatoX's package format, dependency metadata, filesystem layout and build tooling.

Its main property is isolation and incremental replacement: the old root remains intact, the new versions are built in an overlay, the resulting artifacts are retained as packages, and a new root is assembled independently.

## 12. Toward a self-hosting distribution

The long-term consequence is a self-hosting evolution path. NeonatoX 2026 can build the components required for NeonatoX 27; once NeonatoX 27 is sufficiently complete, it can become the build platform for the next generation.

Conceptually:

> NeonatoX N → incremental bootstrap → NeonatoX N+1 → incremental bootstrap → NeonatoX N+2

In this model, LFS remains important as the historical foundation of the project, while `nhopkg-overlay` and `nhopkg` provide the mechanism for continuing the distribution's evolution without returning to an external bootstrap host for every generation.

## 13. Reproducibility and future work

- Publish the exact package dependency graph used for the NeonatoX 27 bootstrap.
- Document the criteria used to decide when an older package can be reused.
- Complete a full bootable NeonatoX 27 image and record the complete package set.
- Demonstrate NeonatoX 27 building a subsequent generation without relying on NeonatoX 2026.
- Automate compatibility checks where package metadata and ABI information permit.

## Conclusion

NeonatoX 27 represents a change in bootstrap strategy rather than simply another package refresh. The project moves from repeated LFS-based construction toward an incremental, package-oriented and self-hosting model. `nhopkg-overlay` provides the isolation needed to modify a virtualized copy of the current system, while `nhopkg` preserves the results as installable artifacts. A separate target root can then be assembled from those artifacts, with compatible components reused and only necessary components rebuilt.

The result is an architecture that makes each previous generation of NeonatoX the natural build platform for the next, without touching the old installation. That is the true foundation of the NeonatoX 27 incremental approach: a system that builds itself, step by step.

## References and project resources

- **Linux From Scratch** — used as a technical reference for system construction.
- **Archlinux** — used as an additional reference for package/toolchain compatibility.
- **NeonatoX source repository:** [https://gitlab.com/neonatox-sources/](https://gitlab.com/neonatox-sources/)
- **GNU Binutils:** [https://www.gnu.org/software/binutils/](https://www.gnu.org/software/binutils/)
- **GNU GCC:** [https://gcc.gnu.org/](https://gcc.gnu.org/)
- **GNU C Library:** [https://www.gnu.org/software/libc/](https://www.gnu.org/software/libc/)
