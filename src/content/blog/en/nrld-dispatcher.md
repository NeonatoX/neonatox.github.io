---
title: "neonatox-RLDispatcher: making glibc programs work properly on a musl system"
description: "nrld gives glibc programs a real, isolated glibc in /usr/lib/glibc6/, without mixing two libcs in the same process: this is how Firefox runs on NeonatoX."
pubDate: 2026-10-21
lang: en
author: "Carlos Sánchez"
tags: ["Neonatox", "nrld", "musl", "glibc", "compatibility"]
---

## The underlying problem

Imagine you have two very different car brands. Each one uses its own spare parts system: the parts of one don't fit the other. If you try to mix spare parts from both brands in the same engine, something will most likely break… or it simply won't start at all.

That's roughly what happens when you try to run a program compiled for **glibc** (like Firefox, Chromium, or many desktop applications) on a system that uses **musl** (like Alpine, Void, or NeonatoX).

Most traditional solutions try to "trick" the program into believing it's using glibc spare parts, when in reality it's still mounted on top of musl. The result tends to be unstable: the program may work for a while… and then suddenly fail in ways that are hard to understand, or it may not even get to work at all.

## The idea behind nrld

Instead of trying to force one brand's spare parts to work inside the other's engine, **nrld does something different**:

> It runs the program with a **real glibc engine**, but completely separated from the rest of the system.

That real glibc environment lives in its own directory (`/usr/lib/glibc6/`). The rest of the system keeps using musl peacefully. The two never mix inside the same process.

It's like having two cars in the same workshop: each one with its own spare parts, without swapping pieces between them.

## How it works, in a nutshell

The system has three main pieces:

1. **nrld** — A "fake" interpreter for executables. When the system tries to start a glibc program, the kernel calls nrld instead of the normal loader. It's installed as `/lib64/ld-linux-x86-64.so.2`, so this happens on its own: neither the application nor the user has to do anything. nrld takes care of preparing the whole isolated environment.
2. **libnrld-proxy.so** — A small library loaded alongside the program (`LD_PRELOAD`). Its job is to make sure nobody sneaks musl spare parts into the glibc engine. If it detects that something is being mixed, it cuts the problem cleanly. And if the process is musl, it becomes completely transparent: it interposes nothing.
3. **AppImage support** — Many modern applications ship packaged as AppImages. nrld knows how to detect them, extract them safely (no FUSE, always inside `/tmp`) and run the program inside.

And there's a detail that looks minor but isn't: **nrld is written in C without libc**, with raw syscalls, no `malloc` and no `printf`. It's not just another `LD_PRELOAD` you expect to "just work". It's code you can read from top to bottom, that compiles with `meson` in no time, and that doesn't rely on any secret of the host.

## The important advance: using musl tools from glibc applications

For a long time, one of the most annoying problems was this:

A glibc application (for example a program built with Electron or GTK) needs to launch a system tool. That tool is musl (like `git`, `bwrap`, or other helpers).

Since the glibc application was running with an environment prepared for glibc, the child inherited variables like `LD_LIBRARY_PATH` pointing at the glibc sysroot. The result was predictable: the musl program would try to load the wrong "spare parts" and fail.

### How it was solved

The proxy now intercepts the calls that launch other programs (`execve`, `posix_spawn`, and similar). Before running the new process, it makes a simple but effective check:

- It looks at what interpreter the target program has.
- If it detects a **musl** binary, it strips from the environment the variables that could contaminate it (`LD_LIBRARY_PATH` and `LD_PRELOAD`).
- If the program is glibc, it lets it pass with the normal environment (because it will go through nrld again anyway).

### What do we gain from this?

That glibc applications can naturally use the system's musl tools and runtime dependencies.

Concrete examples:

- An editor or an Electron-based IDE can show the git tree of a project.
- Applications that need to launch system helpers (compression, sandboxing, image conversion, etc.) stop breaking.
- The need to duplicate tools inside the glibc sysroot is reduced.

This advance has an important design consequence: **there's no longer a need to maintain a full tree of binaries inside the sysroot**. In practice, the goal gets much closer to something like `lib32`: a well-organized set of libraries, without needing to duplicate a large part of the system's tools.

In other words, the sysroot can be oriented almost exclusively towards **libs**, and let the helpers and auxiliary programs remain the system's musl ones.

## Looking a bit further: other architectures

Although nrld was born to solve the conflict between musl and glibc on the same architecture (x86-64), the same isolation idea opens up another interesting possibility:

> Could a similar approach be used to run programs from another architecture on an x86 system?

These days it's already possible to experiment with this by combining:

- `qemu-user` (which translates the instructions of the other architecture)
- A sysroot with that architecture's libraries
- An isolation logic similar to nrld's

This isn't about emulating a full machine, but about translating only what the process needs and taking advantage of the host kernel. The result is lighter than a traditional virtual machine.

It's still experimental ground, but it shows that the underlying problem (properly isolating different userspace environments) isn't limited to musl versus glibc. The same philosophy could be applied, with the right amount of work, to other architectures.

## Current limitations

Like every design, this one has its limits:

- For now the main development is centered on **x86-64**.
- Large applications require quite a few libraries inside the isolated environment.
- Some very special ways of launching programs aren't fully covered yet: the `execl*` variants and `execveat` don't go through the interposition, so an app spawning a musl child that way would still leak the environment. In practice, the apps in this ecosystem use `execve` or `posix_spawn`, but it's worth knowing.
- The main loader code concentrates a lot of logic in a single place.

None of this is insurmountable, but these are points to keep in mind.

## Current state of the project

These days, nrld is already used for real inside NeonatoX. It has been tested with:

- Firefox (including its internal processes, on both modern and ESR versions)
- Chromium, Brave, and Electron-based applications
- Several AppImages (OpenShot 4.0.0 among them)
- Programs built with GTK and Qt

The system is usable day to day and keeps evolving. One of the most visible results of the latest advance is precisely that complex applications can rely on the system's musl tools without breaking, which allows simplifying the sysroot and bringing it closer to a lighter, library-focused model.

Compiling and testing it takes four commands:

```bash
meson setup build --prefix=/usr
meson compile -C build
meson test -C build
sudo meson install -C build
```

## The real problems and how they were solved

The road to today's nrld wasn't a straight one. There were several concrete problems that, at the time, looked capable of bringing the whole approach down. Solving them one by one is what shaped the system that exists today.

### 1. The mixing of two libcs

The most classic symptom: the program started and, at some point, ended in a hard-to-understand `SIGSEGV` (often inside `strtod_l` or other functions). The cause was simple to explain and hard to avoid: some library ended up resolving to the musl version in `/usr/lib` instead of the glibc one in the sysroot.

**Solution:** a transitive dependency guard (`DT_NEEDED`) + the proxy's runtime scanning. If something strays outside the sysroot, it's cut cleanly instead of letting the process corrupt itself.

### 2. `/proc/self/exe` pointed at the loader

Many applications (especially browsers and Electron-based things) consult `/proc/self/exe` to locate themselves. If that path points at the loader instead of the real program, they start failing in strange ways.

**Solution:** in user mode a copy of the binary is created with `PT_INTERP` rewritten to the real glibc loader. The kernel loads that loader inside the same process and `/proc/self/exe` keeps pointing at the application.

### 3. AppImages rejected by the glibc loader

Type-2 AppImages carry non-standard bytes in the ELF header. The glibc loader rejects them outright.

**Solution:** detect that case, create a temporary copy with the corrected header, and run that copy. The AppImage's contents are unaffected.

### 4. Absolute paths in dependencies

Some binaries carry `DT_NEEDED` entries with absolute paths (for example `/usr/lib/libalgo.so`). The loader takes them literally and, once again, ends up pulling musl libraries into the process.

**Solution:** detect those entries, create a patched copy where the absolute path becomes a normal soname, and make sure it resolves inside the sysroot.

### 5. musl children inherited the glibc environment

This one was among the most troublesome. A glibc application launched a system tool (git, bwrap, etc.). That tool is musl, but it inherited `LD_LIBRARY_PATH` pointing at the glibc sysroot… and failed.

**Solution:** the proxy intercepts the execution calls and, when it detects that the target is musl, cleans the dangerous variables from the environment before launching it. This change was especially important: it allowed glibc applications to use system helpers and, along the way, opened the door to simplifying the sysroot (orienting it more towards libraries and less towards duplicated binaries).

### 6. Noise in standard output

At first nrld wrote a lot of diagnostic messages to standard output. That broke things like `make`, scripts that capture output, or tools from the toolchain itself.

**Solution:** all diagnostics moved to stderr, with log levels and silence by default. It only speaks when asked to, or when there's a real error.

### 7. Processes that "swallowed" the error messages

In Firefox, for example, content processes redirect their stderr. A proxy rejection could end up completely invisible.

**Solution:** the ability to mirror the proxy's messages to a log file was added, so you can diagnose even when the terminal shows nothing.

Each of these problems pushed the design towards a stricter isolation and, at the same time, a more usable one. The current result isn't just that "glibc programs start", but that they can coexist much more naturally with the musl system around them.

## Conclusion

nrld doesn't try to make musl "understand" glibc. Nor does it try to turn a glibc program into something musl. It simply gives that program an authentic, well-isolated glibc environment, and makes sure it doesn't mix with the rest of the system.

The fact that glibc applications can now safely use musl helpers is an important step: they don't just "run", they integrate better with the system around them. And thanks to that, the sysroot itself can become simpler, closer in spirit to what has traditionally been done with `lib32`.

Plus, although it's still early, the same line of work suggests broader possibilities, like experimenting with other architectures on an x86 host.

The code is available under the GPL v3 license at:

[https://github.com/NeonatoX/neonatox-rldispatcher](https://github.com/NeonatoX/neonatox-rldispatcher)

Happy hacking.
