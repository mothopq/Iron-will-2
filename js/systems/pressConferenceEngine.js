// pressConferenceEngine.js - Motor dinâmico e interativo de Coletivas de Imprensa para eventos significativos

import { MODALITY_LABELS } from '../models/OpponentGenerator.js';

export function isSignificantEvent(fight) {
  if (!fight) return false;
  const opp = fight.opponent || {};

  return !!(
    fight.isTitleFight ||
    fight.isTitle ||
    fight.isOlympic ||
    fight.matchType === 'CROSS_STYLE' ||
    fight.category === 'luta_livre' ||
    fight.category === 'continental' ||
    fight.category === 'ufc' ||
    (opp.tier === 'MUNDIAL' || opp.tier === 'ELITE') ||
    (opp.rank && opp.rank <= 10)
  );
}

export function generatePressConference(fighter, fight) {
  const opp = fight.opponent;
  const isCrossStyle = fight.matchType === 'CROSS_STYLE' || (opp.modality && opp.modality !== fighter.modality);
  const isTitle = !!(fight.isTitleFight || fight.isTitle);
  const isOlympic = !!fight.isOlympic;
  const rounds = fight.rounds || 5;

  const playerMod = MODALITY_LABELS[fighter.modality] || fighter.modality;
  const oppMod = MODALITY_LABELS[opp.modality] || opp.modality;

  // Introdução do Moderador
  const hostIntro = isOlympic
    ? `Senhoras e senhores da imprensa internacional, bem-vindos à Coletiva Oficial dos Jogos Olímpicos! Em disputa, a glória imortal da Medalha de Ouro para suas nações!`
    : isTitle
    ? `Bem-vindos à Coletiva de Imprensa Oficial para a Disputa de Cinturão em ${fight.eventName}! Os dois melhores do mundo frente a frente diante dos microfones!`
    : isCrossStyle
    ? `Atenção imprensa mundial: estamos na coletiva do Desafio Aberto de Estilos (${playerMod} vs. ${oppMod})! Um choque histórico de filosofias e técnicas marciais!`
    : `Sejam bem-vindos à Coletiva Oficial de Imprensa de ${fight.eventName}! A rivalidade entre os atletas atingiu o ponto de ebulição!`;

  // Fala provocatória inicial do adversário
  let rivalOpeningQuote = '';
  if (isCrossStyle) {
    rivalOpeningQuote = `"O estilo dele (${playerMod}) é limitado. Quando eu impuser meu jogo de ${oppMod}, ele vai entrar em desespero antes do segundo round."`;
  } else if (isTitle) {
    rivalOpeningQuote = `"Ele fez um bom caminho para chegar até aqui, mas o cinturão é meu. Ele nunca sentiu o peso de um soco no nível de campeonato mundial."`;
  } else if (opp.personality && opp.personality.includes('Trash Talker')) {
    rivalOpeningQuote = `"Vou nocautear esse cara e usar a bolsa da luta para comemorar em Las Vegas. Ele não aguenta três minutos no mesmo ringue comigo."`;
  } else {
    rivalOpeningQuote = `"Treinei feito um animal. Se ele piscar ou baixar a guarda, a luta acaba na mesma hora."`;
  }

  // 3 Rodadas de Perguntas Interativas
  const questions = [
    {
      id: 'q_clash',
      journalistName: 'Rodrigo Brandão',
      mediaOutlet: 'Canal Combate & SporTV',
      outletBadge: 'TV AO VIVO',
      question: isCrossStyle
        ? `Temos aqui um clássico choque de disciplinas: seu ${playerMod} contra o ${oppMod} de ${opp.name}. Ele acabou de declarar que sua arte é limitada. Como você pretende anular as armas dele?`
        : isTitle
        ? `Você está diante do combate mais decisivo da sua vida valendo o cinturão unificado. ${opp.name} prometeu que você não passará do início. Qual é o seu recado direto para ele?`
        : `A rivalidade entre você e ${opp.name} cresceu durante a semana do camp. Olhando nos olhos dele aqui na bancada, como você define o que vai acontecer no ringue?`,
      options: [
        {
          id: 'trash_talk',
          type: 'TRASH_TALK',
          badge: '🔥 PROVOCAÇÃO / TRASH TALK',
          text: `"Ele fala muito porque sabe que vai cair duro. No primeiro golpe limpo que entrar no queixo dele, a boca dele vai fechar para sempre e ele vai sair de maca!"`,
          fameGain: 40,
          moralGain: 0,
          fightIqGain: 0,
          cashBonus: 0,
          staminaBonus: 0,
          effectDesc: '🔥 Fama +40 | O adversário entra enfurecido no Round 1 (bate mais forte, mas abre brechas para contragolpes)',
          headline: `BOMBÁSTICO: "${fighter.name} detona ${opp.shortName} na coletiva: 'Vai sair de maca!'"`
        },
        {
          id: 'martial_honor',
          type: 'HONOR',
          badge: '🥋 HONRA MARCIAL & RESPEITO',
          text: `"Tenho total respeito pela história e pelo estilo dele. Treinei a minha vida inteira para este dia. O respeito fica fora do ringue; lá dentro que vença o melhor atleta."`,
          fameGain: 15,
          moralGain: 30,
          fightIqGain: 10,
          cashBonus: 0,
          staminaBonus: 0,
          effectDesc: '🥋 Moral +30 | Fight IQ +10 | Simpatia dos juízes laterais (+1 ponto em caso de rounds parelhos)',
          headline: `CLASSE PURA: "${fighter.name} prega disciplina marcial mas avisa que está no auge para o duelo"`
        },
        {
          id: 'surgical_intel',
          type: 'IQ',
          badge: '🧠 LEITURA CIRÚRGICA & ESTRATÉGIA',
          text: `"Minha equipe estudou centenas de rounds dele e identificamos três falhas graves de movimentação. Não vou brigar na emoção; vou dar uma aula de estratégia."`,
          fameGain: 20,
          moralGain: 15,
          fightIqGain: 25,
          cashBonus: 0,
          staminaBonus: 0,
          effectDesc: '🧠 Fight IQ +25 | Esquiva inicial +12% no Round 1 ao prever combinações do rival',
          headline: `ESTUDO TÁTICO: "${fighter.name} afirma ter decifrado as fraquezas de ${opp.shortName}"`
        },
        {
          id: 'crowd_showman',
          type: 'SHOWMAN',
          badge: '⚡ SHOWMAN / PROMOTOR DO PPV',
          text: `"Os fãs pagaram ingresso e compraram o pay-per-view para ver um espetáculo histórico! Garanto que sexta-feira será a Luta do Ano com um nocaute cinematográfico!"`,
          fameGain: 50,
          moralGain: 10,
          fightIqGain: 0,
          cashBonus: 1200,
          staminaBonus: 0,
          effectDesc: '⚡ Fama +50 | +$1.200 bônus financeiro do promotor por promover o evento',
          headline: `ESPETÁCULO: "${fighter.name} leva a imprensa ao delírio e promete show memorável!"`
        }
      ]
    },
    {
      id: 'q_rounds_gas',
      journalistName: 'Claire Davies',
      mediaOutlet: 'The Ring Magazine (EUA)',
      outletBadge: 'IMPRENSA GLOBAL',
      question: `Este combate oficial foi programado para ${rounds} rounds de alto nível. Muitos atletas quebram física e psicologicamente quando a luta se arrasta para os rounds finais. O seu preparo aguenta uma verdadeira guerra de atrito?`,
      options: [
        {
          id: 'iron_cardio',
          type: 'CARDIO',
          badge: '🫁 CARDIO DE FERRO / GUERRA DE ATRITO',
          text: `"Treino para lutar 15 rounds se for preciso. Se ele quiser guerra do primeiro ao último segundo, eu serei o homem que vai marchar para a frente sem cansar."`,
          fameGain: 20,
          moralGain: 20,
          fightIqGain: 5,
          cashBonus: 0,
          staminaBonus: 20,
          effectDesc: '🫁 Estamina Inicial +20 | Resistência a quedas de rendimento nos rounds finais',
          headline: `MÁQUINA: "${fighter.name} avisa que seu cardio aguenta uma guerra de ${rounds} rounds!"`
        },
        {
          id: 'early_executioner',
          type: 'KO_HUNTER',
          badge: '💥 CAÇADOR DE NOCAUTES',
          text: `"Os juízes nem precisavam vir trabalhar hoje. Essa luta não chega na metade dos rounds. Quando o meu golpe mais pesado entrar limpo, o juiz encerra."`,
          fameGain: 35,
          moralGain: 15,
          fightIqGain: 0,
          cashBonus: 0,
          staminaBonus: 0,
          effectDesc: '💥 Instinto Assassino: +15% de poder de impacto e dano crítico nos dois primeiros rounds',
          headline: `AVISO MORTAL: "${fighter.name} sentencia: 'Essa luta não chega na metade dos rounds'"`
        },
        {
          id: 'unbreakable_mind',
          type: 'MENTAL',
          badge: '🧘 MENTE INABALÁVEL & QUEIXO DE AÇO',
          text: `"A dor é temporária, a glória é para sempre. Já suportei guerras no treino e na vida. Não há nada que ele possa me acertar que eu já não tenha aguentado."`,
          fameGain: 15,
          moralGain: 35,
          fightIqGain: 10,
          cashBonus: 0,
          staminaBonus: 10,
          effectDesc: '🗿 Blindagem Mental: Queixo reforçado (+15 Chin HP inicial) e menor risco de knockdown',
          headline: `DETERMINAÇÃO: "${fighter.name} afirma estar psicologicamente e fisicamente indestrutível"`
        },
        {
          id: 'family_roots',
          type: 'HEART',
          badge: '🩸 SANGUE NO TABLADO / PELO MEU POVO',
          text: `"Eu represento minha bandeira, minha equipe e todos que acreditaram em mim quando eu não tinha nada. Vou deixar meu sangue e minha alma naquele tablado."`,
          fameGain: 30,
          moralGain: 40,
          fightIqGain: 0,
          cashBonus: 0,
          staminaBonus: 10,
          effectDesc: '🩸 Fúria Heroica (+40 Moral e bônus de superação quando com baixa vida)',
          headline: `EMOÇÃO: "${fighter.name} emociona a todos: 'Vou deixar minha alma naquele tablado'"`
        }
      ]
    },
    {
      id: 'q_staredown',
      journalistName: 'Promoter Oficial da Noite',
      mediaOutlet: 'Comissão Atlética & TV',
      outletBadge: 'MOMENTO DECISIVO',
      question: `Chegou o momento culminante da coletiva mundial: A GRANDE ENCARADA OFICIAL (STAREDOWN)! O rival se levanta e fica cara a cara com você a poucos centímetros. Qual é a sua postura?`,
      options: [
        {
          id: 'faceoff_predator',
          type: 'PREDATOR',
          badge: '👁️ OLHAR GELADO DE PREDADOR (SEM PISCAR)',
          text: `Você caminha lentamente até o centro do palco, cola os olhos nos olhos de ${opp.shortName} a dez centímetros de distância, sem piscar e com respiração gelada. O adversário engole seco e desvia o olhar após alguns segundos!`,
          fameGain: 35,
          moralGain: 20,
          fightIqGain: 10,
          cashBonus: 0,
          staminaBonus: 0,
          effectDesc: '👁️ Intimidação Psicológica: O rival inicia o combate hesitante no 1º minuto',
          headline: `CLIMA PESADO: "Olhar de predador de ${fighter.name} faz ${opp.shortName} desviar a visão na encarada!"`
        },
        {
          id: 'faceoff_brawl',
          type: 'BRAWL',
          badge: '🔥 TESTA COM TESTA & DEDO EM RISTE (TENSÃO MÁXIMA)',
          text: `Você cola a testa na dele, aponta o dedo na cara do oponente e dispara: "Amanhã você vai cair duro!". O rival te empurra e os seguranças pulam no meio para evitar a briga no palco! Câmeras do mundo todo registram o tumulto!`,
          fameGain: 65,
          moralGain: 10,
          fightIqGain: 0,
          cashBonus: 1500,
          staminaBonus: 0,
          effectDesc: '🔥 Viral Global: Fama +65, +$1.500 bônus de audiência | Arena entra fervendo',
          headline: `QUASE SAÍRAM NA MÃO! "Seguranças intervêm para separar briga na pesagem entre ${fighter.name} e ${opp.shortName}!"`
        },
        {
          id: 'faceoff_smirk',
          type: 'SMIRK',
          badge: '😏 SORRISO CALMO E IRONIA SUPERIOR',
          text: `Você cruza os braços, relaxa a postura e solta um sorriso sereno, olhando de cima a baixo para ${opp.shortName} como quem diz: "Você sabe exatamente o que te espera". O rival fica visivelmente incomodado com sua calma!`,
          fameGain: 30,
          moralGain: 30,
          fightIqGain: 15,
          cashBonus: 0,
          staminaBonus: 0,
          effectDesc: '😏 Superioridade Zen: Confiança absoluta (+15 Fight IQ e serenidade sob pressão)',
          headline: `SANGUE FRIO: "${fighter.name} desestabiliza ${opp.shortName} com sorriso irônico na encarada!"`
        },
        {
          id: 'faceoff_salute',
          type: 'SALUTE',
          badge: '🤝 TOQUE DE PUNHOS FIRME & HONRA',
          text: `Você estende a mão para um aperto de punhos de aço, olha com firmeza e balança a cabeça em sinal de respeito marcial mútuo. O auditório da imprensa aplaude de pé a demonstração de alto nível esportivo.`,
          fameGain: 25,
          moralGain: 40,
          fightIqGain: 10,
          cashBonus: 500,
          staminaBonus: 0,
          effectDesc: '🤝 Diplomacia dos Campeões (+40 Moral e apoio caloroso da mídia especializada)',
          headline: `EXEMPLO: "Público aplaude de pé a encarada de honra entre ${fighter.name} e ${opp.shortName}!"`
        }
      ]
    }
  ];

  return {
    fight: fight,
    opponent: opp,
    hostIntro: hostIntro,
    rivalOpeningQuote: rivalOpeningQuote,
    isTitle: isTitle,
    isOlympic: isOlympic,
    isCrossStyle: isCrossStyle,
    rounds: rounds,
    questions: questions
  };
}
