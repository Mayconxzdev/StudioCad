# AI System Card — StudioCad

Este documento registra **o papel da IA, as fronteiras entre visualização e engenharia, a dependência de provedores e os controles de aprovação** usados no StudioCad.

## Finalidade da IA

A IA é usada como apoio conceitual e visual para explorar referências, preparar estudos e ajudar a organizar material técnico. Ela **não substitui CAD de fabricação, cálculo de engenharia, validação normativa ou aprovação técnica**.

A indisponibilidade de IA também não bloqueia o núcleo de organização, inventário, rastreabilidade e conversão dos arquivos autorizados.

## Provedores

A versão privada pode usar modelos locais e remotos por meio de:

- **Ollama**;
- **Hermes**;
- **OpenRouter**.

A arquitetura admite fallback quando apropriado. Um provedor alternativo não recebe automaticamente mais autoridade sobre o projeto: a origem técnica e a aprovação humana continuam sendo os elementos decisivos.

## Fontes e proveniência

Uma visualização derivada precisa manter vínculo com a origem autorizada. O sistema registra fonte/hash e não trata geometria genérica ou saída de IA como substituta de um CAD ausente.

Princípios:

- arquivo recebido e artefato derivado são objetos diferentes;
- origem e hash acompanham a visualização;
- conversão não equivale a aprovação de engenharia;
- ausência de fonte confiável deve resultar em limite explícito, não em invenção;
- aprovação humana é necessária antes de apresentação, vídeo ou movimento mecânico.

## Processamento seguro de arquivos

Pacotes externos são uma superfície de risco independente da IA. ZIP, TAR e JSON são inventariados sem executar scripts, macros ou conteúdo recebido.

A edição pública demonstra controles para rejeitar:

- path traversal;
- entradas especiais inesperadas;
- arquivos criptografados quando não podem ser inspecionados com segurança;
- compressão anormal/zip bomb;
- pacotes cuja estrutura não atende aos limites esperados.

## Fronteira de decisão

A IA **não pode**, sozinha:

- declarar que uma visualização é desenho de fabricação;
- confirmar dimensão, material, tolerância ou comportamento físico sem fonte técnica;
- habilitar movimento sem componente, eixo, pivô, limites e responsável confirmados;
- autorizar vídeo/apresentação quando a fonte ou a seleção visual ainda não foi aprovada;
- transformar um pacote recebido em conteúdo executável.

## Riscos e controles

| Risco | Controle |
| --- | --- |
| Alucinação visual/técnica | saída tratada como estudo; comparação com fonte autorizada e revisão humana |
| CAD ausente | sistema não apresenta geometria genérica como substituta da fonte |
| Provedor de IA indisponível | fallback quando aplicável; funções principais continuam independentes |
| Exposição de material corporativo | edição pública sanitizada; documentos, CADs, NAS e credenciais ficam privados |
| Arquivo malicioso | inventário sem execução + rejeição de path traversal e compressão suspeita |
| Movimento incorreto | habilitação somente após parâmetros e responsável confirmados |
| Apresentação prematura | bloqueio enquanto fonte/seleção não estiverem aprovadas |

## Dados e privacidade

Não fazem parte da edição pública:

- CADs, desenhos, PDFs e fotos reais;
- nomes de clientes, pessoas e projetos;
- caminhos de NAS/rede;
- banco de índice e logs operacionais;
- credenciais, certificados e segredos.

A edição pública usa reconstruções sanitizadas e fixtures sintéticas para demonstrar decisões de produto e segurança.

## Evidência atual

A versão privada passou por validações de:

- índice local;
- conversão CAD rastreável;
- prévias;
- comparação visual;
- bloqueios de apresentação;
- tarefa agendada;
- acesso em rede local.

A edição pública preserva os padrões técnicos e testes de inspeção segura, sem apresentar esses resultados como certificação ou validação de engenharia.

## Limites

- modelos generativos podem produzir conteúdo visual plausível e tecnicamente errado;
- conversores podem perder propriedades ou semântica de formatos proprietários;
- fallback entre modelos não garante equivalência de qualidade;
- vídeo/animação não comprova funcionamento físico;
- revisão humana precisa ser feita por pessoa adequada ao contexto e à responsabilidade técnica envolvida.

## Documentação relacionada

- [`architecture.md`](architecture.md)
- [`privacy-and-security.md`](privacy-and-security.md)
- [`validation.md`](validation.md)
