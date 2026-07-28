# Estratégia de validação

## Testes automatizados deste repositório

| Caso | Critério |
|---|---|
| ZIP seguro | Identifica PDF/CAD por extensão sem extrair arquivos |
| Path traversal | Rejeita entradas `../` e caminhos absolutos |
| Compressão suspeita | Rejeita expansão fora do orçamento |
| JSON | Interpreta como dados, sem executar conteúdo |
| Redação | Remove caminho local, rede, usuário, token e segredo de um manifesto público |

## Evidência esperada no produto completo

Uma entrega operacional deveria registrar, em ambiente autorizado:

1. hash antes/depois da cópia local do CAD;
2. seleção visual e comparação com o desenho;
3. responsável, evidência e data da aprovação;
4. perfil de movimento confirmado, quando aplicável;
5. inspeção humana do vídeo final;
6. validação automática de codec, duração, resolução, FPS e frames;
7. teste de cancelamento, falha de conversor, cache e retomada.

Este repositório não afirma que esses testes foram executados contra dados públicos; ele mostra o contrato de engenharia usado para torná-los auditáveis.
