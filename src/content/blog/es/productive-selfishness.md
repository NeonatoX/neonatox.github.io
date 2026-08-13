---
title: "El egoísmo productivo: Git, Linux y algunas reflexiones sobre Neonatox"
description: "Cómo el 'egoísmo productivo' inspiró esta distro Linux, al igual que Git y Linux nacieron de resolver problemas propios."
pubDate: 2026-06-20
lang: es
author: "Carlos Sánchez"
tags: ["Software Libre", "Neonatox", "Linux", "Desarrollo"]
---

Hola ¿qué tal?

Hace unos días estuve leyendo nuevamente sobre la historia de Git. Aunque hoy parece una herramienta indispensable para cualquier desarrollador, la realidad es que nació de una necesidad bastante concreta. Cuando el desarrollo del kernel Linux perdió acceso a BitKeeper, Linus Torvalds necesitaba una herramienta que pudiera manejar el flujo de trabajo del kernel. Evaluó algunas alternativas, pero ninguna hacía exactamente lo que él necesitaba.

Así que hizo lo que muchos programadores terminamos haciendo tarde o temprano: escribió la suya propia. Pero más interesante que Git, siempre me llamó la atención una frase de Linus:

> "Soy un egoísta terrible; escribo programas para resolver mis propios problemas."

Puede sonar algo extraña la primera vez que se lee, pero si observamos la historia del software libre descubrimos que muchos de los proyectos más importantes nacieron exactamente así.

- Linux nació porque Linus quería un sistema parecido a Unix para su computadora.
- Git nació porque necesitaba una herramienta de control de versiones distribuida.
- Y una enorme cantidad de proyectos que usamos todos los días existen simplemente porque alguien tenía un problema y decidió resolverlo.

Pensando en eso, me di cuenta de que gran parte de Neonatox nació de la misma manera.

Nunca me senté frente a una computadora con la idea de crear una distribución para competir con otras distribuciones. De hecho, muchas de las herramientas que hoy forman parte de Neonatox aparecieron simplemente porque las necesitaba en algún momento.

## Una de las primeras fue Nhopkg

Cuando comencé a construir mi propio LFS, buscaba una forma de gestionar paquetes que se adaptara a mi manera de trabajar. Con el tiempo fueron apareciendo nuevas necesidades y el proyecto fue creciendo. Llegaron los paquetes binarios, la construcción desde fuentes, los repositorios, además de muchas otras características que se han ido incorporando poco a poco.

No existía un plan maestro, simplemente aparecía un problema y la herramienta evolucionaba para resolverlo.

## Algo parecido ocurrió con Neonatox Live Boot

Siempre me gustó entender cómo funciona realmente el arranque de un sistema Linux. Muchas herramientas modernas hacen un excelente trabajo automatizando procesos, pero también esconden gran parte de lo que ocurre detrás de escena. Por simple curiosidad comencé a experimentar con scripts de arranque, detección de dispositivos, OverlayFS y otros componentes. Lo que empezó como una serie de pruebas terminó convirtiéndose con el tiempo en Neonatox Live Boot.

## Lo mismo ocurrió con Mkinitramfs

Quería algo sencillo, algo que pudiera entender completamente meses después sin tener que volver a estudiar cientos de líneas de código. Algo que hiciera su trabajo sin intentar resolver absolutamente todos los problemas posibles y así terminó naciendo.

## Bootstrap tuvo una historia un poco diferente

A diferencia de otras herramientas que fueron apareciendo de forma más orgánica, Bootstrap sí nació con un objetivo bastante concreto. La idea es complementar el entorno proporcionado por Neonatox Live Boot y permitir una instalación desde repositorios utilizando la infraestructura ya existente.

Mientras el instalador estaba pensado en principio para desplegar un sistema Live completo mediante la copia del SquashFS, Bootstrap deberá permitir construir el sistema directamente desde los paquetes disponibles en los repositorios. Con el tiempo fue incorporando nuevas funciones, como la configuración de usuarios, perfiles de escritorio, instalación del cargador de arranque y otras tareas de post-instalación, pero la idea principal siempre fue la misma: trabajar junto con Live Boot para facilitar la construcción de sistemas desde la red sea un live boot completo o uno mínimo.

## Y algo parecido ocurrió con el instalador

Al principio la idea es que el trabajo sea bastante simple: copiar el sistema desde una imagen Live, configurar algunos parámetros básicos y dejar una instalación funcional, por esa razón, contiene herramientas auxiliares para gestionar usuarios, particiones, zonas horarias, configuraciones de arranque y otras tareas. Lo curioso es que muchas de ellas terminaron siendo útiles incluso fuera del propio instalador. Y ahora surge la idea de incorporar más adelante Bootstrap como una forma más de instalar Neonatox.

Mirando hacia atrás, noto que todos estos proyectos comparten algunas características:

- Intentan ser simples.
- Intentan ser transparentes.
- Intentan tener pocas dependencias.
- Sobre todo intentan resolver problemas reales antes que seguir modas o tendencias.

Durante años he pensado y desarrollado estas herramientas sin meditar demasiado en ello. Simplemente aparece una necesidad, intento resolverla y si la solución funciona termina convirtiéndose en parte del proyecto. Vistas por separado parecen herramientas independientes, incluso pueden funcionar como tal, pero observándolas en conjunto, todas comparten un mismo origen: resolver problemas reales que fui encontrando durante el camino.

Quizás por eso la historia de Git me resulta tan familiar. No porque Neonatox pretenda compararse con proyectos como Linux o Git, sino porque la motivación inicial fue muy parecida.

Nunca he visto Neonatox como una competencia para otras distribuciones. Siempre lo he visto más como un laboratorio donde puedo experimentar, aprender cómo funcionan las cosas y construir herramientas adaptadas a mis propias necesidades. Y claro, si alguna de esas herramientas termina ayudando a alguien más, mejor todavía.

Al final, aquella frase de Linus sigue teniendo bastante sentido:

> "Soy un egoísta terrible; escribo programas para resolver mis propios problemas."

Tal vez ese tipo de egoísmo no sea algo malo después de todo, porque muchas veces las mejores herramientas nacen exactamente así:

- Alguien tiene un problema.
- Lo resuelve.
- Comparte la solución.

Y sin darse cuenta, termina ayudando también a otras personas.

Saludos.

Happy hacking!
