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

O catálogo começa com 200 atletas e inclui cartas extras para algumas fases da carreira de Messi, Cristiano Ronaldo, Ronaldo, Ronaldinho e Kaká. Cada carta tem clube, temporada e notas próprias. Na mesma partida, os dois participantes podem receber o mesmo atleta em temporadas diferentes. A faixa depende da média das notas da carta. Ruins vão até 69, médios de 70 a 79, bons de 80 a 89 e lendas de 90 a 99.

O catálogo ainda inclui atletas e clubes fictícios, identificados nas cartas. Todas as notas são provisórias e foram definidas para testar o jogo.
