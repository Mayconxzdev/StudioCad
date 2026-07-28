# Privacidade e segurança

## Princípio de publicação

Este repositório documenta padrões de engenharia. Ele não distribui dados, arquivos ou infraestrutura de terceiros.

## Exclusões obrigatórias

- documentos técnicos, CADs, imagens, fotos e PDFs reais;
- qualquer endereço de rede, nome de host, usuário ou caminho local;
- nomes de cliente, produto interno, pedido, revisão ou pessoa;
- arquivos de banco, logs, cache, instalador e runtime;
- tokens, chaves, certificados, senhas e credenciais;
- screenshots que exponham conteúdo técnico ou identidade de terceiros.

## Controles demonstrados

- inventário de ZIP/TAR/JSON sem execução;
- validação contra path traversal, entradas especiais, criptografia e tamanhos suspeitos;
- limites de quantidade de entradas, tamanho expandido e taxa de compressão;
- exportação pública que remove caminhos, rede, identidades, segredos e logs;
- reconhecimento de que uma PNG interna não equivale a desenho técnico ou CAD.

## Limite ético

Uma versão de portfólio deve demonstrar capacidade, não reproduzir conhecimento confidencial. Qualquer dado real deve permanecer fora do repositório, mesmo que pareça inofensivo isoladamente.
