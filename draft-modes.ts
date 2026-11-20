export const modes = {
  football: {
    title: 'Football Player Draft',
    theme: 'Football',
    subtitle: 'Player Draft',
    attributes: ['Finalização', 'Passe', 'Drible', 'Velocidade', 'Defesa', 'Físico'],
  },
  anime: {
    title: 'Anime Character Draft',
    theme: 'Anime',
    subtitle: 'Character Draft',
    attributes: ['Força', 'Técnica', 'Velocidade', 'Defesa', 'Estratégia', 'Energia'],
  },
} as const

export type Mode = keyof typeof modes
