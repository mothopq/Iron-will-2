// weightClasses.js - Categorias de peso oficiais e infantis/juvenis

export const WEIGHT_CLASSES = [
  {
    id: 'strawweight',
    name: 'Peso Palha',
    limitKg: 52.2,
    limitLbs: 115,
    description: 'Velocidade estonteante e ritmo ininterrupto. Exige grande flexibilidade.',
    idealHeightRange: [155, 168],
    youthAllowed: true
  },
  {
    id: 'flyweight',
    name: 'Peso Mosca',
    limitKg: 56.7,
    limitLbs: 125,
    description: 'Combates elétricos de alta velocidade, transições rápidas e scramble constante.',
    idealHeightRange: [160, 172],
    youthAllowed: true
  },
  {
    id: 'bantamweight',
    name: 'Peso Galo',
    limitKg: 61.2,
    limitLbs: 135,
    description: 'Excelente equilíbrio entre técnica de mãos, velocidade e gás infinito.',
    idealHeightRange: [165, 175],
    youthAllowed: true
  },
  {
    id: 'featherweight',
    name: 'Peso Pena',
    limitKg: 65.8,
    limitLbs: 145,
    description: 'Uma das categorias mais disputadas do mundo. Nocautes frequentes e alto nível técnico.',
    idealHeightRange: [170, 180],
    youthAllowed: true
  },
  {
    id: 'lightweight',
    name: 'Peso Leve',
    limitKg: 70.3,
    limitLbs: 155,
    description: 'A divisão de ouro dos esportes de combate: potência pura combinada com velocidade explosiva.',
    idealHeightRange: [172, 183],
    youthAllowed: false
  },
  {
    id: 'welterweight',
    name: 'Peso Meio-Médio',
    limitKg: 77.1,
    limitLbs: 170,
    description: 'Atletas fortes, com wrestling dominante e golpes pesados na média distância.',
    idealHeightRange: [178, 188],
    youthAllowed: false
  },
  {
    id: 'middleweight',
    name: 'Peso Médio',
    limitKg: 83.9,
    limitLbs: 185,
    description: 'Força bruta e resistência. Um único golpe limpo costuma definir a luta.',
    idealHeightRange: [180, 192],
    youthAllowed: false
  },
  {
    id: 'light_heavyweight',
    name: 'Peso Meio-Pesado',
    limitKg: 93.0,
    limitLbs: 205,
    description: 'Gigantes ágeis com pegada devastadora de nocaute.',
    idealHeightRange: [185, 196],
    youthAllowed: false
  },
  {
    id: 'heavyweight',
    name: 'Peso Pesado',
    limitKg: 120.2,
    limitLbs: 265,
    description: 'Os homens mais perigosos do planeta. A força é astronômica e o queixo é testado a cada segundo.',
    idealHeightRange: [188, 205],
    youthAllowed: false
  }
];

export function getWeightClassByWeight(weightKg, isYouth = false) {
  if (isYouth && weightKg < 48) {
    return {
      id: 'youth_cadet',
      name: 'Juvenil / Amador Leve',
      limitKg: 50.0,
      limitLbs: 110,
      description: 'Categoria infantil/juvenil adaptada para o desenvolvimento do atleta.',
      idealHeightRange: [140, 165],
      youthAllowed: true
    };
  }

  for (const wc of WEIGHT_CLASSES) {
    if (weightKg <= wc.limitKg) {
      return wc;
    }
  }
  return WEIGHT_CLASSES[WEIGHT_CLASSES.length - 1]; // Pesado por padrão
}
