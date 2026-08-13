---
title: "O egoísmo produtivo: Git, Linux e algumas reflexões sobre Neonatox"
description: "Como o 'egoísmo produtivo' inspirou esta distro Linux, assim como Git e Linux nasceram de resolver problemas próprios."
pubDate: 2026-06-20
lang: pt
author: "Carlos Sánchez"
tags: ["Software Livre", "Neonatox", "Linux", "Desenvolvimento"]
---

E ai?

Há alguns dias estive lendo novamente sobre a história do Git. Embora hoje pareça uma ferramenta indispensável para qualquer desenvolvedor, a realidade é que nasceu de uma necessidade bastante concreta. Quando o desenvolvimento do kernel Linux perdeu o acesso ao BitKeeper, Linus Torvalds precisava de uma ferramenta que pudesse lidar com o fluxo de trabalho do kernel. Ele avaliou algumas alternativas, mas nenhuma fazia exatamente o que ele precisava.

Então ele fez o que muitos de nós programadores acabamos fazendo mais cedo ou mais tarde: escreveu a sua própria. Mas mais interessante que o Git, sempre me chamou a atenção uma frase de Linus:

> "Sou um egoísta terrível; escrevo programas para resolver meus próprios problemas."

Pode soar um pouco estranho na primeira vez que se lê, mas se observarmos a história do software livre descobrimos que muitos dos projetos mais importantes nasceram exatamente assim.

- Linux nasceu porque Linus queria um sistema parecido com Unix para seu computador.
- Git nasceu porque ele precisava de uma ferramenta de controle de versão distribuída.
- E uma enorme quantidade de projetos que usamos todos os dias existem simplesmente porque alguém tinha um problema e decidiu resolvê-lo.

Pensando nisso, percebi que grande parte do Neonatox nasceu da mesma maneira.

Nunca me sentei em frente a um computador com a ideia de criar uma distribuição para competir com outras distribuições. Na verdade, muitas das ferramentas que hoje fazem parte do Neonatox apareceram simplesmente porque eu precisava delas em algum momento.

## Uma das primeiras foi Nhopkg

Quando comecei a construir meu próprio LFS, procurava uma forma de gerenciar pacotes que se adaptasse à minha maneira de trabalhar. Com o tempo foram aparecendo novas necessidades e o projeto foi crescendo. Chegaram os pacotes binários, a construção a partir de fontes, os repositórios, além de muitas outras características que foram sendo incorporadas aos poucos.

Não existia um plano mestre, simplesmente aparecia um problema e a ferramenta evoluía para resolvê-lo.

## Algo parecido ocorreu com Neonatox Live Boot

Sempre gostei de entender como funciona realmente a inicialização de um sistema Linux. Muitas ferramentas modernas fazem um excelente trabalho automatizando processos, mas também escondem grande parte do que acontece nos bastidores. Por simples curiosidade comecei a experimentar com scripts de inicialização, detecção de dispositivos, OverlayFS e outros componentes. O que começou como uma série de testes acabou se tornando com o tempo o Neonatox Live Boot.

## O mesmo ocorreu com Mkinitramfs

Queria algo simples, algo que eu pudesse entender completamente meses depois sem ter que voltar a estudar centenas de linhas de código. Algo que fizesse seu trabalho sem tentar resolver absolutamente todos os problemas possíveis e assim acabou nascendo.

## Bootstrap teve uma história um pouco diferente

Diferente de outras ferramentas que foram aparecendo de forma mais orgânica, Bootstrap nasceu com um objetivo bastante concreto. A ideia é complementar o ambiente fornecido pelo Neonatox Live Boot e permitir uma instalação a partir de repositórios utilizando a infraestrutura já existente.

Enquanto o instalador estava pensado a princípio para implantar um sistema Live completo mediante a cópia do SquashFS, Bootstrap deverá permitir construir o sistema diretamente a partir dos pacotes disponíveis nos repositórios. Com o tempo foi incorporando novas funções, como a configuração de usuários, perfis de desktop, instalação do carregador de inicialização e outras tarefas de pós-instalação, mas a ideia principal sempre foi a mesma: trabalhar junto com Live Boot para facilitar a construção de sistemas a partir da rede seja um live boot completo ou um mínimo.

## E algo parecido ocorreu com o instalador

No início a ideia é que o trabalho seja bastante simples: copiar o sistema a partir de uma imagem Live, configurar alguns parâmetros básicos e deixar uma instalação funcional, por essa razão, contém ferramentas auxiliares para gerenciar usuários, partições, fusos horários, configurações de inicialização e outras tarefas. O curioso é que muitas delas acabaram sendo úteis inclusive fora do próprio instalador. E agora surge a ideia de incorporar mais adiante o Bootstrap como uma forma mais de instalar Neonatox.

Olhando para trás, noto que todos esses projetos compartilham algumas características:

- Tentam ser simples.
- Tentam ser transparentes.
- Tentam ter poucas dependências.
- Acima de tudo tentam resolver problemas reais antes que seguir modas ou tendências.

Durante anos estive pensando e desenvolvendo essas ferramentas sem meditar demais sobre isso. Simplesmente aparece uma necessidade, tento resolvê-la e se a solução funciona acaba se tornando parte do projeto. Vistas separadamente parecem ferramentas independentes, inclusive podem funcionar como tal, mas observando-as em conjunto, todas compartilham uma mesma origem: resolver problemas reais que fui encontrando durante o caminho.

Talvez por isso a história do Git me resulta tão familiar. Não porque Neonatox pretenda se comparar com projetos como Linux ou Git, mas porque a motivação inicial foi muito parecida.

Nunca vi Neonatox como uma competição para outras distribuições. Sempre o vi mais como um laboratório onde posso experimentar, aprender como funcionam as coisas e construir ferramentas adaptadas às minhas próprias necessidades. E claro, se alguma dessas ferramentas acaba ajudando alguém mais, melhor ainda.

No final, aquela frase de Linus continua fazendo muito sentido:

> "Sou um egoísta terrível; escrevo programas para resolver meus próprios problemas."

Talvez esse tipo de egoísmo não seja algo mau depois de tudo, porque muitas vezes as melhores ferramentas nascem exatamente assim:

- Alguém tem um problema.
- Resolve.
- Compartilha a solução.

E sem perceber, acaba ajudando também a outras pessoas.

Abraçõs.

Happy hacking!
