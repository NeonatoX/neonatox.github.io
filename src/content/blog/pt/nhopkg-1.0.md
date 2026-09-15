---
title: "Finalmente o nhopkg 1.0"
description: "O gerenciador de pacotes do Neonatox alcança sua primeira versão estável: PATH privado com BusyBox + zstd, assinatura GPG de repositórios, nhouser e muito mais."
pubDate: 2026-09-15
lang: pt
author: "Carlos Sánchez"
tags: ["Neonatox", "nhopkg", "release", "anúncio"]
---

Olá.

Se você me acompanha há um tempo, vai saber que sou daqueles que preferem entender como as coisas funcionam, mesmo que para isso seja preciso sujar as mãos mexendo em configurações. E uma das coisas com as quais mais mexi nos últimos anos é o **nhopkg**, o gerenciador de pacotes do Neonatox — aquele que compila tudo do código-fonte porque aprender exige pisar na lama.

Bem, depois de bastante trabalho, enfim podemos dizer isso a sério: **o nhopkg 1.0 já é uma realidade**. Como toda primeira versão estável, isso não é só um salto de número: é o release em que a gente acha que a coisa finalmente aguenta o dia a dia de um sistema rolling release sem dores de cabeça.

E para quem é isso? Para os curiosos como a gente, essa gente que não se contenta em instalar pacotes, mas quer saber *como* eles são instalados. Se você veio do LFS e ficou com vontade de mais, se sonha em montar sua própria distro do zero, ou se simplesmente queria entender o que um gerenciador de pacotes faz por baixo dos panos, isto é para você. O nhopkg é daqueles projetos em que o código se lê, se entende e se aprende: nada de binários mágicos nem caixas pretas, só bash, tar e zstd bem destrinchados.

![nhopkg 1.0](/screenshots/nhopkg-1.0.png)

De tudo o que traz, o que mais me empolga é o **BusyBox + zstd em um PATH privado**: binários estáticos compilados com musl-gcc durante o build, de modo que quando você atualiza a C library do sistema — sim, aquelas atualizações que quebram até o gerenciador de pacotes mais veterano — o nhopkg segue funcionando como se nada tivesse acontecido.

Mas não é só isso:

- **nhouser**: gestão de usuários e grupos com backend duplo (shadow-utils ou BusyBox, detectado em tempo de execução). Essencial quando o `useradd` fica quebrado após uma atualização.
- **Assinatura GPG de repositórios**: `nhopkg-repos` reescrito com assinatura, verificação, gestão de chaves e metadata de repo assinada.
- **`--root` transparente**: os scripts de pré/pós-instalação são executados dentro do chroot usando namespaces de montagem privados.
- **Metapacotes**: você cria um pacote que agrupa todo um conjunto, resolvido direto da metadata do repo.
- **`# Replaces:`**: retirar um pacote de forma limpa, sem pisar em headers nem quebrar builds alheios.

E para fechar: chegou a **tradução para o russo** de toda a documentação, downloads paralelos de dependências, e uma boa leva de mudanças para que tudo funcione *idêntico* em sistemas GNU e BusyBox.

## Um gostinho do changelog

Deixo aqui uma amostra do que entrou no [changelog-1.0.md](https://github.com/NeonatoX/neonatox-nhopkg/releases/tag/1.0):

> Estável: 60 commits em 103 arquivos desde 2026.3.
> - BusyBox 1.37.0 + zstd 1.5.7 estáticos (musl-gcc) para o PATH privado que sobrevive a atualizações de glibc/musl.
> - Detecção em tempo de execução de shadow-utils vs BusyBox para usuários e grupos, com tradução de flags entre backends.
> - `nhopkg-repos`: `sign`, `sign-all`, `verify`, `keygen`, `import-key`, … com assinatura verificada em cada update.
> - `ns_exec_in()` com mount namespace privado para execução `--root`.
> - Metapacotes via `nhopkg-src --init --meta`.
> - Downloads paralelos de dependências (`NHOPKG_DOWNLOAD_JOBS`, padrão 4).

Se quiserem ver a lista completa de mudanças, convido vocês a conferir o release:

https://github.com/NeonatoX/neonatox-nhopkg/releases/tag/1.0

Espero que seja útil e que vocês se animem a experimentar. Vocês sabem que dessas coisas sempre se aprende algo novo.

Happy hacking.