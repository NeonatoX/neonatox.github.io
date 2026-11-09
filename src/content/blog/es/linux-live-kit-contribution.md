---
title: "De admirar un proyecto a contribuir con él: una pequeña historia de software libre"
description: "Un Pull Request de 2025, un 'You're wrong' y un 'thank you for this idea, implemented' un año después: así terminé contribuyendo a Linux Live Kit."
pubDate: 2026-11-09
lang: es
author: "Carlos Sánchez"
tags: ["Software Libre", "Linux Live Kit", "Neonatox", "Upstream"]
---

Hola.

A veces el software libre tiene un sentido del humor bastante particular. 😂

## El problema: `xz` estaba, pero no se veía

En julio de 2025 abrí un Pull Request en **Linux Live Kit**, el proyecto de Thomas M.

¿El motivo? Había encontrado un problema durante las pruebas de construcción de sistemas Live: los scripts de Linux Live no detectaban correctamente la presencia de `xz`, incluso cuando estaba instalado.

Me encontré con este comportamiento en Ubuntu, Arch Linux y Linux From Scratch. Y, por supuesto, también afectaba a NeonatoX.

La cuestión era que los scripts intentaban determinar la disponibilidad de XZ analizando la salida de `xz --help` y buscando la palabra «Compress». Era una comprobación frágil: dependía del idioma y del formato de la ayuda, así que en la práctica podía fallar incluso con `xz` instalado. Lo que hacía falta era verificar simplemente la presencia del ejecutable.

## "You're wrong."

Durante la revisión, `crim50n` señaló algo técnicamente correcto: SquashFS soporta compresión XZ desde 2011, por lo que no tenía sentido comprobar si `mksquashfs` ofrecía esa capacidad. Las versiones modernas ya la incorporaban. El problema era que esa funcionalidad no podía utilizarse si el ejecutable `xz` no estaba instalado.

Su respuesta inicial fue bastante directa:

> "You're wrong."

Reconocí la aclaración y expliqué que mi problema no era la compatibilidad de SquashFS con XZ, sino que Linux Live Kit no conseguía detectar `xz` en sistemas donde sí estaba instalado.

La conversación quedó ahí. Mi propuesta inicial no llegó a integrarse y el problema práctico que había identificado seguía pendiente.

## De la frustración a NeonatoX Live Boot

Fue una experiencia que, entre otras cosas, terminó impulsándome a desarrollar mi propia herramienta: **NeonatoX Live Boot**.

Durante ese tiempo, Linux Live Kit pareció entrar en una etapa de relativa inactividad. Sin embargo, mi admiración por el trabajo de Thomas nunca desapareció. Algunas de las ideas de su proyecto incluso influyeron en el diseño de herramientas propias como `nhopkg`.

## Un año después: "thank you for this idea, implemented"

Y aquí viene la parte verdaderamente curiosa.

Ayer estaba conversando sobre Linux Live Kit, su nueva versión 2.13, la adopción de GRUB 2 y la influencia que había tenido en mis proyectos. Incluso bromeaba diciendo que ahora Thomas era nuestra competencia.

Hoy descubro que Thomas ha retomado aquella propuesta y ha incorporado una solución en el repositorio oficial.

El cambio es sencillo y más robusto: en lugar de analizar la salida de `xz --help`, ahora se comprueba directamente la existencia del ejecutable mediante `command -v xz`.

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

Al cerrar el Pull Request, Thomas dejó este comentario:

> "thank you for this idea, implemented."

Después de más de un año, aquella pequeña propuesta finalmente encontró su lugar en Linux Live Kit.

## Lo que significa

No es una contribución enorme ni pretende serlo. Es una pequeña mejora, pero tiene un significado especial para mí.

Porque detrás de esas pocas líneas hay una historia de aprendizaje, de proyectos propios, de intercambio técnico y, sobre todo, de software libre.

Hoy puedo decir que un proyecto que admiro no solamente me inspiró: también tiene una pequeña contribución mía.

Gracias, Thomas.

Y sí, seguimos siendo competencia... ¡pero ahora también somos upstream! 😂

---

**Referencias:**

- Pull Request #290: https://github.com/Tomas-M/linux-live/pull/290
- Commit integrado: https://github.com/Tomas-M/linux-live/commit/cfd4b95eec8e8c761dc3a74fabed6f29d99aee2a
- Linux Live Kit 2.13: https://github.com/Tomas-M/linux-live/releases/tag/v2.13
- NeonatoX Live Boot: https://github.com/NeonatoX/neonatox-live-boot
