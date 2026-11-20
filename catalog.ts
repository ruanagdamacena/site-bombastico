export const attributes = ['Finalização', 'Passe', 'Drible', 'Velocidade', 'Defesa', 'Físico'] as const
export const tiers = ['Ruins', 'Médios', 'Bons', 'Lendas'] as const

const legends = 'Pelé|Maradona|Messi|Cristiano Ronaldo|Cruyff|Beckenbauer|Zidane|Ronaldo|Ronaldinho|Romário|Garrincha|Zico|Sócrates|Rivaldo|Cafu|Roberto Carlos|Maldini|Baresi|Nesta|Cannavaro|Pirlo|Baggio|Totti|Del Piero|Van Basten|Gullit|Rijkaard|Henry|Bergkamp|Eusébio|Puskás|Di Stéfano|Gento|George Best|Bobby Charlton|Bobby Moore|Gerd Müller|Matthäus|Xavi|Iniesta|Busquets|Modrić|Neymar|Rivaldo Vítor Borba|Bebeto|Carlos Alberto Torres|Djalma Santos|Nilton Santos|Falcão|Kaká'.replace('Rivaldo Vítor Borba', 'Jairzinho')
const good = 'Adriano|Juninho Pernambucano|Diego Ribas|Alex de Souza|Djalminha|Giovane Élber|Luís Fabiano|Fred|Hulk|Paulinho|Renato Augusto|Lucas Moura|Bernard|Douglas Costa|Willian|Oscar|Ramires|David Luiz|Dante|Miranda|Filipe Luís|Juan|Dedé|Lúcio|Diego Costa|Éverton Ribeiro|Arrascaeta|Gabigol|Bruno Henrique|Pedro|Dudu|Raphael Veiga|Gustavo Gómez|Lucas Paquetá|Bruno Guimarães|Richarlison|Raphinha|Martinelli|Rodrygo|Vinícius Júnior|Casemiro|Fabinho|Fernandinho|Marcelo|Dani Alves|Maicon|Bastos|Robinho|Ricardo Oliveira|Nilmar'
const first = ['André', 'Bruno', 'Caio', 'Daniel', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique', 'Igor', 'João']
const surnames = ['Amarante', 'Barbalho', 'Cordeiro', 'Dourado', 'Esteves', 'Furtado', 'Gouveia', 'Horta', 'Lamego', 'Moura']
const groups = [
  first.flatMap(name => surnames.slice(0, 5).map(last => name + ' ' + last)),
  first.flatMap(name => surnames.slice(5).map(last => name + ' ' + last)),
  good.split('|'),
  legends.split('|'),
]

export const catalog = groups.flatMap((names, tier) => names.map((name, index) => {
  const id = tier * 50 + index
  const target = [60, 70, 80, 90][tier] + (index * 7 % 10)
  const offsets = [10, -10, 6, -6, 3, -3].map(offset => {
    const variation = Math.min(99 - target, Math.abs(offset))
    return Math.sign(offset) * variation
  })
  const ratings = attributes.map((_, attribute) => target + offsets[(attribute + index + tier) % offsets.length])
  const overall = Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
  return { id, name, tier, ratings, overall, fictional: tier < 2 }
}))
