---
title: "Bienvenido a Neonatox — Un recorrido por la web"
description: "Conoce todas las secciones de la página oficial de Neonatox, su propósito y cómo aprovecharlas al máximo."
pubDate: 2026-05-26
lang: es
author: "Carlos Sánchez"
tags: ["neonatox", "web", "bienvenida"]
---

Neonatox no es solo un sistema operativo. Es un proyecto que nace de una filosofía clara: **abrir la caja negra** y aprender construyendo.

Esta web es el centro de documentación, descargas y comunidad. Aquí te guiamos por sus secciones.

---

## Páginas principales

### Inicio

La landing page te recibe con una visión general: qué es Neonatox, por qué existe y hacia dónde va. Encontrarás un contador en vivo con la cantidad de paquetes disponibles en el repositorio.

### Historia

Neonatox empezó como un experimento personal con Linux From Scratch. La página de Historia narra ese recorrido: desde copiar y pegar comandos hasta entender cada capa del sistema, pasando por el origen del nombre, la creación de **nhopkg**, la pausa del proyecto y su regreso en 2023.

### Filosofía

Aquí está el corazón del proyecto. Explicamos por qué Neonatox **no es otra distro**, por qué rechazamos las cajas negras y cómo cada paquete está diseñado para enseñar, no solo para instalar.

### Arquitectura

Un desglose técnico de las capas del sistema: toolchain, kernel, init, gestor de paquetes, escritorio. Ideal para entender cómo encaja todo.

### Paquetes

Documentación completa del formato `*.srcnho` (nhoid) y `.nho`. Incluye un ejemplo real con Transmission 4.1.1, sus funciones de ciclo de vida (`nbuild`, `ninstall`, etc.) y, desde la última actualización, las **métricas del repositorio** con conteo total de paquetes, activos por período y distribución por categoría.

### Proyectos

Los cuatro pilares del ecosistema:
- **nhopkg** — gestor de paquetes nativo
- **live-boot** — sistema live basado en overlayfs
- **installer** — instalador gráfico
- **sources** — repositorio GitLab con todos los nhoid

### Descargas

Tres ISOs live listas para probar: **GNOME 50**, **KDE 6.23.0** y **XFCE 4.20**. Cada una incluye enlace de descarga directa, torrent/magnet y SHA256. También encontrarás credenciales de acceso y recomendaciones de uso con VirtualBox.

### Ruta del Constructor

Una guía paso a paso para pasar de usuario curioso a constructor de sistemas: LFS → nhopkg → paquete propio → ISO bootable.

---

## Características de la web

- **Multilingüe:** Español, English, Português — selector de idioma en el header
- **Estilo visual:** Fondo oscuro, acentos cyan y púrpura, tipografía clara
- **Responsive:** Navegación adaptable con menú hamburguesa en móvil
- **SEO:** Sitemap automático, meta descriptions, OpenGraph
- **Métricas en vivo:** Los contadores de paquetes se actualizan desde la API de GitLab al cargar la página
- **Slider de capturas:** Carrusel con imágenes de los escritorios disponibles

---

Este es solo el comienzo. El blog se irá poblando con artículos técnicos, anuncios, guías y reflexiones sobre el proyecto.

Mientras tanto, te invitamos a explorar, descargar una ISO y, sobre todo, **construir**.

✨ *Neonatox no es el destino. Es el mapa para que construyas el tuyo.*
