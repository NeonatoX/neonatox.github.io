---
title: "Del bootstrap con LFS al auto-hosting incremental"
description: "Cómo NeonatoX 27 se auto-bootstrapea: aislamiento OverlayFS con nhopkg-overlay, reconstrucción incremental y un modelo de auto-hosting basado en paquetes."
pubDate: 2026-08-13
lang: es
author: "Carlos Sánchez"
tags: ["Neonatox", "Linux", "Bootstrap", "nhopkg"]
---

*El modelo de bootstrap de NeonatoX 27 con nhopkg-overlay*

## Resumen

NeonatoX utilizó originalmente Linux From Scratch (LFS) como mecanismo de bootstrap. La generación de 2025 se construyó desde un host Archlinux, mientras que NeonatoX 2026 se bootstrapeó desde NeonatoX 2025 usando LFS. Para NeonatoX 27, el proyecto introduce un modelo diferente: el bootstrap incremental. Un sistema NeonatoX existente se usa como plataforma de construcción, nhopkg-overlay proporciona una raíz aislada basada en OverlayFS durante la construcción de paquetes, y los paquetes NHO resultantes se instalan en una raíz completamente separada mediante `nhopkg --root`. Solo se reconstruyen los componentes que necesitan cambiar; los paquetes compatibles pueden reutilizarse. Esto separa el entorno de construcción, los artefactos de paquete y el sistema de destino, permitiendo ensamblar una nueva generación sin modificar la instalación anterior.

## 1. Antecedentes y evolución

La estrategia de bootstrap de NeonatoX evolucionó a lo largo de tres generaciones:

- **NeonatoX 2025** — bootstrap LFS desde un host Archlinux.
- **NeonatoX 2026** — bootstrap LFS desde la generación anterior de NeonatoX.
- **NeonatoX 27** — bootstrap incremental desde NeonatoX 2026 usando `nhopkg-overlay` y `nhopkg`.

La transición importante es que LFS sigue siendo la base histórica del bootstrap, pero ya no es necesario como procedimiento de construcción para cada generación posterior. La distribución existente se convierte en la plataforma desde la que se puede construir la siguiente generación.

## 2. Idea central

El método separa tres roles que a menudo se combinan en los flujos de trabajo tradicionales de bootstrap:

| Componente          | Rol                                             |
|---------------------|-------------------------------------------------|
| NeonatoX 2026       | Plataforma de construcción / generación anterior |
| `nhopkg-overlay`    | Entorno de construcción aislado temporal        |
| Paquetes `.nho`     | Artefactos de construcción persistentes         |
| `$LFS`              | Raíz de destino independiente para la nueva generación |
| `nhopkg --root`     | Ensamblaje de la raíz de destino basado en paquetes |

El principio central es: el sistema anterior se usa para construir el siguiente sistema, pero no se convierte a sí mismo en el siguiente sistema.

## 3. nhopkg-overlay

`nhopkg-overlay` crea un montaje OverlayFS con el sistema de archivos raíz existente como capa inferior y un directorio superior (upper) y de trabajo (work) dedicados. Por lo tanto, la sesión de construcción ve un sistema de archivos que se comporta como el sistema anfitrión, mientras que las modificaciones se redirigen a la capa del overlay.

El diseño relevante es:

- `/var/lib/nhopkg-overlay/upper` — contenido del sistema de archivos modificado.
- `/var/lib/nhopkg-overlay/work` — directorio de trabajo de OverlayFS.
- `/var/lib/nhopkg-overlay/root` — raíz aislada montada.
- `/work` dentro del overlay — directorio de trabajo del host montado con bind.

El último punto es importante: los paquetes `.nho` generados se escriben en el directorio de trabajo montado con bind y, por tanto, sobreviven al desmontaje del overlay. El overlay es efímero como capa de modificación del sistema, mientras que los artefactos de paquete son persistentes.

## 4. Construir normalmente dentro del overlay

Las recetas de paquetes no requieren un sistema de construcción especial consciente del overlay. Continúan ejecutándose mediante el mecanismo normal de construcción de nhopkg, por ejemplo:

> nhopkg -Cv binutils

Esto es significativo porque las recetas existentes pueden reutilizarse con cambios mínimos. Una receta que instala archivos en `/` está modificando efectivamente la capa superior del overlay, no la raíz real de NeonatoX 2026.

## 5. Bootstrap de la toolchain

El núcleo de la transición de NeonatoX 27 incluye los headers actualizados de la API de Linux, binutils, glibc y GCC. Las recetas NHO reales declaran sus dependencias de compilación y realizan construcciones ordinarias.

Versiones de ejemplo utilizadas en el entorno demostrado de NeonatoX 27:

- binutils 2.46.1
- glibc 2.44
- GCC 16.1.0

La receta de GCC usa la toolchain existente para construir GCC 16.1.0, mientras que binutils y glibc se actualizan según sea necesario. Las recetas también soportan paquetes divididos (split packages) y componentes multilib donde la configuración de NeonatoX lo requiere.

## 6. Reutilización incremental

El bootstrap incremental no exige reconstruir todos los paquetes. Un paquete puede reutilizarse cuando su versión y compatibilidad siguen siendo apropiadas para la generación de destino. Los paquetes cuyas versiones o requisitos deben cambiar se reconstruyen en el overlay.

Ejemplos de paquetes presentes en NeonatoX 2026:

- bash 5.3
- bzip2 1.0.8
- gettext 0.26
- gmp 6.3.0

El conjunto de paquetes demostrado de NeonatoX 27 incluye:

- file 5.48
- GCC 16.1.0
- paquete de desarrollo de GCC 16.1.0
- glibc 2.44
- hwdata 0.409

La compatibilidad se evalúa usando la documentación actual de LFS, referencias de Archlinux y el repositorio de paquetes de NeonatoX. En la práctica, un paquete se reutiliza cuando su versión en NeonatoX 2026 coincide exactamente con la versión requerida para NeonatoX 27, siempre que las bibliotecas compartidas de las que depende (principalmente glibc) mantengan compatibilidad binaria hacia atrás con la nueva versión del sistema. Esto es actualmente una decisión de ingeniería pragmática; no implica que versiones idénticas de paquetes por sí solas garanticen la compatibilidad binaria (ABI) en todos los casos.

## 7. Crear la nueva raíz

La raíz de destino está representada por `$LFS`. Puede ser un directorio normal o un sistema de archivos/partición dedicado. Antes de instalar paquetes, se crea la jerarquía del sistema de archivos requerida.

La jerarquía se adapta a la familia de libc detectada en el sistema de construcción. Para glibc, el diseño incluye `/usr/lib`, `/usr/lib32` y los enlaces de compatibilidad correspondientes; para musl, se usa un diseño más simple. La configuración también establece enlaces de /usr fusionado, como `/bin → /usr/bin` y `/lib → /usr/lib`.

Una vez que existe la jerarquía, los paquetes se instalan directamente en la raíz de destino:

> nhopkg --root="$LFS" -i paquete.nho

Por lo tanto, la nueva raíz se ensambla a partir de paquetes, no copiando el directorio superior del overlay.

## 8. Completar el nuevo sistema

Una instalación temporal de BusyBox proporciona las utilidades básicas del sistema de archivos necesarias durante el ensamblaje inicial, incluidos comandos como `ln`, `cp`, `mv` y `mkdir`.

Los demás componentes del sistema se tratan como paquetes NHO normales. Según los requisitos de compatibilidad y versión, el kernel, GRUB, los componentes de red, systemd y BusyBox pueden reconstruirse o reutilizarse.

El estado específico del sistema se crea luego manualmente o mediante scripts, incluyendo `fstab`, usuarios y archivos de configuración. Esto mantiene la construcción de paquetes separada de la configuración específica de cada máquina.

## 9. Validación

La raíz de destino resultante se probó tras la instalación de la nueva toolchain. Las versiones observadas fueron:

| Componente           | Resultado observado                             |
|----------------------|-------------------------------------------------|
| GCC                  | 16.1.0                                          |
| GNU ld               | 2.46.1                                          |
| GNU libc / ldd       | 2.44                                            |
| `/usr/bin/gcc`       | ELF 64-bit LSB PIE, x86-64, enlazado dinámicamente |
| `/bin/sh`            | enlace simbólico a bash                         |

Un programa en C se compiló y ejecutó con éxito con la nueva toolchain. Una segunda prueba que usa funcionalidad de `stdio`, `stdlib` y `string`, incluyendo `strdup()` y `free()`, también compiló y ejecutó correctamente. Esto valida la compilación, el enlazado, la integración de libc y la ejecución en tiempo real dentro del nuevo entorno.

La raíz actual aún no contenía `uname`, por lo que `uname -a` no estuvo disponible durante esta prueba. Es una limitación del estado de construcción, no una falla de la toolchain.

**Aunque la siguiente generación (NeonatoX 28) aún no se ha construido por completo, los paquetes que hemos compilado con las nuevas versiones de la toolchain (GCC 16.1.0, glibc 2.44 y binutils 2.46.1) no han mostrado errores de compilación hasta ahora**, lo que refuerza la estabilidad de la toolchain actual y sugiere que la transición a la siguiente generación será viable sin mayores problemas.

## 10. Comparación con el flujo de trabajo LFS original

| Aspecto              | Bootstrap tradicional usado históricamente | Modelo incremental NeonatoX 27       |
|----------------------|---------------------------------------------|--------------------------------------|
| Entorno inicial      | Distribución externa / sistema anterior     | Generación anterior de NeonatoX      |
| Aislamiento del sistema | Entorno de construcción LFS dedicado     | OverlayFS mediante `nhopkg-overlay`  |
| Alcance de reconstrucción | Gran secuencia de bootstrap             | Solo componentes cambiados/requeridos |
| Modelo de artefactos | Instalaciones durante la construcción       | Paquetes `.nho` persistentes         |
| Raíz de destino      | Construida como parte del bootstrap         | `$LFS` independiente ensamblado con nhopkg |
| Siguiente generación | Repetir el procedimiento de bootstrap       | Reutilizar la generación actual como constructor |

## 11. Qué es el método — y qué no es

El método no debe describirse como un reemplazo universal del proceso de bootstrap aislado de la toolchain realizado en LFS, ni como una alternativa al Canadian Cross. Es una arquitectura de bootstrap incremental específica de la distribución, construida alrededor del formato de paquete de NeonatoX, los metadatos de dependencias, el diseño del sistema de archivos y las herramientas de construcción.

Su propiedad principal es el aislamiento y el reemplazo incremental: la raíz anterior permanece intacta, las nuevas versiones se construyen en un overlay, los artefactos resultantes se conservan como paquetes y se ensambla una nueva raíz de forma independiente.

## 12. Hacia una distribución auto-hosting

La consecuencia a largo plazo es una vía de evolución auto-hosting. NeonatoX 2026 puede construir los componentes necesarios para NeonatoX 27; una vez que NeonatoX 27 esté suficientemente completo, puede convertirse en la plataforma de construcción para la siguiente generación.

Conceptualmente:

> NeonatoX N → bootstrap incremental → NeonatoX N+1 → bootstrap incremental → NeonatoX N+2

En este modelo, LFS sigue siendo importante como base histórica del proyecto, mientras que `nhopkg-overlay` y `nhopkg` proporcionan el mecanismo para continuar la evolución de la distribución sin volver a un host de bootstrap externo en cada generación.

## 13. Reproducibilidad y trabajo futuro

- Publicar el grafo de dependencias de paquetes exacto utilizado para el bootstrap de NeonatoX 27.
- Documentar los criterios usados para decidir cuándo un paquete antiguo puede reutilizarse.
- Completar una imagen NeonatoX 27 completamente bootable y registrar el conjunto completo de paquetes.
- Demostrar que NeonatoX 27 construye una generación posterior sin depender de NeonatoX 2026.
- Automatizar las comprobaciones de compatibilidad donde los metadatos de paquetes y la información ABI lo permitan.

## Conclusión

NeonatoX 27 representa un cambio en la estrategia de bootstrap, no simplemente otra actualización de paquetes. El proyecto pasa de la construcción repetida basada en LFS hacia un modelo incremental, orientado a paquetes y auto-hosting. `nhopkg-overlay` proporciona el aislamiento necesario para modificar una copia virtualizada del sistema actual, mientras que `nhopkg` conserva los resultados como artefactos instalables. Una raíz de destino separada puede luego ensamblarse a partir de esos artefactos, reutilizando componentes compatibles y reconstruyendo solo los necesarios.

El resultado es una arquitectura que convierte cada generación anterior de NeonatoX en la plataforma de construcción natural de la siguiente, sin tocar la instalación anterior. Esa es la verdadera base del enfoque incremental de NeonatoX 27: un sistema que se construye a sí mismo, paso a paso.

## Referencias y recursos del proyecto

- **Linux From Scratch** — usado como referencia técnica para la construcción del sistema.
- **Archlinux** — usado como referencia adicional para la compatibilidad de paquetes/toolchain.
- **Repositorio fuente de NeonatoX:** [https://gitlab.com/neonatox-sources/](https://gitlab.com/neonatox-sources/)
- **GNU Binutils:** [https://www.gnu.org/software/binutils/](https://www.gnu.org/software/binutils/)
- **GNU GCC:** [https://gcc.gnu.org/](https://gcc.gnu.org/)
- **GNU C Library:** [https://www.gnu.org/software/libc/](https://www.gnu.org/software/libc/)
