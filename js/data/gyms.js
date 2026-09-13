// gyms.js - Academias, treinadores e equipamentos para evolução do lutador

export const GYMS = [
  {
    id: 'garage_gym',
    name: 'Garagem do Mestre Tião',
    tier: 'Iniciante',
    monthlyFee: 50,
    minFame: 0,
    description: 'Um espaço rústico com saco de pancadas de lona, pneus velhos e muito suor. Ideal para forjar caráter.',
    statMultipliers: {
      toughness: 1.2,
      punchPower: 1.1,
      technique: 0.9,
      recovery: 0.85
    },
    coach: {
      name: 'Mestre Tião',
      specialty: 'Raça, queixo e boxe tradicional',
      adviceBonus: 'Bônus de resistência no corner (+10% recuperação de gás entre rounds)'
    }
  },
  {
    id: 'regional_academy',
    name: 'Centro de Lutas União & Garra',
    tier: 'Intermediário',
    monthlyFee: 250,
    minFame: 15,
    description: 'Boa estrutura com ringue oficial, área de tatame decente e atletas amadores dedicados.',
    statMultipliers: {
      boxing: 1.15,
      kicking: 1.15,
      cardio: 1.15,
      technique: 1.1
    },
    coach: {
      name: 'Professor Marcelo "Navalha"',
      specialty: 'Kickboxing holandês e combinações velozes',
      adviceBonus: '+10% de precisão nos golpes em pé nos rounds 2 e 3'
    }
  },
  {
    id: 'pro_fight_club',
    name: 'Predator Fight Club',
    tier: 'Avançado',
    monthlyFee: 850,
    minFame: 40,
    description: 'Academia de nível nacional com octógono, gaiola de wrestling, sparrings de elite e fisioterapeuta parceiro.',
    statMultipliers: {
      wrestling: 1.25,
      bjj: 1.25,
      speed: 1.2,
      defense: 1.2,
      fightIQ: 1.15
    },
    coach: {
      name: 'Treinador Alex "Predador" Ramos',
      specialty: 'Transições de MMA, quedas e controle posicional',
      adviceBonus: '+15% de defesa de quedas e contra-ataques precisos'
    }
  },
  {
    id: 'elite_world_camp',
    name: 'Apex Global Performance Center',
    tier: 'Elite Mundial',
    monthlyFee: 2500,
    minFame: 70,
    description: 'O santuário dos campeões mundiais. Câmaras hiperbáricas, biomecânica,sparrings internacionais e staff completo.',
    statMultipliers: {
      fightIQ: 1.35,
      recovery: 1.35,
      punchPower: 1.25,
      speed: 1.25,
      technique: 1.3,
      defense: 1.25
    },
    coach: {
      name: 'Head Coach Marcus Sterling',
      specialty: 'Estratégia de título mundial e inteligência analítica de combate',
      adviceBonus: 'Leitura perfeita do plano do adversário e bônus em todos os atributos no round final'
    }
  }
];

export const EQUIPMENT = [
  {
    id: 'pro_gloves',
    name: 'Luvas de Couro Genuíno Pro',
    price: 350,
    bonus: { punchPower: +4, defense: +2 },
    description: 'Excelente absorção de impacto no punho e firmeza no pulso.'
  },
  {
    id: 'custom_mouthguard',
    name: 'Protetor Bucal Odontológico Sob Medida',
    price: 250,
    bonus: { chin: +5, recovery: +3 },
    description: 'Protege a arcada e dissipa forças rotacionais que causam concussões.'
  },
  {
    id: 'altitude_mask',
    name: 'Máscara de Treinamento de Hipóxia',
    price: 450,
    bonus: { cardio: +6 },
    description: 'Fortalece a musculatura diafragmática para rounds de 5 minutos.'
  },
  {
    id: 'compression_gear',
    name: 'Vestimenta de Compressão & Caneleiras Premium',
    price: 300,
    bonus: { kicking: +3, recovery: +4 },
    description: 'Melhora o retorno venoso e reduz micro-traumas canela com canela.'
  }
];
