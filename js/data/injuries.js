// injuries.js - Sistema realista de lesões, gravidades e tratamentos

export const INJURY_TYPES = {
  broken_hand: {
    id: 'broken_hand',
    name: 'Fratura na Mão / Metacarpo',
    icon: '🦴',
    location: 'Mão',
    severity: 'Alta',
    healWeeks: 8,
    costTreatment: 1200,
    penalties: { punchPower: -35, boxing: -25 },
    description: 'Os ossos da mão sofreram impacto direto sem amortecimento suficiente. Golpear causa dor intensa.'
  },
  knee_ligament: {
    id: 'knee_ligament',
    name: 'Entorse de Joelho / Ligamento (LCA/LCL)',
    icon: '🦵',
    location: 'Joelho',
    severity: 'Severa',
    healWeeks: 12,
    costTreatment: 2800,
    penalties: { speed: -40, wrestling: -35, kicking: -30, defense: -20 },
    description: 'Instabilidade na articulação do joelho. Dificuldade severa para apoiar o peso, chutar ou defender quedas.'
  },
  dislocated_shoulder: {
    id: 'dislocated_shoulder',
    name: 'Subluxação do Ombro',
    icon: '🦾',
    location: 'Ombro',
    severity: 'Média-Alta',
    healWeeks: 6,
    costTreatment: 900,
    penalties: { punchPower: -25, defense: -20, clinch: -25 },
    description: 'Articulação glenoumeral frouxa. Risco constante de sair do lugar em ganchos e clinches.'
  },
  concussion: {
    id: 'concussion',
    name: 'Concussão Cerebral / Trauma Craniano',
    icon: '🧠',
    location: 'Cabeça',
    severity: 'Crítica',
    healWeeks: 6,
    costTreatment: 1500,
    penalties: { chin: -45, reflexes: -30, fightIQ: -15 },
    description: 'O cérebro chacoalhou na caixa craniana. O queixo fica extremamente vulnerável a novos impactos.'
  },
  cut_eyebrow: {
    id: 'cut_eyebrow',
    name: 'Corte Profundo no Supercílio',
    icon: '🩸',
    location: 'Rosto',
    severity: 'Leve',
    healWeeks: 2,
    costTreatment: 300,
    penalties: { defense: -10, reflexes: -10 },
    description: 'Pele rasgada por cotovelo ou soco contundente. Sangramento que pode cegar temporariamente a visão.'
  },
  cracked_rib: {
    id: 'cracked_rib',
    name: 'Costela Trincada',
    icon: '🩻',
    location: 'Tronco',
    severity: 'Alta',
    healWeeks: 7,
    costTreatment: 850,
    penalties: { cardio: -35, toughness: -30, recovery: -25 },
    description: 'Respiração profunda e golpes no corpo tornam-se insuportáveis.'
  },
  muscle_tear: {
    id: 'muscle_tear',
    name: 'Estiramento Muscular Grau 2',
    icon: '⚡',
    location: 'Músculo',
    severity: 'Média',
    healWeeks: 4,
    costTreatment: 500,
    penalties: { speed: -20, punchPower: -15, recovery: -15 },
    description: 'Fibras musculares rompidas por excesso de carga ou falta de aquecimento.'
  },
  sprained_ankle: {
    id: 'sprained_ankle',
    name: 'Torção de Tornozelo',
    icon: '🦶',
    location: 'Tornozelo',
    severity: 'Leve-Média',
    healWeeks: 3,
    costTreatment: 350,
    penalties: { speed: -15, distanceControl: -25 },
    description: 'Perda de estabilidade na movimentação do ringue e nas esquivas pendulares.'
  }
};

export function getRandomInjury() {
  const keys = Object.keys(INJURY_TYPES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return { ...INJURY_TYPES[randomKey], remainingWeeks: INJURY_TYPES[randomKey].healWeeks };
}
