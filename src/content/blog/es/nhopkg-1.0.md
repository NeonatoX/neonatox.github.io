---
title: "Finalmente nhopkg 1.0"
description: "El gestor de paquetes de NeonatoX alcanza su primera versión estable: PATH privado con BusyBox + zstd, firma GPG de repositorios, nhouser y mucho más."
pubDate: 2026-09-15
lang: es
author: "Carlos Sánchez"
tags: ["Neonatox", "nhopkg", "release", "anuncio"]
---

Hola.

Si me leen desde hace tiempo, sabrán que soy de esos que prefieren entender de qué van las cosas, aunque para eso haya que ensuciarse las manos toqueteando configuraciones. Y una de las cosas con las que más he toqueteado en los últimos años es **nhopkg**, el gestor de paquetes de NeonatoX, ese que compila todo desde código fuente porque aprender implica meter las patas en el barro.

Bueno, después de bastante trabajo, por fin podemos decirlo en serio: **nhopkg 1.0 ya es una realidad**. Como toda primera versión estable, esto no es solo un salto de número: es el release en el que pensamos que la cosa por fin aguanta el día a día de un sistema rolling release sin dolores de cabeza.

¿Y a quién va dirigido esto? A los curiosos como uno, esa gente que no se conforma con instalar paquetes, sino que quiere saber *cómo* se instalan. Si vienes del LFS y te quedaste con ganas de más, si sueñas con montar tu propia distro desde cero, o si simplemente querías entender qué hace un gestor de paquetes por debajo, esto es para ti. nhopkg es de esos proyectos donde el código se lee, se entiende y se aprende: ni binarios mágicos ni cajas negras, solo bash, tar y zstd bien desglosados.

![nhopkg 1.0](/screenshots/nhopkg-1.0.png)

De todo lo que trae, lo que más me emociona es el **BusyBox + zstd en un PATH privado**: binarios estáticos que se compilan con musl-gcc durante el build, de modo que cuando actualizas la C library del sistema —sí, esas actualizaciones que rompen hasta al gestor de paquetes más pintado— nhopkg sigue funcionando como si nada.

Pero eso no es todo:

- **nhouser**: gestión de usuarios y grupos con doble backend (shadow-utils o BusyBox, detectado en caliente). Clave cuando el `useradd` queda roto tras una actualización.
- **Firma GPG de repositorios**: `nhopkg-repos` reescrito con firmado, verificación, gestión de llaves y metadata de repo firmada.
- **`--root` transparente**: los scripts de pre/post-install se ejecutan dentro del chroot usando namespaces de montaje privados.
- **Metapaquetes**: creas un paquete que agrupa todo un grupo, resuelto directo desde la metadata del repo.
- **`# Replaces:`**: retirar un paquete de forma limpia, sin pisar headers ni romper los builds ajenos.

Y para redondear: llegó la **traducción al ruso** de toda la documentación, descargas paralelas de dependencias, y una buena tanda de cambios para que todo funcione *idéntico* en sistemas GNU y en BusyBox.

## Un adelanto del changelog

Les dejo una muestra de lo último que entró en el [changelog-1.0.md](https://github.com/NeonatoX/neonatox-nhopkg/releases/tag/1.0):

> Estable: 60 commits en 103 archivos desde 2026.3.
> - BusyBox 1.37.0 + zstd 1.5.7 estáticos (musl-gcc) para el PATH privado que sobrevive a actualizaciones de glibc/musl.
> - Detección runtime shadow-utils vs BusyBox para usuarios y grupos, con traducción de flags entre backends.
> - `nhopkg-repos`: `sign`, `sign-all`, `verify`, `keygen`, `import-key`, … con firma verificada en cada update.
> - `ns_exec_in()` con mount namespace privado para ejecución `--root`.
> - Metapaquetes vía `nhopkg-src --init --meta`.
> - Descargas paralelas de dependencias (`NHOPKG_DOWNLOAD_JOBS`, por defecto 4).

Si quieren ver la lista completa de cambios, los invito a revisar el release:

https://github.com/NeonatoX/neonatox-nhopkg/releases/tag/1.0

Espero que les sea útil y que se animen a probarlo. Ya saben que de estas cosas siempre se aprende algo nuevo.

Happy hacking.