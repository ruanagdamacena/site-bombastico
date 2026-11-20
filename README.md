# Bombástico

Protótipo do Football Player Draft e do Anime Character Draft com partidas contra bot ou por convite.

## Rodar localmente

Use Node.js 24. Na pasta do projeto, execute:

```sh
npm ci
npm run build
npm start
```

Abra http://localhost:3000. Para simular dois jogadores na mesma máquina, abra o convite em outro perfil do navegador ou em uma janela anônima. As salas ficam no arquivo local `draft.sqlite`.

## Catálogo de teste

O catálogo começa com 200 atletas e inclui cartas extras para algumas fases da carreira de Messi, Cristiano Ronaldo, Ronaldo, Ronaldinho e Kaká. Cada carta tem clube, temporada e notas próprias. Na mesma partida, os dois participantes podem receber o mesmo atleta em temporadas diferentes. O sorteio usa faixas internas definidas pela média das notas da carta. Ruins vão até 69, médios de 70 a 79, bons de 80 a 89 e lendas de 90 a 99.

As partidas novas e as revanches usam 200 futebolistas reais, em 207 cartas. As notas de futebol são provisórias. Para os atletas adicionados em 2019 e 2023/24, as referências de clube e temporada são as fichas da [CBF (Chapecoense e Corinthians)](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/serie-a/2019/20001/20004/20052/20006/chapecoense-x-corinthians/813085?view=escalacao), [CBF (Fortaleza)](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/serie-a/2019/185444/esporte-clube-bahia-x-fortaleza/813066?view=escalacao), [Grêmio (Grêmio e Flamengo)](https://gremio.net/futebol/ficha/3704) e [Premier League](https://www.premierleague.com/en/news/3886218).

No modo anime, são 48 cartas de Naruto, Dragon Ball, One Piece e Bleach, incluindo versões de fases diferentes. Cada carta mostra a fase e uma pista sobre uma habilidade. As notas foram definidas para o jogo com base no que o personagem demonstra naquela fase. Velocidade mede deslocamento e reação, Defesa inclui resistência e proteção, e Energia representa a reserva ou a capacidade de sustentar habilidades.

Referências de personagens e fases: [Naruto — Exame Chūnin](https://naruto-official.com/en/news/01_1282), [Naruto — Shikamaru](https://naruto-official.com/en/news/01_1910), [Dragon Ball — Cell](https://en.dragon-ball-official.com/news/01_1257.html), [Dragon Ball — Torneio do Poder](https://en.dragon-ball-official.com/news/01_900.html), [One Piece — personagens](https://one-piece.com/character/), [One Piece — Wano](https://one-piece.com/story/land_of_wano/index.html) e [Bleach — Guerra Sangrenta dos Mil Anos](https://bleach-anime.com/en/character/).

Partidas abertas antes da troca usam o catálogo com que começaram até a próxima revanche.
