🤖 AGENTS.md — Neonatox Web Project
===================================

**Propósito:** Este documento contiene toda la información necesaria para que un agente de IA pueda continuar desarrollando, manteniendo o ampliando el sitio web de **Neonatox** sin perder contexto.

**📋 Índice**

*   [1\. Identidad del Proyecto](#identidad)
*   [2\. Stack Técnico](#stack)
*   [3\. Estructura de Archivos](#estructura)
*   [4\. Internacionalización (i18n)](#i18n)
*   [5\. Guía de Estilo y Contenido](#estilo)
*   [6\. Documentación de nhopkg](#nhopkg)
*   [7\. Despliegue en GitHub Pages](#deploy)
*   [8\. Próximos Pasos y Prioridades](#proximos)
*   [9\. Comandos Útiles](#comandos)
*   [10\. Notas para el Agente](#notas)

🎯 1. Identidad del Proyecto
----------------------------

### Nombre y Acrónimo

    NEONATOX = NEw Operating system, Not Another Derivative, TOtally eXperimental

### Filosofía Central

*   **No es una caja negra:** El sistema debe ser transparente y educativo.
*   **Aprender construyendo:** Cada componente enseña cómo funciona por dentro.
*   **Simplicidad estructural:** Abstracción justa, no más.
*   **Formar arquitectos, no usuarios pasivos.**

### Base Técnica

Componente

Elección

Fundamento

Linux From Scratch (LFS)

Init

systemd

Arquitectura

Multilib (x86\_64 + i686)

Gestor de paquetes

nhopkg (nativo, propio)

Público

Usuarios avanzados, desarrolladores, educadores

### Sitio Web

*   **URL:** `https://neonatox.github.io`
*   **Repo:** `https://github.com/NeonatoX/neonatox.github.io`
*   **Idiomas:** ES (default), EN, PT-BR
*   **Estilo:** Landing moderna + documentación técnica clara

⚙️ 2. Stack Técnico
-------------------

### Dependencias Principales (`package.json`)

    {
      "dependencies": {
        "astro": "^5.0.0",
        "@astrojs/tailwind": "^5.1.2",
        "@astrojs/sitemap": "^3.2.0",
        "tailwindcss": "^3.4.14"
      },
      "devDependencies": {
        "postcss": "^8.4.49",
        "autoprefixer": "^10.4.20"
      }
    }

### Configuración Clave

#### `astro.config.mjs`

    import { defineConfig } from 'astro/config';
    import tailwind from '@astrojs/tailwind';
    import sitemap from '@astrojs/sitemap';
    
    export default defineConfig({
      site: 'https://neonatox.github.io',
      base: '/',
      integrations: [tailwind(), sitemap()],
      i18n: {
        defaultLocale: 'es',
        locales: [
          { path: 'es', codes: ['es', 'es-ES'], label: 'Español' },
          { path: 'en', codes: ['en', 'en-US'], label: 'English' },
          { path: 'pt', codes: ['pt', 'pt-BR'], label: 'Português' }
        ],
        routing: { prefixDefaultLocale: true }
      }
    });

#### `tailwind.config.cjs`

    module.exports = {
      content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      theme: {
        extend: {
          colors: {
            neon: { cyan: '#00f5ff', purple: '#b967ff' }
          }
        }
      },
      plugins: []
    }

#### `postcss.config.cjs`

    module.exports = {
      plugins: { tailwindcss: {}, autoprefixer: {} }
    }

📁 3. Estructura de Archivos
----------------------------

neonatox.github.io/ ├─ public/ │ └─ robots.txt ├─ src/ │ ├─ assets/ # Imágenes, SVGs, fuentes │ ├─ components/ │ │ ├─ Header.astro # Navbar con LangSwitcher │ │ ├─ Footer.astro │ │ └─ LangSwitcher.astro # Selector ES/EN/PT │ ├─ content/docs/ # Futuro: MDX para guías │ ├─ layouts/ │ │ └─ BaseLayout.astro # Layout base con <slot /> │ ├─ pages/ │ │ ├─ index.astro # Redirect a /es/ │ │ ├─ es/ │ │ │ ├─ index.astro # Landing ES │ │ │ ├─ filosofia.astro │ │ │ ├─ arquitectura.astro │ │ │ ├─ paquetes.astro # Docs nhopkg + ejemplo Transmission │ │ │ └─ ruta-constructor.astro │ │ ├─ en/ # Mismas páginas, traducción EN │ │ └─ pt/ # Mismas páginas, traducción PT-BR │ └─ utils/ │ └─ i18n.ts # Diccionario de traducciones ├─ astro.config.mjs ├─ tailwind.config.cjs ├─ postcss.config.cjs ├─ tsconfig.json └─ package.json

#### Convenciones de Nombres

*   Páginas i18n: `src/pages/{es|en|pt}/{slug}.astro`
*   Componentes: PascalCase (`LangSwitcher.astro`)
*   Utilidades: camelCase (`i18n.ts`)
*   Assets: kebab-case (`hero-bg.svg`)

🌐 4. Internacionalización (i18n)
---------------------------------

### Diccionario Central (`src/utils/i18n.ts`)

    export const dict = {
      es: {
        heroTitle: "No es otra distro. Es tu próxima evolución con Linux.",
        heroDesc: "Neonatox no es una caja negra...",
        ctaStart: "Empieza a construir",
        ctaArch: "Ver la arquitectura",
        pkgRuleTitle: "Un paquete en Neonatox enseña, no solo instala."
      },
      en: {
        heroTitle: "Not another distro. Your next evolution with Linux.",
        heroDesc: "Neonatox isn't a black box...",
        ctaStart: "Start building",
        ctaArch: "See the architecture",
        pkgRuleTitle: "A Neonatox package teaches, it doesn't just install."
      },
      pt: {
        heroTitle: "Não é só mais uma distro. É sua próxima evolução com Linux.",
        heroDesc: "Neonatox não é uma caixa preta...",
        ctaStart: "Comece a construir",
        ctaArch: "Ver a arquitetura",
        pkgRuleTitle: "Um pacote no Neonatox ensina, não apenas instala."
      }
    };
    
    export const getLangFromPath = (path: string): 'es'|'en'|'pt' => {
      const match = path.match(/^\/(es|en|pt)/);
      return (match?.[1] as 'es'|'en'|'pt') || 'es';
    };

### Uso en Páginas

    ---
    import { dict } from '../../utils/i18n';
    const lang = Astro.params.lang || 'es';
    const t = dict[lang as keyof typeof dict];
    ---
    <BaseLayout lang={lang}>
      <h1>{t.heroTitle}</h1>
    </BaseLayout>

### Selector de Idioma (`LangSwitcher.astro`)

*   Reconstruye URLs manteniendo la ruta: `/es/paquetes` → `/en/packages`
*   Muestra estado activo con estilo destacado
*   Usa atributos `hreflang` para SEO

✍️ 5. Guía de Estilo y Contenido
--------------------------------

### Tono y Voz

Característica

Descripción

Ejemplo

**Conversacional**

Habla directo al lector, como un compañero

"Si quieres dominar Linux, bienvenido."

**Técnico pero accesible**

Explica conceptos complejos con analogías simples

"`DESTDIR` es como una maleta temporal para instalar"

**Humor natural**

Toques ligeros sin forzar

"No, no vamos a vender humo. Vamos a compilar realidad."

**Práctico**

Siempre termina con "¿y ahora qué hago?"

"Próximo paso: clona el repo y ejecuta `nbuild()`"

### Estructura de Páginas Técnicas

1.  **Contexto breve** (¿para qué sirve esto?)
2.  **Explicación paso a paso** o desglose conceptual
3.  **Ejemplo real** (snippet de código, comando, archivo)
4.  **"Por qué importa"** (enlace a filosofía o siguiente paso)
5.  **Toque humano** (anécdota, humor, advertencia honesta)

### SEO Integrado

*   **Titles:** < 60 caracteres, incluye keyword principal
*   **Meta descriptions:** < 155 caracteres, llamada a la acción
*   **Encabezados:** Jerarquía clara `H1 → H2 → H3`
*   **Keywords:** Técnicas + long-tail (`nhopkg formato`, `LFS systemd multilib`)
*   **Enlazado interno:** De "multilib" → `/arquitectura`, de `build()` → `/ruta-constructor`
*   **OpenGraph:** Imagen 1200x630, título y descripción únicos por idioma

### Recursos Visuales

*   **Bancos libres:** Unsplash, Pexels, Pixabay (con atribución)
*   **Infografías:** SVG editables para diagramas de arquitectura
*   **Código:** Highlight con `font-mono`, fondo `bg-slate-900`, texto `text-green-400`

📦 6. Documentación de nhopkg
-----------------------------

### Formato del Archivo `.nhopkg`

    #%NHO-0.5                    # Versión del formato
    # Package Maintainer: nombre <email>
    
    # Name:       paquete
    # Version:    1.0.0
    # Release:    n2026
    # License:    GPL-2.0-or-later
    # Repository: extra
    # Arch:       i686 x86_64
    # Url:        https://...
    # Description: Texto breve
    # Splitpackage: subpkg1 subpkg2   # Opcional: paquetes derivados
    
    # BuildDep:   dependencias-de-compilación
    # Dep(post):  dependencias-de-ejecución
    # Dep_subpkg(post): deps específicas por sub-paquete

### Funciones del Ciclo de Vida

Función

Propósito

Notas

`nbuild()`

Compilación aislada

Usar `build/`, `CFLAGS` explícitas, `make -j$(nproc/2)`

`ninstall()`

Instalación del paquete base

Usar `DESTDIR` temporal, integrar systemd, licencias

`ninstall_subpkg()`

Instalación de sub-paquetes

Mismo patrón, rutas específicas

`npostinstall()`

Hooks post-instalación

`noemptyfuncs` si no hay acción requerida

`npostremove()`

Limpieza post-remoción

Opcional, pero consistente

### Ejemplo Real: Transmission 4.1.1

*   **Split packages:** `base`, `gtk`, `qt`
*   **Integración systemd:** `.service`, `sysusers.d`, `tmpfiles.d`
*   **Licencias:** Instaladas en `/usr/share/licenses/{subpkg}/COPYING`
*   **Web UI:** Copiada desde `build/web/public_html/`

### Reglas de Empaquetado Neonatox

*   **Reproducibilidad:** Mismo input → mismo binario
*   **Transparencia:** La automatización no esconde decisiones
*   **Separación:** `BuildDep` ≠ `Dep(post)`
*   **Minimalismo:** Abstracción justa, no más
*   **Educación:** Leer un PKG es leer una mini-doc

🚀 7. Despliegue en GitHub Pages
--------------------------------

### Configuración del Repo

*   **Nombre:** `neonatox.github.io` (obligatorio para dominio root)
*   **Branch:** `main`
*   **GitHub Pages:** Settings → Pages → Source: `GitHub Actions`

### Workflow Recomendado (`.github/workflows/deploy.yml`)

    name: Deploy to GitHub Pages
    on:
      push: { branches: [main] }
      workflow_dispatch:
    permissions:
      contents: read
      pages: write
      id-token: write
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '20' }
          - run: npm ci
          - run: npm run build
          - uses: actions/upload-pages-artifact@v3
            with: { path: ./dist }
      deploy:
        needs: build
        environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
        steps:
          - uses: actions/deploy-pages@v4

### Verificación Post-Deploy

*   `https://neonatox.github.io/es/` carga
*   Selector de idioma funciona
*   Sitemap generado (`/sitemap-index.xml`)
*   Robots.txt accesible
*   Sin errores 404 en enlaces internos

📌 8. Próximos Pasos y Prioridades
----------------------------------

### MVP v1.0 (Completado ✅)

*   Estructura Astro + Tailwind + i18n
*   Landing page con hero + CTAs
*   Página de paquetes con ejemplo Transmission
*   Selector de idioma funcional
*   SEO base + sitemap

### v1.1 (Prioridad Alta)

1.  **Ruta del Constructor** (`/ruta-constructor`): Guía paso a paso LFS → primer nhopkg → ISO bootable
2.  **Página de Arquitectura**: Diagrama SVG de capas del sistema, comparativa con Debian/Arch/Gentoo
3.  **Blog técnico**: Primer post "De usuario curioso a constructor de sistemas" (historia personal)
4.  **FAQ técnica**: Preguntas frecuentes sobre nhopkg, systemd, multilib

### v1.2 (Prioridad Media)

1.  **Buscador interno**: Integración con Pagefind o similar
2.  **Modo oscuro/claro**: Toggle persistente con `localStorage`
3.  **RSS feeds**: Por idioma, para el blog
4.  **Analytics ligero**: Plausible o Fathom (privacy-first)

### v2.0 (Visión)

1.  **Generador interactivo de nhopkg**: Formulario web que exporta esqueleto de paquete
2.  **Repositorio de paquetes documentados**: Catálogo con filtros por categoría, complejidad, dependencias
3.  **Entorno de prueba en navegador**: WebAssembly + xterm.js para simular `nbuild()`

🛠️ 9. Comandos Útiles
----------------------

    # Desarrollo local
    npm run dev          # Inicia servidor en http://localhost:4321
    npm run dev -- --host  # Expone a red local
    
    # Build y preview
    npm run build        # Genera /dist para producción
    npm run preview      # Sirve /dist localmente
    
    # Limpieza
    rm -rf node_modules dist
    npm install          # Reinstala dependencias limpias
    
    # SEO y calidad
    npx astro check      # Verifica tipos y enlaces
    npx astro build && npx serve dist  # Preview post-build
    
    # i18n: Añadir nuevo idioma
    # 1. Actualizar astro.config.mjs → locales
    # 2. Añadir entradas en src/utils/i18n.ts
    # 3. Crear carpeta src/pages/{nuevo-codigo}/
    # 4. Traducir páginas base

🤖 10. Notas para el Agente
---------------------------

**Antes de Modificar:**

1.  **Lee este archivo completo** para entender contexto
2.  **Verifica la rama actual:** `git branch` (trabaja en `main` o crea feature branch)
3.  **Prueba localmente:** `npm run dev` antes de commitear

#### Al Añadir Contenido Nuevo

*   **Sigue la estructura i18n:** Crea versiones ES/EN/PT simultáneamente
*   **Mantén el tono:** Revisa la [Guía de Estilo](#estilo)
*   **SEO desde el inicio:** Title, meta description, encabezados jerárquicos
*   **Enlazado interno:** Conecta conceptos relacionados entre páginas

#### Al Corregir Bugs

1.  **Reproduce el error** localmente
2.  **Revisa consola del navegador** (F12 → Console) y terminal de Astro
3.  **Aísla el componente:** Prueba con versión mínima funcional
4.  **Documenta la solución:** Añade comentario en el código si el fix no es obvio

#### Al Recibir Nuevos nhopkg

1.  **Valida formato:** `#%NHO-0.5`, funciones requeridas, dependencias explícitas
2.  **Extrae metadatos:** Nombre, versión, licencia, descripción, split packages
3.  **Genera documentación:** Anatomía del paquete, claves educativas, ejemplo de uso
4.  **Actualiza `/paquetes`:** Añade a la galería de ejemplos con enlace al source

**Contacto Humano:**  
Si algo no está claro o necesitas decisión de diseño:

*   **Pregunta específica:** "¿Prefieres que la página de Arquitectura use diagrama SVG o tabla comparativa?"
*   **Opciones concretas:** Ofrece 2-3 alternativas con pros/contras
*   **Contexto técnico:** Incluye snippet o error exacto si es relevante

**Última actualización:** Mayo 2026  
**Mantenedor:** @cargabsj175  
**Licencia del contenido:** CC BY-SA 4.0  
**Código del sitio:** MIT

✨ "Neonatox no es el destino. Es el mapa para que construyas el tuyo."

// Smooth scroll para enlaces internos document.querySelectorAll('a\[href^="#"\]').forEach(anchor => { anchor.addEventListener('click', function(e) { e.preventDefault(); const target = document.querySelector(this.getAttribute('href')); if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }); }); // Resaltar sección activa en TOC al hacer scroll const sections = document.querySelectorAll('h2\[id\]'); const tocLinks = document.querySelectorAll('.toc a'); window.addEventListener('scroll', () => { let current = ''; sections.forEach(section => { const sectionTop = section.offsetTop - 100; if (pageYOffset >= sectionTop) { current = section.getAttribute('id'); } }); tocLinks.forEach(link => { link.style.color = ''; if (link.getAttribute('href') === \`#${current}\`) { link.style.color = 'var(--accent-cyan)'; link.style.fontWeight = '600'; } }); });
