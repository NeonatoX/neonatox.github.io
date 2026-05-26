---
title: "Bem-vindo ao Neonatox — Um tour pelo site"
description: "Conheça todas as seções do site oficial do Neonatox, seu propósito e como aproveitá-las ao máximo."
pubDate: 2026-05-26
lang: pt
tags: ["neonatox", "site", "boas-vindas"]
---

O Neonatox não é apenas um sistema operacional. É um projeto que nasce de uma filosofia clara: **abrir a caixa preta** e aprender construindo.

Este site é o centro de documentação, downloads e comunidade. Aqui está um guia das suas seções.

---

## Páginas principais

### Início

A landing page recebe você com uma visão geral: o que é o Neonatox, por que existe e para onde vai. Você encontrará um contador ao vivo com a quantidade de pacotes disponíveis no repositório.

### História

O Neonatox começou como um experimento pessoal com Linux From Scratch. A página de História narra essa jornada: desde copiar e colar comandos até entender cada camada do sistema, passando pela origem do nome, a criação do **nhopkg**, a pausa do projeto e seu retorno em 2023.

### Filosofia

Aqui está o coração do projeto. Explicamos por que o Neonatox **não é mais uma distro**, por que rejeitamos caixas pretas e como cada pacote é projetado para ensinar, não apenas para instalar.

### Arquitetura

Uma divisão técnica das camadas do sistema: toolchain, kernel, init, gerenciador de pacotes, desktop. Ideal para entender como tudo se encaixa.

### Pacotes

Documentação completa do formato `*.srcnho` (nhoid) e `.nho`. Inclui um exemplo real com Transmission 4.1.1, suas funções de ciclo de vida (`nbuild`, `ninstall`, etc.) e, desde a última atualização, as **métricas do repositório** com contagem total de pacotes, ativos por período e distribuição por categoria.

### Projetos

Os quatro pilares do ecossistema:
- **nhopkg** — gerenciador de pacotes nativo
- **live-boot** — sistema live baseado em overlayfs
- **installer** — instalador gráfico
- **sources** — repositório GitLab com todos os nhoid

### Downloads

Três ISOs live prontas para testar: **GNOME 50**, **KDE 6.23.0** e **XFCE 4.20**. Cada uma inclui link de download direto, torrent/magnet e SHA256. Você também encontrará credenciais de acesso e recomendações de uso com VirtualBox.

### Caminho do Construtor

Um guia passo a passo para passar de usuário curioso a construtor de sistemas: LFS → nhopkg → seu próprio pacote → ISO bootável.

---

## Características do site

- **Multilíngue:** Espanhol, English, Português — seletor de idioma no header
- **Estilo visual:** Fundo escuro, acentos ciano e roxo, tipografia clara
- **Responsivo:** Navegação adaptável com menu hambúrguer no celular
- **SEO:** Sitemap automático, meta descriptions, OpenGraph
- **Métricas ao vivo:** Os contadores de pacotes são atualizados pela API do GitLab ao carregar a página
- **Slider de capturas:** Carrossel com imagens dos desktops disponíveis

---

Este é apenas o começo. O blog será povoado com artigos técnicos, anúncios, guias e reflexões sobre o projeto.

Enquanto isso, convidamos você a explorar, baixar uma ISO e, acima de tudo, **construir**.

✨ *O Neonatox não é o destino. É o mapa para você construir o seu.*
