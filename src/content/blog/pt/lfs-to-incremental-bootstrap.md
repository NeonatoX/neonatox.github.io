---
title: "Do bootstrap com LFS ao auto-hosting incremental"
description: "Como o NeonatoX 27 se auto-bootstrap: isolamento OverlayFS com nhopkg-overlay, reconstrução incremental e um modelo de auto-hospedagem baseado em pacotes."
pubDate: 2026-08-13
lang: pt
author: "Carlos Sánchez"
tags: ["Neonatox", "Linux", "Bootstrap", "nhopkg"]
---

*O modelo de bootstrap do NeonatoX 27 com nhopkg-overlay*

## Resumo

O NeonatoX usou originalmente o Linux From Scratch (LFS) como mecanismo de bootstrap. A geração de 2025 foi construída a partir de um host Archlinux, enquanto o NeonatoX 2026 foi inicializado a partir do NeonatoX 2025 usando LFS. Para o NeonatoX 27, o projeto introduz um modelo diferente: o bootstrap incremental. Um sistema NeonatoX existente é usado como plataforma de construção, o nhopkg-overlay fornece uma raiz isolada baseada em OverlayFS durante a construção de pacotes, e os pacotes NHO resultantes são instalados em uma raiz completamente separada usando `nhopkg --root`. Apenas os componentes que precisam mudar são reconstruídos; pacotes compatíveis podem ser reutilizados. Isso separa o ambiente de construção, os artefatos de pacote e o sistema de destino, permitindo montar uma nova geração sem modificar a instalação anterior.

## 1. Antecedentes e evolução

A estratégia de bootstrap do NeonatoX evoluiu ao longo de três gerações:

- **NeonatoX 2025** — bootstrap LFS a partir de um host Archlinux.
- **NeonatoX 2026** — bootstrap LFS a partir da geração anterior do NeonatoX.
- **NeonatoX 27** — bootstrap incremental a partir do NeonatoX 2026 usando `nhopkg-overlay` e `nhopkg`.

A transição importante é que o LFS continua sendo a base histórica do bootstrap, mas não é mais necessário como procedimento de construção para todas as gerações subsequentes. A distribuição existente torna-se a plataforma a partir da qual a próxima geração pode ser construída.

## 2. Ideia central

O método separa três papéis que muitas vezes são combinados nos fluxos de trabalho tradicionais de bootstrap:

| Componente            | Papel                                            |
|-----------------------|--------------------------------------------------|
| NeonatoX 2026         | Plataforma de construção / geração anterior      |
| `nhopkg-overlay`      | Ambiente de construção isolado temporário        |
| Pacotes `.nho`        | Artefatos de construção persistentes             |
| `$LFS`                | Raiz de destino independente para a nova geração |
| `nhopkg --root`       | Montagem da raiz de destino baseada em pacotes   |

O princípio central é: o sistema anterior é usado para construir o próximo sistema, mas ele próprio não é convertido no próximo sistema.

## 3. nhopkg-overlay

O `nhopkg-overlay` cria um mount OverlayFS com o sistema de arquivos raiz existente como camada inferior e um diretório upper (superior) e work (trabalho) dedicados. A sessão de construção vê, portanto, um sistema de arquivos que se comporta como o sistema anfitrião, enquanto as modificações são redirecionadas para a camada do overlay.

O layout relevante é:

- `/var/lib/nhopkg-overlay/upper` — conteúdo do sistema de arquivos modificado.
- `/var/lib/nhopkg-overlay/work` — diretório de trabalho do OverlayFS.
- `/var/lib/nhopkg-overlay/root` — raiz isolada montada.
- `/work` dentro do overlay — diretório de trabalho do host montado com bind.

O último ponto é importante: os pacotes `.nho` gerados são gravados no diretório de trabalho montado com bind e, portanto, sobrevivem ao desmonte do overlay. O overlay é efêmero como camada de modificação do sistema, enquanto os artefatos de pacote são persistentes.

## 4. Construir normalmente dentro do overlay

As receitas de pacotes não exigem um sistema de construção especial ciente do overlay. Elas continuam sendo executadas pelo mecanismo normal de construção do nhopkg, por exemplo:

> nhopkg -Cv binutils

Isso é significativo porque as receitas existentes podem ser reutilizadas com mudanças mínimas. Uma receita que instala arquivos em `/` está efetivamente modificando a camada superior do overlay, não a raiz real do NeonatoX 2026.

## 5. Bootstrap da toolchain

O núcleo da transição do NeonatoX 27 inclui os headers atualizados da API do Linux, binutils, glibc e GCC. As receitas NHO reais declaram suas dependências de compilação e realizam construções comuns.

Versões de exemplo usadas no ambiente demonstrado do NeonatoX 27:

- binutils 2.46.1
- glibc 2.44
- GCC 16.1.0

A receita do GCC usa a toolchain existente para construir o GCC 16.1.0, enquanto binutils e glibc são atualizados conforme necessário. As receitas também suportam split packages e componentes multilib onde a configuração do NeonatoX exige.

## 6. Reutilização incremental

O bootstrap incremental não exige reconstruir todos os pacotes. Um pacote pode ser reutilizado quando sua versão e compatibilidade continuam apropriadas para a geração de destino. Os pacotes cujas versões ou requisitos precisam mudar são reconstruídos no overlay.

Exemplos de pacotes presentes no NeonatoX 2026:

- bash 5.3
- bzip2 1.0.8
- gettext 0.26
- gmp 6.3.0

O conjunto de pacotes demonstrado do NeonatoX 27 inclui:

- file 5.48
- GCC 16.1.0
- pacote de desenvolvimento do GCC 16.1.0
- glibc 2.44
- hwdata 0.409

A compatibilidade é avaliada usando a documentação atual do LFS, referências do Archlinux e o repositório de pacotes do NeonatoX. Na prática, um pacote é reutilizado quando sua versão no NeonatoX 2026 corresponde exatamente à versão exigida pelo NeonatoX 27, desde que as bibliotecas compartilhadas das quais depende (principalmente glibc) mantenham compatibilidade binária retroativa com a nova versão do sistema. Isso é atualmente uma decisão de engenharia pragmática; não implica que versões idênticas de pacotes por si só garantam compatibilidade binária (ABI) em todos os casos.

## 7. Criar a nova raiz

A raiz de destino é representada por `$LFS`. Pode ser um diretório comum ou um sistema de arquivos/partição dedicado. Antes da instalação dos pacotes, a hierarquia necessária do sistema de arquivos é criada.

A hierarquia se adapta à família de libc detectada no sistema de construção. Para glibc, o layout inclui `/usr/lib`, `/usr/lib32` e os links de compatibilidade correspondentes; para musl, usa-se um layout mais simples. A configuração também estabelece links de /usr mesclado, como `/bin → /usr/bin` e `/lib → /usr/lib`.

Depois que a hierarquia existe, os pacotes são instalados diretamente na raiz de destino:

> nhopkg --root="$LFS" -i pacote.nho

Portanto, a nova raiz é montada a partir de pacotes, e não copiando o diretório superior do overlay.

## 8. Completar o novo sistema

Uma instalação temporária do BusyBox fornece as utilidades básicas do sistema de arquivos necessárias durante a montagem inicial, incluindo comandos como `ln`, `cp`, `mv` e `mkdir`.

Os demais componentes do sistema são tratados como pacotes NHO normais. Dependendo dos requisitos de compatibilidade e versão, o kernel, o GRUB, os componentes de rede, o systemd e o BusyBox podem ser reconstruídos ou reutilizados.

O estado específico do sistema é criado então manualmente ou por scripts, incluindo `fstab`, usuários e arquivos de configuração. Isso mantém a construção de pacotes separada da configuração específica de cada máquina.

## 9. Validação

A raiz de destino resultante foi testada após a instalação da nova toolchain. As versões observadas foram:

| Componente            | Resultado observado                              |
|-----------------------|--------------------------------------------------|
| GCC                   | 16.1.0                                           |
| GNU ld                | 2.46.1                                           |
| GNU libc / ldd        | 2.44                                             |
| `/usr/bin/gcc`        | ELF 64-bit LSB PIE, x86-64, vinculado dinamicamente |
| `/bin/sh`             | link simbólico para o bash                       |

Um programa em C foi compilado e executado com sucesso com a nova toolchain. Um segundo teste usando funcionalidades de `stdio`, `stdlib` e `string`, incluindo `strdup()` e `free()`, também compilou e executou corretamente. Isso valida compilação, vinculação, integração da libc e execução em tempo real dentro do novo ambiente.

A raiz atual ainda não continha `uname`, então `uname -a` não esteve disponível durante este teste. É uma limitação do estado de construção, não uma falha da toolchain.

**Embora a próxima geração (NeonatoX 28) ainda não tenha sido totalmente construída, os pacotes que compilamos com as novas versões da toolchain (GCC 16.1.0, glibc 2.44 e binutils 2.46.1) não apresentaram erros de compilação até agora**, o que reforça a estabilidade da toolchain atual e sugere que a transição para a próxima geração será viável sem grandes problemas.

## 10. Comparação com o fluxo de trabalho LFS original

| Aspecto                | Bootstrap tradicional usado historicamente | Modelo incremental NeonatoX 27      |
|------------------------|---------------------------------------------|-------------------------------------|
| Ambiente inicial       | Distribuição externa / sistema anterior     | Geração anterior do NeonatoX        |
| Isolamento do sistema  | Ambiente de construção LFS dedicado         | OverlayFS por meio do `nhopkg-overlay` |
| Escopo de reconstrução | Grande sequência de bootstrap               | Apenas componentes alterados/necessários |
| Modelo de artefatos    | Instalações durante a construção            | Pacotes `.nho` persistentes         |
| Raiz de destino        | Construída como parte do bootstrap          | `$LFS` independente montado com nhopkg |
| Próxima geração        | Repetir o procedimento de bootstrap         | Reutilizar a geração atual como construtor |

## 11. O que o método é — e o que não é

O método não deve ser descrito como um substituto universal do processo de bootstrap isolado da toolchain realizado no LFS, nem como uma alternativa ao Canadian Cross. É uma arquitetura de bootstrap incremental específica da distribuição, construída em torno do formato de pacote do NeonatoX, dos metadados de dependências, do layout do sistema de arquivos e das ferramentas de construção.

Sua principal propriedade é o isolamento e a substituição incremental: a raiz antiga permanece intacta, as novas versões são construídas em um overlay, os artefatos resultantes são mantidos como pacotes e uma nova raiz é montada de forma independente.

## 12. Rumo a uma distribuição auto-hospedada

A consequência de longo prazo é um caminho de evolução auto-hospedado. O NeonatoX 2026 pode construir os componentes necessários para o NeonatoX 27; quando o NeonatoX 27 estiver suficientemente completo, ele pode se tornar a plataforma de construção da próxima geração.

Conceitualmente:

> NeonatoX N → bootstrap incremental → NeonatoX N+1 → bootstrap incremental → NeonatoX N+2

Nesse modelo, o LFS continua importante como base histórica do projeto, enquanto `nhopkg-overlay` e `nhopkg` fornecem o mecanismo para continuar a evolução da distribuição sem voltar a um host de bootstrap externo a cada geração.

## 13. Reproducibilidade e trabalho futuro

- Publicar o grafo de dependências de pacotes exato usado no bootstrap do NeonatoX 27.
- Documentar os critérios usados para decidir quando um pacote antigo pode ser reutilizado.
- Completar uma imagem NeonatoX 27 totalmente inicializável e registrar o conjunto completo de pacotes.
- Demonstrar o NeonatoX 27 construindo uma geração subsequente sem depender do NeonatoX 2026.
- Automatizar as verificações de compatibilidade onde os metadados de pacotes e as informações de ABI permitirem.

## Conclusão

O NeonatoX 27 representa uma mudança na estratégia de bootstrap, não simplesmente mais uma atualização de pacotes. O projeto passa da construção repetida baseada em LFS para um modelo incremental, orientado a pacotes e auto-hospedado. O `nhopkg-overlay` fornece o isolamento necessário para modificar uma cópia virtualizada do sistema atual, enquanto o `nhopkg` preserva os resultados como artefatos instaláveis. Uma raiz de destino separada pode então ser montada a partir desses artefatos, reutilizando componentes compatíveis e reconstruindo apenas os necessários.

O resultado é uma arquitetura que torna cada geração anterior do NeonatoX a plataforma natural de construção da próxima, sem tocar na instalação antiga. Essa é a verdadeira base do enfoque incremental do NeonatoX 27: um sistema que se constrói a si mesmo, passo a passo.

## Referências e recursos do projeto

- **Linux From Scratch** — usado como referência técnica para a construção do sistema.
- **Archlinux** — usado como referência adicional para compatibilidade de pacotes/toolchain.
- **Repositório fonte do NeonatoX:** [https://gitlab.com/neonatox-sources/](https://gitlab.com/neonatox-sources/)
- **GNU Binutils:** [https://www.gnu.org/software/binutils/](https://www.gnu.org/software/binutils/)
- **GNU GCC:** [https://gcc.gnu.org/](https://gcc.gnu.org/)
- **GNU C Library:** [https://www.gnu.org/software/libc/](https://www.gnu.org/software/libc/)
