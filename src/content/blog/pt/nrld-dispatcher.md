---
title: "neonatox-RLDispatcher: como fazer programas glibc funcionarem bem em um sistema musl"
description: "O nrld dá aos programas glibc um glibc real e isolado em /usr/lib/glibc6/, sem misturar duas libcs no mesmo processo: é assim que o Firefox roda no NeonatoX."
pubDate: 2026-10-21
lang: pt
author: "Carlos Sánchez"
tags: ["Neonatox", "nrld", "musl", "glibc", "compatibilidade"]
---

## O problema de fundo

Imagine que você tem duas marcas de carros bem diferentes. Cada uma usa seu próprio sistema de peças: as peças de uma não encaixam bem na outra. Se você tentar misturar peças das duas marcas no mesmo motor, é bem provável que algo falhe… ou que simplesmente não ligue.

É mais ou menos o que acontece quando você tenta executar um programa compilado para **glibc** (como Firefox, Chromium ou muitos aplicativos de desktop) em um sistema que usa **musl** (como Alpine, Void ou NeonatoX).

A maioria das soluções tradicionais tenta "enganar" o programa para que ele acredite estar usando peças glibc, quando na verdade continua montado sobre musl. O resultado costuma ser instável: o programa pode funcionar um tempo… e de repente falhar de formas difíceis de entender, ou pode nem chegar a funcionar.

## A ideia do nrld

Em vez de tentar fazer as peças de uma marca funcionarem à força dentro do motor da outra, **o nrld faz algo diferente**:

> Executa o programa com um **motor glibc de verdade**, mas completamente separado do resto do sistema.

Esse ambiente glibc real mora em uma pasta própria (`/usr/lib/glibc6/`). O resto do sistema continua usando musl tranquilamente. Os dois nunca se misturam dentro do mesmo processo.

É como ter dois carros na mesma oficina: cada um com as suas próprias peças, sem trocar componentes entre eles.

## Como funciona, em poucas palavras

O sistema tem três peças principais:

1. **nrld** — É um "intérprete falso" de executáveis. Quando o sistema tenta iniciar um programa glibc, o kernel chama o nrld em vez do carregador normal. Ele é instalado como `/lib64/ld-linux-x86-64.so.2`, então isso acontece sozinho: nem o aplicativo nem o usuário precisam fazer nada. O nrld se encarrega de preparar todo o ambiente isolado.
2. **libnrld-proxy.so** — É uma pequena biblioteca carregada junto com o programa (`LD_PRELOAD`). O trabalho dela é vigiar que ninguém coloque peças musl dentro do motor glibc. Se detectar que algo está se misturando, corta o problema de forma limpa. E se o processo for musl, ela fica completamente transparente: não interpõe nada.
3. **Suporte a AppImages** — Muitos aplicativos modernos vêm empacotados como AppImage. O nrld sabe detectá-los, extraí-los de forma segura (sem FUSE, sempre dentro de `/tmp`) e executar o programa que vem dentro.

E há um detalhe que parece menor, mas não é: **o nrld é escrito em C sem libc**, com syscalls crus, sem `malloc` e sem `printf`. Não é mais um `LD_PRELOAD` dos quais se espera que "já funciona". É código que se lê de cima a baixo, que compila com `meson` rapidinho e que não depende de nenhum segredo do host.

## O avanço importante: usar ferramentas musl a partir de aplicativos glibc

Durante muito tempo, um dos problemas mais chatos era este:

Um aplicativo glibc (por exemplo, um programa feito com Electron ou GTK) precisa lançar uma ferramenta do sistema. Essa ferramenta é musl (como `git`, `bwrap` ou outros helpers).

Como o aplicativo glibc estava rodando com um ambiente preparado para glibc, o filho herdava variáveis como `LD_LIBRARY_PATH` apontando para o sysroot glibc. O resultado era previsível: o programa musl tentava carregar as "peças" erradas e falhava.

### Como foi resolvido

O proxy agora intercepta as chamadas que lançam outros programas (`execve`, `posix_spawn` e similares). Antes de executar o novo processo, ele faz uma verificação simples, mas eficaz:

- Olha qual interpretador o programa a ser lançado tem.
- Se detectar que é um binário **musl**, limpa do ambiente as variáveis que poderiam contaminá-lo (`LD_LIBRARY_PATH` e `LD_PRELOAD`).
- Se o programa for glibc, deixa passar com o ambiente normal (porque ele vai passar de novo pelo nrld).

### O que ganhamos com isso?

Que aplicativos glibc podem usar de forma natural as ferramentas e dependências de runtime do sistema musl.

Exemplos concretos:

- Um editor ou uma IDE baseada em Electron pode mostrar a árvore git de um projeto.
- Aplicativos que precisam lançar helpers do sistema (compressão, sandboxing, conversão de imagens, etc.) param de quebrar.
- Reduz-se a necessidade de duplicar ferramentas dentro do sysroot glibc.

Esse avanço tem uma consequência importante de design: **já não é necessário manter uma árvore completa de binários dentro do sysroot**. Na prática, o objetivo fica muito mais perto de algo parecido com `lib32`: um conjunto de bibliotecas bem organizado, sem precisar duplicar boa parte das ferramentas do sistema.

Ou seja, o sysroot pode se orientar quase exclusivamente para **libs**, e deixar que os helpers e programas auxiliares continuem sendo os do sistema musl.

## Olhando um pouco mais adiante: outras arquiteturas

Embora o nrld tenha nascido para resolver o conflito entre musl e glibc na mesma arquitetura (x86-64), a mesma ideia de isolamento abre outra possibilidade interessante:

> Será que daria para usar uma abordagem parecida para executar programas de outra arquitetura em um sistema x86?

Hoje em dia já é possível experimentar isso combinando:

- `qemu-user` (que traduz as instruções da outra arquitetura)
- Um sysroot com as bibliotecas daquela arquitetura
- Uma lógica de isolamento parecida com a do nrld

Não se trata de emular uma máquina completa, mas de traduzir apenas o necessário do processo e aproveitar o kernel do host. O resultado é mais leve do que uma máquina virtual tradicional.

Ainda é um terreno experimental, mas mostra que o problema de fundo (isolar corretamente ambientes de userspace distintos) não se limita a musl contra glibc. A mesma filosofia poderia ser aplicada, com o trabalho adequado, a outras arquiteturas.

## Limitações atuais

Como todo design, este também tem seus limites:

- Por enquanto o desenvolvimento principal está centralizado na **x86-64**.
- Para aplicativos grandes é preciso ter bastante biblioteca dentro do ambiente isolado.
- Algumas formas muito especiais de lançar programas ainda não estão totalmente cobertas: as variantes `execl*` e `execveat` não passam pela interposição, então um app que spawne um filho musl por ali ainda vazaria o ambiente. Na prática, os apps deste ecossistema usam `execve` ou `posix_spawn`, mas é bom saber.
- O código do carregador principal concentra muita lógica em um único lugar.

Nada disso é intransponível, mas são pontos a ter em conta.

## Estado atual do projeto

Hoje, o nrld já é usado de verdade dentro do NeonatoX. Ele foi testado com:

- Firefox (incluindo os processos internos dele, tanto em versões modernas quanto ESR)
- Chromium, Brave e aplicativos baseados em Electron
- Vários AppImages (o OpenShot 4.0.0 entre eles)
- Programas feitos com GTK e Qt

O sistema é usável no dia a dia e continua evoluindo. Um dos resultados mais visíveis do último avanço é justamente que aplicativos complexos podem se apoiar em ferramentas musl do sistema sem quebrar, o que permite simplificar o sysroot e aproximá-lo de um modelo mais leve, centrado em bibliotecas.

Compilar e testar são quatro comandos:

```bash
meson setup build --prefix=/usr
meson compile -C build
meson test -C build
sudo meson install -C build
```

## Os problemas reais e como foram resolvidos

O caminho até o nrld atual não foi linear. Houve vários problemas concretos que, na época, pareciam capazes de derrubar toda a abordagem. Resolvê-los um a um foi o que deu forma ao sistema que existe hoje.

### 1. A mistura de duas libcs

O sintoma mais clássico: o programa subia e, em algum momento, terminava num `SIGSEGV` difícil de entender (muitas vezes dentro de `strtod_l` ou outras funções). A causa era simples de explicar e difícil de evitar: alguma biblioteca acabava resolvendo para a versão musl de `/usr/lib` em vez da glibc do sysroot.

**Solução:** um guard transitivo de dependências (`DT_NEEDED`) + a varredura em runtime do proxy. Se algo sai do sysroot, é cortado de forma limpa em vez de deixar o processo se corromper.

### 2. `/proc/self/exe` apontava para o loader

Muitos aplicativos (especialmente navegadores e coisas baseadas em Electron) consultam `/proc/self/exe` para se localizar. Se esse caminho aponta para o loader em vez do programa real, começam a falhar de formas estranhas.

**Solução:** no modo usuário é criada uma cópia do binário com o `PT_INTERP` reescrito para o loader glibc real. O kernel carrega esse loader dentro do mesmo processo e `/proc/self/exe` continua apontando para o aplicativo.

### 3. AppImages rejeitadas pelo loader da glibc

As AppImages type-2 carregam bytes não padronizados no cabeçalho ELF. O loader da glibc simplesmente as rejeita.

**Solução:** detectar esse caso, criar uma cópia temporária com o cabeçalho corrigido e executar essa cópia. O conteúdo da AppImage não é afetado.

### 4. Caminhos absolutos nas dependências

Alguns binários trazem `DT_NEEDED` com caminhos absolutos (por exemplo `/usr/lib/libalgo.so`). O loader pega isso ao pé da letra e, de novo, acaba metendo bibliotecas musl dentro do processo.

**Solução:** detectar essas entradas, criar uma cópia corrigida onde o caminho absoluto vira um soname normal e garantir que ele seja resolvido dentro do sysroot.

### 5. Os filhos musl herdavam o ambiente glibc

Este foi um dos mais enrolados. Um aplicativo glibc lançava uma ferramenta do sistema (git, bwrap, etc.). Essa ferramenta é musl, mas herdava `LD_LIBRARY_PATH` apontando para o sysroot glibc… e falhava.

**Solução:** o proxy intercepta as chamadas de execução e, quando detecta que o destino é musl, limpa as variáveis perigosas do ambiente antes de lançá-lo. Essa mudança foi especialmente importante: permitiu que aplicativos glibc usassem helpers do sistema e, de quebra, abriu a porta para simplificar o sysroot (orientá-lo mais para bibliotecas e menos para binários duplicados).

### 6. Ruído na saída padrão

No começo o nrld escrevia muita mensagem de diagnóstico na saída normal. Isso quebrava coisas como `make`, scripts que capturam a saída ou ferramentas do próprio toolchain.

**Solução:** todo o diagnóstico passou para o stderr, com níveis de log e silêncio por padrão. Ele só fala quando pedido, ou quando há um erro real.

### 7. Processos que "engoliam" as mensagens de erro

No Firefox, por exemplo, os processos de conteúdo redirecionam o stderr. Uma rejeição do proxy podia ficar completamente invisível.

**Solução:** foi adicionada a possibilidade de espelhar as mensagens do proxy em um arquivo de log, para diagnosticar mesmo quando o terminal não mostra nada.

Cada um desses problemas empurrou o design para um isolamento mais estrito e, ao mesmo tempo, mais usável. O resultado atual não é apenas que "programas glibc arrancam", mas que eles convivem de forma bem mais natural com o sistema musl ao redor.

## Conclusão

O nrld não tenta fazer musl "entender" glibc. Também não tenta transformar um programa glibc em algo musl. simplesmente dá a esse programa um ambiente glibc autêntico e bem isolado, e garante que ele não se misture com o resto do sistema.

O fato de que agora os aplicativos glibc consigam usar helpers musl de forma segura é um passo importante: já não apenas "dão para rodar", como se integram melhor com o sistema ao redor. E graças a isso, o próprio sysroot pode ficar mais simples, parecido em espírito com o que|tradicionalmente se fez com o `lib32`.

Além disso, embora ainda seja cedo, a mesma linha de trabalho aponta possibilidades mais amplas, como experimentar com outras arquiteturas sobre um host x86.

O código está disponível sob a licença GPL v3 em:

[https://github.com/NeonatoX/neonatox-rldispatcher](https://github.com/NeonatoX/neonatox-rldispatcher)

Happy hacking.
