---
title: "El Portal de Fuentes de NeonatoX ya está aquí"
description: "Presentamos el portal de fuentes: metadata nhoid en Git, paquetes interconectados y un catálogo generado directamente desde GitLab."
pubDate: 2026-11-26
lang: es
author: "Carlos Sánchez"
tags: ["Neonatox", "nhopkg", "nhoid", "fuentes", "GitLab", "anuncio"]
---

Durante mucho tiempo, tuve una idea clara en mente: crear un espacio que recopilara de manera amigable y accesible toda la información sobre los paquetes de NeonatoX, tanto en su forma de código fuente (*sources*) como en su versión binaria.

Hoy, ese espacio es una realidad. Nos complace presentar el nuevo **[Portal de Fuentes de NeonatoX](https://neonatox-sources.gitlab.io/)**.

![Catálogo de paquetes del Portal de Fuentes de NeonatoX](/screenshots/portal-de-fuentes-catalogo.png)

### La inspiración: Mostrar las entrañas con estilo KISS

Si hay algo que siempre me ha parecido genial y profundamente humano es el estilo de navegadores de paquetes como el de Arch Linux. Su filosofía es clara: ordenado, limpio, prolijo y simple. Muestra las "entrañas" del sistema sin adornos innecesarios, confiando en la inteligencia del usuario.

Ese es exactamente el espíritu que queríamos capturar. NeonatoX no es una caja negra; es un sistema diseñado para ser entendido. Queríamos que, al entrar al portal, la experiencia fuera tan clara que cualquier persona pudiera decir: *"Oye, entiendo esto. Está muy claro para mí"*.

### El viaje técnico: De scripts locales a la verdad única de Git

Llegar a este punto no fue un camino recto. Inicialmente, intenté resolver el problema con scripts en Bash que procesaran los paquetes en local. Sin embargo, me encontré con un muro: la metadata no siempre estaba disponible de manera consistente y el sistema local rara vez estaba en el estado exacto necesario para que el proceso fuera fiable al 100%.

El punto de inflexión llegó al tomar una decisión arquitectónica fundamental: **migrar toda la metadata (`nhoid`) a Git**.

Esta decisión cambió las reglas del juego. Permitió que `nhopkg` se valiera de Git como la "fuente única de verdad" para crear paquetes y armar la distribución. A medida que fui definiendo los *pipelines* y los flujos de trabajo (Workflows) de GitLab CI/CD, entendí cómo automatizar y escalar este proceso. El resultado es el generador estático actual: un script en Python que, con caché incremental y procesamiento paralelo, lee directamente de la API de GitLab, garantizando que lo que ves en la web es exactamente lo que está en el repositorio, siempre actualizado y sin fricción.

### Una experiencia interconectada, no islas de información

El mayor valor de este nuevo portal no es solo que sea bonito, sino que **da contexto**.

Antes, los paquetes podían sentirse como un montón de repositorios individuales con recetas aisladas. Ahora, están entrelazados. Desde el portal, puedes analizar un paquete y, con un clic, navegar directamente a sus dependencias, probar la estructura de su binario o entender cómo se divide en subpaquetes (`splitpackages`).

![Vista de un paquete en el Portal de Fuentes de NeonatoX](/screenshots/portal-de-fuentes-paquete.png)

El objetivo es que dejes de ver comandos sueltos y empieces a ver el ecosistema completo. Queremos que te sientas en casa, con la misma claridad y confianza que muchos sentimos al descubrir Linux por primera vez a través de comunidades que valoran la transparencia.

### Una casa ordenada para construir juntos

De momento, nuestro enfoque es pulir y mejorar lo que ya hemos conseguido. La base está sólida: noticias, feeds RSS, caché eficiente y una estructura clara. Más adelante, exploraremos funcionalidades como gráficos de dependencias o búsqueda en tiempo real.

Pero lo más importante de esta herramienta es lo que representa para el futuro de NeonatoX: **orden**.

Quien desee ser parte del proyecto, ya sea para reportar un error, mejorar una receta `nhoid` o proponer una nueva característica, encontrará ahora "la casa ordenada". Hay un punto de partida claro, documentación accesible y un flujo de trabajo definido. No hay secretos, solo código y voluntad de colaborar.

### Una última reflexión

A cualquiera que esté leyendo esto y sienta curiosidad por probar NeonatoX, revisar un `nhoid` o sumarse al desarrollo, solo quiero decirle esto:

> *"Cuando amas lo que haces y tienes la posibilidad, hazlo y llévalo hasta su última consecuencia. Te sorprenderá hasta dónde puedes llegar con una buena idea y un poco de ayuda."*

El mapa está aquí. Las herramientas están listas. Te invitamos a empezar a construir con nosotros.

---
*¿Quieres explorar el código? Visita el [repositorio del portal](https://gitlab.com/neonatox-sources/neonatox-sources.gitlab.io) o sumérgete directamente en el [catálogo de paquetes](https://neonatox-sources.gitlab.io/packages/).*
