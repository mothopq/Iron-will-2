// trainingEngine.js - Sistema de rotina semanal, fadiga, overtraining e ganhos de atributos

import { GYMS } from '../data/gyms.js';
import { getRandomInjury } from '../data/injuries.js';

export const TRAINING_ACTIVITIES = {
  strength_weights: {
    id: 'strength_weights',
    name: 'Musculação & Cargas',
    category: 'Físico',
    icon: '🏋️‍♂️',
    description: 'Levantamento olímpico e hipertrofia para potência de impacto.',
    fatigue: 9,
    energyCost: 12,
    injuryRisk: 0.03,
    modalities: ['all'],
    gains: { strength: 0.9, punchPower: 0.6 }
  },
  cardio_sprints: {
    id: 'cardio_sprints',
    name: 'Tiros de Corrida & Cardio',
    category: 'Físico',
    icon: '🏃‍♂️',
    description: 'Treino intervalado de alta intensidade (HIIT) para fôlego de campeonato.',
    fatigue: 8,
    energyCost: 14,
    injuryRisk: 0.02,
    modalities: ['all'],
    gains: { cardio: 1.2, speed: 0.7 }
  },
  technique_pads: {
    id: 'technique_pads',
    name: 'Manopla & Técnica Pura',
    category: 'Técnico',
    icon: '🥊',
    description: 'Ajuste fino de combinações, ângulos e velocidade com o treinador.',
    fatigue: 7,
    energyCost: 10,
    injuryRisk: 0.02,
    modalities: ['boxing', 'muay_thai', 'kickboxing', 'mma'],
    gains: { boxing: 0.9, distanceControl: 0.7, reflexes: 0.5 }
  },
  speed_bag: {
    id: 'speed_bag',
    name: 'Pera de Velocidade & Ritmo',
    category: 'Técnico',
    icon: '⚡',
    description: 'Coordenação motora, ritmo de ombros e reflexos de velocidade pura.',
    fatigue: 6,
    energyCost: 9,
    injuryRisk: 0.01,
    modalities: ['boxing', 'kickboxing', 'mma'],
    gains: { speed: 1.0, reflexes: 0.8, coordination: 0.7 }
  },
  shadow_boxing: {
    id: 'shadow_boxing',
    name: 'Shadow Boxing & Pêndulo',
    category: 'Técnico',
    icon: '🌀',
    description: 'Esquivas na frente do espelho, jogo de pernas elusivo e fluidez.',
    fatigue: 5,
    energyCost: 8,
    injuryRisk: 0.01,
    modalities: ['boxing', 'kickboxing', 'muay_thai', 'mma'],
    gains: { reflexes: 1.1, distanceControl: 0.9, defense: 0.6 }
  },
  kicking_bag: {
    id: 'kicking_bag',
    name: 'Saco Pesado & Chutes',
    category: 'Técnico',
    icon: '🦵',
    description: 'Fortalecimento de canelas e impacto em chutes e joelhadas.',
    fatigue: 8,
    energyCost: 12,
    injuryRisk: 0.03,
    modalities: ['muay_thai', 'kickboxing', 'mma'],
    gains: { kicking: 1.1, punchPower: 0.5, toughness: 0.4 }
  },
  grappling_roll: {
    id: 'grappling_roll',
    name: 'Treino de Solo / Rola de BJJ',
    category: 'Grappling',
    icon: '🥋',
    description: 'Transições, pegadas de costas, passagens de guarda e caça a finalizações.',
    fatigue: 9,
    energyCost: 14,
    injuryRisk: 0.05,
    modalities: ['jiu_jitsu', 'judo', 'mma'],
    gains: { bjj: 1.2, coordination: 0.6, recovery: 0.4 }
  },
  wrestling_takedowns: {
    id: 'wrestling_takedowns',
    name: 'Wrestling & Defesa de Quedas',
    category: 'Grappling',
    icon: '🤼',
    description: 'Entradas de perna, sprawl implacável e grade.',
    fatigue: 10,
    energyCost: 15,
    injuryRisk: 0.06,
    modalities: ['wrestling', 'judo', 'mma', 'jiu_jitsu'],
    gains: { wrestling: 1.2, strength: 0.5, defense: 0.6 }
  },
  hard_sparring: {
    id: 'hard_sparring',
    name: 'Sparring Duro / Simulação Real',
    category: 'Combate',
    icon: '💥',
    description: 'Combate com contato total para forjar queixo, reflexos e inteligência de luta.',
    fatigue: 16,
    energyCost: 20,
    injuryRisk: 0.14,
    modalities: ['all'],
    gains: { fightIQ: 1.4, defense: 1.1, reflexes: 1.0, chin: 0.4 }
  },
  recovery_physio: {
    id: 'recovery_physio',
    name: 'Fisioterapia & Crioterapia',
    category: 'Recuperação',
    icon: '🧊',
    description: 'Banheira de gelo, massagem miofascial e descanso guiado.',
    fatigue: -18,
    energyCost: -15,
    injuryRisk: 0.0,
    modalities: ['all'],
    gains: { recovery: 0.6 }
  },
  total_rest: {
    id: 'total_rest',
    name: 'Descanso Total & Sono',
    category: 'Recuperação',
    icon: '🛌',
    description: 'Dia livre para recarregar o sistema nervoso central e mente.',
    fatigue: -25,
    energyCost: -30,
    injuryRisk: 0.0,
    modalities: ['all'],
    gains: {}
  }
};

// Retorna as atividades de treino válidas para a modalidade do atleta
export function getActivitiesForModality(modalityId = 'boxing') {
  return Object.values(TRAINING_ACTIVITIES).filter(act => {
    if (!act.modalities || act.modalities.includes('all')) return true;
    return act.modalities.includes(modalityId);
  });
}

export class TrainingEngine {
  constructor(fighter) {
    this.fighter = fighter;
    // Rotina padrão: 7 dias x 2 turnos (Manhã e Tarde)
    this.weeklySchedule = {
      seg_m: 'technique_pads', seg_t: 'strength_weights',
      ter_m: 'kicking_bag',    ter_t: 'grappling_roll',
      qua_m: 'cardio_sprints',  qua_t: 'hard_sparring',
      qui_m: 'technique_pads', qui_t: 'wrestling_takedowns',
      sex_m: 'hard_sparring',  sex_t: 'cardio_sprints',
      sab_m: 'recovery_physio',sab_t: 'total_rest',
      dom_m: 'total_rest',     dom_t: 'total_rest'
    };
  }

  setScheduleSlot(slotKey, activityId) {
    if (this.weeklySchedule[slotKey] !== undefined && TRAINING_ACTIVITIES[activityId]) {
      this.weeklySchedule[slotKey] = activityId;
    }
  }

  // Processa o Camp de Treinamento de 4 Meses completo do lutador
  executeCampTraining() {
    const gym = GYMS.find(g => g.id === this.fighter.gymId) || GYMS[0];
    const statGainsSummary = {};
    let totalFatigueDelta = 0;
    let totalEnergyCost = 0;
    let injuriesOccurred = [];

    // Guarda os níveis anteriores para exibir a evolução visual
    const oldAttributes = { ...this.fighter.attributes };

    // Itera pelos 14 turnos da rotina base do camp
    Object.values(this.weeklySchedule).forEach(actId => {
      const act = TRAINING_ACTIVITIES[actId] || TRAINING_ACTIVITIES.total_rest;

      totalFatigueDelta += act.fatigue * 0.4;
      totalEnergyCost += act.energyCost * 0.35;

      // Cálculo de Ganhos de Atributos no ciclo de 4 meses
      Object.entries(act.gains).forEach(([attr, baseGain]) => {
        const gymMod = gym.statMultipliers[attr] || 1.0;
        // Bônus se o lutador for jovem (aprende mais rápido!)
        const youthBonus = this.fighter.age < 20 ? 1.3 : this.fighter.age > 33 ? 0.7 : 1.0;
        // Fator de escala do camp de 4 meses: gera ganhos visíveis de +1 a +4 pontos
        const campGain = baseGain * 0.35 * gymMod * youthBonus;

        statGainsSummary[attr] = (statGainsSummary[attr] || 0) + campGain;
      });

      // Checagem de Lesões no decorrer dos 4 meses de camp
      const fatigueMultiplier = this.fighter.fatigue > 60 ? 2.0 : 1.0;
      if (Math.random() < act.injuryRisk * 0.3 * fatigueMultiplier) {
        const newInjury = getRandomInjury();
        injuriesOccurred.push(newInjury);
      }
    });

    // Rótulos amigáveis das habilidades
    const attrLabels = {
      strength: 'Força Bruta',
      speed: 'Velocidade',
      toughness: 'Resistência Física',
      cardio: 'Cardio / Gás',
      reflexes: 'Reflexos de Esquiva',
      coordination: 'Coordenação',
      recovery: 'Recuperação',
      punchPower: 'Potência de Golpes',
      defense: 'Defesa & Bloqueio',
      chin: 'Queixo / Absorção',
      fightIQ: 'Inteligência de Luta (Fight IQ)',
      wrestling: 'Wrestling & Quedas',
      bjj: 'Jiu-Jitsu & Solo',
      boxing: 'Boxe & Mãos',
      kicking: 'Chutes & Canelas',
      clinch: 'Controle de Clinch',
      distanceControl: 'Controle de Distância'
    };

    // Monta progressão detalhada com níveis antigos e novos
    const progressionList = [];

    // Atualiza Atributos do Lutador (Escala 0 a 100, respeitando o Teto Genético de DNA)
    Object.entries(statGainsSummary).forEach(([attr, gain]) => {
      if (this.fighter.attributes[attr] !== undefined && gain >= 0.15) {
        const oldVal = Math.round(oldAttributes[attr]);
        const maxDna = (this.fighter.dnaMaxAttributes && this.fighter.dnaMaxAttributes[attr] !== undefined)
          ? this.fighter.dnaMaxAttributes[attr]
          : 70;
        
        const calculated = Math.min(maxDna, Math.round((this.fighter.attributes[attr] + gain) * 10) / 10);
        this.fighter.attributes[attr] = calculated;
        const newVal = Math.round(calculated);

        progressionList.push({
          attr,
          label: attrLabels[attr] || attr,
          oldVal,
          newVal,
          gain: Math.round(gain * 10) / 10,
          levelUp: newVal > oldVal,
          isAtDnaMax: newVal >= maxDna
        });
      }
    });

    // Concede XP de Treinamento por Camp concluído (80 a 140 XP)
    const campXpGained = Math.round(75 + (intensityScore * 30));
    this.fighter.xp = (this.fighter.xp || 0) + campXpGained;
    this.fighter.totalXpEarned = (this.fighter.totalXpEarned || 0) + campXpGained;

    // Ordena progressão pelos maiores ganhos
    progressionList.sort((a, b) => b.gain - a.gain);

    // Atualiza Fadiga e Energia no final do ciclo de 4 meses
    this.fighter.fatigue = Math.max(0, Math.min(100, this.fighter.fatigue + totalFatigueDelta));
    this.fighter.energy = Math.max(15, Math.min(100, this.fighter.energy - totalEnergyCost + 25));

    // Overtraining: Se a fadiga ultrapassar 80
    let overtrainingMessage = null;
    if (this.fighter.fatigue >= 80) {
      this.fighter.stress = Math.min(100, this.fighter.stress + 25);
      this.fighter.morale = Math.max(20, this.fighter.morale - 15);
      overtrainingMessage = 'Atenção: Sobrecarga de Camp! Seu corpo acumulou excesso de fadiga crônica. Recomendado descansar no próximo ciclo para evitar lesões!';
    }

    // Adiciona lesões ativas
    injuriesOccurred.forEach(inj => {
      this.fighter.injuries.push(inj);
    });

    return {
      statGains: statGainsSummary,
      progressionList,
      campXpGained,
      progression: progressionList,
      injuries: injuriesOccurred,
      overtraining: overtrainingMessage,
      currentFatigue: this.fighter.fatigue,
      currentEnergy: this.fighter.energy
    };
  }

  // Mantém retrocompatibilidade para chamadas antigas
  executeWeeklyTraining() {
    return this.executeCampTraining();
  }
}
