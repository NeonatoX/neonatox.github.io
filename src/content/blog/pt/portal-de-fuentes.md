---
title: "O Portal de Fontes do Neonatox já está aqui"
description: "Apresentamos o portal de fontes: metadados nhoid no Git, pacotes interconectados e um catálogo gerado diretamente do GitLab."
pubDate: 2026-11-26
lang: pt
author: "Carlos Sánchez"
tags: ["Neonatox", "nhopkg", "nhoid", "fontes", "GitLab", "anúncio"]
---

Por muito tempo, tive uma ideia clara na mente: criar um espaço que reunisse de forma amigável e acessível todas as informações sobre os pacotes do Neonatox, tanto na forma de código-fonte (*sources*) quanto na versão binária.

Hoje, esse espaço é uma realidade. Temos o prazer de apresentar o novo **[Portal de Fontes do Neonatox](https://neonatox-sources.gitlab.io/)**.

![Catálogo de pacotes fonte no Portal de Fontes do Neonatox](/screenshots/portal-de-fuentes-catalogo.png)

### A inspiração: mostrar as entranhas com estilo KISS

Se há algo que sempre me pareceu incrível e profundamente humano é o estilo dos navegadores de pacotes como o do Arch Linux. A filosofia deles é clara: organizado, limpo, caprichado e simples. Mostra as "entranhas" do sistema sem adornos desnecessários, confiando na inteligência do usuário.

É exatamente esse o espírito que queríamos capturar. O Neonatox não é uma caixa preta; é um sistema projetado para ser entendido. Queríamos que, ao entrar no portal, a experiência fosse tão clara que qualquer pessoa pudesse dizer: *"Ei, eu entendo isso. Está muito claro para mim"*.

### A jornada técnica: de scripts locais à fonte única da verdade no Git

Chegar até aqui não foi um caminho reto. Inicialmente, tentei resolver o problema com scripts em Bash que processavam os pacotes localmente. No entanto, me deparei com um muro: os metadados nem sempre estavam disponíveis de forma consistente e o sistema local raramente estava no estado exato necessário para que o processo fosse 100% confiável.

O ponto de virada veio com uma decisão arquitetônica fundamental: **migrar todos os metadados (`nhoid`) para o Git**.

Essa decisão mudou as regras do jogo. Permitiu que o `nhopkg` usasse o Git como a "fonte única da verdade" para criar pacotes e montar a distribuição. À medida que eu definia os *pipelines* e os fluxos de trabalho (Workflows) do GitLab CI/CD, entendia como automatizar e escalar esse processo. O resultado é o gerador estático atual: um script em Python que, com cache incremental e processamento paralelo, lê diretamente da API do GitLab, garantindo que o que você vê na web é exatamente o que está no repositório, sempre atualizado e sem atrito.

### Uma experiência interconectada, não ilhas de informação

O maior valor deste novo portal não é apenas ser bonito, mas **dar contexto**.

Antes, os pacotes podiam parecer um monte de repositórios individuais com receitas isoladas. Agora, estão entrelaçados. A partir do portal, você pode analisar um pacote e, com um clique, navegar diretamente para suas dependências, examinar a estrutura de seu binário ou entender como ele é dividido em subpacotes (`splitpackages`).

![Página de um pacote no Portal de Fontes do Neonatox](/screenshots/portal-de-fuentes-paquete.png)

O objetivo é que você deixe de ver comandos soltos e comece a ver o ecossistema completo. Queremos que você se sinta em casa, com a mesma clareza e confiança que muitos de nós sentimos ao descobrir o Linux pela primeira vez por meio de comunidades que valorizam a transparência.

### Uma casa arrumada para construir juntos

Por enquanto, nosso foco é polir e melhorar o que já conquistamos. A base é sólida: notícias, feeds RSS, cache eficiente e uma estrutura clara. Mais adiante, exploraremos recursos como gráficos de dependências ou busca em tempo real.

Mas o mais importante que esta ferramenta representa para o futuro do Neonatox é a **ordem**.

Quem quiser fazer parte do projeto, seja para relatar um erro, melhorar uma receita `nhoid` ou propor uma nova funcionalidade, encontrará agora "a casa arrumada". Há um ponto de partida claro, documentação acessível e um fluxo de trabalho definido. Não há segredos, apenas código e vontade de colaborar.

### Uma última reflexão

A quem estiver lendo isso e sentir curiosidade de testar o Neonatox, conferir um `nhoid` ou se juntar ao desenvolvimento, só quero dizer isto:

> *"Quando você ama o que faz e tem a possibilidade, faça e leve até a última consequência. Você vai se surpreender até onde pode chegar com uma boa ideia e um pouco de ajuda."*

O mapa está aqui. As ferramentas estão prontas. Convidamos você a começar a construir conosco.

---
*Quer explorar o código? Visite o [repositório do portal](https://gitlab.com/neonatox-sources/neonatox-sources.gitlab.io) ou mergulhe diretamente no [catálogo de pacotes](https://neonatox-sources.gitlab.io/packages/).*
