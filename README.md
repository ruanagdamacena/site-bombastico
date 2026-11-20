# Bombástico

Protótipo do Football Player Draft com partidas contra bot ou por convite.

## Rodar localmente

Use Node.js 24. Na pasta do projeto, execute:

```sh
npm ci
npm run build
npm start
```

Abra http://localhost:3000. Para simular dois jogadores na mesma máquina, abra o convite em outro perfil do navegador ou em uma janela anônima. As salas ficam no arquivo local `draft.sqlite`.

## Catálogo de teste

São 200 entradas, com 50 em cada faixa. Ruins vão até 69, médios de 70 a 79, bons de 80 a 89 e lendas de 90 a 99. As duas primeiras faixas usam personagens fictícios. As duas últimas usam nomes de futebolistas reais e notas provisórias geradas para testar o jogo. As notas do catálogo não representam estatísticas oficiais.
