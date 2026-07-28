# Arquitetura e decisões

## Problema

Uma estação visual precisa ajudar alguém a entender um equipamento real, não apenas listar arquivos. Isso exige uma separação forte entre a evidência original, as decisões do novo estudo e qualquer visualização derivada.

## Fronteiras

| Camada | Responsabilidade | Nunca faz |
|---|---|---|
| Acervo autorizado | Mantém fontes históricas | Alterar fonte, revisão ou data original |
| Índice local | Pesquisa metadados e hashes | Tratar nome de arquivo como confirmação técnica |
| Projeto em uso | Salva decisões, responsáveis e evidências | Alterar o histórico original |
| Conversor CAD | Trabalha sobre cópia hash-validada | Executar macro/script recebido ou gravar no acervo |
| Apresentação | Renderiza apenas uma seleção aprovada | Inferir rotor, eixo, limites ou CFD |

## Regra de produto

Uma imagem bonita não é evidência suficiente. O produto deve preferir um bloqueio explícito a uma demonstração tecnicamente falsa.

## Fluxo de apresentação

1. identificar a fonte técnica e registrar seu hash;
2. gerar uma visualização derivada em cache local;
3. mostrar desenho e visualização lado a lado;
4. registrar a decisão humana com responsável e evidência;
5. liberar somente a câmera após seleção visual aprovada;
6. liberar movimento somente após perfil mecânico confirmado;
7. validar o vídeo gerado por codec, duração, resolução, FPS e frames úteis.
