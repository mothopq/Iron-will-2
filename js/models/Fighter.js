// Fighter.js - Classe principal que encapsula todos os dados, atributos e métodos do lutador

import { getWeightClassByWeight } from '../data/weightClasses.js';
import { getStarterMovesForModality, getMoveById } from '../data/movesData.js';
import { getAttributeKeysForModality } from '../data/modalities.js';

export const CAMP_NAMES = [
  'Jan - Abr (Camp 1)',
  'Mai - Ago (Camp 2)',
  'Set - Dez (Camp 3)'
];

export function getSkillTier(value) {
  const val = Math.round(value);
  if (val < 40) return { tier: 'INICIANTE', badgeClass: 'tier-iniciante', color: '#94a3b8' };
  if (val < 55) return { tier: 'AMADOR', badgeClass: 'tier-amador', color: '#38bdf8' };
  if (val < 70) return { tier: 'MEDIANO', badgeClass: 'tier-mediano', color: '#34d399' };
  if (val < 85) return { tier: 'AVANÇADO / PRO', badgeClass: 'tier-avancado', color: '#a855f7' };
  if (val < 95) return { tier: 'ELITE MUNDIAL', badgeClass: 'tier-elite', color: '#ffd166' };
  return { tier: 'LENDÁRIO', badgeClass: 'tier-lendario', color: '#ef4444' };
}

export class Fighter {
  constructor(config = {}) {
    // 1. Identificação Básica
    this.name = config.name || 'Lutador Desconhecido';
    this.nickname = config.nickname || 'O Fenômeno';
    this.initialAge = config.initialAge || 18;
    this.age = config.initialAge || 18;
    
    // Sistema de Tempo: 3 Camps de 4 Meses por Ano (12 Meses = 1 Ano)
    this.careerCamps = 0; // Total acumulado de quadrimestres
    this.careerWeeks = 0; // Mantido para compatibilidade (1 camp = ~17 semanas)
    this.gender = config.gender || 'Masculino';
    this.stance = config.stance || 'Destro'; // Destro, Canhoto, Switch
    this.nationality = config.nationality || 'Brasil';
    this.birthState = config.birthState || 'São Paulo (SP)';
    this.birthCity = config.birthCity || 'São Paulo';
    this.personality = config.personality || 'Frio & Calculista';
    this.style = config.style || 'Equilibrado';

    // 2. Biotipo & Físico
    this.heightCm = config.heightCm || 178;
    this.weightKg = config.weightKg || 70.3;
    this.walkWeightKg = config.weightKg || 70.3; // Peso fora do camp
    this.reachCm = config.reachCm || 180;
    this.modality = config.modality || 'boxing';
    this.weightClass = getWeightClassByWeight(this.weightKg, this.age < 18).id;

    // 3. Aparência Visual
    this.appearance = {
      skinTone: config.appearance?.skinTone || '#d29a73',
      hairStyle: config.appearance?.hairStyle || 'fade',
      hairColor: config.appearance?.hairColor || '#221814',
      beard: config.appearance?.beard || 'none',
      bodyType: config.appearance?.bodyType || 'athletic',
      shortsColor: config.appearance?.shortsColor || '#d90429',
      glovesColor: config.appearance?.glovesColor || '#111111'
    };

    // 4. Atributos Fundamentais (Escala Nível 0 a 100)
    // Teto de DNA genético herdado das Lendas ("aquelas habilidades que nós pega dos caras é o nosso máximo")
    this.dnaMaxAttributes = config.dnaMaxAttributes ? { ...config.dnaMaxAttributes } : {};
    
    // Garante que APENAS os atributos da modalidade marcial do atleta sejam gerados
    const validKeys = getAttributeKeysForModality(this.modality);
    validKeys.forEach(attr => {
      if (this.dnaMaxAttributes[attr] === undefined) {
        this.dnaMaxAttributes[attr] = 70;
      }
    });

    const clampStat = (val, max = 100) => Math.max(0, Math.min(max, Math.round(val)));

    this.attributes = {};
    validKeys.forEach(attr => {
      const defaultVal = attr === 'fightIQ' ? (this.age >= 30 ? 50 : 35) :
                         (attr === 'strength' || attr === 'cardio' || attr === 'boxing' || attr === 'bjj' || attr === 'kicking' ? 42 : 38);
      const val = config.attributes && config.attributes[attr] !== undefined
        ? config.attributes[attr]
        : defaultVal;
      this.attributes[attr] = clampStat(val, this.dnaMaxAttributes[attr] || 100);
    });

    // 5. Sistema de Progressão: PH (Pontos de Habilidade para Comprar Golpes) & XP (para Aumentar Atributos)
    this.skillPoints = config.skillPoints !== undefined ? config.skillPoints : 0; // PH ganhos de 1 a 5 por vitória
    this.xp = config.xp !== undefined ? config.xp : 300; // XP acumulado para upar atributos (inicia com saldo para os primeiros upgrades)
    this.totalXpEarned = config.totalXpEarned || (this.xp || 300);

    // 6. Arsenal de Golpes: 5 Golpes Básicos Iniciais + Especiais Desbloqueados
    // Regra fundamental: Os golpes são estritamente isolados pela modalidade do atleta!
    const starterMoves = getStarterMovesForModality(this.modality);
    let initialUnlocked = config.unlockedMoves && Array.isArray(config.unlockedMoves)
      ? [...config.unlockedMoves]
      : [...starterMoves];

    let refundedPH = 0;
    const sanitizedUnlocked = [];
    starterMoves.forEach(sm => {
      if (!sanitizedUnlocked.includes(sm)) sanitizedUnlocked.push(sm);
    });

    initialUnlocked.forEach(mId => {
      if (sanitizedUnlocked.includes(mId)) return;
      const moveData = getMoveById(mId);
      if (!moveData || moveData.isBasic) return;

      if (this.modality === 'mma' || (moveData.modalities && moveData.modalities.includes(this.modality))) {
        sanitizedUnlocked.push(mId);
      } else if (moveData.cost) {
        refundedPH += moveData.cost;
      }
    });

    this.unlockedMoves = sanitizedUnlocked;
    this.skillPoints = (config.skillPoints !== undefined ? config.skillPoints : 0) + refundedPH;

    // 7. Estado Atual / Condição Dinâmica
    this.energy = 100; // 0-100
    this.fatigue = 0; // 0-100 (acumulado)
    this.stress = 10; // 0-100
    this.morale = 80; // 0-100

    // 8. Finanças & Vida
    this.money = config.money !== undefined ? config.money : 1500;
    this.fame = config.fame !== undefined ? config.fame : (this.age < 18 ? 5 : 10);
    this.followers = 450;
    this.job = this.age < 16 ? 'Estudante' : 'Entregador de Aplicativo';
    this.jobWeeklyPay = this.age < 16 ? 0 : 250;
    this.livingTier = 'Quarto Compartilhado';
    this.weeklyLivingCost = 180;
    this.sponsors = [];
    this.inventory = [];

    // 9. Academia & Equipe
    this.gymId = 'garage_gym';
    this.coachLoyalty = 75;

    // 10. Recordes Oficiais e Cartel Detalhado
    this.record = {
      fights: config.record?.fights || 0,
      wins: config.record?.wins || 0,
      losses: config.record?.losses || 0,
      draws: config.record?.draws || 0,
      winsKO: config.record?.winsKO || 0,
      winsTKO: config.record?.winsTKO || 0,
      winsSub: config.record?.winsSub || 0,
      winsDec: config.record?.winsDec || 0,
      lossesKO: config.record?.lossesKO || 0,
      lossesTKO: config.record?.lossesTKO || 0,
      lossesSub: config.record?.lossesSub || 0,
      lossesDec: config.record?.lossesDec || 0
    };

    this.fightHistory = config.fightHistory || [];
    this.ranking = config.ranking !== undefined ? config.ranking : null;
    this.titlesHeld = config.titlesHeld || [];
    this.isChampion = config.isChampion || false;
    this.olympicGoldMedals = config.olympicGoldMedals || 0;
    this.olympicSilverMedals = config.olympicSilverMedals || 0;

    // 11. Fase da Carreira
    this.careerPhase = this.calculateCareerPhase();

    // 12. Lesões Ativas
    this.injuries = config.injuries || [];

    // 13. Próxima Luta Agendada
    this.scheduledFight = null;
    this.rivals = [];
  }

  // Retorna ano e quadrimestre atual da carreira
  get careerYear() {
    return Math.floor(this.careerCamps / 3) + 1;
  }

  get campOfYear() {
    return (this.careerCamps % 3) + 1;
  }

  get currentCampName() {
    return CAMP_NAMES[this.campOfYear - 1] || 'Camp Geral';
  }

  get formattedSeason() {
    return `Ano ${this.careerYear} • Camp ${this.campOfYear}/3 (${this.currentCampName})`;
  }

  // Define a fase da carreira baseada na idade e cartel
  calculateCareerPhase() {
    if (this.age < 14) return 'INFÂNCIA';
    if (this.age < 18) return 'ADOLESCÊNCIA';
    if (!this.record || (this.record.fights || 0) === 0) return 'INICIANTE / AMADOR';
    if (this.isChampion) {
      return (this.record.wins || 0) >= 20 ? 'LENDÁRIO' : 'CAMPEÃO';
    }
    if (this.ranking && this.ranking <= 5) return 'CONTENDER';
    if (this.ranking && this.ranking <= 15) return 'PROSPECT';
    if ((this.record.fights || 0) > 0) return 'PROFISSIONAL';
    return 'INICIANTE / AMADOR';
  }

  // Avanço do tempo em ciclo de 4 Meses (1 Camp / Quadrimestre)
  advanceCamp() {
    this.careerCamps++;
    this.careerWeeks += 17; // 17 semanas por quadrimestre

    // A cada 3 camps (12 meses = 1 ano), o lutador envelhece 1 ano
    if (this.careerCamps % 3 === 0) {
      this.age++;
      this.onBirthday();
    }

    // Processamento de lesões (cada camp avança o tempo de recuperação)
    if (this.injuries.length > 0) {
      for (let i = this.injuries.length - 1; i >= 0; i--) {
        this.injuries[i].remainingWeeks = (this.injuries[i].remainingWeeks || 4) - 8;
        if (this.injuries[i].remainingWeeks <= 0) {
          this.injuries.splice(i, 1);
        }
      }
    }

    // Recuperação natural de energia após período de preparação
    this.energy = Math.min(100, Math.max(20, this.energy + 35));
    // Dissipação de fadiga
    this.fatigue = Math.max(0, this.fatigue - 35);
    // Redução do estresse com a rotina completada
    this.stress = Math.max(5, this.stress - 12);

    // Luta agendada
    if (this.scheduledFight) {
      if (this.scheduledFight.campsRemaining !== undefined) {
        this.scheduledFight.campsRemaining--;
      } else {
        this.scheduledFight.weeksRemaining = 0;
      }
    }

    this.careerPhase = this.calculateCareerPhase();
  }

  // Mantém retrocompatibilidade caso algo chame advanceWeek
  advanceWeek() {
    this.advanceCamp();
  }

  // Efeito do envelhecimento anual
  onBirthday() {
    if (this.age >= 31) {
      // Declínio físico sutil compensado por acréscimo de maturidade e Fight IQ
      this.attributes.speed = Math.max(15, this.attributes.speed - 2);
      this.attributes.reflexes = Math.max(15, this.attributes.reflexes - 2);
      this.attributes.recovery = Math.max(15, this.attributes.recovery - 2);
      this.attributes.fightIQ = Math.min(100, this.attributes.fightIQ + 3);
      this.attributes.defense = Math.min(100, this.attributes.defense + 1);
    }
    if (this.age >= 35) {
      this.attributes.chin = Math.max(15, this.attributes.chin - 3);
      this.attributes.toughness = Math.max(15, this.attributes.toughness - 2);
    }
  }

  // Registra o resultado oficial de uma luta no cartel
  recordFightResult(fightData) {
    this.record.fights++;
    const isWin = fightData.winner === 'player';
    const isLoss = fightData.winner === 'opponent';
    const isDraw = fightData.winner === 'draw';

    if (isWin) {
      this.record.wins++;
      if (fightData.method === 'KO') this.record.winsKO++;
      else if (fightData.method === 'TKO') this.record.winsTKO++;
      else if (fightData.method === 'SUB') this.record.winsSub++;
      else this.record.winsDec++;
      this.morale = Math.min(100, this.morale + 15);
      this.fame = Math.min(100, this.fame + (fightData.isTitleFight ? 15 : 6));
      this.followers += Math.round(500 + this.fame * 120);
    } else if (isLoss) {
      this.record.losses++;
      if (fightData.method === 'KO') this.record.lossesKO++;
      else if (fightData.method === 'TKO') this.record.lossesTKO++;
      else if (fightData.method === 'SUB') this.record.lossesSub++;
      else this.record.lossesDec++;
      this.morale = Math.max(10, this.morale - 20);
      this.stress = Math.min(100, this.stress + 15);
    } else {
      this.record.draws++;
    }

    // Adiciona ao histórico completo com timestamp de Camp (4 meses)
    this.fightHistory.unshift({
      opponentName: fightData.opponentName,
      opponentRecord: fightData.opponentRecord,
      result: isWin ? 'Vitória' : isLoss ? 'Derrota' : 'Empate',
      method: fightData.method,
      methodDescription: fightData.methodDescription,
      round: fightData.round,
      time: fightData.time,
      eventName: fightData.eventName,
      modality: fightData.modality,
      dateFormatted: `Ano ${this.careerYear} • Camp ${this.campOfYear}/3 (${this.currentCampName})`,
      isTitleFight: fightData.isTitleFight || false
    });

    // Bolsas financeiras
    this.money += fightData.purseEarned || 0;
    this.scheduledFight = null;
    this.careerPhase = this.calculateCareerPhase();
  }

  // Retorna atributos com aplicação de bônus de equipamentos e penalidades de lesões ativas (Escala 0 a 100)
  getEffectiveAttributes() {
    const effective = { ...this.attributes };

    // Aplica penalidades de lesões ativas
    this.injuries.forEach(inj => {
      if (inj.penalties) {
        Object.entries(inj.penalties).forEach(([attr, pen]) => {
          if (effective[attr] !== undefined) {
            effective[attr] = effective[attr] + pen;
          }
        });
      }
    });

    // Penalidade severa de fadiga extrema
    if (this.fatigue > 75) {
      effective.speed = (effective.speed || 40) - 15;
      effective.cardio = (effective.cardio || 40) - 20;
      effective.reflexes = (effective.reflexes || 40) - 12;
    }

    // Garante que cada atributo fique estritamente entre 0 e 100
    Object.keys(effective).forEach(k => {
      effective[k] = Math.max(0, Math.min(100, Math.round(effective[k])));
    });

    return effective;
  }

  // =========================================================================
  // SISTEMA DE RECOMPENSAS DE LUTA: 1 A 5 PONTOS DE HABILIDADE (PH) E XP
  // "a cada vitoria dependendo de quao dificil foi voce ganha de 1 a 5 pontos de habilidades que voce compre golpes e faz xp"
  // =========================================================================
  awardFightRewards(summary, opponent) {
    const isWin = summary.winner === 'player';
    const isLoss = summary.winner === 'opponent';

    let earnedPH = 0;
    let earnedXP = 0;
    let phReason = '';
    let difficultyTier = 'Amador';

    if (isWin) {
      // 1. Dificuldade base do adversário avaliada por Tier, Cartel ou Rating
      const oppTier = opponent?.tier ? opponent.tier.toLowerCase() : 'amador';
      const oppWins = opponent?.record?.wins || 0;
      const isChampOrTitle = summary.isTitleFight || summary.isOlympic || opponent?.isChampion;

      let basePH = 1;

      if (isChampOrTitle || oppTier === 'mundial' || oppWins >= 18) {
        basePH = 4;
        difficultyTier = 'Mundial / Título';
        phReason = 'Adversário de Elite Mundial / Disputa de Cinturão (+4 PH base)';
      } else if (oppTier === 'elite' || oppWins >= 10 || (opponent?.overallRating && opponent.overallRating >= 72)) {
        basePH = 3;
        difficultyTier = 'Elite';
        phReason = 'Adversário Ranqueado de Elite (+3 PH base)';
      } else if (oppTier === 'mediano' || oppWins >= 4 || (opponent?.overallRating && opponent.overallRating >= 54)) {
        basePH = 2;
        difficultyTier = 'Mediano';
        phReason = 'Adversário Mediano Profissional (+2 PH base)';
      } else {
        basePH = 1;
        difficultyTier = 'Amador / Estreante';
        phReason = 'Adversário Nível Amador / Inicial (+1 PH base)';
      }

      // 2. Bônus por Desempenho e Contundência (Finalização, KO, TKO ou Luta Épica)
      let bonusPH = 0;
      if (summary.method === 'KO' || summary.method === 'TKO' || summary.method === 'SUB') {
        bonusPH += 1;
        phReason += ' + Bônus de Finalização/Nocaute Espetacular (+1 PH)';
      } else if (isChampOrTitle && basePH < 5) {
        bonusPH += 1;
        phReason += ' + Bônus de Disputa de Cinturão (+1 PH)';
      }

      // Garante estritamente entre 1 e 5 Pontos de Habilidade (PH)
      earnedPH = Math.max(1, Math.min(5, basePH + bonusPH));
      this.skillPoints = (this.skillPoints || 0) + earnedPH;

      // 3. Ganho substancial de XP na vitória (Base aumentada + bônus de tier + finalização/título)
      const baseXP = 340;
      const diffMultiplier = basePH * 120; // 120 XP (Amador), 240 (Mediano), 360 (Elite), 480 (Mundial)
      const finishBonus = (summary.method === 'KO' || summary.method === 'SUB' || summary.method === 'TKO') ? 180 : 80;
      const titleBonus = isChampOrTitle ? 250 : 0;
      const quickFinishBonus = (summary.round === 1 && finishBonus >= 180) ? 80 : 0;

      earnedXP = baseXP + diffMultiplier + finishBonus + titleBonus + quickFinishBonus;
      this.xp = (this.xp || 0) + earnedXP;
      this.totalXpEarned = (this.totalXpEarned || 0) + earnedXP;

    } else if (isLoss) {
      // Na derrota: 0 PH (só vitória ganha PH), mas ganha XP substancial pela experiência de combate
      earnedPH = 0;
      difficultyTier = 'Derrota';
      phReason = 'Derrotas não concedem Pontos de Habilidade (PH). Seu aprendizado no combate rendeu XP generoso!';
      earnedXP = Math.round(240 + (summary.round || 1) * 45);
      this.xp = (this.xp || 0) + earnedXP;
      this.totalXpEarned = (this.totalXpEarned || 0) + earnedXP;

    } else {
      // Empate
      earnedPH = 1;
      difficultyTier = 'Empate';
      phReason = 'Empate oficial concedeu 1 PH de consolação e XP de combate.';
      earnedXP = 380;
      this.skillPoints = (this.skillPoints || 0) + 1;
      this.xp = (this.xp || 0) + earnedXP;
      this.totalXpEarned = (this.totalXpEarned || 0) + earnedXP;
    }

    return {
      earnedPH,
      earnedXP,
      phReason,
      difficultyTier,
      currentPH: this.skillPoints,
      currentXP: this.xp,
      isWin
    };
  }

  // =========================================================================
  // SISTEMA DE EVOLUÇÃO DE ATRIBUTOS COM XP E TETO DE DNA
  // "aquelas habilidades que nois pega dos cara é o nosso maximo"
  // =========================================================================
  getXpCostForAttribute(attrKey) {
    const currentVal = Math.round(this.attributes[attrKey] || 40);
    if (currentVal < 45) return 40;
    if (currentVal < 55) return 60;
    if (currentVal < 65) return 90;
    if (currentVal < 75) return 130;
    if (currentVal < 85) return 180;
    if (currentVal < 92) return 240;
    return 320;
  }

  canUpgradeAttributeWithXp(attrKey) {
    const validKeys = getAttributeKeysForModality(this.modality);
    if (!validKeys.includes(attrKey) && this.modality !== 'mma') {
      return {
        canUpgrade: false,
        reason: `Este atributo não pertence à nobre arte do ${this.modality}.`,
        cost: 0,
        currentVal: 0,
        maxDna: 0,
        isAtDnaMax: true
      };
    }

    const currentVal = Math.round(this.attributes[attrKey] || 40);
    const maxDna = this.dnaMaxAttributes && this.dnaMaxAttributes[attrKey] !== undefined 
      ? this.dnaMaxAttributes[attrKey] 
      : 70;
    const cost = this.getXpCostForAttribute(attrKey);

    if (currentVal >= maxDna) {
      return {
        canUpgrade: false,
        reason: `TETO GENÉTICO ATINGIDO! Seu DNA herdado trava esta habilidade no Nível ${maxDna}.`,
        cost,
        currentVal,
        maxDna,
        isAtDnaMax: true
      };
    }

    if ((this.xp || 0) < cost) {
      return {
        canUpgrade: false,
        reason: `XP Insuficiente! Você precisa de ${cost} XP (possui ${this.xp || 0} XP).`,
        cost,
        currentVal,
        maxDna,
        isAtDnaMax: false
      };
    }

    return {
      canUpgrade: true,
      cost,
      currentVal,
      maxDna,
      isAtDnaMax: false
    };
  }

  upgradeAttributeWithXp(attrKey) {
    const check = this.canUpgradeAttributeWithXp(attrKey);
    if (!check.canUpgrade) return check;

    this.xp -= check.cost;
    this.attributes[attrKey] = Math.min(check.maxDna, Math.round(this.attributes[attrKey] + 1));

    return {
      success: true,
      newVal: this.attributes[attrKey],
      remainingXp: this.xp,
      maxDna: check.maxDna
    };
  }

  // =========================================================================
  // SISTEMA DE COMPRA DE GOLPES (LOJA DE HABILIDADES COM PH)
  // =========================================================================
  canUnlockMove(moveId) {
    if (this.unlockedMoves && this.unlockedMoves.includes(moveId)) {
      return { canUnlock: false, reason: 'Golpe já faz parte do seu arsenal de combate.' };
    }
    const move = getMoveById(moveId);
    if (!move) {
      return { canUnlock: false, reason: 'Golpe não encontrado no banco de dados.' };
    }

    // Regra estrita: O atleta só pode comprar golpes do seu próprio estilo de luta!
    if (this.modality !== 'mma' && (!move.modalities || !move.modalities.includes(this.modality))) {
      return { 
        canUnlock: false, 
        reason: `Este golpe é exclusivo de outra modalidade e não pode ser aprendido por atletas de ${this.modality}.` 
      };
    }

    if ((this.skillPoints || 0) < move.cost) {
      return { 
        canUnlock: false, 
        reason: `Pontos de Habilidade insuficientes (${this.skillPoints || 0}/${move.cost} PH).`, 
        cost: move.cost,
        move 
      };
    }
    return { canUnlock: true, move, cost: move.cost };
  }

  unlockMove(moveId) {
    const check = this.canUnlockMove(moveId);
    if (!check.canUnlock) return check;

    this.skillPoints = (this.skillPoints || 0) - check.cost;
    if (!this.unlockedMoves) this.unlockedMoves = [];
    this.unlockedMoves.push(moveId);

    return {
      success: true,
      move: check.move,
      remainingPH: this.skillPoints
    };
  }

  // Purga golpes e atributos incompatíveis e reembolsa recursos (útil ao restaurar saves legados)
  sanitizeMoves() {
    this.sanitizeAttributes();

    const starterMoves = getStarterMovesForModality(this.modality);
    const sanitized = [];
    starterMoves.forEach(sm => {
      if (!sanitized.includes(sm)) sanitized.push(sm);
    });

    let refunded = 0;
    (this.unlockedMoves || []).forEach(mId => {
      if (sanitized.includes(mId)) return;
      const moveData = getMoveById(mId);
      if (!moveData || moveData.isBasic) return;
      if (this.modality === 'mma' || (moveData.modalities && moveData.modalities.includes(this.modality))) {
        sanitized.push(mId);
      } else if (moveData.cost) {
        refunded += moveData.cost;
      }
    });

    this.unlockedMoves = sanitized;
    this.skillPoints = (this.skillPoints || 0) + refunded;
  }

  // Purga atributos que não pertencem à modalidade do atleta
  sanitizeAttributes() {
    const validKeys = getAttributeKeysForModality(this.modality);
    let refundedXp = 0;

    Object.keys(this.attributes || {}).forEach(key => {
      if (!validKeys.includes(key) && this.modality !== 'mma') {
        const val = this.attributes[key];
        if (val > 35) {
          refundedXp += (val - 35) * 45;
        }
        delete this.attributes[key];
      }
    });

    Object.keys(this.dnaMaxAttributes || {}).forEach(key => {
      if (!validKeys.includes(key) && this.modality !== 'mma') {
        delete this.dnaMaxAttributes[key];
      }
    });

    if (refundedXp > 0) {
      this.xp = (this.xp || 0) + refundedXp;
    }
  }
}

