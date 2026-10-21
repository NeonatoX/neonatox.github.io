---
title: "neonatox-RLDispatcher: cómo hacer que los programas de glibc funcionen bien en un sistema musl"
description: "nrld da a los programas glibc un glibc real y aislado en /usr/lib/glibc6/, sin mezclar dos libcs en un mismo proceso: así corre Firefox en NeonatoX."
pubDate: 2026-10-21
lang: es
author: "Carlos Sánchez"
tags: ["Neonatox", "nrld", "musl", "glibc", "compatibilidad"]
---

## El problema de fondo

Imagina que tienes dos marcas de autos muy distintas. Cada una usa su propio sistema de repuestos: las piezas de una no encajan bien en la otra. Si intentas mezclar repuestos de las dos marcas en el mismo motor, es muy probable que algo falle… o que directamente no arranque.

Eso es más o menos lo que pasa cuando intentas ejecutar un programa compilado para **glibc** (como Firefox, Chromium o muchas aplicaciones de escritorio) en un sistema que usa **musl** (como Alpine, Void o NeonatoX).

La mayoría de soluciones tradicionales intentan "engañar" al programa para que crea que está usando repuestos glibc, cuando en realidad sigue montado sobre musl. El resultado suele ser inestable: el programa puede funcionar un rato… y de repente fallar de formas difíciles de entender, o incluso puede que ni siquiera llegue a funcionar.

## La idea de nrld

En lugar de intentar hacer que los repuestos de una marca funcionen a la fuerza dentro del motor de la otra, **nrld hace algo diferente**:

> Ejecuta el programa con un **motor glibc de verdad**, pero completamente separado del resto del sistema.

Ese entorno glibc real vive en una carpeta propia (`/usr/lib/glibc6/`). El resto del sistema sigue usando musl tranquilamente. Los dos nunca se mezclan dentro del mismo proceso.

Es como tener dos autos en el mismo taller: cada uno con sus propios repuestos, sin intercambiar piezas entre sí.

## Cómo funciona, en pocas palabras

El sistema tiene tres piezas principales:

1. **nrld** — Es un "intérprete falso" de ejecutables. Cuando el sistema intenta arrancar un programa glibc, el kernel llama a nrld en lugar del cargador normal. Está instalado como `/lib64/ld-linux-x86-64.so.2`, así que esto ocurre solo: ni la aplicación ni el usuario tienen que hacer nada. nrld se encarga de preparar todo el entorno aislado.
2. **libnrld-proxy.so** — Es una pequeña biblioteca que se carga junto al programa (`LD_PRELOAD`). Su trabajo es vigilar que nadie intente meter repuestos musl dentro del motor glibc. Si detecta que algo se está mezclando, corta el problema de forma limpia. Y si el proceso es musl, se vuelve completamente transparente: no interpone nada.
3. **Soporte de AppImages** — Muchas aplicaciones modernas vienen empaquetadas como AppImage. nrld sabe detectarlas, extraerlas de forma segura (sin FUSE, siempre dentro de `/tmp`) y ejecutar el programa que llevan dentro.

Y hay un detalle que parece menor, pero no lo es: **nrld está escrito en C sin libc**, con syscalls crudos, sin `malloc` y sin `printf`. No es un `LD_PRELOAD` más del que se espera que "ya funciona". Es código que se lee de arriba abajo, que se compila con `meson` en un rato y que no depende de ningún secreto del host.

## El avance importante: usar herramientas musl desde aplicaciones glibc

Durante mucho tiempo, uno de los problemas más molestos era este:

Una aplicación glibc (por ejemplo un programa hecho con Electron o GTK) necesita lanzar una herramienta del sistema. Esa herramienta es musl (como `git`, `bwrap` u otros helpers).

Como la aplicación glibc estaba corriendo con un entorno preparado para glibc, el hijo heredaba variables como `LD_LIBRARY_PATH` apuntando al sysroot de glibc. El resultado era predecible: el programa musl intentaba cargar "repuestos" equivocados y fallaba.

### Cómo se resolvió

El proxy ahora intercepta las llamadas que lanzan otros programas (`execve`, `posix_spawn` y similares). Antes de ejecutar el nuevo proceso, hace una comprobación sencilla pero efectiva:

- Mira qué intérprete tiene el programa que se quiere lanzar.
- Si detecta que es un binario **musl**, limpia del entorno las variables que podrían contaminarlo (`LD_LIBRARY_PATH` y `LD_PRELOAD`).
- Si el programa es glibc, lo deja pasar con el entorno normal (porque volverá a pasar por nrld).

### ¿Qué se gana con esto?

Que las aplicaciones glibc pueden usar de forma natural las herramientas y dependencias de runtime del sistema musl.

Ejemplos concretos:

- Un editor o una IDE basada en Electron puede mostrar el árbol de git de un proyecto.
- Aplicaciones que necesitan lanzar helpers del sistema (compresión, sandboxing, conversión de imágenes, etc.) dejan de romperse.
- Se reduce la necesidad de duplicar herramientas dentro del sysroot de glibc.

Este avance tiene una consecuencia importante de diseño: **ya no es necesario mantener un árbol completo de binarios dentro del sysroot**. En la práctica, el objetivo se acerca mucho más a algo parecido a `lib32`: un conjunto de bibliotecas bien organizado, sin necesidad de duplicar gran parte de las herramientas del sistema.

En otras palabras, el sysroot puede orientarse casi exclusivamente a **libs**, y dejar que los helpers y programas auxiliares sigan siendo los del sistema musl.

## Mirando un poco más lejos: otras arquitecturas

Aunque nrld nació para resolver el conflicto entre musl y glibc en la misma arquitectura (x86-64), la misma idea de aislamiento abre otra posibilidad interesante:

> ¿Se podría usar un enfoque parecido para ejecutar programas de otra arquitectura sobre un sistema x86?

Hoy en día ya es posible experimentar con esto combinando:

- `qemu-user` (que traduce las instrucciones de la otra arquitectura)
- Un sysroot con las bibliotecas de esa arquitectura
- Una lógica de aislamiento similar a la de nrld

No se trata de emular una máquina completa, sino de traducir solo lo necesario del proceso y aprovechar el kernel del host. El resultado es más ligero que una máquina virtual tradicional.

Todavía es un terreno experimental, pero demuestra que el problema de fondo (aislar correctamente entornos de userspace distintos) no se limita solo a musl frente a glibc. La misma filosofía podría aplicarse, con el trabajo adecuado, a otras arquitecturas.

## Limitaciones actuales

Como todo diseño, este también tiene sus límites:

- Por ahora el desarrollo principal está centrado en **x86-64**.
- Para aplicaciones grandes hace falta tener bastantes bibliotecas dentro del entorno aislado.
- Algunas formas muy especiales de lanzar programas todavía no están completamente cubiertas: las variantes `execl*` y `execveat` no pasan por la interposición, así que una app que spawnee un hijo musl por ahí seguiría filtrando el entorno. En la práctica, las apps de este ecosistema usan `execve` o `posix_spawn`, pero conviene saberlo.
- El código del cargador principal concentra mucha lógica en un solo lugar.

Nada de esto es insalvable, pero son puntos que hay que tener en cuenta.

## Estado actual del proyecto

Hoy en día, nrld ya se usa de forma real dentro de NeonatoX. Se ha probado con:

- Firefox (incluidos sus procesos internos, tanto en versiones modernas como ESR)
- Chromium, Brave y aplicaciones basadas en Electron
- Varios AppImages (OpenShot 4.0.0 entre ellos)
- Programas hechos con GTK y Qt

El sistema es usable en el día a día y sigue evolucionando. Uno de los resultados más visibles del último avance es precisamente que aplicaciones complejas pueden apoyarse en herramientas musl del sistema sin romperse, lo que permite simplificar el sysroot y acercarlo a un modelo más ligero, centrado en bibliotecas.

Compilarlo y probarlo son cuatro órdenes:

```bash
meson setup build --prefix=/usr
meson compile -C build
meson test -C build
sudo meson install -C build
```

## Los problemas reales y cómo se fueron resolviendo

El camino hasta el nrld actual no fue lineal. Hubo varios problemas concretos que, en su momento, parecían capaces de tumbar todo el enfoque. Ir resolviéndolos uno por uno es lo que terminó dando forma al sistema que existe hoy.

### 1. La mezcla de dos libcs

El síntoma más clásico: el programa arrancaba y, en algún momento, terminaba en un `SIGSEGV` difícil de entender (muchas veces dentro de `strtod_l` u otras funciones). La causa era simple de explicar y difícil de evitar: alguna biblioteca terminaba resolviendo hacia la versión musl de `/usr/lib` en lugar de la glibc del sysroot.

**Solución:** un guard transitivo de dependencias (`DT_NEEDED`) + el escaneo en runtime del proxy. Si algo se sale del sysroot, se corta de forma limpia en lugar de dejar que el proceso se corrompa.

### 2. `/proc/self/exe` apuntaba al loader

Muchas aplicaciones (especialmente navegadores y cosas basadas en Electron) consultan `/proc/self/exe` para encontrarse a sí mismas. Si esa ruta apunta al cargador en lugar del programa real, empiezan a fallar de formas raras.

**Solución:** en modo usuario se crea una copia del binario con el `PT_INTERP` reescrito al loader real de glibc. El kernel carga ese loader dentro del mismo proceso y `/proc/self/exe` sigue apuntando a la aplicación.

### 3. AppImages rechazadas por el loader de glibc

Los AppImage type-2 llevan bytes no estándar en el encabezado ELF. El loader de glibc los rechaza directamente.

**Solución:** detectar ese caso, crear una copia temporal con el encabezado corregido y ejecutar esa copia. El contenido del AppImage no se ve afectado.

### 4. Rutas absolutas en las dependencias

Algunos binarios traen `DT_NEEDED` con rutas absolutas (por ejemplo `/usr/lib/libalgo.so`). El loader las toma literalmente y, otra vez, termina metiendo bibliotecas musl en el proceso.

**Solución:** detectar esas entradas, crear una copia parcheada donde la ruta absoluta se convierte en un soname normal, y asegurarse de que se resuelva dentro del sysroot.

### 5. Los hijos musl heredaban el entorno glibc

Este fue uno de los más engorrosos. Una aplicación glibc lanzaba una herramienta del sistema (git, bwrap, etc.). Esa herramienta es musl, pero heredaba `LD_LIBRARY_PATH` apuntando al sysroot de glibc… y fallaba.

**Solución:** el proxy intercepta las llamadas de ejecución y, cuando detecta que el destino es musl, limpia las variables peligrosas del entorno antes de lanzarlo. Este cambio fue especialmente importante: permitió que las aplicaciones glibc usaran helpers del sistema y, de paso, abrió la puerta a simplificar el sysroot (orientarlo más a bibliotecas y menos a binarios duplicados).

### 6. El ruido en la salida estándar

Al principio nrld escribía muchos mensajes de diagnóstico a la salida normal. Eso rompía cosas como `make`, scripts que capturan la salida, o herramientas del propio toolchain.

**Solución:** todo el diagnóstico pasó a stderr, con niveles de log y silencio por defecto. Solo se habla cuando se le pide o cuando hay un error real.

### 7. Procesos que se "tragaban" los mensajes de error

En Firefox, por ejemplo, los procesos de contenido redirigen su stderr. Un rechazo del proxy podía quedar completamente invisible.

**Solución:** se añadió la posibilidad de reflejar los mensajes del proxy en un archivo de log, para poder diagnosticar incluso cuando la terminal no muestra nada.

Cada uno de estos problemas fue empujando el diseño hacia un aislamiento más estricto y, al mismo tiempo, más usable. El resultado actual no es solo que "los programas glibc arrancan", sino que pueden convivir de forma mucho más natural con el sistema musl que los rodea.

## Conclusión

nrld no intenta hacer que musl "entienda" glibc. Tampoco intenta convertir un programa glibc en algo musl. Simplemente le da a ese programa un entorno glibc auténtico y bien aislado, y se asegura de que no se mezcle con el resto del sistema.

El hecho de que ahora las aplicaciones glibc puedan usar helpers musl de forma segura es un paso importante: ya no solo "pueden ejecutarse", sino que pueden integrarse mejor con el sistema que las rodea. Y gracias a eso, el propio sysroot puede volverse más simple, parecido en espíritu a lo que tradicionalmente se ha hecho con `lib32`.

Además, aunque todavía es temprano, la misma línea de trabajo sugiere posibilidades más amplias, como experimentar con otras arquitecturas sobre un host x86.

El código está disponible bajo licencia GPL v3 en:

[https://github.com/NeonatoX/neonatox-rldispatcher](https://github.com/NeonatoX/neonatox-rldispatcher)

Happy hacking.
