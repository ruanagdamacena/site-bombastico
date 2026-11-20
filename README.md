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

As partidas novas e as revanches usam 200 futebolistas reais, em 207 cartas. As duas faixas inferiores incluem elencos conhecidos do Brasil e da Europa. As notas de futebol são provisórias. Entre as referências de elenco estão os arquivos de [Santos](https://www.santosfc.com.br/paulistao-de-2011-o-show-na-hora-certa/), [São Paulo](https://www.saopaulofc.net/enciclopedia-jogadores-listas-de-inscritos/), [Palmeiras](https://www.palmeiras.com.br/libertadores-2020/), [Manchester United](https://www.manutd.com/en/club/history/history-by-decade/2000-2009) e [UEFA](https://editorial.uefa.com/resources/0282-18407a7a3056-fed61d05639b-1000/ucl_202223_finals_md13.pdf).

No modo anime, são 80 cartas de Naruto, Dragon Ball, One Piece, Bleach, Demon Slayer, Jujutsu Kaisen, My Hero Academia e Hunter × Hunter. As cartas mais fracas aparecem em 40% dos sorteios e podem ter uma especialidade forte. Cada carta mostra o personagem, a série, a fase e a faixa. As notas foram definidas para o jogo com base no que o personagem demonstra naquela fase. Velocidade mede deslocamento e reação, Defesa inclui resistência e proteção, e Energia representa a reserva ou a capacidade de sustentar habilidades.

Referências de personagens e fases: [Naruto — Exame Chūnin](https://naruto-official.com/en/news/01_1282), [Naruto — Shikamaru](https://naruto-official.com/en/news/01_1910), [Dragon Ball — Cell](https://en.dragon-ball-official.com/news/01_1257.html), [Dragon Ball — Torneio do Poder](https://en.dragon-ball-official.com/news/01_900.html), [One Piece — personagens](https://one-piece.com/character/), [One Piece — Wano](https://one-piece.com/story/land_of_wano/index.html) e [Bleach — Guerra Sangrenta dos Mil Anos](https://bleach-anime.com/en/character/).

Referências das novas séries: [Demon Slayer](https://demonslayer-anime.com/hta/character/), [Jujutsu Kaisen](https://jujutsukaisen.jp/character/index_1st.php), [My Hero Academia](https://www.heroaca.com/character/chara_group01/) e [Hunter × Hunter](https://madhouse.co.jp/english/works/tv_hunter/).

Partidas abertas antes da troca usam o catálogo com que começaram até a próxima revanche.
