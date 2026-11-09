---
title: "De admirar um projeto a contribuir com ele: uma pequena história de software livre"
description: "Um Pull Request de 2025, um 'You're wrong' e um 'thank you for this idea, implemented' um ano depois: como acabei contribuindo com o Linux Live Kit."
pubDate: 2026-11-09
lang: pt
author: "Carlos Sánchez"
tags: ["Software Livre", "Linux Live Kit", "Neonatox", "Upstream"]
---

Olá.

Às vezes o software livre tem um senso de humor bastante peculiar. 😂

## O problema: o `xz` estava lá, mas não era visto

Em julho de 2025 abri um Pull Request no **Linux Live Kit**, o projeto de Thomas M.

O motivo? Eu tinha encontrado um problema durante os testes de construção de sistemas Live: os scripts do Linux Live não detectavam corretamente a presença do `xz`, mesmo quando ele estava instalado.

Encontrei esse comportamento no Ubuntu, no Arch Linux e no Linux From Scratch. E, é claro, isso também afetava o NeonatoX.

A questão era que os scripts tentavam determinar a disponibilidade do XZ analisando a saída do `xz --help` e procurando a palavra "Compress". Era uma verificação frágil: dependia do idioma e do formato do texto de ajuda, então na prática podia falhar mesmo com o `xz` instalado. O que era necessário era simplesmente verificar a presença do executável.

## "You're wrong."

Durante a revisão, `crim50n` apontou algo tecnicamente correto: o SquashFS suporta compressão XZ desde 2011, então não fazia sentido verificar se o `mksquashfs` oferecia esse recurso. As versões modernas já o incluíam. O problema era que esse recurso não podia ser usado se o executável `xz` não estivesse instalado.

Sua resposta inicial foi bem direta:

> "You're wrong."

Reconheci o esclarecimento e expliquei que meu problema não era a compatibilidade do SquashFS com XZ, mas sim que o Linux Live Kit não conseguia detectar o `xz` em sistemas onde ele estava instalado.

A conversa parou por aí. Minha proposta inicial não foi integrada e o problema prático que eu havia identificado continuava pendente.

## Da frustração ao NeonatoX Live Boot

Foi uma experiência que, entre outras coisas, acabou me impulsionando a desenvolver minha própria ferramenta: o **NeonatoX Live Boot**.

Durante esse período, o Linux Live Kit pareceu entrar em uma fase de relativa inatividade. No entanto, minha admiração pelo trabalho do Thomas nunca desapareceu. Algumas das ideias do projeto dele até influenciaram o design de ferramentas próprias, como o `nhopkg`.

## Um ano depois: "thank you for this idea, implemented"

E aqui vem a parte realmente curiosa.

Ontem eu estava conversando sobre o Linux Live Kit, sua nova versão 2.13, a adoção do GRUB 2 e a influência que ele teve nos meus projetos. Cheguei até a brincar dizendo que agora o Thomas era nossa concorrência.

Hoje descubro que o Thomas retomou aquela proposta e incorporou uma solução no repositório oficial.

A mudança é simples e mais robusta: em vez de analisar a saída do `xz --help`, agora se verifica diretamente a existência do executável com `command -v xz`.

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

Ao fechar o Pull Request, o Thomas deixou este comentário:

> "thank you for this idea, implemented."

Depois de mais de um ano, aquela pequena proposta finalmente encontrou seu lugar no Linux Live Kit.

## O que isso significa

Não é uma contribuição enorme, nem pretende ser. É uma pequena melhoria, mas tem um significado especial para mim.

Porque por trás dessas poucas linhas há uma história de aprendizado, de projetos próprios, de troca técnica e, acima de tudo, de software livre.

Hoje posso dizer que um projeto que admiro não apenas me inspirou: ele também tem uma pequena contribuição minha.

Obrigado, Thomas.

E sim, continuamos sendo concorrência... mas agora também somos upstream! 😂

---

**Referências:**

- Pull Request #290: https://github.com/Tomas-M/linux-live/pull/290
- Commit integrado: https://github.com/Tomas-M/linux-live/commit/cfd4b95eec8e8c761dc3a74fabed6f29d99aee2a
- Linux Live Kit 2.13: https://github.com/Tomas-M/linux-live/releases/tag/v2.13
- NeonatoX Live Boot: https://github.com/NeonatoX/neonatox-live-boot
