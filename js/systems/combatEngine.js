// combatEngine.js - Motor de combate tático, interativo e jogável com física, regras e dano localizado

import { soundFX } from '../audio.js';
import { MODALITIES } from '../data/modalities.js';
import { getMoveById } from '../data/movesData.js';

export class CombatEngine {
  constructor(player, opponent, modalityId, options = {}) {
    this.player = player;
    this.opponent = opponent;
    this.modality = MODALITIES[modalityId] || MODALITIES.boxing;
    this.isTitleFight = !!options.isTitleFight;
    this.isOlympic = !!options.isOlympic;
    this.titleName = options.titleName || '';
    this.category = options.category || '';
    this.eventName = options.eventName || 'Arena Showdown';
    this.purse = options.purse || 1000;
    this.matchType = options.matchType || (opponent.matchType || 'MODALITY');
    this.matchTypeBadge = options.matchTypeBadge || (opponent.matchTypeBadge || '');
    this.styleClash = options.styleClash || (opponent.styleClash || '');
    this.rulesDescription = options.rulesDescription || (opponent.rulesDescription || '');

    // Configuração Dinâmica de Rounds com base no Campeonato e Categoria
    if (options.rounds || options.totalRounds) {
      this.totalRounds = options.rounds || options.totalRounds;
    } else if (opponent.rounds) {
      this.totalRounds = opponent.rounds;
    } else {
      this.totalRounds = this.isTitleFight ? this.modality.roundsTitle : this.modality.roundsDefault;
    }

    if (options.roundDurationSec) {
      this.roundDurationSec = options.roundDurationSec;
    } else if (opponent.roundDurationSec) {
      this.roundDurationSec = opponent.roundDurationSec;
    } else {
      this.roundDurationSec = this.modality.roundDurationSec;
    }

    this.currentRound = 1;
    this.timeRemainingSec = this.roundDurationSec;
    this.roundsDescription = options.roundsDescription || opponent.roundsDescription || `${this.totalRounds} Rounds`;

    // Estado da luta
    this.phase = 'STANDUP'; // 'STANDUP', 'CLINCH', 'GROUND'
    this.groundPosition = 'GUARD'; // 'GUARD', 'HALF_GUARD', 'MOUNT', 'BACK'
    this.groundTopFighter = null; // 'player' | 'opponent'
    this.isBetweenRounds = false;
    this.isTacticalPause = false; // Pausa tática a cada 4 golpes
    this.strikesInSequence = 0; // Contador de 0 a 4
    this.isOver = false;
    this.winner = null; // 'player' | 'opponent' | 'draw'
    this.resultMethod = null; // 'KO' | 'TKO' | 'SUB' | 'DEC_UNANIMOUS' | 'DEC_SPLIT' | 'DRAW'
    this.resultDetail = '';

    // Condição dos lutadores no combate (adversário escala por tier)
    this.fighterStats = {
      player: this.initCombatantStats(this.player, true),
      opponent: this.initCombatantStats(this.opponent, false)
    };

    // Pontuações dos 3 Juízes Laterais [Juiz 1, Juiz 2, Juiz 3]
    // Cada elemento: { player: total, opponent: total }
    this.judgeScores = [
      { player: 0, opponent: 0 },
      { player: 0, opponent: 0 },
      { player: 0, opponent: 0 }
    ];
    this.roundByRoundScores = []; // Histórico de cartões de pontuação

    // Logs narrativos da luta
    this.actionLog = [];

    // Callback opcional de Skill Check (estilo Dead by Daylight)
    this.onSkillCheck = null;
  }

  initCombatantStats(fighter, isPlayer) {
    const attrs = isPlayer ? fighter.getEffectiveAttributes() : fighter.attributes;

    if (isPlayer) {
      const playerChin = Math.round(210 + (attrs.chin || 50) * 1.1);
      const playerHead = Math.round(180 + (attrs.chin || 50) * 0.5 + (attrs.toughness || 50) * 0.5);
      const playerBody = Math.round(180 + (attrs.stamina || 50) * 0.5 + (attrs.strength || 50) * 0.5);
      const playerLegs = Math.round(180 + (attrs.conditioning || 50) * 0.5 + (attrs.kicking || 50) * 0.4);
      return {
        name: fighter.name,
        shortName: fighter.shortName || fighter.nickname || fighter.name,
        headHP: playerHead,
        maxHead: playerHead,
        bodyHP: playerBody,
        maxBody: playerBody,
        legsHP: playerLegs,
        maxLegs: playerLegs,
        stamina: 100,
        maxStamina: 100,
        chinHP: playerChin,
        maxChin: playerChin,
        cuts: 0,
        knockdowns: 0,
        strikesLanded: 0,
        strikesThrown: 0,
        sigStrikesLanded: 0,
        takedownsLanded: 0,
        subAttempts: 0,
        activeInjury: null,
        currentRoundScore: { damage: 0, controlSec: 0, knockdowns: 0 }
      };
    }

    // Oponente escala em HP e Queixo de acordo com o Tier e Dificuldade
    const tier = fighter.tier || 'AMADOR';
    let baseHP = 180;
    let baseStamina = 100;
    let calculatedChin = Math.round(190 + (attrs.chin || 45) * 0.9);

    if (tier === 'MUNDIAL') {
      baseHP = 240;
      baseStamina = 120;
      calculatedChin = Math.round(260 + (attrs.chin || 85) * 1.0);
    } else if (tier === 'ELITE') {
      baseHP = 215;
      baseStamina = 115;
      calculatedChin = Math.round(230 + (attrs.chin || 70) * 0.95);
    } else if (tier === 'MEDIANO') {
      baseHP = 195;
      baseStamina = 110;
      calculatedChin = Math.round(210 + (attrs.chin || 55) * 0.9);
    }

    return {
      name: fighter.name,
      shortName: fighter.shortName || fighter.nickname || fighter.name,
      headHP: baseHP,
      maxHead: baseHP,
      bodyHP: baseHP,
      maxBody: baseHP,
      legsHP: baseHP,
      maxLegs: baseHP,
      stamina: baseStamina,
      maxStamina: baseStamina,
      chinHP: calculatedChin,
      maxChin: calculatedChin,
      cuts: 0,
      knockdowns: 0,
      strikesLanded: 0,
      strikesThrown: 0,
      sigStrikesLanded: 0,
      takedownsLanded: 0,
      subAttempts: 0,
      activeInjury: null,
      currentRoundScore: { damage: 0, controlSec: 0, knockdowns: 0 }
    };
  }

  // Registra mensagem no log de combate com estilo visual
  log(text, type = 'normal') {
    this.actionLog.unshift({ text, type, time: this.getFormattedTime(), round: this.currentRound });
    if (this.actionLog.length > 80) this.actionLog.pop();
  }

  getFormattedTime() {
    const mins = Math.floor(this.timeRemainingSec / 60);
    const secs = this.timeRemainingSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Detecta dinamicamente o contexto e a situação tática exata do combate
  getCurrentSituation() {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    if (this.phase === 'GROUND') {
      const isTop = this.groundTopFighter === 'player';
      if (isTop) {
        if (this.groundPosition === 'MOUNT') {
          return {
            id: 'GROUND_MOUNT',
            label: '🥋 MONTADA DOMINANTE (POR CIMA)',
            desc: 'Você está montado no peito do adversário! Posição letal para nocautear no gnp ou finalizar!',
            badgeClass: 'situation-critical'
          };
        }
        if (this.groundPosition === 'BACK') {
          return {
            id: 'GROUND_BACK',
            label: '🥋 COSTAS PEGADAS (POR CIMA)',
            desc: 'Ganchos colocados! O pescoço do rival está exposto para o mata-leão!',
            badgeClass: 'situation-critical'
          };
        }
        return {
          id: 'GROUND_TOP_GUARD',
          label: `🥋 CONTROLE NO SOLO (${this.groundPosition})`,
          desc: 'Você domina por cima. Pode passar guarda, desferir marretadas ou levantar.',
          badgeClass: 'situation-advantage'
        };
      } else {
        return {
          id: 'GROUND_BOTTOM',
          label: '⚠️ PRESO POR BAIXO NO CHÃO',
          desc: 'O adversário está te amassando por cima! Tente raspar, amarrar ou finalizar da guarda.',
          badgeClass: 'situation-danger'
        };
      }
    }

    if (this.phase === 'CLINCH') {
      return {
        id: 'CLINCH',
        label: '🤼 CORPO A CORPO NO CLINCH',
        desc: 'Distância colada! Oportunidade para joelhadas nas costelas, cotoveladas ou quedas.',
        badgeClass: 'situation-clinch'
      };
    }

    // Em pé: prioridades situacionais em tempo real
    // 1. Jogador em perigo crítico (balançado/grogue)
    if (pStats.chinHP <= 45) {
      return {
        id: 'PLAYER_ROCKED',
        label: '🚨 VOCÊ ESTÁ BALANÇADO / GROGUE!',
        desc: 'Visão turva e pernas bambas! O adversário vem babando! Adote medidas de sobrevivência imediatas!',
        badgeClass: 'situation-danger'
      };
    }

    // 2. Oponente balançado / grogue
    if (oStats.chinHP <= 45) {
      return {
        id: 'OPPONENT_ROCKED',
        label: '⚡ ADVERSÁRIO SENTIU O GOLPE / GROGUE!',
        desc: 'O adversário está tonto e com os olhos vidrados! É a hora de partir para a definição!',
        badgeClass: 'situation-critical'
      };
    }

    // 3. Oponente sangrando muito por corte
    if (oStats.cuts >= 30) {
      return {
        id: 'OPPONENT_CUT',
        label: '🩸 ADVERSÁRIO COM CORTE PROFUNDO!',
        desc: 'O supercílio do adversário está jorrando sangue! Castigue o ferimento para forçar TKO médico!',
        badgeClass: 'situation-cut'
      };
    }

    // 4. Jogador sem gás
    if (pStats.stamina <= 30) {
      return {
        id: 'PLAYER_GASSED',
        label: '⚠️ VOCÊ ESTÁ SEM GÁS / FADIGA SEVERA!',
        desc: 'Braços de chumbo e respiração ofegante! Economize oxigênio e paute com jabs para respirar.',
        badgeClass: 'situation-warning'
      };
    }

    // 5. Oponente sem gás
    if (oStats.stamina <= 30) {
      return {
        id: 'OPPONENT_GASSED',
        label: '🫁 ADVERSÁRIO EXAUSTO / SEM GÁS!',
        desc: 'O rival está de boca aberta e sem pernas! Ataque a linha de cintura para esgotar o restante do ar!',
        badgeClass: 'situation-advantage'
      };
    }

    // 6. Oponente com perna avariada
    if (oStats.legsHP <= 40) {
      return {
        id: 'OPPONENT_LEGS_HURT',
        label: '🦵 ADVERSÁRIO COM PERNA DESTRUÍDA!',
        desc: 'A perna do adversário está trêmula de hematomas! Um chute baixo certeiro pode encerrar o combate!',
        badgeClass: 'situation-advantage'
      };
    }

    // Situação normal em pé
    return {
      id: 'STANDUP_NEUTRAL',
      label: '🥊 TROCAÇÃO NA DISTÂNCIA',
      desc: 'Luta estudada no centro do ringue/octógono. Meça o alcance e prepare seus ataques.',
      badgeClass: 'situation-neutral'
    };
  }

  // Executa uma rodada/troca de ações escolhida pelo jogador
  async executeExchange(playerAction) {
    if (this.isOver || this.isBetweenRounds || this.isTacticalPause) return;

    soundFX.init();
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;
    const pAttrs = this.player.getEffectiveAttributes();
    const oAttrs = this.opponent.attributes;

    // Tempo que a troca consome (12 a 25 segundos)
    const timeSpent = Math.min(this.timeRemainingSec, Math.floor(Math.random() * 10) + 14);
    this.timeRemainingSec -= timeSpent;

    // Incrementa contador de golpes na sequência
    this.strikesInSequence++;

    // IA Escolhe a ação do adversário
    const oppAction = this.chooseOpponentAction();
    this.currentPlayerAction = playerAction;
    this.currentOpponentAction = oppAction;

    // Processamento tático da troca (pode conter skill check)
    await this.resolveExchange(playerAction, oppAction, pAttrs, oAttrs);

    // Dreno natural de estamina por atividade
    pStats.stamina = Math.max(10, pStats.stamina - (pStats.stamina < 30 ? 1 : 2));
    oStats.stamina = Math.max(10, oStats.stamina - (oStats.stamina < 30 ? 1 : 2));

    // Checagem de Fim de Luta por KO/TKO/Cortes
    if (this.checkFinishConditions()) {
      return;
    }

    // Checagem de Fim de Round
    if (this.timeRemainingSec <= 0) {
      this.strikesInSequence = 0;
      this.isTacticalPause = false;
      this.endRound();
      return;
    }

    // A CADA 4 GOLPES: ATIVA A PAUSA TÁTICA!
    if (this.strikesInSequence >= 4) {
      this.isTacticalPause = true;
      this.strikesInSequence = 0;
      this.log('⏸️ PAUSA TÁTICA: 4 trocas de golpes concluídas! Os lutadores se distanciam para respirar e estudar o próximo ataque.', 'corner');
    }
  }

  // Retoma o combate após a pausa tática de 4 golpes
  resumeFromTacticalPause() {
    this.isTacticalPause = false;
    this.log('▶️ Combate retomado! Atletas avançam ao centro do ringue para os próximos 4 golpes.', 'normal');
  }

  // IA do oponente escolhe ação coerente com a modalidade e fase
  // IA do oponente escolhe ação coerente, agressiva e perigosa
  chooseOpponentAction() {
    const oAttrs = this.opponent.attributes;
    const oStats = this.fighterStats.opponent;
    const pStats = this.fighterStats.player;

    if (this.phase === 'STANDUP') {
      const allowed = this.modality.allowedStrikes || [];
      const rnd = Math.random();

      // 1. Se o jogador estiver grogue/balançado, a IA parte feroz para tentar nocautear!
      if (pStats.chinHP <= 45 || pStats.headHP <= 40) {
        if (rnd < 0.40) return 'power_hook';
        if (rnd < 0.65) return 'uppercut';
        if (this.modality.hasKicks && (allowed.includes('head_kick') || this.modality.id !== 'boxing') && rnd < 0.85) return 'head_kick';
        return 'jab_cross';
      }

      // 2. Se o jogador estiver sem gás, pressão pesada
      if (pStats.stamina <= 30) {
        if (rnd < 0.40) return 'power_hook';
        if (rnd < 0.70) return 'body_strike';
        if (this.modality.hasTakedowns && rnd < 0.90) return 'takedown';
        return 'jab_cross';
      }

      // 3. Wrestler / Judô tenta derrubar
      if (this.modality.hasTakedowns && (oAttrs.wrestling > 55 || oAttrs.judo > 55) && rnd < 0.28) {
        return 'takedown';
      }

      // 4. Muay Thai busca o clinch com joelhos
      if (this.modality.hasClinchStrikes && oAttrs.clinch > 55 && rnd < 0.20) {
        return 'clinch';
      }

      // 5. Chutes (se modalidade permitir)
      if (this.modality.hasKicks && rnd < 0.35) {
        const kickRnd = Math.random();
        if (kickRnd < 0.45) return 'low_kick';
        if (kickRnd < 0.75) return 'body_kick';
        return 'head_kick';
      }

      // 6. Oponente balançado revida ferozmente no desespero (nunca fica passivo)
      if (oStats.chinHP <= 45) {
        return rnd < 0.60 ? 'power_hook' : 'jab_cross';
      }

      // 7. Trocação de socos agressiva padrão
      if (rnd < 0.35) return 'jab_cross';
      if (rnd < 0.65) return 'power_hook';
      if (rnd < 0.85) return 'uppercut';
      return 'body_strike';

    } else if (this.phase === 'CLINCH') {
      const rnd = Math.random();
      if (this.modality.hasTakedowns && rnd < 0.35) return 'clinch_trip';
      if (this.modality.hasKnees && rnd < 0.70) return 'clinch_knee';
      return 'clinch_elbow';

    } else if (this.phase === 'GROUND') {
      const isTop = this.groundTopFighter === 'opponent';
      const rnd = Math.random();
      if (isTop) {
        if (oAttrs.bjj > 60 && rnd < 0.35) return 'ground_submission';
        if (rnd < 0.80) return 'ground_and_pound';
        return 'pass_guard';
      } else {
        if (rnd < 0.40) return 'sweep';
        if (rnd < 0.70) return 'stand_up';
        return 'defensive_guard';
      }
    }
    return 'jab_cross';
  }

  // Resolução detalhada de danos, esquivas, contra-ataques e transições
  async resolveExchange(pAct, oAct, pAttrs, oAttrs) {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    // 1. Fase Em Pé (STANDUP)
    if (this.phase === 'STANDUP') {
      // Clinch de Sobrevivência (quando jogador está balançado)
      if (pAct === 'survival_clinch') {
        this.phase = 'CLINCH';
        pStats.chinHP = Math.min(pStats.maxChin || 220, pStats.chinHP + 35);
        pStats.headHP = Math.min(pStats.maxHead || 200, pStats.headHP + 15);
        pStats.stamina = Math.min(100, pStats.stamina + 10);
        soundFX.playBlock();
        this.log(`Sobrevivência heroica! Mesmo grogue, você mergulha no peito de ${this.opponent.shortName} e trava o clinch salvador!`, 'highlight');
        return;
      }

      // Descanso no Clinch (quando jogador está sem gás)
      if (pAct === 'rest_in_clinch') {
        this.phase = 'CLINCH';
        pStats.stamina = Math.min(100, pStats.stamina + 20);
        soundFX.playBlock();
        this.log(`Você fecha o clinch e apoia seu peso morto em ${this.opponent.shortName}, recuperando o oxigênio!`, 'action');
        return;
      }

      // Queda Oportunista (quando adversário está grogue/balançado)
      if (pAct === 'opportunist_takedown') {
        this.phase = 'GROUND';
        this.groundPosition = 'MOUNT';
        this.groundTopFighter = 'player';
        pStats.takedownsLanded++;
        pStats.currentRoundScore.damage += 16;
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        this.log(`QUEDA OPORTUNISTA DEVASTADORA! Vendo ${this.opponent.shortName} cambaleando, você o arremessa ao chão e já cai cravado na MONTADA!`, 'critical');
        return;
      }

      // Jogador tenta Clinch convencional
      // Jogador tenta Clinch convencional
      if (pAct === 'clinch') {
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'clinch', null, true);
        if (check.landed || check.isCrit) {
          this.phase = 'CLINCH';
          soundFX.playBlock();
          this.log(`Você fecha a distância e trava ${this.opponent.shortName} em um clinch dominante!`, 'action');
          return;
        } else {
          this.log(`${this.opponent.shortName} antecipa sua entrada e empurra você para trás!`, 'defense');
        }
      }

      // Jogador tenta Queda (Takedown)
      if (pAct === 'takedown') {
        pStats.stamina = Math.max(5, pStats.stamina - 8);
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'takedown', null, true);
        if (check.landed || check.isCrit) {
          this.phase = 'GROUND';
          this.groundPosition = 'GUARD';
          this.groundTopFighter = 'player';
          pStats.takedownsLanded++;
          pStats.currentRoundScore.damage += 12;
          soundFX.playHeavyHit();
          this.log(`Queda fantástica! Você mergulha nas pernas e derruba ${this.opponent.shortName} na lona!`, 'highlight');
          return;
        } else {
          soundFX.playBlock();
          this.log(`${this.opponent.shortName} defende com um sprawl firme e a luta permanece em pé.`, 'defense');
        }
      }

      // Oponente tenta Queda
      if (oAct === 'takedown') {
        const check = this.rollHiddenD20Attack(this.opponent, this.player, 'takedown', null, false);
        if (check.landed || check.isCrit) {
          this.phase = 'GROUND';
          this.groundPosition = 'GUARD';
          this.groundTopFighter = 'opponent';
          oStats.takedownsLanded++;
          oStats.currentRoundScore.damage += 12;
          soundFX.playHeavyHit();
          this.log(`${this.opponent.shortName} explode em um double-leg e te joga no solo!`, 'danger');
          return;
        } else {
          soundFX.playBlock();
          this.log(`Você executa um sprawl perfeito e bloqueia a tentativa de queda de ${this.opponent.shortName}!`, 'defense');
        }
      }

      // Se a ação for um Golpe Especial comprado da Loja de Habilidades
      const specialMove = getMoveById(pAct);
      if (specialMove && !specialMove.isBasic) {
        await this.resolveSpecialMove(specialMove, pAct, oAct, pAttrs, oAttrs);
        return;
      }

      // Golpes em Pé (Trocação de Socos e Chutes)
      await this.resolveStrikingClash(pAct, oAct, pAttrs, oAttrs);
    } 
    // 2. Fase de Clinch (CLINCH)
    else if (this.phase === 'CLINCH') {
      const specialMove = getMoveById(pAct);
      if (specialMove && !specialMove.isBasic && (specialMove.phase === 'CLINCH' || specialMove.id === 'suplex_slam' || specialMove.id === 'kimura_trap')) {
        await this.resolveSpecialMove(specialMove, pAct, oAct, pAttrs, oAttrs);
        return;
      }
      this.resolveClinchClash(pAct, oAct, pAttrs, oAttrs);
    } 
    // 3. Fase de Solo (GROUND)
    else if (this.phase === 'GROUND') {
      const specialMove = getMoveById(pAct);
      if (specialMove && !specialMove.isBasic && (specialMove.phase === 'GROUND' || specialMove.category === 'submission')) {
        await this.resolveSpecialMove(specialMove, pAct, oAct, pAttrs, oAttrs);
        return;
      }
      this.resolveGroundClash(pAct, oAct, pAttrs, oAttrs);
    }
  }

  // -------------------------------------------------------------
  // MOTOR OCULTO DE CD (Classe de Dificuldade) POR GOLPE
  // "lembre-se para isso tudo cada golpe tem um CD"
  // -------------------------------------------------------------
  getMoveBaseDC(moveId, moveObj = null) {
    if (moveObj && moveObj.dc !== undefined) return moveObj.dc;

    const dcMap = {
      // Golpes rápidos e de medição (CD mais baixa = fáceis de tocar)
      'jab': 8,
      'pace_and_jab': 8,
      'body_rip_short': 10,
      'low_kick': 10,
      'teep_kick': 10,
      'clinch_knee': 10,
      'clinch_elbow': 11,
      'uppercut_inside': 11,

      // Golpes combinados / técnicos
      'combo_1_2': 11,
      'jab_cross': 10,
      'body_strike': 10,
      'body_kick': 11,
      'uppercut': 12,
      'clinch': 11,
      'clinch_trip': 12,
      'takedown': 12,
      'target_the_cut': 11,
      'body_punishment': 11,
      'increase_pace': 10,
      'finish_leg_kick': 11,
      'counter_stance': 11,
      'defensive_slip': 11,

      // Golpes pesados / de alta potência / finalizadores (CD mais alta)
      'power_overhand': 15,
      'power_hook': 13,
      'head_kick': 14,
      'finish_blitz': 13,
      'aim_precision_chin': 14,
      'patient_hunt': 9,
      'hail_mary_counter': 16,

      // Solo e Finalizações
      'ground_and_pound': 9,
      'pass_guard': 11,
      'sweep': 13,
      'armbar_mount': 13,
      'head_arm_choke': 12,
      'rear_naked_choke': 12,
      'submission_attempt': 14,
      'stand_up': 12,
      'tie_up_guard': 10
    };

    if (dcMap[moveId]) return dcMap[moveId];

    // Se for golpe especial desbloqueado da loja
    if (moveObj) {
      if (moveObj.category === 'submission') return 13;
      if (moveObj.damage >= 38 || (moveObj.koChance && moveObj.koChance > 0.25)) return 14;
      if (moveObj.damage >= 26) return 12;
      return 10;
    }

    return 11;
  }

  // -------------------------------------------------------------
  // MOTOR OCULTO DE RESOLUÇÃO D20 (HIT / MISS / CRITICAL)
  // "faz como codigo escondido um d20 para ver se acerta ou erra
  // voce nunca revelara o qual numero precisara para acertar e errar"
  // -------------------------------------------------------------
  rollHiddenD20Attack(attacker, defender, moveId, moveObj = null, isAttackerPlayer = true) {
    // 1. Rolagem do d20 oculto (1 a 20) sob o capô
    const d20 = Math.floor(Math.random() * 20) + 1;

    // 2. CD Base inerente do golpe específico
    const baseDC = this.getMoveBaseDC(moveId, moveObj);

    // 3. Modificador de Ataque (Atacante)
    const attAttrs = isAttackerPlayer ? attacker.getEffectiveAttributes() : attacker.attributes;
    const attStats = isAttackerPlayer ? this.fighterStats.player : this.fighterStats.opponent;

    let attackMod = 0;
    const cat = moveObj?.category || 'striking';

    if (cat === 'kicking' || moveId.includes('kick')) {
      attackMod = Math.round((attAttrs.kicking || 50) * 0.08 + (attAttrs.speed || 50) * 0.04);
    } else if (cat === 'submission' || moveId.includes('choke') || moveId.includes('armbar') || moveId.includes('sub')) {
      attackMod = Math.round((attAttrs.bjj || 50) * 0.09 + (attAttrs.technique || 50) * 0.04);
    } else if (cat === 'wrestling' || moveId.includes('takedown') || moveId.includes('trip')) {
      attackMod = Math.round((attAttrs.wrestling || 50) * 0.09 + (attAttrs.strength || 50) * 0.04);
    } else {
      // Boxe / Striking de Punhos
      attackMod = Math.round((attAttrs.boxing || 50) * 0.08 + (attAttrs.speed || 50) * 0.04);
    }

    if (attStats.stamina < 30) attackMod -= 2;

    // 4. Modificador de Defesa (Defensor) e Bônus Táticos
    const defAttrs = isAttackerPlayer ? defender.attributes : defender.getEffectiveAttributes();
    const defStats = isAttackerPlayer ? this.fighterStats.opponent : this.fighterStats.player;
    const defPosture = isAttackerPlayer ? this.currentOpponentAction : this.currentPlayerAction;

    let defenseMod = Math.round((defAttrs.defense || 50) * 0.08 + (defAttrs.reflexes || 50) * 0.05);

    if (!isAttackerPlayer) {
      // Jogador é o defensor: posturas táticas ativas erguem muralha de proteção contra nocautes
      if (defPosture === 'turtle_guard') defenseMod += 7;
      else if (defPosture === 'circle_evade') defenseMod += 5;
      else if (defPosture === 'defensive_footwork') defenseMod += 4;
      else if (defPosture === 'counter_stance') defenseMod += 3;
    } else {
      // Oponente é o defensor
      if (defPosture === 'counter_stance' || defPosture === 'defensive_slip') defenseMod += 3;
    }

    // Se o defensor estiver grogue, a defesa cai
    if (defStats.chinHP <= 45) {
      defenseMod -= 3;
    }

    // CD Efetiva Oculta (limitada entre 5 e 19)
    const finalDC = Math.max(5, Math.min(19, baseDC + defenseMod - attackMod));

    // 5. Avaliação do d20
    if (d20 === 20) {
      return { landed: true, isCrit: true, isFumble: false, d20 };
    }
    if (d20 === 1) {
      return { landed: false, isCrit: false, isFumble: true, d20 };
    }

    const landed = d20 >= finalDC;
    return { landed, isCrit: false, isFumble: false, d20 };
  }

  // Resolução de Golpes Especiais Desbloqueados da Loja de Habilidades (com d20 oculto)
  async resolveSpecialMove(move, pAct, oAct, pAttrs, oAttrs) {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    pStats.stamina = Math.max(5, pStats.stamina - (move.staminaCost || 10));
    pStats.strikesThrown++;

    const isOppRocked = oStats.chinHP <= 45;
    const check = this.rollHiddenD20Attack(this.player, this.opponent, move.id, move, true);

    // 1. FINALIZAÇÕES ESPECIAIS (Submissions)
    if (move.category === 'submission' || move.subChance) {
      pStats.subAttempts++;
      if (check.landed || check.isCrit) {
        this.isOver = true;
        this.winner = 'player';
        this.resultMethod = 'SUB';
        this.resultDetail = `${move.name}`;
        soundFX.playCrowdRoar();
        this.log(`💥 ${move.effectText || `FINALIZAÇÃO ESPETACULAR COM ${move.name.toUpperCase()}!`}`, 'finish');
        return;
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} escapa com extrema dificuldade da tentativa de ${move.name}!`, 'defense');
        // Se for guilhotina saltada e defendeu, cai na guarda no chão
        if (move.id === 'guillotine_jump') {
          this.phase = 'GROUND';
          this.groundPosition = 'GUARD';
          this.groundTopFighter = 'opponent';
          this.log(`Você puxou a guarda e a luta agora está no solo!`, 'normal');
        }
      }
    } 
    // 2. GOLPES DE IMPACTO / PROJEÇÃO
    else if (check.landed) {
      soundFX.playHeavyHit();
      soundFX.playCrowdRoar();
      pStats.strikesLanded++;
      pStats.sigStrikesLanded++;

      let damage = Math.round((move.damage || 30) * 0.85 + (pAttrs.punchPower * 0.20));
      if (check.isCrit) damage = Math.round(damage * 1.35); // Bônus de acerto crítico oculto

      pStats.currentRoundScore.damage += damage;

      // Alvo e efeitos específicos
      if (move.target === 'body') {
        oStats.bodyHP = Math.max(0, oStats.bodyHP - damage);
        oStats.stamina = Math.max(0, oStats.stamina - 20);
        this.log(`🔥 GOLPE CIRÚRGICO! ${move.name} explode no tronco de ${this.opponent.shortName}! O ar dele acabou!`, 'critical');
      } else if (move.target === 'legs') {
        oStats.legsHP = Math.max(0, oStats.legsHP - damage);
        this.log(`⚡ CANELADA FEROZ! ${move.name} detona a perna de apoio de ${this.opponent.shortName}!`, 'critical');
      } else {
        // Head / Cabeça
        oStats.headHP = Math.max(0, oStats.headHP - damage);
        const chinMultiplier = move.koChance ? (0.50 + move.koChance * 0.45) : 0.55;
        const rockedMultiplier = isOppRocked ? 1.3 : 1.0;
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(damage * chinMultiplier * rockedMultiplier));
        this.log(`💣 IMPACTO DESTRUIDOR! ${move.effectText || `${move.name.toUpperCase()} acerta em cheio a cabeça!`}`, 'critical');
        if (isOppRocked && oStats.chinHP <= 0) {
          this.log(`💥 NOCAUTE DEFINITIVO! ${this.opponent.shortName} foi apagado pelo seu golpe especial ${move.name}!`, 'critical');
        }

        // Cortes
        if (move.id === 'spinning_elbow' || move.id === 'superman_punch') {
          oStats.cuts += 25;
          this.log(`🩸 A pancada abriu um rasgo profundo com sangue espirrando!`, 'danger');
        }
      }

      // Efeito de projeção do Suplex
      if (move.id === 'suplex_slam') {
        this.phase = 'GROUND';
        this.groundPosition = 'MOUNT';
        this.groundTopFighter = 'player';
        pStats.takedownsLanded++;
        this.log(`💥 O impacto do Suplex fez o tablado tremer! Você já cai dominando na MONTADA!`, 'highlight');
      }

      this.checkKnockdown('opponent', oStats);
    } else {
      soundFX.playDodge();
      if (check.isFumble) {
        this.log(`Você arriscou o ${move.name}, mas cortou apenas o ar e perdeu o equilíbrio!`, 'normal');
      } else {
        this.log(`${this.opponent.shortName} antecipa sua tentativa arriscada de ${move.name} e sai do raio de ação!`, 'defense');
      }
    }

    // Se o oponente foi nocauteado ou luta acabou, não há revide
    if (oStats.chinHP <= 0 || oStats.headHP <= 0 || this.isOver) {
      return;
    }

    // Oponente responde com contra-ataque
    await this.resolveOpponentStrike(oAct, pAct, pAttrs, oAttrs);
  }

  // Trocação direta de golpes em pé (com ações normais e dinâmicas-situacionais)
  async resolveStrikingClash(pAct, oAct, pAttrs, oAttrs) {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    let pStrikeLanded = false;
    let pDamage = 0;
    let target = 'head';

    const isOppRocked = oStats.chinHP <= 32;
    const rockedBonusHit = isOppRocked ? 0.22 : 0;

    // -------------------------------------------------------------
    // AÇÕES SITUACIONAIS ESPECIAIS (Com d20 Oculto & CD Própria)
    // -------------------------------------------------------------

    // 1. BLITZ DE FINALIZAÇÃO (Adversário grogue)
    if (pAct === 'finish_blitz') {
      pStats.stamina = Math.max(5, pStats.stamina - 12);
      pStats.strikesThrown += 4;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'finish_blitz', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pStats.sigStrikesLanded += 3;
        pDamage = Math.round((38 + (pAttrs.punchPower * 0.5)) * (check.isCrit ? 1.30 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 1.4));
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        this.log(`BLITZ VIOLENTA! Você encurrala ${this.opponent.shortName} nas cordas/grade e descarrega uma saraivada implacável!`, 'critical');
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} se encolhe no desespero e sobrevive ao bombardeio!`, 'defense');
      }
    }
    // 2. TIRO CERTEIRO NO QUEIXO (Adversário grogue)
    else if (pAct === 'aim_precision_chin') {
      pStats.stamina = Math.max(5, pStats.stamina - 6);
      pStats.strikesThrown += 1;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'aim_precision_chin', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pStats.sigStrikesLanded++;
        pDamage = Math.round((36 + (pAttrs.punchPower * 0.45)) * (check.isCrit ? 1.35 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 1.6));
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        this.log(`PRECISÃO CIRÚRGICA! Você encontra o ângulo perfeito e conecta um míssil no queixo trêmulo de ${this.opponent.shortName}!`, 'critical');
      } else {
        soundFX.playDodge();
        this.log(`O golpe no queixo passa a um centímetro do alvo!`, 'normal');
      }
    }
    // 3. CAÇADA METÓDICA (Adversário grogue)
    else if (pAct === 'patient_hunt') {
      pStats.stamina = Math.min(100, pStats.stamina + 4);
      pStats.strikesThrown += 2;
      pStrikeLanded = true;
      pDamage = Math.round(15 + (pAttrs.punchPower * 0.2));
      oStats.headHP = Math.max(0, oStats.headHP - pDamage);
      oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 0.8));
      soundFX.playHeavyHit();
      this.log(`Você encurrala ${this.opponent.shortName} com frieza, cortando passos e pontuando golpes limpos sem correr riscos!`, 'highlight');
    }
    // 4. GUARDA CONCHA DE SOBREVIVÊNCIA (Jogador grogue)
    else if (pAct === 'turtle_guard') {
      pStats.chinHP = Math.min(pStats.maxChin || 220, pStats.chinHP + 32);
      pStats.headHP = Math.min(pStats.maxHead || 200, pStats.headHP + 16);
      pStats.stamina = Math.min(100, pStats.stamina + 8);
      soundFX.playBlock();
      this.log(`Você ergue os dois antebraços na guarda concha hermética, absorve a tempestade e começa a clarear as ideias!`, 'defense');
    }
    // 5. CIRCULAR E FUGIR (Jogador grogue)
    else if (pAct === 'circle_evade') {
      pStats.chinHP = Math.min(pStats.maxChin || 220, pStats.chinHP + 25);
      pStats.stamina = Math.min(100, pStats.stamina + 12);
      soundFX.playDodge();
      this.log(`Jogo de pernas salvador! Você circula rápido lateralmente, saindo do raio de fogo de ${this.opponent.shortName}!`, 'action');
    }
    // 6. GOLPE DO DESESPERO (Jogador grogue arrisca tudo)
    else if (pAct === 'hail_mary_counter') {
      pStats.stamina = Math.max(5, pStats.stamina - 8);
      pStats.strikesThrown += 1;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'hail_mary_counter', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pStats.sigStrikesLanded++;
        pDamage = Math.round((45 + (pAttrs.punchPower * 0.5)) * (check.isCrit ? 1.40 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 1.5));
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        this.log(`MILAGRE! No puro desespero, você solta um cruzado cego e PEGA ${this.opponent.shortName} EM CHEIO NO CONTRAGOLPE! A luta virou!`, 'critical');
      } else {
        soundFX.playDodge();
        this.log(`Seu contragolpe kamikaze corta o vento e você fica desprotegido!`, 'danger');
      }
    }
    // 7. CASTIGAR O CORTE ABERTO (Adversário sangrando)
    else if (pAct === 'target_the_cut') {
      pStats.stamina = Math.max(5, pStats.stamina - 5);
      pStats.strikesThrown += 2;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'target_the_cut', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pDamage = Math.round((18 + (pAttrs.punchPower * 0.2)) * (check.isCrit ? 1.30 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.cuts += 30;
        soundFX.playHeavyHit();
        this.log(`ALVO NO CORTE! Você crava socos retos direto na ferida aberta de ${this.opponent.shortName}! O sangue jorra abundantemente!`, 'critical');
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} ergue o braço para proteger o supercílio machucado.`, 'defense');
      }
    }
    // 8. CASTIGO NA LINHA DE CINTURA (Adversário sem gás)
    else if (pAct === 'body_punishment') {
      pStats.stamina = Math.max(5, pStats.stamina - 5);
      pStats.strikesThrown += 2;
      target = 'body';
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'body_punishment', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pDamage = Math.round((24 + (pAttrs.punchPower * 0.3)) * (check.isCrit ? 1.30 : 1.0));
        oStats.bodyHP = Math.max(0, oStats.bodyHP - pDamage);
        oStats.stamina = Math.max(0, oStats.stamina - 20);
        soundFX.playHeavyHit();
        this.log(`GOLPE NO FÍGADO! Um gancho violento na costela dobra ${this.opponent.shortName} ao meio! O ar acabou de vez!`, 'highlight');
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} cola os cotovelos no corpo e bloqueia o golpe.`, 'defense');
      }
    }
    // 9. AUMENTAR O RITMO (Adversário sem gás)
    else if (pAct === 'increase_pace') {
      pStats.stamina = Math.max(5, pStats.stamina - 7);
      pStats.strikesThrown += 3;
      pStrikeLanded = true;
      pDamage = Math.round(20 + (pAttrs.punchPower * 0.25));
      oStats.headHP = Math.max(0, oStats.headHP - pDamage);
      oStats.stamina = Math.max(0, oStats.stamina - 15);
      soundFX.playHeavyHit();
      this.log(`RITMO AVASSALADOR! Você sufoca ${this.opponent.shortName} com alto volume e não o deixa respirar!`, 'action');
    }
    // 10. PAUTAR COM JAB E RESPIRAR (Jogador sem gás)
    else if (pAct === 'pace_and_jab') {
      pStats.stamina = Math.min(100, pStats.stamina + 14);
      pStats.strikesThrown += 1;
      pStrikeLanded = true;
      pDamage = Math.round(7 + (pAttrs.punchPower * 0.1));
      oStats.headHP = Math.max(0, oStats.headHP - pDamage);
      soundFX.playHeavyHit();
      this.log(`Jab educado e econômico! Você pontua na ponta do nariz de ${this.opponent.shortName} e recupera o ar!`, 'action');
    }
    // 11. JOGO DE PERNAS EVASIVO (Jogador sem gás)
    else if (pAct === 'defensive_footwork') {
      pStats.stamina = Math.min(100, pStats.stamina + 18);
      soundFX.playDodge();
      this.log(`Você usa o ringue inteiro com passadas largas, descansando os ombros e oxigenando os pulmões.`, 'normal');
    }
    // 12. CHUTE DE MISERICÓRDIA NA PERNA (Adversário com perna machucada)
    else if (pAct === 'finish_leg_kick') {
      pStats.stamina = Math.max(5, pStats.stamina - 5);
      pStats.strikesThrown += 1;
      target = 'legs';
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'finish_leg_kick', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pDamage = Math.round((26 + (pAttrs.punchPower * 0.3)) * (check.isCrit ? 1.30 : 1.0));
        oStats.legsHP = Math.max(0, oStats.legsHP - pDamage);
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        this.log(`CHUTE DE MISERICÓRDIA NA COXA! A perna castigada de ${this.opponent.shortName} falseia e ele cai desequilibrado de dor!`, 'critical');
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} recolhe a perna a tempo.`, 'normal');
      }
    }
    // -------------------------------------------------------------
    // GOLPES CONVENCIONAIS (Com d20 Oculto & CD Própria)
    // -------------------------------------------------------------
    else if (pAct === 'jab') {
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'jab', null, true);
      pStats.strikesThrown += 1;
      if (check.landed) {
        pStrikeLanded = true;
        pDamage = Math.round((8 + (pAttrs.punchPower * 0.12)) * (check.isCrit ? 1.30 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 0.20));
        soundFX.playHeavyHit();
        this.log(`Seu jab rápido estala na cara de ${this.opponent.shortName}!`, 'action');
      } else {
        soundFX.playDodge();
        if (check.isFumble) {
          this.log(`Seu jab passa no vazio e você se desequilibra por um segundo.`, 'normal');
        } else {
          this.log(`${this.opponent.shortName} se esquiva por milímetros do seu jab.`, 'normal');
        }
      }
    } else if (pAct === 'combo_1_2') {
      pStats.stamina = Math.max(5, pStats.stamina - 4);
      pStats.strikesThrown += 2;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'combo_1_2', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pStats.sigStrikesLanded++;
        pDamage = Math.round((16 + (pAttrs.punchPower * 0.20)) * (check.isCrit ? 1.30 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 0.35));
        soundFX.playHeavyHit();
        this.log(`Combinação um-dois precisa! Jab no peito e direto de encontro no queixo de ${this.opponent.shortName}!`, 'highlight');
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} fecha a guarda e absorve a combinação nas luvas.`, 'defense');
      }
    } else if (pAct === 'power_overhand') {
      pStats.stamina = Math.max(5, pStats.stamina - 7);
      pStats.strikesThrown += 1;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'power_overhand', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pStats.sigStrikesLanded++;
        pDamage = Math.round((24 + (pAttrs.punchPower * 0.32)) * (check.isCrit ? 1.35 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 0.58));
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        this.log(`BOMBA! Seu overhand entra devastador na têmpora de ${this.opponent.shortName}!`, 'critical');
        if (Math.random() < 0.25 || check.isCrit) {
          oStats.cuts += 20;
          this.log(`O impacto abriu um corte sangrento no supercílio de ${this.opponent.shortName}!`, 'danger');
        }
      } else {
        soundFX.playDodge();
        if (check.isFumble) {
          this.log(`Você soltou a pedrada, mas o golpe cortou apenas o ar e você quase foi ao chão com o giro!`, 'normal');
        } else {
          this.log(`Você arrisca o golpe forte mas erra no vazio, desequilibrando-se momentaneamente.`, 'normal');
        }
      }
    } else if (pAct === 'low_kick') {
      pStats.stamina = Math.max(5, pStats.stamina - 4);
      pStats.strikesThrown += 1;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'low_kick', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        target = 'legs';
        pDamage = Math.round((15 + (pAttrs.punchPower * 0.18)) * (check.isCrit ? 1.30 : 1.0));
        oStats.legsHP = Math.max(0, oStats.legsHP - pDamage);
        soundFX.playHeavyHit();
        this.log(`Canelada brutal na coxa! A perna de apoio de ${this.opponent.shortName} treme com o impacto!`, 'highlight');
      } else {
        soundFX.playBlock();
        pStats.legsHP = Math.max(0, pStats.legsHP - 5);
        this.log(`${this.opponent.shortName} levanta o joelho e checa seu chute com a canela dura!`, 'danger');
      }
    } else if (pAct === 'head_kick') {
      pStats.stamina = Math.max(5, pStats.stamina - 9);
      pStats.strikesThrown += 1;
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'head_kick', null, true);
      if (check.landed) {
        pStrikeLanded = true;
        pStats.sigStrikesLanded++;
        pDamage = Math.round((28 + (pAttrs.punchPower * 0.35)) * (check.isCrit ? 1.35 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - pDamage);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(pDamage * 0.65));
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        this.log(`CHUTE ALTO DEVASTADOR NA CABEÇA! O capacete de ossos de ${this.opponent.shortName} foi abalado!`, 'critical');
      } else {
        soundFX.playDodge();
        if (check.isFumble) {
          this.log(`Você arriscou o chute alto com tudo, mas escorregou no giro e quase caiu!`, 'normal');
        } else {
          this.log(`${this.opponent.shortName} inclina o tronco para trás e o chute corta apenas o vento.`, 'normal');
        }
      }
    } else if (pAct === 'counter_stance') {
      this.log(`Você adota postura calculista de contra-ataque, esperando o movimento adversário.`, 'defense');
    }

    if (pStrikeLanded) {
      if (isOppRocked && target === 'head') {
        const extraChin = Math.round(pDamage * 0.30);
        oStats.chinHP = Math.max(0, oStats.chinHP - extraChin);
        if (oStats.chinHP <= 0) {
          soundFX.playCrowdRoar();
          this.log(`💥 NOCAUTE BRUTAL! Aproveitando o adversário grogue, seu golpe apagou o disjuntor de ${this.opponent.shortName}!`, 'finish');
        }
      }
      pStats.strikesLanded++;
      pStats.currentRoundScore.damage += pDamage;
      this.checkKnockdown('opponent', oStats);
    }

    // Se o oponente foi nocauteado ou ficou com queixo zerado, encerra sem revide
    if (oStats.chinHP <= 0 || oStats.headHP <= 0 || this.isOver) {
      return;
    }

    // Resolução do Golpe do Adversário (com possível Skill Check interativo)
    await this.resolveOpponentStrike(oAct, pAct, pAttrs, oAttrs);
  }

  // Resposta ativa e perigosa do golpe do adversário (com d20 Oculto, CD de cada golpe e Skill Check DBD)
  async resolveOpponentStrike(oAct, pAct, pAttrs, oAttrs) {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    if (oStats.chinHP <= 0 || this.isOver) return;

    oStats.strikesThrown++;
    let oStrikeLanded = false;
    let oDamage = 0;

    // Escala de Dificuldade e Dano por Tier do Oponente
    const oppTier = this.opponent.tier || 'AMADOR';
    let tierDamageMult = 1.0;
    if (oppTier === 'MUNDIAL') tierDamageMult = 1.20;
    else if (oppTier === 'ELITE') tierDamageMult = 1.12;
    else if (oppTier === 'MEDIANO') tierDamageMult = 1.05;

    // Se o jogador está esgotado (sem gás), sofre ligeiramente mais impacto
    if (pStats.stamina < 30) tierDamageMult *= 1.12;

    // Mitigação natural de guarda baseada na Defesa técnica do jogador
    const guardMitigation = Math.max(0.72, 1.0 - ((pAttrs.defense || 50) * 0.0028));

    // Redutor de dano caso o jogador esteja em postura puramente defensiva
    const isTurtle = pAct === 'turtle_guard';
    const isCircle = pAct === 'circle_evade';
    const postureDamageReduction = isTurtle ? 0.45 : (isCircle ? 0.60 : 1.0);
    const finalMult = tierDamageMult * guardMitigation * postureDamageReduction;

    // Rolagem do d20 oculto da IA contra a CD e postura do jogador
    const check = this.rollHiddenD20Attack(this.opponent, this.player, oAct, null, false);

    // -------------------------------------------------------------
    // SKILL CHECK ESTILO DEAD BY DAYLIGHT (ESQUIVA INTERATIVA DE GOLPES)
    // "coloca as vezes skills checks tipo do dead by daylight para ver se o player consegue esquivar de algum ataque"
    // Dispara em ataques perigosos (power_hook, head_kick, uppercut, body_kick) ou quando o golpe conectaria limpo
    // -------------------------------------------------------------
    const heavyDangerMoves = ['power_hook', 'head_kick', 'uppercut', 'counter_stance', 'body_kick', 'body_strike'];
    const isPlayerRocked = pStats.chinHP <= (pStats.maxChin ? pStats.maxChin * 0.35 : 75);
    const shouldPromptSkillCheck = !isTurtle && !isCircle && (
      (heavyDangerMoves.includes(oAct) && Math.random() < 0.45) ||
      (isPlayerRocked && Math.random() < 0.50) ||
      (check.landed && Math.random() < 0.25)
    );

    if (shouldPromptSkillCheck && typeof this.onSkillCheck === 'function') {
      const moveLabels = {
        'power_hook': 'Cruzado Violento / Overhand',
        'head_kick': 'Chute Alto Devastador',
        'uppercut': 'Uppercut Fura-Guarda',
        'body_kick': 'Chute nas Costelas',
        'jab_cross': 'Combinação de Diretos',
        'body_strike': 'Gancho no Fígado',
        'low_kick': 'Canelada Baixa na Coxa',
        'counter_stance': 'Contragolpe de Encontro'
      };
      const moveName = moveLabels[oAct] || 'Ataque Pesado';

      const skillResult = await this.onSkillCheck({
        moveId: oAct,
        moveName,
        opponentName: this.opponent.shortName || this.opponent.name,
        playerReflexes: pAttrs.reflexes || 50,
        opponentSpeed: oAttrs.speed || 50
      });

      if (skillResult === 'GREAT') {
        // Esquiva Perfeita estilo DBD com Contragolpe Letal!
        soundFX.playDodge();
        soundFX.playHeavyHit();
        soundFX.playCrowdRoar();
        const counterDmg = Math.round(20 + (pAttrs.punchPower || 50) * 0.25);
        oStats.headHP = Math.max(0, oStats.headHP - counterDmg);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(counterDmg * 0.75));
        pStats.strikesLanded++;
        pStats.sigStrikesLanded++;
        pStats.currentRoundScore.damage += counterDmg;
        this.log(`⚡ [ESQUIVA PERFEITA & CONTRAGOLPE!] (Skill Check Crítico!) Você acertou o milissegundo exato, fez o pêndulo e disparou um míssil de encontro no queixo de ${this.opponent.shortName}!`, 'critical');
        this.checkKnockdown('opponent', oStats);
        return;
      } else if (skillResult === 'SUCCESS') {
        // Esquiva Cirúrgica (Evita 100% do Dano do Rival)
        soundFX.playDodge();
        this.log(`💨 [ESQUIVA CIRÚRGICA!] (Skill Check Bem-Sucedido!) Você leu o ataque no reflexo e esquivou! O golpe violento de ${this.opponent.shortName} cortou apenas o ar!`, 'highlight');
        return;
      } else {
        // Falha no Skill Check
        this.log(`⚠️ [ESQUIVA FALHOU!] Você tentou esquivar do ataque mas errou o tempo! O golpe adversário conectou!`, 'danger');
      }
    }

    // 1. JAB & CROSS (Combinação de Diretos)
    if (oAct === 'jab_cross') {
      if (check.landed) {
        oStrikeLanded = true;
        oDamage = Math.round((12 + (oAttrs.punchPower * 0.14)) * finalMult * (check.isCrit ? 1.25 : 1.0));
        pStats.headHP = Math.max(0, pStats.headHP - oDamage);
        pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(oDamage * 0.35));
        soundFX.playHeavyHit();
        this.log(`💥 [ATAQUE DO RIVAL] ${this.opponent.shortName} avança e conecta uma combinação sólida de diretos no seu rosto!`, 'danger');
      } else {
        soundFX.playBlock();
        if (check.isFumble) {
          this.log(`💨 [ERRO DO RIVAL] ${this.opponent.shortName} avança com os diretos, mas corta o ar no vazio!`, 'normal');
        } else {
          this.log(`🛡️ [BLOQUEIO] ${this.opponent.shortName} dispara uma sequência rápida, mas você absorve nas luvas!`, 'defense');
        }
      }
    }
    // 2. POWER HOOK (Cruzado Pesado / Overhand)
    else if (oAct === 'power_hook') {
      if (check.landed) {
        oStrikeLanded = true;
        oStats.sigStrikesLanded++;
        oDamage = Math.round((20 + (oAttrs.punchPower * 0.22)) * finalMult * (check.isCrit ? 1.25 : 1.0));
        pStats.headHP = Math.max(0, pStats.headHP - oDamage);
        pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(oDamage * 0.48));
        soundFX.playHeavyHit();
        this.log(`💣 [BOMBA DO RIVAL] O cruzado violento de ${this.opponent.shortName} explode na sua têmpora!`, 'critical');
        if (Math.random() < 0.20 || check.isCrit) {
          pStats.cuts += 14;
          this.log(`🩸 O impacto abriu um corte no seu supercílio!`, 'danger');
        }
      } else {
        soundFX.playDodge();
        if (check.isFumble) {
          this.log(`💨 [ERRO DO RIVAL] ${this.opponent.shortName} solta um cruzado no vazio e quase cai com o próprio giro!`, 'normal');
        } else {
          this.log(`💨 [ESQUIVA] ${this.opponent.shortName} tenta te nocautear com um cruzado pesado, mas você faz o pêndulo e esquiva!`, 'action');
        }
      }
    }
    // 3. UPPERCUT (Fura-Guarda)
    else if (oAct === 'uppercut') {
      if (check.landed) {
        oStrikeLanded = true;
        oStats.sigStrikesLanded++;
        oDamage = Math.round((18 + (oAttrs.punchPower * 0.20)) * finalMult * (check.isCrit ? 1.25 : 1.0));
        pStats.headHP = Math.max(0, pStats.headHP - oDamage);
        pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(oDamage * 0.44));
        soundFX.playHeavyHit();
        this.log(`⚡ [UPPERCUT DO RIVAL] ${this.opponent.shortName} fura sua guarda com um gancho vertical no seu queixo!`, 'critical');
      } else {
        soundFX.playBlock();
        this.log(`🛡️ [BLOQUEIO] ${this.opponent.shortName} tenta o uppercut por dentro, mas você fecha o queixo no peito e bloqueia!`, 'defense');
      }
    }
    // 4. BODY STRIKE (Golpe na Linha de Cintura)
    else if (oAct === 'body_strike') {
      if (check.landed) {
        oStrikeLanded = true;
        oDamage = Math.round((16 + (oAttrs.punchPower * 0.18)) * finalMult * (check.isCrit ? 1.20 : 1.0));
        pStats.bodyHP = Math.max(0, pStats.bodyHP - oDamage);
        pStats.stamina = Math.max(5, pStats.stamina - 10);
        soundFX.playHeavyHit();
        this.log(`🥊 [GOLPE NO CORPO] ${this.opponent.shortName} enterra um soco violento nas suas costelas! Seu fôlego cai!`, 'danger');
      } else {
        soundFX.playBlock();
        this.log(`🛡️ [BLOQUEIO] ${this.opponent.shortName} desce um gancho no seu corpo, mas você amortece com o cotovelo colado!`, 'defense');
      }
    }
    // 5. BODY KICK (Chute na Linha de Cintura)
    else if (oAct === 'body_kick') {
      if (check.landed) {
        oStrikeLanded = true;
        oDamage = Math.round((18 + (oAttrs.kicking * 0.20)) * finalMult * (check.isCrit ? 1.20 : 1.0));
        pStats.bodyHP = Math.max(0, pStats.bodyHP - oDamage);
        pStats.stamina = Math.max(5, pStats.stamina - 12);
        soundFX.playHeavyHit();
        this.log(`🦵 [CHUTE DO RIVAL] A canela de ${this.opponent.shortName} estala com estrondo nas suas costelas!`, 'critical');
      } else {
        soundFX.playBlock();
        this.log(`🛡️ [BLOQUEIO] ${this.opponent.shortName} dispara um chute nas suas costelas, mas você absorve com os braços!`, 'defense');
      }
    }
    // 6. HEAD KICK (Chute Alto)
    else if (oAct === 'head_kick') {
      if (check.landed) {
        oStrikeLanded = true;
        oStats.sigStrikesLanded++;
        oDamage = Math.round((22 + (oAttrs.kicking * 0.24)) * finalMult * (check.isCrit ? 1.25 : 1.0));
        pStats.headHP = Math.max(0, pStats.headHP - oDamage);
        pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(oDamage * 0.52));
        soundFX.playHeavyHit();
        this.log(`💥 [CHUTE ALTO DO RIVAL] A canela de ${this.opponent.shortName} chicoteia na lateral da sua cabeça!`, 'critical');
      } else {
        soundFX.playDodge();
        if (check.isFumble) {
          this.log(`💨 [ERRO DO RIVAL] ${this.opponent.shortName} arrisca a canelada alta, mas erra no ar e quase escorrega!`, 'normal');
        } else {
          this.log(`💨 [ESQUIVA] ${this.opponent.shortName} chuta alto com força, mas você inclina o tronco e o golpe passa raspando!`, 'normal');
        }
      }
    }
    // 7. LOW KICK (Chute Baixo na Perna)
    else if (oAct === 'low_kick') {
      if (check.landed) {
        oStrikeLanded = true;
        oDamage = Math.round((13 + (oAttrs.kicking * 0.16)) * finalMult);
        pStats.legsHP = Math.max(0, pStats.legsHP - oDamage);
        soundFX.playHeavyHit();
        this.log(`🦵 [CHUTE BAIXO] ${this.opponent.shortName} chuta sua perna de apoio com impacto doloroso!`, 'danger');
      } else {
        soundFX.playBlock();
        this.log(`🛡️ [DEFESA] ${this.opponent.shortName} solta um chute baixo, mas você levanta a canela no bloqueio perfeito!`, 'defense');
      }
    }
    // 8. COUNTER STANCE / DEFENSIVE SLIP (Contragolpe de encontro)
    else if (oAct === 'counter_stance' || oAct === 'defensive_slip') {
      if (check.landed) {
        oStrikeLanded = true;
        oDamage = Math.round((15 + (oAttrs.punchPower * 0.18)) * finalMult);
        pStats.headHP = Math.max(0, pStats.headHP - oDamage);
        pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(oDamage * 0.40));
        soundFX.playHeavyHit();
        this.log(`⚡ [CONTRAGOLPE DO RIVAL] ${this.opponent.shortName} esquiva e entra no contra-ataque de encontro no seu rosto!`, 'critical');
      } else {
        this.log(`💨 [DEFESA] ${this.opponent.shortName} tenta o contragolpe de encontro, mas você recolhe a guarda a tempo!`, 'normal');
      }
    }
    // 9. FALLBACK GERAL (Ataque contínuo)
    else {
      if (check.landed) {
        oStrikeLanded = true;
        oDamage = Math.round((12 + (oAttrs.punchPower * 0.12)) * finalMult);
        pStats.headHP = Math.max(0, pStats.headHP - oDamage);
        pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(oDamage * 0.35));
        soundFX.playHeavyHit();
        this.log(`💥 [ATAQUE DO RIVAL] ${this.opponent.shortName} pressiona e conecta um golpe limpo no seu queixo!`, 'danger');
      } else {
        soundFX.playBlock();
        this.log(`🛡️ [BLOQUEIO] ${this.opponent.shortName} ataca no centro do ringue, mas você bloqueia com firmeza!`, 'defense');
      }
    }

    // -------------------------------------------------------------
    // PROTEÇÃO HEROICA CONTRA NOCAUTE PREMATURO DO JOGADOR
    // -------------------------------------------------------------
    if (pStats.chinHP <= 0 && this.currentRound <= 2 && pStats.knockdowns < 2) {
      pStats.chinHP = 20;
      this.log(`🛡️ RESISTÊNCIA DE GUERREIRO! Suas pernas bambeiam com o impacto terrível, mas seu queixo de aço se recusa a ceder!`, 'highlight');
    }

    if (oStrikeLanded) {
      oStats.strikesLanded++;
      oStats.currentRoundScore.damage += oDamage;
      this.checkKnockdown('player', pStats);
    }
  }

  // Ações dentro do Clinch
  resolveClinchClash(pAct, oAct, pAttrs, oAttrs) {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    if (pAct === 'break_clinch') {
      this.phase = 'STANDUP';
      soundFX.playDodge();
      this.log(`Você cria espaço com o antebraço e rompe o clinch, voltando para a média distância!`, 'action');
      return;
    }

    // Ações exclusivas de Clinch no Boxe (Nobre Arte)
    if (pAct === 'body_rip_short') {
      pStats.stamina = Math.max(5, pStats.stamina - 6);
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'body_rip_short', null, true);
      if (check.landed) {
        const dmg = Math.round((18 + pAttrs.punchPower * 0.22) * (check.isCrit ? 1.30 : 1.0));
        oStats.bodyHP = Math.max(0, oStats.bodyHP - dmg);
        oStats.stamina = Math.max(0, oStats.stamina - 15);
        pStats.currentRoundScore.damage += dmg;
        soundFX.playHeavyHit();
        this.log(`Gancho curto no fígado na curta distância! ${this.opponent.shortName} dobra o tronco de dor!`, 'critical');
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} fecha os cotovelos colados ao corpo e bloqueia o gancho.`, 'defense');
      }
    } else if (pAct === 'uppercut_inside') {
      pStats.stamina = Math.max(5, pStats.stamina - 7);
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'uppercut_inside', null, true);
      if (check.landed) {
        const dmg = Math.round((20 + pAttrs.punchPower * 0.28) * (check.isCrit ? 1.35 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - dmg);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(dmg * 0.70));
        pStats.currentRoundScore.damage += dmg;
        soundFX.playHeavyHit();
        this.log(`UPPERCUT CURTO POR DENTRO NA SEPARAÇÃO! A cabeça de ${this.opponent.shortName} chicoteia para trás!`, 'critical');
        this.checkKnockdown('opponent', oStats);
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} cola o queixo no peito e o soco passa por cima.`, 'defense');
      }
    } else if (pAct === 'tie_up_arms') {
      pStats.stamina = Math.min(100, pStats.stamina + 12);
      soundFX.playBlock();
      this.log(`Você amarra com maestria os braços de ${this.opponent.shortName}. O árbitro intervém prontamente: "BREAK!"`, 'action');
      this.phase = 'STANDUP';
      return;
    } else if (pAct === 'cage_press') {
      pStats.currentRoundScore.controlSec += 15;
      oStats.stamina = Math.max(0, oStats.stamina - 14);
      soundFX.playBlock();
      this.log(`Você pressiona ${this.opponent.shortName} pesadamente contra as cordas/grade, desgastando o oxigênio dele na isometria!`, 'action');
    } else if (pAct === 'clinch_knee') {
      pStats.stamina = Math.max(5, pStats.stamina - 5);
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'clinch_knee', null, true);
      if (check.landed) {
        const dmg = Math.round((18 + pAttrs.strength * 0.20) * (check.isCrit ? 1.30 : 1.0));
        oStats.bodyHP = Math.max(0, oStats.bodyHP - dmg);
        oStats.stamina = Math.max(0, oStats.stamina - 12);
        pStats.currentRoundScore.damage += dmg;
        soundFX.playHeavyHit();
        this.log(`Joelhada afiada nas costelas de ${this.opponent.shortName}! O ar dele escapou com dor!`, 'highlight');
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} fecha os braços e bloqueia a joelhada.`, 'defense');
      }
    } else if (pAct === 'clinch_elbow') {
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'clinch_elbow', null, true);
      if (check.landed) {
        const dmg = Math.round((18 + pAttrs.punchPower * 0.2) * (check.isCrit ? 1.30 : 1.0));
        oStats.headHP = Math.max(0, oStats.headHP - dmg);
        oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(dmg * 0.65));
        oStats.cuts += 30;
        pStats.currentRoundScore.damage += dmg;
        soundFX.playHeavyHit();
        this.log(`Cotovelada cortante na curta distância! O sangue jorra do rosto de ${this.opponent.shortName}!`, 'critical');
      } else {
        this.log(`A cotovelada raspa de lado sem pegar em cheio.`, 'normal');
      }
    } else if (pAct === 'clinch_trip') {
      const check = this.rollHiddenD20Attack(this.player, this.opponent, 'clinch_trip', null, true);
      if (check.landed) {
        if (this.modality.hasGroundGame) {
          this.phase = 'GROUND';
          this.groundPosition = 'HALF_GUARD';
          this.groundTopFighter = 'player';
          pStats.takedownsLanded++;
          soundFX.playHeavyHit();
          this.log(`Rasteira de judô perfeita! Você projeta ${this.opponent.shortName} de costas no tatame!`, 'highlight');
          return;
        } else {
          pStats.takedownsLanded++;
          pStats.currentRoundScore.damage += 16;
          soundFX.playHeavyHit();
          this.log(`Projeção limpa de clinch! ${this.opponent.shortName} cai ao tablado com estrondo e levanta rapidamente!`, 'highlight');
          return;
        }
      } else {
        soundFX.playBlock();
        this.log(`${this.opponent.shortName} resiste à projeção e mantém o equilíbrio.`, 'defense');
      }
    }

    // Revide do adversário no Clinch (com d20 oculto)
    if (oStats.chinHP > 0 && oStats.headHP > 0 && !this.isOver) {
      const oCheck = this.rollHiddenD20Attack(this.opponent, this.player, 'clinch_knee', null, false);
      if (oCheck.landed) {
        const oClinchDmg = Math.round((14 + (oAttrs.clinch || 50) * 0.20) * (oCheck.isCrit ? 1.25 : 1.0));
        pStats.bodyHP = Math.max(0, pStats.bodyHP - oClinchDmg);
        pStats.stamina = Math.max(5, pStats.stamina - 10);
        soundFX.playHeavyHit();
        this.log(`💥 [CLINCH DO RIVAL] Na briga colada, ${this.opponent.shortName} estala uma joelhada pesada na sua costela!`, 'danger');
      } else {
        soundFX.playBlock();
        this.log(`🛡️ [DEFESA NO CLINCH] ${this.opponent.shortName} tenta te golpear por dentro, mas você cola o peito e anula o espaço!`, 'defense');
      }
    }
  }

  // Ações de Luta de Solo (Ground Game & Submissions com d20 Oculto e CD por golpe)
  resolveGroundClash(pAct, oAct, pAttrs, oAttrs) {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;
    const isPlayerTop = this.groundTopFighter === 'player';

    if (isPlayerTop) {
      // 1. Armlock da Montada (CD 13)
      if (pAct === 'armbar_mount') {
        pStats.subAttempts++;
        pStats.stamina = Math.max(5, pStats.stamina - 10);
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'armbar_mount', null, true);
        if (check.landed || check.isCrit) {
          this.isOver = true;
          this.winner = 'player';
          this.resultMethod = 'SUB';
          this.resultDetail = 'Chave de Braço (Armlock da Montada)';
          soundFX.playCrowdRoar();
          this.log(`ARMLOCK PERFEITO! Você gira o quadril, estica o braço de ${this.opponent.shortName} e ele BATE DESESPERADO!`, 'finish');
          return;
        } else {
          this.groundPosition = 'GUARD';
          this.log(`Você ataca o braço, mas ele gira no tempo exato e você cai na guarda dele.`, 'normal');
        }
      }
      // 2. Katagatame da Montada (CD 12)
      else if (pAct === 'head_arm_choke') {
        pStats.subAttempts++;
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'head_arm_choke', null, true);
        if (check.landed || check.isCrit) {
          this.isOver = true;
          this.winner = 'player';
          this.resultMethod = 'SUB';
          this.resultDetail = 'Katagatame (Estrangulamento)';
          soundFX.playCrowdRoar();
          this.log(`KATAGATAME AJUSTADO! O estrangulamento fecha as artérias e ${this.opponent.shortName} APAGA NO SOLO!`, 'finish');
          return;
        } else {
          this.log(`${this.opponent.shortName} atende a tempo e defende com a mão no quadril.`, 'defense');
        }
      }
      // 3. Mata-Leão (Costas) (CD 12)
      else if (pAct === 'rear_naked_choke') {
        pStats.subAttempts++;
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'rear_naked_choke', null, true);
        if (check.landed || check.isCrit) {
          this.isOver = true;
          this.winner = 'player';
          this.resultMethod = 'SUB';
          this.resultDetail = 'Mata-Leão Pelas Costas (RNC)';
          soundFX.playCrowdRoar();
          this.log(`MATA-LEÃO ENCAIXADO! Braço passado no queixo, mão na nuca e ${this.opponent.shortName} DÁ OS TRÊS TAPINHAS!`, 'finish');
          return;
        } else {
          this.log(`${this.opponent.shortName} segura seus pulsos desesperadamente para evitar o estrangulamento.`, 'defense');
        }
      }
      // 4. Ground and Pound (CD 9)
      else if (pAct === 'ground_and_pound') {
        pStats.stamina = Math.max(5, pStats.stamina - 6);
        const isMount = this.groundPosition === 'MOUNT';
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'ground_and_pound', null, true);
        if (check.landed) {
          const dmg = Math.round(((isMount ? 32 : 22) + pAttrs.punchPower * 0.35) * (check.isCrit ? 1.30 : 1.0));
          oStats.headHP = Math.max(0, oStats.headHP - dmg);
          oStats.chinHP = Math.max(0, oStats.chinHP - Math.round(dmg * 0.9));
          pStats.currentRoundScore.damage += dmg;
          soundFX.playHeavyHit();
          this.log(`MARRETADAS DEVASTADORAS! Você descarrega cotovelos e socos pesados de cima para baixo em ${this.opponent.shortName}!`, 'critical');
          this.checkKnockdown('opponent', oStats);
        } else {
          this.log(`${this.opponent.shortName} cola você no peito dele, anulando o espaço dos socos.`, 'defense');
        }
      }
      // 5. Passar Guarda (CD 11)
      else if (pAct === 'pass_guard') {
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'pass_guard', null, true);
        if (check.landed) {
          this.groundPosition = 'MOUNT';
          pStats.currentRoundScore.damage += 15;
          soundFX.playCrowdRoar();
          this.log(`Transição espetacular! Você passa a guarda e crava a MONTADA COMPLETA!`, 'highlight');
        } else {
          this.log(`${this.opponent.shortName} repõe a guarda com firmeza.`, 'normal');
        }
      }
      // 6. Pegar as Costas
      else if (pAct === 'take_back') {
        this.groundPosition = 'BACK';
        soundFX.playCrowdRoar();
        this.log(`Você gira com técnica, grampeia as costas de ${this.opponent.shortName} e passa os ganchos!`, 'highlight');
      }
      // 7. Finalização Genérica (CD 14)
      else if (pAct === 'submission_attempt') {
        pStats.subAttempts++;
        pStats.stamina = Math.max(5, pStats.stamina - 12);
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'submission_attempt', null, true);

        if (check.landed || check.isCrit) {
          this.isOver = true;
          this.winner = 'player';
          this.resultMethod = 'SUB';
          this.resultDetail = this.groundPosition === 'MOUNT' ? 'Armlock da Montada' : 'Kimura Ajustada';
          soundFX.playCrowdRoar();
          this.log(`FINALIZAÇÃO HISTÓRICA! O golpe está arrochado e ${this.opponent.shortName} BATE EM DESISTÊNCIA!`, 'finish');
          return;
        } else {
          this.log(`Você ataca a articulação, mas ${this.opponent.shortName} defende no limite.`, 'defense');
        }
      }
      // 8. Levantar
      else if (pAct === 'stand_up') {
        this.phase = 'STANDUP';
        this.log(`Você se desvencilha do solo e manda ${this.opponent.shortName} levantar para o centro!`, 'action');
      }

      // Reação do oponente por baixo (não fica inerte!)
      if (oStats.chinHP > 0 && oStats.headHP > 0 && !this.isOver && this.phase === 'GROUND') {
        const oCheck = this.rollHiddenD20Attack(this.opponent, this.player, 'tie_up_guard', null, false);
        if (oCheck.landed) {
          this.log(`🥋 [DEFESA DO RIVAL] Por baixo, ${this.opponent.shortName} explode o quadril e trava sua postura no solo!`, 'normal');
        }
      }
    } else {
      // Jogador está por baixo
      // 1. Fechar Guarda e Amarrar (CD 10)
      if (pAct === 'tie_up_guard') {
        soundFX.playBlock();
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'tie_up_guard', null, true);
        if (check.landed) {
          this.phase = 'STANDUP';
          this.log(`Você amarra completamente o pescoço e braços do adversário. O árbitro interrompe por falta de ação e coloca os dois de pé!`, 'highlight');
        } else {
          this.log(`Você trava a cabeça de ${this.opponent.shortName} no peito, anulando os socos dele por baixo.`, 'defense');
        }
      }
      // 2. Raspagem (CD 13)
      else if (pAct === 'sweep') {
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'sweep', null, true);
        if (check.landed) {
          this.groundTopFighter = 'player';
          this.groundPosition = 'MOUNT';
          soundFX.playCrowdRoar();
          this.log(`RASPAGEM MAGISTRAL! Você inverte a posição e cai montado!`, 'highlight');
        } else {
          this.log(`Você tenta raspar, mas a base pesada de ${this.opponent.shortName} não cede.`, 'defense');
          const gnpDmg = Math.round(14 + (oAttrs.punchPower || 50) * 0.18);
          pStats.headHP = Math.max(0, pStats.headHP - gnpDmg);
          pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(gnpDmg * 0.35));
          soundFX.playHeavyHit();
          this.log(`Por cima, ${this.opponent.shortName} aproveita a tentativa frustrada e desce socos no seu rosto!`, 'danger');
          if (pStats.chinHP <= 0 && (this.currentRound === 1 || pStats.headHP > 20)) pStats.chinHP = 6;
          this.checkKnockdown('player', pStats);
        }
      }
      // 3. Finalização por Baixo (CD 14)
      else if (pAct === 'submission_attempt') {
        pStats.subAttempts++;
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'submission_attempt', null, true);
        if (check.isCrit || (check.landed && Math.random() < 0.7)) {
          this.isOver = true;
          this.winner = 'player';
          this.resultMethod = 'SUB';
          this.resultDetail = 'Triângulo Justo da Guarda';
          soundFX.playCrowdRoar();
          this.log(`TRIÂNGULO ENCAIXADO DA GUARDA! ${this.opponent.shortName} apaga e bate desesperado!`, 'finish');
          return;
        } else {
          this.log(`Você tenta a finalização, mas ${this.opponent.shortName} ergue a postura e golpeia por cima!`, 'danger');
          const gnpDmg = Math.round(16 + (oAttrs.punchPower || 50) * 0.18);
          pStats.headHP = Math.max(0, pStats.headHP - gnpDmg);
          pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(gnpDmg * 0.35));
          soundFX.playHeavyHit();
          if (pStats.chinHP <= 0 && (this.currentRound === 1 || pStats.headHP > 20)) pStats.chinHP = 6;
          this.checkKnockdown('player', pStats);
        }
      }
      // 4. Levantar com Escala de Grade (CD 12)
      else if (pAct === 'stand_up') {
        const check = this.rollHiddenD20Attack(this.player, this.opponent, 'stand_up', null, true);
        if (check.landed) {
          this.phase = 'STANDUP';
          this.log(`Você escala a grade, dá o scramble e fica de pé com raça!`, 'action');
        } else {
          const gnpDmg = Math.round(12 + (oAttrs.punchPower || 50) * 0.16);
          pStats.headHP = Math.max(0, pStats.headHP - gnpDmg);
          pStats.chinHP = Math.max(0, pStats.chinHP - Math.round(gnpDmg * 0.30));
          soundFX.playHeavyHit();
          this.log(`${this.opponent.shortName} grampeia você no solo e desce socos curtos na orelha!`, 'danger');
          if (pStats.chinHP <= 0 && (this.currentRound === 1 || pStats.headHP > 20)) pStats.chinHP = 6;
          this.checkKnockdown('player', pStats);
        }
      }
    }
  }

  // Checa se ocorreu knockdown e contagem do árbitro
  checkKnockdown(targetFighterKey, stats) {
    if (stats.chinHP <= 20 && Math.random() < 0.65) {
      stats.knockdowns++;
      // Ao levantar do knockdown, recupera a postura e recompõe parte do queixo
      stats.chinHP = Math.max(stats.chinHP + 45, Math.round((stats.maxChin || 200) * 0.35));
      soundFX.playCrowdRoar();

      if (targetFighterKey === 'opponent') {
        this.log(`KNOCKDOWN! ${this.opponent.shortName} DESABA NA LONA COM OS OLHOS VIDRADOS!`, 'critical');
        this.fighterStats.player.currentRoundScore.knockdowns++;
      } else {
        this.log(`VOCÊ FOI AO CHÃO! Um golpe violento te derrubou! O árbitro abre contagem... 7... 8... Você se levanta com raça!`, 'critical');
        this.fighterStats.opponent.currentRoundScore.knockdowns++;
      }

      // Se sofreu 3 knockdowns no mesmo round, TKO técnico!
      if (stats.knockdowns >= 3) {
        this.isOver = true;
        this.winner = targetFighterKey === 'opponent' ? 'player' : 'opponent';
        this.resultMethod = 'TKO';
        this.resultDetail = 'Regra de 3 Knockdowns no mesmo round';
        this.log(`O árbitro interrompe a luta! TKO por acúmulo de quedas!`, 'finish');
      }
    }
  }

  // Checagem de condições fatais de interrupção (KO, TKO, Cortes)
  checkFinishConditions() {
    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    // Nocaute do Oponente
    if (oStats.headHP <= 0 || oStats.chinHP <= 0) {
      this.isOver = true;
      this.winner = 'player';
      this.resultMethod = 'KO';
      this.resultDetail = 'Nocaute Fulminante no Queixo';
      soundFX.playCrowdRoar();
      this.log(`NOCAUTE! ${this.opponent.shortName} CAI DESACORDADO! A ARENA VAI À LOUCURA!`, 'finish');
      return true;
    }

    // Nocaute do Jogador (quando o Queixo se esgota totalmente)
    if (pStats.chinHP <= 0) {
      this.isOver = true;
      this.winner = 'opponent';
      this.resultMethod = 'KO';
      this.resultDetail = 'Nocaute Sofrido';
      soundFX.playCrowdRoar();
      this.log(`VOCÊ FOI APAGADO! O árbitro mergulha para te proteger. Vitória de ${this.opponent.shortName}.`, 'finish');
      return true;
    }

    // TKO por cortes profundos (Parada Médica)
    if (oStats.cuts >= 80) {
      this.isOver = true;
      this.winner = 'player';
      this.resultMethod = 'TKO';
      this.resultDetail = 'Interrupção Médica por Corte Profundo';
      this.log(`O médico da comissão examina o supercílio de ${this.opponent.shortName} e ENCERRA O COMBATE! Sangramento incontrolável!`, 'finish');
      return true;
    }
    if (pStats.cuts >= 80) {
      this.isOver = true;
      this.winner = 'opponent';
      this.resultMethod = 'TKO';
      this.resultDetail = 'Interrupção Médica por Cortes Graves';
      this.log(`O médico decreta que seu olho está comprometido pelo sangue e interrompe a luta.`, 'finish');
      return true;
    }

    return false;
  }

  // Fim do Round: Avaliação dos 3 Juízes e Intervalo do Corner
  endRound() {
    soundFX.playBell();
    this.isBetweenRounds = true;
    this.isTacticalPause = false;
    this.strikesInSequence = 0;
    this.phase = 'STANDUP'; // Sempre recomeça em pé

    const pScore = this.fighterStats.player.currentRoundScore;
    const oScore = this.fighterStats.opponent.currentRoundScore;

    // Critério 10-Point Must dos Juízes
    const roundScores = this.judgeScores.map(judge => {
      let pRound = 10;
      let oRound = 9;

      // Vantagem por knockdowns
      if (pScore.knockdowns > oScore.knockdowns) {
        oRound = (pScore.knockdowns - oScore.knockdowns > 1) ? 7 : 8;
      } else if (oScore.knockdowns > pScore.knockdowns) {
        pRound = (oScore.knockdowns - pScore.knockdowns > 1) ? 7 : 8;
        oRound = 10;
      } else {
        // Dano efetivo
        const diff = pScore.damage - oScore.damage;
        if (diff > 25) {
          pRound = 10;
          oRound = 8;
        } else if (diff > 0) {
          pRound = 10;
          oRound = 9;
        } else if (diff < -25) {
          pRound = 8;
          oRound = 10;
        } else if (diff < 0) {
          pRound = 9;
          oRound = 10;
        } else {
          pRound = 10;
          oRound = 10;
        }
      }

      judge.player += pRound;
      judge.opponent += oRound;
      return { pRound, oRound };
    });

    this.roundByRoundScores.push({
      round: this.currentRound,
      scores: roundScores
    });

    this.log(`Fim do Round ${this.currentRound}! Os lutadores caminham para os seus respectivos córners.`, 'highlight');

    // Reset dos contadores do round atual
    this.fighterStats.player.currentRoundScore = { damage: 0, controlSec: 0, knockdowns: 0 };
    this.fighterStats.opponent.currentRoundScore = { damage: 0, controlSec: 0, knockdowns: 0 };
  }

  // Escolha do jogador no banco do córner durante o minuto de intervalo
  applyCornerAction(cornerChoice) {
    if (!this.isBetweenRounds) return;

    const pStats = this.fighterStats.player;
    const oStats = this.fighterStats.opponent;

    if (cornerChoice === 'ice_vaseline') {
      pStats.cuts = Math.max(0, pStats.cuts - 35);
      pStats.headHP = Math.min(pStats.maxHead || 200, pStats.headHP + 35);
      pStats.chinHP = Math.min(pStats.maxChin || 220, pStats.chinHP + 25);
      this.log(`O cutman estanca o sangramento com vaselina e gelo na testa, aliviando o inchaço.`, 'action');
    } else if (cornerChoice === 'deep_breaths') {
      pStats.stamina = Math.min(pStats.maxStamina || 100, pStats.stamina + 50);
      pStats.chinHP = Math.min(pStats.maxChin || 220, pStats.chinHP + 30);
      this.log(`Você respira fundo pelo nariz, oxigena o cérebro e recupera o fôlego para o próximo round.`, 'action');
    } else if (cornerChoice === 'tactical_advice') {
      pStats.chinHP = Math.min(pStats.maxChin || 220, pStats.chinHP + 55);
      pStats.headHP = Math.min(pStats.maxHead || 200, pStats.headHP + 30);
      this.log(`Seu treinador recalibra sua postura: "Mantenha a guarda firme, antecipe o direto dele e contra-ataque!"`, 'action');
    }

    // Oponente também se recupera no intervalo
    oStats.stamina = Math.min(oStats.maxStamina || 100, oStats.stamina + 35);
    oStats.chinHP = Math.min(oStats.maxChin || 200, oStats.chinHP + 40);
    oStats.headHP = Math.min(oStats.maxHead || 200, oStats.headHP + 25);
    oStats.cuts = Math.max(0, oStats.cuts - 20);

    // Se completou o último round, vai para a decisão dos juízes!
    if (this.currentRound >= this.totalRounds) {
      this.resolveJudgesDecision();
    } else {
      // Inicia próximo round
      this.currentRound++;
      this.timeRemainingSec = this.roundDurationSec;
      this.isBetweenRounds = false;
      soundFX.playBell();
      this.log(`Começa o Round ${this.currentRound}! Para o centro do ringue!`, 'highlight');
    }
  }

  // Decisão dos juízes ao soar o gongo final
  resolveJudgesDecision() {
    this.isOver = true;
    soundFX.playCrowdRoar();

    let playerWinsCount = 0;
    let opponentWinsCount = 0;

    this.judgeScores.forEach(j => {
      if (j.player > j.opponent) playerWinsCount++;
      else if (j.opponent > j.player) opponentWinsCount++;
    });

    const scoreCardText = this.judgeScores.map(j => `${j.player}-${j.opponent}`).join(', ');

    if (playerWinsCount === 3) {
      this.winner = 'player';
      this.resultMethod = 'DEC_UNANIMOUS';
      this.resultDetail = `Decisão Unânime dos Juízes (${scoreCardText})`;
      this.log(`E O VENCEDOR POR DECISÃO UNÂNIME: VOCÊ! Cartões: ${scoreCardText}!`, 'finish');
    } else if (playerWinsCount === 2 && opponentWinsCount <= 1) {
      this.winner = 'player';
      this.resultMethod = 'DEC_SPLIT';
      this.resultDetail = `Decisão Dividida dos Juízes (${scoreCardText})`;
      this.log(`E O VENCEDOR POR DECISÃO DIVIDIDA: VOCÊ! Uma batalha disputada round a round!`, 'finish');
    } else if (opponentWinsCount >= 2) {
      this.winner = 'opponent';
      this.resultMethod = opponentWinsCount === 3 ? 'DEC_UNANIMOUS' : 'DEC_SPLIT';
      this.resultDetail = `Derrota por Decisão dos Juízes (${scoreCardText})`;
      this.log(`Os juízes declaram a vitória para ${this.opponent.name}. Cartões: ${scoreCardText}.`, 'finish');
    } else {
      this.winner = 'draw';
      this.resultMethod = 'DRAW';
      this.resultDetail = `Empate Majoritário (${scoreCardText})`;
      this.log(`EMPATE! Os juízes não conseguiram apontar um vencedor incontestável!`, 'finish');
    }
  }

  // Retorna os dados finais estruturados para gravação no cartel
  getFightSummary() {
    return {
      winner: this.winner,
      opponentName: this.opponent.name,
      opponentRecord: `${this.opponent.record.wins}-${this.opponent.record.losses}-${this.opponent.record.draws}`,
      method: this.resultMethod,
      methodDescription: this.resultDetail,
      round: this.currentRound,
      time: this.getFormattedTime(),
      eventName: this.eventName,
      modality: this.modality.name,
      isTitleFight: this.isTitleFight,
      isOlympic: this.isOlympic,
      titleName: this.titleName,
      category: this.category,
      purseEarned: this.winner === 'player' ? this.purse : Math.round(this.purse * 0.5),
      playerDamageDealt: this.fighterStats.player.strikesLanded * 15,
      stats: {
        player: this.fighterStats.player,
        opponent: this.fighterStats.opponent
      }
    };
  }
}
