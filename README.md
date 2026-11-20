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

No modo anime, são 80 cartas de Naruto, Dragon Ball, One Piece, Bleach, Demon Slayer, Jujutsu Kaisen, My Hero Academia e Hunter × Hunter. As cartas mais fracas aparecem em 40% dos sorteios e podem ter uma especialidade forte. Cada carta mostra o personagem, a série, a fase e a faixa. As notas de Força, Técnica, Velocidade, Defesa, Estratégia e Energia foram definidas para o jogo com base no que o personagem demonstra naquela fase. Velocidade mede deslocamento e reação, Defesa inclui resistência e proteção, e Energia representa a reserva ou a capacidade de sustentar habilidades.

Referências de personagens e fases: [Naruto — Exame Chūnin](https://naruto-official.com/en/news/01_1282), [Naruto — Shikamaru](https://naruto-official.com/en/news/01_1910), [Dragon Ball — Cell](https://en.dragon-ball-official.com/news/01_1257.html), [Dragon Ball — Torneio do Poder](https://en.dragon-ball-official.com/news/01_900.html), [One Piece — personagens](https://one-piece.com/character/), [One Piece — Wano](https://one-piece.com/story/land_of_wano/index.html) e [Bleach — Guerra Sangrenta dos Mil Anos](https://bleach-anime.com/en/character/).

Referências das novas séries: [Demon Slayer](https://demonslayer-anime.com/hta/character/), [Jujutsu Kaisen](https://jujutsukaisen.jp/character/index_1st.php), [My Hero Academia](https://www.heroaca.com/character/chara_group01/) e [Hunter × Hunter](https://madhouse.co.jp/english/works/tv_hunter/).

Partidas abertas antes da troca usam o catálogo com que começaram até a próxima revanche.

## Perfil e cosméticos

O apelido é escolhido no cadastro e usado na entrada da conta e nas partidas. As contas ficam no banco local do servidor. O progresso e os cosméticos ficam vinculados à conta neste navegador. Ao criar uma conta neste navegador, o progresso local anterior é transferido para ela.

Cada partida concluída rende 20 moedas e 100 XP, com mais 10 moedas e 50 XP por vitória. As moedas compram banners e emblemas. A cada 100 XP o jogador sobe um nível, e a cada 10 níveis ganha um título. Títulos comprados na versão anterior continuam disponíveis no perfil.

## Draft histórico

O Draft histórico já permite montar um XI em 4-3-3 ou 4-4-2 e disputar um quadrangular solo. As campanhas de Libertadores 2019 e Copa de 2002 ficam salvas por conta. Escolha entre três jogadores por vaga, use um novo sorteio se quiser e escolha a tática antes de cada rodada. A tabela usa pontos, saldo e gols marcados. Em empate nesses três critérios, os times ficam em ordem alfabética.

Os elencos foram adaptados à formação do jogo com notas provisórias. As referências de escalação são a [ficha oficial de Flamengo e Grêmio](https://gremio.net/futebol/ficha/3704), o [arquivo do River Plate](https://www.cariverplate.com.ar/docs/socios/memoria-2019-2020-anexo.pdf), o [registro da AFA](https://www.afa.com.ar/ligapro/posts/river-recibira-a-boca-a-partir-de-las-21.30-en-la-primera-semifinal-de-la-copa-libertadores), o [arquivo da FIFA](https://ipt.fifa.com/de/tournaments/mens/worldcup/2002korea-japan/news/18-uhr-im-stream-ronaldo-fuhrt-brasilien-zum-funften-stern) e a [ficha da Federação Turca](https://www.tff.org/Default.aspx?macId=4508&pageId=528). A inspiração para o fluxo de sorteio, escalação e calendário veio de [7a0](https://7a0.com.br/como-jogar) e [38–0](https://38zero.com.br/jogo-de-draft-de-futebol). A simulação e os quadrangulares são regras do Bombástico.

### Imagens das cartas de anime

As 80 cartas mostram imagens após o sorteio, em uma moldura com proporção fixa que mantém a imagem inteira visível. O jogo distingue as imagens da fase e os retratos gerais de personagem. No protótipo local, os arquivos em `public/anime-portraits/` são opcionais e ficam fora do Git. Quando um arquivo local está indisponível, a carta tenta carregar a imagem da fonte. As permissões para publicar as artes ainda precisam ser confirmadas.

As imagens da fase vêm das páginas de [Naruto — Shikamaru](https://naruto-official.com/en/anime/naruto1/list/01_288), [Naruto Shippuden — Kakashi](https://naruto-official.com/en/anime/naruto2/list/01_819), [Crunchyroll — Gojo](https://www.crunchyroll.com/news/announcements/2023/6/30/jujutsu-kaisen-season-2-anime-premieres-on-crunchyroll-july-6), [Demon Slayer — Distrito do Entretenimento](https://demonslayer-anime.com/eda/character/), [Demon Slayer — Trem Infinito](https://demonslayer-anime.com/mugentrain/character/) e [Bleach](https://bleach-anime.com/en/character/). Os retratos gerais apontam para os perfis do [AniList](https://anilist.co/) e, no caso do Tanjiro, para o site oficial de [Demon Slayer](https://demonslayer-anime.com/hta/character/).
