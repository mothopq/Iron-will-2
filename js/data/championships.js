// championships.js - Banco de dados com 15 Campeonatos Reais por Modalidade:
// Boxe, Muay Thai, MMA, Jiu-Jitsu, Judô, Wrestling e Kickboxing
// Níveis: Municipal (Base, Intermunicipal, Metropolitano), Estadual (Seletiva, Oficial, Supercopa),
// Nacional (Interestadual, Copa Brasil, Brasileiro Oficial, Nacional Pro),
// Continental (Mercosul, Sul-Americano Oficial, Pan-Americano),
// Mundial (Liga Internacional Contender, Disputa de Cinturão Mundial Unificado) e Jogos Olímpicos (a cada 4 anos)

import { generateOpponent, MODALITY_LABELS } from '../models/OpponentGenerator.js';

export function isOlympicYear(careerYear) {
  return careerYear > 0 && careerYear % 4 === 0;
}

export function getYearsToNextOlympics(careerYear) {
  const remainder = careerYear % 4;
  return remainder === 0 ? 0 : 4 - remainder;
}

// Checadores de desbloqueio por idade e experiência
export function isEstadualUnlocked(fighter, minFights = 2) {
  return fighter.age >= 15 && fighter.record.fights >= minFights;
}

export function isNacionalUnlocked(fighter, minFights = 5) {
  const hasStateTitle = (fighter.titlesHeld || []).some(t => {
    const s = typeof t === 'string' ? t : (t.title || '');
    return s.toLowerCase().includes('estadual') || s.toLowerCase().includes('taça') || s.toLowerCase().includes('copa');
  });
  return fighter.age >= 16 && (fighter.record.fights >= minFights || hasStateTitle);
}

export function isContinentalUnlocked(fighter, minFights = 6) {
  const hasNationalTitle = (fighter.titlesHeld || []).some(t => {
    const s = typeof t === 'string' ? t : (t.title || '');
    return s.toLowerCase().includes('nacional') || s.toLowerCase().includes('brasileiro') || s.toLowerCase().includes('estadual');
  });
  return fighter.age >= 17 && (fighter.record.fights >= minFights || hasNationalTitle);
}

export function isOlympicEligible(fighter) {
  return fighter.age >= 16 && fighter.record.fights >= 6;
}

export function isUfcUnlocked(fighter, minFights = 8, minWins = 6) {
  if (fighter.age < 18) return false;
  return (fighter.record.fights >= minFights && fighter.record.wins >= minWins) ||
         (fighter.ranking && fighter.ranking <= 15) ||
         fighter.fame >= 30;
}

// =========================================================================
// CÁLCULO REALISTA DE QUANTIDADE DE ROUNDS E TEMPO POR CAMPEONATO
// =========================================================================
export function calculateChampionshipRounds(category, tier, modalityId = 'boxing', isTitle = false, isOlympic = false) {
  // 1. Regra Olímpica Oficial
  if (isOlympic) {
    return {
      rounds: 3,
      roundDurationSec: 180,
      roundsDescription: '3 Rounds de 3 min (Regulamento Olímpico Oficial)'
    };
  }

  // 2. Boxe Profissional (Nobre Arte)
  // Amador/Base: 4 rounds | Estadual: 6 rounds | Nacional: 8 rounds | Continental: 10 rounds | Mundial/Cinturão: 12 rounds
  if (modalityId === 'boxing') {
    if (category === 'ufc' || category === 'mundial' || tier === 'MUNDIAL' || isTitle) {
      if (category === 'ufc' || category === 'mundial' || (isTitle && (category === 'continental' || category === 'nacional'))) {
        return {
          rounds: 12,
          roundDurationSec: 180,
          roundsDescription: '12 Rounds de 3 min (Disputa de Cinturão Mundial Unificado)'
        };
      }
      return {
        rounds: 10,
        roundDurationSec: 180,
        roundsDescription: '10 Rounds de 3 min (Disputa de Título / Contender)'
      };
    }
    if (category === 'continental') {
      return {
        rounds: 10,
        roundDurationSec: 180,
        roundsDescription: '10 Rounds de 3 min (Campeonato Continental Oficial)'
      };
    }
    if (category === 'nacional') {
      return {
        rounds: 8,
        roundDurationSec: 180,
        roundsDescription: '8 Rounds de 3 min (Campeonato Nacional Oficial)'
      };
    }
    if (category === 'estadual') {
      return {
        rounds: 6,
        roundDurationSec: 180,
        roundsDescription: '6 Rounds de 3 min (Campeonato Estadual)'
      };
    }
    // Municipal / Base Amadora
    return {
      rounds: 4,
      roundDurationSec: 180,
      roundsDescription: '4 Rounds de 3 min (Circuito de Base Amadora)'
    };
  }

  // 3. MMA (Artes Marciais Mistas)
  // Lutas comuns: 3 rounds de 5 min (300s) | Cinturão / Main Event Mundial: 5 rounds de 5 min (300s)
  if (modalityId === 'mma') {
    if (category === 'ufc' || category === 'mundial' || isTitle || tier === 'MUNDIAL') {
      return {
        rounds: 5,
        roundDurationSec: 300,
        roundsDescription: '5 Rounds de 5 min (Cinturão Mundial / Main Event de MMA)'
      };
    }
    return {
      rounds: 3,
      roundDurationSec: 300,
      roundsDescription: '3 Rounds de 5 min (Regulamento Unificado de MMA)'
    };
  }

  // 4. Muay Thai & Kickboxing
  // Base: 3 rounds de 3 min | Títulos e Campeonatos Oficiais: 5 rounds de 3 min
  if (modalityId === 'muay_thai' || modalityId === 'kickboxing') {
    if (category === 'ufc' || category === 'mundial' || category === 'continental' || category === 'nacional' || isTitle || tier === 'ELITE' || tier === 'MUNDIAL') {
      return {
        rounds: 5,
        roundDurationSec: 180,
        roundsDescription: '5 Rounds de 3 min (Regulamento Profissional Oficial)'
      };
    }
    if (category === 'estadual') {
      return {
        rounds: 4,
        roundDurationSec: 180,
        roundsDescription: '4 Rounds de 3 min (Campeonato Estadual)'
      };
    }
    return {
      rounds: 3,
      roundDurationSec: 180,
      roundsDescription: '3 Rounds de 3 min (Base Amadora / Estreantes)'
    };
  }

  // 5. Jiu-Jitsu / Judô / Wrestling
  if (category === 'ufc' || category === 'mundial' || tier === 'MUNDIAL' || isTitle) {
    return {
      rounds: 5,
      roundDurationSec: 180,
      roundsDescription: '5 Rounds Táticos de 3 min (Finais de Grand Slam / Mundial)'
    };
  }
  if (category === 'nacional' || category === 'continental' || tier === 'ELITE') {
    return {
      rounds: 4,
      roundDurationSec: 180,
      roundsDescription: '4 Rounds Táticos de 3 min (Fase Final de Eliminatórias)'
    };
  }
  return {
    rounds: 3,
    roundDurationSec: 180,
    roundsDescription: '3 Rounds Táticos de 3 min (Chave Preliminar de Base)'
  };
}

// =========================================================================
// BANCO DE DADOS: 15 CAMPEONATOS REAIS POR MODALIDADE DE LUTA
// =========================================================================
export const TOURNAMENTS_DATABASE = {
  // -----------------------------------------------------------------------
  // 1. BOXE (Nobre Arte) - 15 Campeonatos Reais
  // -----------------------------------------------------------------------
  boxing: [
    {
      tier: 'local_1',
      category: 'local',
      categoryLabel: 'MUNICIPAL / BASE',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Torneio Municipal Forja dos Campeões (${city})`,
      tag: '🥊 Circuito de Base Municipal',
      desc: 'O mais tradicional torneio de base do boxe nacional. Ideal para soltar os primeiros golpes e iniciar o cartel amador.',
      titleTemplate: (city) => `Troféu Forja de Campeões de ${city}`,
      isTitle: false,
      minAge: 8,
      minFights: 0,
      basePurse: 350,
      purseMult: 25,
      diffMod: 1.04
    },
    {
      tier: 'local_2',
      category: 'local',
      categoryLabel: 'INTERMUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: () => `Torneio Regional Luvas de Prata Aberto`,
      tag: '⚡ Circuito Intermunicipal de Boxe',
      desc: 'Disputa entre as melhores academias e polos de boxe da região metropolitana. Ritmo acelerado e combates intensos.',
      titleTemplate: () => `Medalha de Prata Intermunicipal de Boxe`,
      isTitle: false,
      minAge: 10,
      minFights: 1,
      basePurse: 650,
      purseMult: 35,
      diffMod: 1.07
    },
    {
      tier: 'local_3',
      category: 'local',
      categoryLabel: 'DESAFIO MUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Copa Metropolitana de Boxe Amador (${city})`,
      tag: '🥇 Desafio dos Melhores de Base',
      desc: 'Confronto entre os atletas mais destacados dos centros de treinamento municipais antes de ingressar no circuito federado.',
      titleTemplate: (city) => `Taça Metropolitana de Boxe (${city})`,
      isTitle: false,
      minAge: 12,
      minFights: 1,
      basePurse: 900,
      purseMult: 45,
      diffMod: 1.10
    },
    {
      tier: 'estadual_1',
      category: 'estadual',
      categoryLabel: 'SELETIVA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Seletiva Classificatória da Federação Estadual de Boxe (${state})`,
      tag: '🥊 Etapa Classificatória Oficial',
      desc: 'Fase de ranqueamento oficial da federação do estado. Vitórias aqui garantem chaveamento favorável no campeonato titular.',
      titleTemplate: (_, state) => `Troféu Ranqueamento Estadual de Boxe (${state})`,
      isTitle: false,
      minAge: 15,
      minFights: 2,
      basePurse: 1400,
      purseMult: 60,
      diffMod: 1.12
    },
    {
      tier: 'estadual_2',
      category: 'estadual',
      categoryLabel: 'CAMPEONATO ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Campeonato Estadual Oficial da Federação de Boxe (${state})`,
      tag: '🏆 Disputa Oficial de Cinturão Estadual',
      desc: 'A elite dos pugilistas do estado disputando o prestigioso cinturão oficial da federação estadual.',
      titleTemplate: (_, state) => `Cinturão Estadual Oficial de Boxe (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 2,
      basePurse: 2400,
      purseMult: 80,
      diffMod: 1.15
    },
    {
      tier: 'estadual_3',
      category: 'estadual',
      categoryLabel: 'SUPERCOPA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Copa dos Campeões Estaduais – Troféu Luvas de Ouro (${state})`,
      tag: '🥇 Supercopa dos Melhores do Estado',
      desc: 'Torneio anual fechado reunindo apenas os campeões e finalistas das federações do estado.',
      titleTemplate: (_, state) => `Troféu Luvas de Ouro Estadual de Boxe (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 3,
      basePurse: 3800,
      purseMult: 110,
      diffMod: 1.17
    },
    {
      tier: 'nacional_1',
      category: 'nacional',
      categoryLabel: 'INTERESTADUAL',
      badgeClass: 'badge-nacional',
      nameTemplate: (city, state, country) => `Taça Interestadual de Boxe das Federações (${country})`,
      tag: '🇧🇷 Duelo Entre Seleções Estaduais',
      desc: 'Confronto interestadual entre os melhores atletas das federações do Sul, Sudeste e Nordeste.',
      titleTemplate: () => `Taça Interestadual de Boxe Olímpico`,
      isTitle: true,
      minAge: 16,
      minFights: 4,
      basePurse: 4800,
      purseMult: 130,
      diffMod: 1.18
    },
    {
      tier: 'nacional_2',
      category: 'nacional',
      categoryLabel: 'COPA DO BRASIL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Copa Brasil Aberta de Boxe Olímpico`,
      tag: '🥊 Circuito Nacional de Alto Rendimento',
      desc: 'Torneio aberto de nível nacional organizado para reunir os principais nomes que buscam vaga na seleção brasileira.',
      titleTemplate: () => `Troféu da Copa Brasil de Boxe`,
      isTitle: false,
      minAge: 16,
      minFights: 4,
      basePurse: 6200,
      purseMult: 150,
      diffMod: 1.20
    },
    {
      tier: 'nacional_3',
      category: 'nacional',
      categoryLabel: 'CAMPEONATO BRASILEIRO',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Campeonato Brasileiro de Boxe Olímpico (CBBoxe Oficial)`,
      tag: '🇧🇷 O Título Nacional Máximo da Confederação',
      desc: 'A principal competição de boxe do país chancelada pela CBBoxe. O vencedor é aclamado campeão brasileiro oficial.',
      titleTemplate: () => `Campeão Brasileiro de Boxe (CBBoxe Oficial)`,
      isTitle: true,
      minAge: 16,
      minFights: 5,
      basePurse: 8500,
      purseMult: 180,
      diffMod: 1.22
    },
    {
      tier: 'nacional_4',
      category: 'nacional',
      categoryLabel: 'NACIONAL PROFISSIONAL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Conselho Nacional de Boxe Profissional (CNB Titular)`,
      tag: '👑 Cinturão Profissional do Brasil',
      desc: 'Disputa de 10 rounds sob as regras do boxe profissional chancelada pelo Conselho Nacional de Boxe.',
      titleTemplate: () => `Cinturão do Conselho Nacional de Boxe (CNB Pro)`,
      isTitle: true,
      minAge: 16,
      minFights: 6,
      basePurse: 12000,
      purseMult: 220,
      diffMod: 1.24
    },
    {
      tier: 'continental_1',
      category: 'continental',
      categoryLabel: 'COPA MERCOSUL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Torneio Mercosul de Boxe Profissional`,
      tag: '🌎 Circuito Sul-Americano de Clubes',
      desc: 'Combates internacionais contra os melhores pugilistas da Argentina, Uruguai, Chile e Brasil.',
      titleTemplate: () => `Troféu Mercosul de Boxe Profissional`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 16000,
      purseMult: 260,
      diffMod: 1.25
    },
    {
      tier: 'continental_2',
      category: 'continental',
      categoryLabel: 'SUL-AMERICANO OFICIAL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Sul-Americano de Boxe Profissional (FESUBOX)`,
      tag: '🌎 Cinturão Oficial da América do Sul',
      desc: 'O título mais cobiçado da América do Sul regido pela Federação Sul-Americana de Boxe (FESUBOX).',
      titleTemplate: () => `Cinturão Sul-Americano FESUBOX de Boxe Profissional`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 22000,
      purseMult: 320,
      diffMod: 1.26
    },
    {
      tier: 'continental_3',
      category: 'continental',
      categoryLabel: 'PAN-AMERICANO',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Pan-Americano de Boxe (AMBC / WBO Latino)`,
      tag: '🌎 Cinturão das Américas & WBO Latino',
      desc: 'Pugilistas de todo o continente americano disputando o topo do ranking continental e a rota direta para o título mundial.',
      titleTemplate: () => `Cinturão Pan-Americano AMBC / WBO Latino de Boxe`,
      isTitle: true,
      minAge: 17,
      minFights: 7,
      basePurse: 32000,
      purseMult: 380,
      diffMod: 1.27
    },
    {
      tier: 'ufc_1',
      category: 'ufc',
      categoryLabel: 'MUNDIAL PRO CONTENDER',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `Top Rank Boxing World Series: Main Card Global`,
      tag: '📺 Transmissão Global em Las Vegas e Nova York',
      desc: 'Combate televisionado internacionalmente nos maiores ringues do mundo promovido pelas maiores promotoras do boxe.',
      titleTemplate: () => `Troféu Top Rank World Series Contender`,
      isTitle: false,
      minAge: 18,
      minFights: 8,
      minWins: 6,
      basePurse: 55000,
      purseMult: 480,
      diffMod: 1.28
    },
    {
      tier: 'ufc_2',
      category: 'ufc',
      categoryLabel: 'TÍTULO MUNDIAL UNIFICADO',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `WBC / WBA Superfight de Unificação Mundial PPV`,
      tag: '👑 Cinturão Verde e Ouro Mundial do WBC / WBA',
      desc: 'O topo absoluto do boxe do planeta Terra. Disputa do cinturão mundial indiscutível em Las Vegas com transmissão pay-per-view global.',
      titleTemplate: () => `Cinturão Mundial Unificado WBC / WBA de Boxe`,
      isTitle: true,
      minAge: 18,
      minFights: 10,
      minWins: 8,
      basePurse: 110000,
      purseMult: 800,
      diffMod: 1.30
    }
  ],

  // -----------------------------------------------------------------------
  // 2. MUAY THAI (A Arte das Oito Armas) - 15 Campeonatos Reais
  // -----------------------------------------------------------------------
  muay_thai: [
    {
      tier: 'local_1',
      category: 'local',
      categoryLabel: 'MUNICIPAL / BASE',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Copa Municipal Aberta de Muay Thai Tradicional (${city})`,
      tag: '🥊 Circuito de Base Municipal de Muay Thai',
      desc: 'Estreia oficial no ringue de Muay Thai com regras amadoras completas (socos, chutes e clinch controlado).',
      titleTemplate: (city) => `Medalha de Ouro Municipal de Muay Thai de ${city}`,
      isTitle: false,
      minAge: 8,
      minFights: 0,
      basePurse: 350,
      purseMult: 25,
      diffMod: 1.04
    },
    {
      tier: 'local_2',
      category: 'local',
      categoryLabel: 'INTERMUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: () => `Torneio Regional Estrelas do Ringue de Muay Thai`,
      tag: '⚡ Circuito Intermunicipal de Striking',
      desc: 'Confronto entre academias regionais com clinch intenso e ritmo de cotovelos almofadados.',
      titleTemplate: () => `Troféu Estrelas do Ringue Intermunicipal`,
      isTitle: false,
      minAge: 10,
      minFights: 1,
      basePurse: 650,
      purseMult: 35,
      diffMod: 1.07
    },
    {
      tier: 'local_3',
      category: 'local',
      categoryLabel: 'DESAFIO MUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Desafio Metropolitano Amador de Muay Thai (${city})`,
      tag: '🥇 Prova de Fogo Municipal',
      desc: 'Combates de alta intensidade entre os nak muays mais duros da região metropolitana.',
      titleTemplate: (city) => `Taça Metropolitana de Muay Thai (${city})`,
      isTitle: false,
      minAge: 12,
      minFights: 1,
      basePurse: 900,
      purseMult: 45,
      diffMod: 1.10
    },
    {
      tier: 'estadual_1',
      category: 'estadual',
      categoryLabel: 'SELETIVA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Seletiva Estadual da Federação de Muay Thai (${state})`,
      tag: '🥊 Ranqueamento Oficial da Federação',
      desc: 'Etapa que define os melhores atletas federados para a disputa do cinturão estadual da temporada.',
      titleTemplate: (_, state) => `Troféu Seletiva Estadual de Muay Thai (${state})`,
      isTitle: false,
      minAge: 15,
      minFights: 2,
      basePurse: 1400,
      purseMult: 60,
      diffMod: 1.12
    },
    {
      tier: 'estadual_2',
      category: 'estadual',
      categoryLabel: 'CAMPEONATO ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Campeonato Estadual Oficial da Federação de Muay Thai (${state})`,
      tag: '🏆 Disputa Oficial do Mongkhon Estadual',
      desc: 'A principal competição estadual chancelada pela federação. O vencedor recebe o Mongkhon e Prajied de campeão oficial.',
      titleTemplate: (_, state) => `Mongkhon de Ouro Estadual de Muay Thai (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 2,
      basePurse: 2400,
      purseMult: 80,
      diffMod: 1.15
    },
    {
      tier: 'estadual_3',
      category: 'estadual',
      categoryLabel: 'SUPERCOPA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Super Taça dos Campeões Estaduais de Muay Thai (${state})`,
      tag: '🥇 Torneio dos Campeões Estaduais',
      desc: 'Superluta reunindo os maiores nomes do estado sob regras completas e ritmo implacável.',
      titleTemplate: (_, state) => `Cinturão da Super Taça Estadual de Muay Thai (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 3,
      basePurse: 3800,
      purseMult: 110,
      diffMod: 1.17
    },
    {
      tier: 'nacional_1',
      category: 'nacional',
      categoryLabel: 'INTERESTADUAL',
      badgeClass: 'badge-nacional',
      nameTemplate: (city, state, country) => `Taça Interestadual de Muay Thai Regional (${country})`,
      tag: '🇧🇷 Desafio Entre Estados Tradicionais',
      desc: 'Torneio interestadual entre os principais centros de treinamento de Muay Thai do Brasil.',
      titleTemplate: () => `Taça Interestadual de Muay Thai Tradicional`,
      isTitle: true,
      minAge: 16,
      minFights: 4,
      basePurse: 4800,
      purseMult: 130,
      diffMod: 1.18
    },
    {
      tier: 'nacional_2',
      category: 'nacional',
      categoryLabel: 'COPA DO BRASIL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Copa do Brasil Aberta de Muay Thai Profissional`,
      tag: '🥊 Circuito Nacional de Elite',
      desc: 'Copa nacional reunindo atletas profissionais disputando ranqueamento para o circuito internacional.',
      titleTemplate: () => `Troféu Copa do Brasil de Muay Thai Pro`,
      isTitle: false,
      minAge: 16,
      minFights: 4,
      basePurse: 6200,
      purseMult: 150,
      diffMod: 1.20
    },
    {
      tier: 'nacional_3',
      category: 'nacional',
      categoryLabel: 'CAMPEONATO BRASILEIRO',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Campeonato Brasileiro de Muay Thai Tradicional (CBMTT / FEBRAMT)`,
      tag: '🇧🇷 Título Brasileiro Máximo da Confederação',
      desc: 'A principal glória do Muay Thai nacional com os melhores strikers do país em 5 rounds clássicos com Sarama.',
      titleTemplate: () => `Campeão Brasileiro de Muay Thai Tradicional (CBMTT / FEBRAMT)`,
      isTitle: true,
      minAge: 16,
      minFights: 5,
      basePurse: 8500,
      purseMult: 180,
      diffMod: 1.22
    },
    {
      tier: 'nacional_4',
      category: 'nacional',
      categoryLabel: 'NACIONAL PROFISSIONAL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `WMBF Brasil Pro / Copa Nacional de Muay Thai Profissional`,
      tag: '👑 Cinturão Nacional Profissional',
      desc: 'Disputa de cinturão profissional com regras tailandesas completas chancelada pela WMBF Brasil.',
      titleTemplate: () => `Cinturão WMBF Brasil Pro de Muay Thai`,
      isTitle: true,
      minAge: 16,
      minFights: 6,
      basePurse: 12000,
      purseMult: 220,
      diffMod: 1.24
    },
    {
      tier: 'continental_1',
      category: 'continental',
      categoryLabel: 'COPA MERCOSUL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Copa Mercosul Tradicional de Muay Thai`,
      tag: '🌎 Circuito Sul-Americano de Estádios',
      desc: 'Enfrentamento de alto nível contra os melhores atletas da América Latina.',
      titleTemplate: () => `Troféu Mercosul Tradicional de Muay Thai`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 16000,
      purseMult: 260,
      diffMod: 1.25
    },
    {
      tier: 'continental_2',
      category: 'continental',
      categoryLabel: 'SUL-AMERICANO OFICIAL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Sul-Americano de Muay Thai (CSMT / WMO South America)`,
      tag: '🌎 Cinturão Oficial da América do Sul',
      desc: 'A disputa máxima continental chancelada pela WMO South America e Confederação Sul-Americana.',
      titleTemplate: () => `Cinturão Sul-Americano WMO / CSMT de Muay Thai`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 22000,
      purseMult: 320,
      diffMod: 1.26
    },
    {
      tier: 'continental_3',
      category: 'continental',
      categoryLabel: 'PAN-AMERICANO',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Pan-American Muay Thai Championship (IFMA Pan-Am)`,
      tag: '🌎 Torneio Pan-Americano Oficial IFMA',
      desc: 'Os maiores expoentes de Muay Thai de todas as Américas em rota direta para o circuito mundial.',
      titleTemplate: () => `Campeão Pan-Americano IFMA de Muay Thai`,
      isTitle: true,
      minAge: 17,
      minFights: 7,
      basePurse: 32000,
      purseMult: 380,
      diffMod: 1.27
    },
    {
      tier: 'ufc_1',
      category: 'ufc',
      categoryLabel: 'ONE CHAMPIONSHIP GP',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `ONE Championship: Muay Thai World Grand Prix`,
      tag: '📺 Transmissão Global com Luvas de 4oz no ONE',
      desc: 'O maior espetáculo de trocação do planeta. Lutas com luvas de MMA de 4 onças com bônus milionários por nocaute.',
      titleTemplate: () => `Cinturão Mundial do ONE Championship Muay Thai`,
      isTitle: true,
      minAge: 18,
      minFights: 8,
      minWins: 6,
      basePurse: 55000,
      purseMult: 480,
      diffMod: 1.28
    },
    {
      tier: 'ufc_2',
      category: 'ufc',
      categoryLabel: 'ESTÁDIO LUMPINEE & RAJADAMNERN',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `Estádio Lumpinee & Rajadamnern: Disputa de Cinturão de Ouro`,
      tag: '👑 O Santo Graal do Muay Thai na Tailândia',
      desc: 'O ápice da carreira de qualquer nak muay na história da humanidade. Luta pelo lendário cinturão no berço de Bangkok.',
      titleTemplate: () => `Cinturão de Ouro Histórico do Lumpinee / Rajadamnern`,
      isTitle: true,
      minAge: 18,
      minFights: 10,
      minWins: 8,
      basePurse: 110000,
      purseMult: 800,
      diffMod: 1.30
    }
  ],

  // -----------------------------------------------------------------------
  // 3. MMA (Artes Marciais Mistas) - 15 Campeonatos Reais
  // -----------------------------------------------------------------------
  mma: [
    {
      tier: 'local_1',
      category: 'local',
      categoryLabel: 'MUNICIPAL / BASE',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Circuito Amador Municipal de MMA no Cage (${city})`,
      tag: '🥊 Circuito de Base de MMA Amador',
      desc: 'Estreia no octógono com caneleiras e luvas de proteção. Foco em integrar striking, wrestling e finalizações.',
      titleTemplate: (city) => `Troféu Circuito Amador de MMA de ${city}`,
      isTitle: false,
      minAge: 8,
      minFights: 0,
      basePurse: 350,
      purseMult: 25,
      diffMod: 1.04
    },
    {
      tier: 'local_2',
      category: 'local',
      categoryLabel: 'INTERMUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: () => `Open Cage Regional de Artes Marciais Mistas`,
      tag: '⚡ Desafio Regional Intermunicipal',
      desc: 'Evento entre equipes regionais de MMA. Ideal para ganhar experiência e soltar o jogo de grade.',
      titleTemplate: () => `Medalha de Honra Open Cage Regional`,
      isTitle: false,
      minAge: 10,
      minFights: 1,
      basePurse: 650,
      purseMult: 35,
      diffMod: 1.07
    },
    {
      tier: 'local_3',
      category: 'local',
      categoryLabel: 'DESAFIO MUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Desafio Metropolitano de Novos Talentos do MMA (${city})`,
      tag: '🥇 Desafio dos Futuros Astros do Cage',
      desc: 'Confronto entre os atletas mais promissores das academias metropolitanas antes da profissionalização.',
      titleTemplate: (city) => `Taça Metropolitana Novos Talentos de MMA (${city})`,
      isTitle: false,
      minAge: 12,
      minFights: 1,
      basePurse: 900,
      purseMult: 45,
      diffMod: 1.10
    },
    {
      tier: 'estadual_1',
      category: 'estadual',
      categoryLabel: 'SELETIVA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Seletiva Classificatória Estadual de MMA (${state})`,
      tag: '🥊 Chaveamento Oficial do Estado',
      desc: 'Etapa que classifica os melhores lutadores para os grandes cards estaduais com transmissão ao vivo.',
      titleTemplate: (_, state) => `Troféu Seletiva Estadual de MMA (${state})`,
      isTitle: false,
      minAge: 15,
      minFights: 2,
      basePurse: 1400,
      purseMult: 60,
      diffMod: 1.12
    },
    {
      tier: 'estadual_2',
      category: 'estadual',
      categoryLabel: 'CAMPEONATO ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Campeonato Estadual Oficial de MMA (${state})`,
      tag: '🏆 Cinturão Oficial da Federação Estadual de MMA',
      desc: 'Disputa de 5 rounds valendo o cinturão oficial de melhor atleta do estado em sua categoria.',
      titleTemplate: (_, state) => `Cinturão Estadual Oficial de MMA (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 2,
      basePurse: 2400,
      purseMult: 80,
      diffMod: 1.15
    },
    {
      tier: 'estadual_3',
      category: 'estadual',
      categoryLabel: 'SHOOTO BRASIL REGIONAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Shooto Brasil – Edição Estadual (${state})`,
      tag: '🥇 O Mais Tradicional Evento de Base do Planeta',
      desc: 'O evento histórico que revelou os maiores campeões do UFC. Lutas transmitidas com olheiros no corner.',
      titleTemplate: (_, state) => `Cinturão Shooto Brasil Estadual (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 3,
      basePurse: 3800,
      purseMult: 110,
      diffMod: 1.17
    },
    {
      tier: 'nacional_1',
      category: 'nacional',
      categoryLabel: 'INTERESTADUAL',
      badgeClass: 'badge-nacional',
      nameTemplate: (city, state, country) => `Taça Interestadual de MMA Profissional (${country})`,
      tag: '🇧🇷 Desafio Entre Estados de MMA',
      desc: 'Combates interestaduais reunindo promessas do Rio de Janeiro, São Paulo, Paraná e Amazonas.',
      titleTemplate: () => `Troféu Interestadual de MMA Profissional`,
      isTitle: true,
      minAge: 16,
      minFights: 4,
      basePurse: 4800,
      purseMult: 130,
      diffMod: 1.18
    },
    {
      tier: 'nacional_2',
      category: 'nacional',
      categoryLabel: 'COPA DO BRASIL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Copa do Brasil de MMA / Demolidor Fight`,
      tag: '🥊 O Torneio Sem Moleza do MMA Nacional',
      desc: 'Card profissional com clima de guerra e ringue em chamas. Quem vence ganha destaque nos rankings nacionais.',
      titleTemplate: () => `Troféu Demolidor Fight Copa do Brasil`,
      isTitle: false,
      minAge: 16,
      minFights: 4,
      basePurse: 6200,
      purseMult: 150,
      diffMod: 1.20
    },
    {
      tier: 'nacional_3',
      category: 'nacional',
      categoryLabel: 'JUNGLE FIGHT',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Jungle Fight Championship (O Maior Evento da América Latina)`,
      tag: '🇧🇷 A Selva Oficial do MMA Profissional',
      desc: 'A selva! A maior organização de MMA da América Latina e principal passaporte de brasileiros para o UFC.',
      titleTemplate: () => `Cinturão do Jungle Fight Championship`,
      isTitle: true,
      minAge: 16,
      minFights: 5,
      basePurse: 8500,
      purseMult: 180,
      diffMod: 1.22
    },
    {
      tier: 'nacional_4',
      category: 'nacional',
      categoryLabel: 'LFA BRASIL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `LFA Brasil: Legacy Fighting Alliance Championship`,
      tag: '📺 Transmissão Global no UFC Fight Pass',
      desc: 'O maior celeiro de talentos do planeta. A LFA é a rota direta para os contratos do UFC e Contender Series.',
      titleTemplate: () => `Cinturão da Legacy Fighting Alliance (LFA Brasil)`,
      isTitle: true,
      minAge: 16,
      minFights: 6,
      basePurse: 12000,
      purseMult: 220,
      diffMod: 1.24
    },
    {
      tier: 'continental_1',
      category: 'continental',
      categoryLabel: 'SUL-AMERICANA DE MMA',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Copa Sul-Americana de MMA (Mercosul Fight League)`,
      tag: '🌎 Disputa Continental da Sul-Americana',
      desc: 'Torneio continental entre os maiores cages do Brasil, Argentina, Uruguai e Paraguai.',
      titleTemplate: () => `Cinturão da Copa Sul-Americana de MMA`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 16000,
      purseMult: 260,
      diffMod: 1.25
    },
    {
      tier: 'continental_2',
      category: 'continental',
      categoryLabel: 'CSMMA CONTINENTAL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Sul-Americano Profissional de MMA (CSMMA)`,
      tag: '🌎 Título Oficial dos Pesos da América do Sul',
      desc: 'Disputa de 5 rounds pelo cinturão oficial da Confederação Sul-Americana de MMA.',
      titleTemplate: () => `Cinturão Sul-Americano CSMMA de MMA`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 22000,
      purseMult: 320,
      diffMod: 1.26
    },
    {
      tier: 'continental_3',
      category: 'continental',
      categoryLabel: 'PFL CONTINENTAL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `PFL (Professional Fighters League) Eliminatórias Continentais`,
      tag: '🌎 Temporada Regular da PFL Américas',
      desc: 'O torneio em formato de temporada da PFL com sistema de pontos e eliminatórias para o prêmio de US$ 1 milhão.',
      titleTemplate: () => `Campeão da Eliminatória Continental PFL`,
      isTitle: true,
      minAge: 17,
      minFights: 7,
      basePurse: 32000,
      purseMult: 380,
      diffMod: 1.27
    },
    {
      tier: 'ufc_1',
      category: 'ufc',
      categoryLabel: 'UFC FIGHT NIGHT',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `UFC Fight Night: Main Card Oficial`,
      tag: '📺 O Octógono Mais Famoso do Mundo',
      desc: 'Você chegou à maior organização de artes marciais mistas do planeta. Luta televisionada globalmente no card principal.',
      titleTemplate: () => `Vitória no Main Card do UFC Fight Night`,
      isTitle: false,
      minAge: 18,
      minFights: 8,
      minWins: 6,
      basePurse: 55000,
      purseMult: 480,
      diffMod: 1.28
    },
    {
      tier: 'ufc_2',
      category: 'ufc',
      categoryLabel: 'CINTURÃO DO UFC (PPV)',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `UFC Pay-Per-View: Disputa de Cinturão Mundial Indiscutível`,
      tag: '👑 O Cinturão Mais Cobiçado da História dos Esportes',
      desc: 'O ápice da carreira de um lutador de MMA. A disputa do cinturão dourado do UFC diante do mundo inteiro.',
      titleTemplate: () => `Cinturão Mundial Indiscutível do UFC`,
      isTitle: true,
      minAge: 18,
      minFights: 10,
      minWins: 8,
      basePurse: 110000,
      purseMult: 800,
      diffMod: 1.30
    }
  ],

  // -----------------------------------------------------------------------
  // 4. JIU-JITSU (Arte Suave / BJJ) - 15 Campeonatos Reais
  // -----------------------------------------------------------------------
  jiu_jitsu: [
    {
      tier: 'local_1',
      category: 'local',
      categoryLabel: 'MUNICIPAL / BASE',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Copa Municipal Aberta de Jiu-Jitsu (${city})`,
      tag: '🥋 Circuito Aberto de Todas as Faixas',
      desc: 'O primeiro teste no tatame competitivo. Disputas de kimono com regras oficiais de pontuação e vantagens.',
      titleTemplate: (city) => `Medalha de Ouro Municipal de Jiu-Jitsu de ${city}`,
      isTitle: false,
      minAge: 8,
      minFights: 0,
      basePurse: 350,
      purseMult: 25,
      diffMod: 1.04
    },
    {
      tier: 'local_2',
      category: 'local',
      categoryLabel: 'INTERMUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: () => `Circuito Regional de Faixas Open Gi & No-Gi`,
      tag: '⚡ Circuito Intermunicipal com e sem Kimono',
      desc: 'Confrontos de kimono e submission entre as principais equipes e filiais da região metropolitana.',
      titleTemplate: () => `Medalha de Honra do Circuito de Faixas Open`,
      isTitle: false,
      minAge: 10,
      minFights: 1,
      basePurse: 650,
      purseMult: 35,
      diffMod: 1.07
    },
    {
      tier: 'local_3',
      category: 'local',
      categoryLabel: 'DESAFIO MUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Desafio Metropolitano da Arte Suave (${city})`,
      tag: '🥇 Prova dos Faixas Graduadas',
      desc: 'Torneio metropolitano onde raspagens e finalizações rápidas definem os novos talentos do tatame.',
      titleTemplate: (city) => `Taça Metropolitana da Arte Suave (${city})`,
      isTitle: false,
      minAge: 12,
      minFights: 1,
      basePurse: 900,
      purseMult: 45,
      diffMod: 1.10
    },
    {
      tier: 'estadual_1',
      category: 'estadual',
      categoryLabel: 'SELETIVA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Etapa Classificatória do Circuito Estadual de Jiu-Jitsu (${state})`,
      tag: '🥋 Ranqueamento Oficial da Federação',
      desc: 'Etapa que soma pontos preciosos para o ranking da federação estadual de Jiu-Jitsu.',
      titleTemplate: (_, state) => `Troféu Etapa do Estadual de Jiu-Jitsu (${state})`,
      isTitle: false,
      minAge: 15,
      minFights: 2,
      basePurse: 1400,
      purseMult: 60,
      diffMod: 1.12
    },
    {
      tier: 'estadual_2',
      category: 'estadual',
      categoryLabel: 'CAMPEONATO ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Campeonato Estadual Oficial da Federação de Jiu-Jitsu (${state})`,
      tag: '🏆 Ouro Oficial da Federação Estadual',
      desc: 'O campeonato mais importante do estado. Os melhores faixas-pretas e coloridas disputando o pódio estadual.',
      titleTemplate: (_, state) => `Medalha de Ouro Estadual da Federação de Jiu-Jitsu (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 2,
      basePurse: 2400,
      purseMult: 80,
      diffMod: 1.15
    },
    {
      tier: 'estadual_3',
      category: 'estadual',
      categoryLabel: 'ABSOLUTO NO-GI PRO',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Copa Estadual Absoluto Sem Quimono (No-Gi Pro – ${state})`,
      tag: '🥇 Disputa do Absoluto Sem Divisão de Peso',
      desc: 'A categoria absoluta sem quimono onde a técnica refinada supera o tamanho e a força física.',
      titleTemplate: (_, state) => `Troféu de Campeão Absoluto No-Gi Pro (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 3,
      basePurse: 3800,
      purseMult: 110,
      diffMod: 1.17
    },
    {
      tier: 'nacional_1',
      category: 'nacional',
      categoryLabel: 'INTERESTADUAL',
      badgeClass: 'badge-nacional',
      nameTemplate: (city, state, country) => `Troféu Interestadual de Jiu-Jitsu Interclubes (${country})`,
      tag: '🇧🇷 Confronto Interestadual das Grandes Equipes',
      desc: 'Duelo entre as maiores academias do país (Alliance, Gracie Barra, Atos, Checkmat, GFTeam).',
      titleTemplate: () => `Troféu Interestadual de Jiu-Jitsu`,
      isTitle: true,
      minAge: 16,
      minFights: 4,
      basePurse: 4800,
      purseMult: 130,
      diffMod: 1.18
    },
    {
      tier: 'nacional_2',
      category: 'nacional',
      categoryLabel: 'COPA DO BRASIL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Copa do Brasil de Jiu-Jitsu (CBJJO Oficial)`,
      tag: '🥋 O Tradicional Torneio da Arte Suave',
      desc: 'Competição clássica de nível nacional reunindo atletas experientes de todo o território brasileiro.',
      titleTemplate: () => `Troféu Copa do Brasil de Jiu-Jitsu`,
      isTitle: false,
      minAge: 16,
      minFights: 4,
      basePurse: 6200,
      purseMult: 150,
      diffMod: 1.20
    },
    {
      tier: 'nacional_3',
      category: 'nacional',
      categoryLabel: 'BRASILEIRO CBJJ',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Campeonato Brasileiro de Jiu-Jitsu (Brasileiro CBJJ Oficial)`,
      tag: '🇧🇷 O Torneio Mais Difícil e Disputado do Mundo',
      desc: 'O famoso Brasileiro de Barueri. Conquistar o ouro na CBJJ é considerado mais difícil do que muitos mundiais.',
      titleTemplate: () => `Medalha de Ouro no Campeonato Brasileiro de Jiu-Jitsu (CBJJ)`,
      isTitle: true,
      minAge: 16,
      minFights: 5,
      basePurse: 8500,
      purseMult: 180,
      diffMod: 1.22
    },
    {
      tier: 'nacional_4',
      category: 'nacional',
      categoryLabel: 'AJP NATIONAL PRO',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Brazilian National Pro Jiu-Jitsu Championship (AJP Tour Brasil)`,
      tag: '👑 Circuito Profissional de Abu Dhabi no Brasil',
      desc: 'Etapa nacional do circuito de Abu Dhabi valendo passagens aéreas e premiação em dinheiro em dólares.',
      titleTemplate: () => `Troféu AJP Brazilian National Pro de Jiu-Jitsu`,
      isTitle: true,
      minAge: 16,
      minFights: 6,
      basePurse: 12000,
      purseMult: 220,
      diffMod: 1.24
    },
    {
      tier: 'continental_1',
      category: 'continental',
      categoryLabel: 'CIRCUITO MERCOSUL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Circuito Mercosul de Jiu-Jitsu Pro`,
      tag: '🌎 Aberto Sul-Americano de Jiu-Jitsu',
      desc: 'Disputa internacional envolvendo os melhores atletas do continente sul-americano.',
      titleTemplate: () => `Troféu Mercosul de Jiu-Jitsu Pro`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 16000,
      purseMult: 260,
      diffMod: 1.25
    },
    {
      tier: 'continental_2',
      category: 'continental',
      categoryLabel: 'SUL-AMERICANO IBJJF',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Sul-Americano de Jiu-Jitsu (IBJJF South American)`,
      tag: '🌎 O Título Oficial da América do Sul da IBJJF',
      desc: 'O prestigioso Sul-Americano oficial da IBJJF reunindo atletas de todas as federações continentais.',
      titleTemplate: () => `Medalha de Ouro no Sul-Americano IBJJF de Jiu-Jitsu`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 22000,
      purseMult: 320,
      diffMod: 1.26
    },
    {
      tier: 'continental_3',
      category: 'continental',
      categoryLabel: 'PAN IBJJF',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Pan-Americano de Jiu-Jitsu (IBJJF Pan Championship)`,
      tag: '🌎 O Gigantesco Pan da Flórida da IBJJF',
      desc: 'Uma das quatro maiores competições do grand slam do Jiu-Jitsu mundial, reunindo milhares de competidores.',
      titleTemplate: () => `Campeão Pan-Americano de Jiu-Jitsu (IBJJF Pan)`,
      isTitle: true,
      minAge: 17,
      minFights: 7,
      basePurse: 32000,
      purseMult: 380,
      diffMod: 1.27
    },
    {
      tier: 'ufc_1',
      category: 'ufc',
      categoryLabel: 'MUNDIAL DA CALIFÓRNIA',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `World IBJJF Jiu-Jitsu Championship (Mundial da Califórnia)`,
      tag: '🥇 O Título de Campeão Mundial da Pirâmide de Long Beach',
      desc: 'O topo indiscutível do Jiu-Jitsu esportivo de quimono. Subir no topo da Pirâmide de Long Beach imortaliza o atleta.',
      titleTemplate: () => `Campeão Mundial de Jiu-Jitsu (Mundial IBJJF Califórnia)`,
      isTitle: true,
      minAge: 18,
      minFights: 8,
      minWins: 6,
      basePurse: 55000,
      purseMult: 480,
      diffMod: 1.28
    },
    {
      tier: 'ufc_2',
      category: 'ufc',
      categoryLabel: 'ADCC WORLD SUBMISSION',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `ADCC World Championship (As Olimpíadas da Luta Agarrada)`,
      tag: '👑 O Maior Evento de Luta Sem Quimono do Planeta Terra',
      desc: 'As Olimpíadas do Grappling. Regras sem quimono com chaves de calcanhar liberadas e pontos com penalidades severas.',
      titleTemplate: () => `Cinturão do ADCC World Submission Fighting Championship`,
      isTitle: true,
      minAge: 18,
      minFights: 10,
      minWins: 8,
      basePurse: 110000,
      purseMult: 800,
      diffMod: 1.30
    }
  ],

  // -----------------------------------------------------------------------
  // 5. JUDÔ (Caminho Suave) - 15 Campeonatos Reais
  // -----------------------------------------------------------------------
  judo: [
    {
      tier: 'local_1',
      category: 'local',
      categoryLabel: 'MUNICIPAL / BASE',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Torneio Municipal de Judô – Festival de Shiai (${city})`,
      tag: '🥋 Circuito de Shiai Municipal',
      desc: 'Festival municipal tradicional com regras de tempo e pontuação de Ippon e Waza-ari.',
      titleTemplate: (city) => `Medalha de Ouro Municipal de Judô (${city})`,
      isTitle: false,
      minAge: 8,
      minFights: 0,
      basePurse: 350,
      purseMult: 25,
      diffMod: 1.04
    },
    {
      tier: 'local_2',
      category: 'local',
      categoryLabel: 'INTERMUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: () => `Circuito Regional de Ippon da Federação`,
      tag: '⚡ Desafio Regional Intermunicipal',
      desc: 'Duelo entre associações e dojôs regionais com pegadas firmes e busca constante pelo Ippon perfeito.',
      titleTemplate: () => `Medalha de Honra do Circuito de Ippon`,
      isTitle: false,
      minAge: 10,
      minFights: 1,
      basePurse: 650,
      purseMult: 35,
      diffMod: 1.07
    },
    {
      tier: 'local_3',
      category: 'local',
      categoryLabel: 'DESAFIO MUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Copa Metropolitana dos Mestres de Judô (${city})`,
      tag: '🥇 Prova de Kumi-Kata Metropolitano',
      desc: 'Competição metropolitana tradicional onde a postura e a disputa de gola e manga são decisivas.',
      titleTemplate: (city) => `Taça Metropolitana dos Mestres de Judô (${city})`,
      isTitle: false,
      minAge: 12,
      minFights: 1,
      basePurse: 900,
      purseMult: 45,
      diffMod: 1.10
    },
    {
      tier: 'estadual_1',
      category: 'estadual',
      categoryLabel: 'SELETIVA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Torneio Seletivo da Federação Estadual de Judô (${state})`,
      tag: '🥋 Ranqueamento Oficial da Federação',
      desc: 'Etapa oficial de ranqueamento que seleciona os titulares do estado para as competições nacionais.',
      titleTemplate: (_, state) => `Troféu Seletiva Estadual de Judô (${state})`,
      isTitle: false,
      minAge: 15,
      minFights: 2,
      basePurse: 1400,
      purseMult: 60,
      diffMod: 1.12
    },
    {
      tier: 'estadual_2',
      category: 'estadual',
      categoryLabel: 'CAMPEONATO ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Campeonato Estadual Oficial da Federação de Judô (${state})`,
      tag: '🏆 Medalha de Ouro Oficial da Federação',
      desc: 'O ápice estadual do Judô federado. Apenas os melhores judocas graduados de cada categoria.',
      titleTemplate: (_, state) => `Medalha de Ouro Estadual de Judô (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 2,
      basePurse: 2400,
      purseMult: 80,
      diffMod: 1.15
    },
    {
      tier: 'estadual_3',
      category: 'estadual',
      categoryLabel: 'TAÇA FAIXAS PRETAS',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Taça Estadual de Shiai dos Faixas Pretas (${state})`,
      tag: '🥇 Torneio de Elite dos Faixas Pretas',
      desc: 'Competição exclusiva para a elite dos faixas pretas e marrons com técnicas de grande amplitude.',
      titleTemplate: (_, state) => `Troféu Estadual Shiai de Faixas Pretas (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 3,
      basePurse: 3800,
      purseMult: 110,
      diffMod: 1.17
    },
    {
      tier: 'nacional_1',
      category: 'nacional',
      categoryLabel: 'INTERESTADUAL',
      badgeClass: 'badge-nacional',
      nameTemplate: (city, state, country) => `Copa Interestadual Interclubes de Judô (${country})`,
      tag: '🇧🇷 Desafio Entre as Grandes Associações',
      desc: 'Confronto interestadual entre dojôs consagrados (Pinheiros, Sogipa, Minas Tênis, Instituto Reação).',
      titleTemplate: () => `Copa Interestadual de Judô Interclubes`,
      isTitle: true,
      minAge: 16,
      minFights: 4,
      basePurse: 4800,
      purseMult: 130,
      diffMod: 1.18
    },
    {
      tier: 'nacional_2',
      category: 'nacional',
      categoryLabel: 'GRAND PRIX NACIONAL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Grand Prix Nacional Interclubes de Judô`,
      tag: '🥋 O Maior Torneio de Equipes do Brasil',
      desc: 'Torneio nacional de altíssimo nível técnico com arbitragem internacional da CBJ.',
      titleTemplate: () => `Troféu Grand Prix Nacional de Judô`,
      isTitle: false,
      minAge: 16,
      minFights: 4,
      basePurse: 6200,
      purseMult: 150,
      diffMod: 1.20
    },
    {
      tier: 'nacional_3',
      category: 'nacional',
      categoryLabel: 'TROFÉU BRASIL CBJ',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Troféu Brasil Interclubes de Judô (CBJ Oficial)`,
      tag: '🇧🇷 O Torneio Mais Importante da CBJ',
      desc: 'O Troféu Brasil reúne os maiores atletas do país valendo convocação direta para a seleção brasileira.',
      titleTemplate: () => `Medalha de Ouro no Troféu Brasil de Judô (CBJ)`,
      isTitle: true,
      minAge: 16,
      minFights: 5,
      basePurse: 8500,
      purseMult: 180,
      diffMod: 1.22
    },
    {
      tier: 'nacional_4',
      category: 'nacional',
      categoryLabel: 'BRASILEIRO SÊNIOR',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Campeonato Brasileiro Sênior de Judô (CBJ Titular)`,
      tag: '👑 O Título Máximo da Categoria Sênior',
      desc: 'O Campeonato Brasileiro oficial da categoria adulta sênior. O campeão se torna o titular número 1 do Brasil.',
      titleTemplate: () => `Campeão Brasileiro Sênior de Judô (CBJ)`,
      isTitle: true,
      minAge: 16,
      minFights: 6,
      basePurse: 12000,
      purseMult: 220,
      diffMod: 1.24
    },
    {
      tier: 'continental_1',
      category: 'continental',
      categoryLabel: 'COPA MERCOSUL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Copa Mercosul Oficial de Judô`,
      tag: '🌎 Torneio de Ranqueamento Continental',
      desc: 'Judocas do Brasil, Argentina, Colômbia e Chile em disputas intensas no tatame internacional.',
      titleTemplate: () => `Troféu Mercosul de Judô`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 16000,
      purseMult: 260,
      diffMod: 1.25
    },
    {
      tier: 'continental_2',
      category: 'continental',
      categoryLabel: 'SUL-AMERICANO CSJ',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Sul-Americano Oficial de Judô (CSJ)`,
      tag: '🌎 O Título Oficial da América do Sul',
      desc: 'O campeonato máximo da Confederação Sul-Americana de Judô valendo pontuação para o circuito olímpico.',
      titleTemplate: () => `Medalha de Ouro no Sul-Americano Oficial de Judô (CSJ)`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 22000,
      purseMult: 320,
      diffMod: 1.26
    },
    {
      tier: 'continental_3',
      category: 'continental',
      categoryLabel: 'PAN-AMERICANO PJC',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Pan-Americano e Oceania de Judô (PJC)`,
      tag: '🌎 A Elite das Américas Chancelada pela FIJ',
      desc: 'Torneio continental unificado de judocas de ponta das Américas e Oceania na rota dos Jogos Mundiais.',
      titleTemplate: () => `Campeão Pan-Americano de Judô (PJC)`,
      isTitle: true,
      minAge: 17,
      minFights: 7,
      basePurse: 32000,
      purseMult: 380,
      diffMod: 1.27
    },
    {
      tier: 'ufc_1',
      category: 'ufc',
      categoryLabel: 'GRAND SLAM IJF',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `Grand Slam IJF de Paris & Tóquio (Circuito Mundial da Federação Internacional)`,
      tag: '🥇 Os Templos Sagrados do Judô Mundial em Paris e Tóquio',
      desc: 'O circuito mundial mais prestigiado da Federação Internacional de Judô (IJF). Pódio aqui garante vaga entre os melhores da história.',
      titleTemplate: () => `Medalha de Ouro no Grand Slam IJF de Paris & Tóquio`,
      isTitle: true,
      minAge: 18,
      minFights: 8,
      minWins: 6,
      basePurse: 55000,
      purseMult: 480,
      diffMod: 1.28
    },
    {
      tier: 'ufc_2',
      category: 'ufc',
      categoryLabel: 'CAMPEONATO MUNDIAL IJF',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `Campeonato Mundial de Judô IJF: Final de Ouro da Categoria`,
      tag: '👑 O Judogi Dourado de Campeão Mundial Oficial',
      desc: 'O título mundial oficial anual da Federação Internacional de Judô. O campeão tem o direito de ostentar a faixa dourada nas costas.',
      titleTemplate: () => `Campeão Mundial Oficial de Judô (IJF World Judo Championship)`,
      isTitle: true,
      minAge: 18,
      minFights: 10,
      minWins: 8,
      basePurse: 110000,
      purseMult: 800,
      diffMod: 1.30
    }
  ],

  // -----------------------------------------------------------------------
  // 6. WRESTLING (Luta Olímpica / Luta Livre & Greco-Romana) - 15 Campeonatos Reais
  // -----------------------------------------------------------------------
  wrestling: [
    {
      tier: 'local_1',
      category: 'local',
      categoryLabel: 'MUNICIPAL / BASE',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Torneio Municipal Aberto de Luta Olímpica (${city})`,
      tag: '🤼 Circuito de Base no Tapete',
      desc: 'Primeiros combates no tapete oficial de wrestling com regras internacionais de pontos por queda e exposição de costas.',
      titleTemplate: (city) => `Medalha de Ouro Municipal de Luta Olímpica de ${city}`,
      isTitle: false,
      minAge: 8,
      minFights: 0,
      basePurse: 350,
      purseMult: 25,
      diffMod: 1.04
    },
    {
      tier: 'local_2',
      category: 'local',
      categoryLabel: 'INTERMUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: () => `Copa Regional de Quedas e Domínio de Chão`,
      tag: '⚡ Circuito Intermunicipal de Quedas',
      desc: 'Duelo regional focado em entradas de perna, sprawl e controle posicional intenso.',
      titleTemplate: () => `Troféu Regional de Quedas e Domínio`,
      isTitle: false,
      minAge: 10,
      minFights: 1,
      basePurse: 650,
      purseMult: 35,
      diffMod: 1.07
    },
    {
      tier: 'local_3',
      category: 'local',
      categoryLabel: 'DESAFIO MUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Desafio Metropolitano de Luta Olímpica (${city})`,
      tag: '🥇 Desafio dos Wrestlers de Base',
      desc: 'Confronto entre os melhores centros de treinamento da região metropolitana.',
      titleTemplate: (city) => `Taça Metropolitana de Luta Olímpica (${city})`,
      isTitle: false,
      minAge: 12,
      minFights: 1,
      basePurse: 900,
      purseMult: 45,
      diffMod: 1.10
    },
    {
      tier: 'estadual_1',
      category: 'estadual',
      categoryLabel: 'SELETIVA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Etapa Seletiva da Federação Estadual de Luta Olímpica (${state})`,
      tag: '🤼 Ranqueamento Oficial da Federação',
      desc: 'Torneio estadual que define os representantes titulares para as competições nacionais da CBW.',
      titleTemplate: (_, state) => `Troféu Seletiva Estadual de Wrestling (${state})`,
      isTitle: false,
      minAge: 15,
      minFights: 2,
      basePurse: 1400,
      purseMult: 60,
      diffMod: 1.12
    },
    {
      tier: 'estadual_2',
      category: 'estadual',
      categoryLabel: 'CAMPEONATO ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Campeonato Estadual Oficial de Luta Olímpica (${state})`,
      tag: '🏆 Medalha de Ouro Oficial da Federação Estadual',
      desc: 'O título estadual oficial disputado nas divisões de Estilo Livre e Greco-Romana.',
      titleTemplate: (_, state) => `Medalha de Ouro Estadual de Luta Olímpica (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 2,
      basePurse: 2400,
      purseMult: 80,
      diffMod: 1.15
    },
    {
      tier: 'estadual_3',
      category: 'estadual',
      categoryLabel: 'COPA DOS MESTRES',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Copa Estadual dos Mestres de Wrestling (${state})`,
      tag: '🥇 Desafio dos Melhores Wrestlers do Estado',
      desc: 'Competição de alto nível reunindo atletas consolidados e campeões estaduais.',
      titleTemplate: (_, state) => `Troféu dos Mestres Estaduais de Wrestling (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 3,
      basePurse: 3800,
      purseMult: 110,
      diffMod: 1.17
    },
    {
      tier: 'nacional_1',
      category: 'nacional',
      categoryLabel: 'INTERESTADUAL',
      badgeClass: 'badge-nacional',
      nameTemplate: (city, state, country) => `Torneio Interestadual Integrado de Wrestling (${country})`,
      tag: '🇧🇷 Desafio Entre Estados da Luta Olímpica',
      desc: 'Duelo interestadual reunindo federações de ponta com wrestlers de alto rendimento físico.',
      titleTemplate: () => `Torneio Interestadual de Wrestling`,
      isTitle: true,
      minAge: 16,
      minFights: 4,
      basePurse: 4800,
      purseMult: 130,
      diffMod: 1.18
    },
    {
      tier: 'nacional_2',
      category: 'nacional',
      categoryLabel: 'COPA BRASIL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Copa Brasil Aberta de Luta Olímpica`,
      tag: '🤼 Circuito Nacional Aberto da CBW',
      desc: 'Torneio nacional de alto ritmo com chaveamento amplo para ranqueamento de atletas de seleção.',
      titleTemplate: () => `Troféu Copa Brasil de Luta Olímpica`,
      isTitle: false,
      minAge: 16,
      minFights: 4,
      basePurse: 6200,
      purseMult: 150,
      diffMod: 1.20
    },
    {
      tier: 'nacional_3',
      category: 'nacional',
      categoryLabel: 'CAMPEONATO BRASILEIRO',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Campeonato Brasileiro de Wrestling (CBW Oficial)`,
      tag: '🇧🇷 O Título Nacional Supremo da Confederação',
      desc: 'A principal glória do wrestling brasileiro chancelada pela Confederação Brasileira de Wrestling (CBW).',
      titleTemplate: () => `Campeão Brasileiro de Luta Olímpica (CBW)`,
      isTitle: true,
      minAge: 16,
      minFights: 5,
      basePurse: 8500,
      purseMult: 180,
      diffMod: 1.22
    },
    {
      tier: 'nacional_4',
      category: 'nacional',
      categoryLabel: 'TAÇA BRASIL INTERFEDERATIVA',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Taça Brasil Interfederativa de Luta Olímpica`,
      tag: '👑 A Maior Taça Interfederativa do País',
      desc: 'A disputa máxima de equipes e seleções de todos os estados do Brasil.',
      titleTemplate: () => `Taça Brasil Interfederativa de Luta Olímpica`,
      isTitle: true,
      minAge: 16,
      minFights: 6,
      basePurse: 12000,
      purseMult: 220,
      diffMod: 1.24
    },
    {
      tier: 'continental_1',
      category: 'continental',
      categoryLabel: 'CIRCUITO MERCOSUL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Circuito Mercosul de Lutas Associadas`,
      tag: '🌎 Torneio de Ranqueamento da América do Sul',
      desc: 'Confronto sul-americano entre atletas do Brasil, Venezuela, Colômbia e Argentina.',
      titleTemplate: () => `Troféu Mercosul de Wrestling`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 16000,
      purseMult: 260,
      diffMod: 1.25
    },
    {
      tier: 'continental_2',
      category: 'continental',
      categoryLabel: 'SUL-AMERICANO CONSULUTA',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Sul-Americano de Luta Olímpica (Consuluta)`,
      tag: '🌎 O Título Oficial da Confederação Sul-Americana',
      desc: 'A disputa de ouro oficial chancelada pela Confederação Sul-Americana de Lutas Associadas.',
      titleTemplate: () => `Medalha de Ouro Sul-Americana de Wrestling (Consuluta)`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 22000,
      purseMult: 320,
      diffMod: 1.26
    },
    {
      tier: 'continental_3',
      category: 'continental',
      categoryLabel: 'PAN-AMERICANO UWW',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Pan-Americano de Wrestling (UWW Pan-Am)`,
      tag: '🌎 A Elite das Américas Chancelada pela UWW',
      desc: 'Wrestlers das maiores potências mundiais (EUA, Cuba, Canadá e Brasil) disputando a hegemonia continental.',
      titleTemplate: () => `Campeão Pan-Americano UWW de Wrestling`,
      isTitle: true,
      minAge: 17,
      minFights: 7,
      basePurse: 32000,
      purseMult: 380,
      diffMod: 1.27
    },
    {
      tier: 'ufc_1',
      category: 'ufc',
      categoryLabel: 'UWW GOLDEN GRAND PRIX',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `UWW Golden Grand Prix Internacional de Wrestling`,
      tag: '🥇 O Circuito Mundial dos Maiores Wrestlers do Planeta',
      desc: 'O torneio internacional de elite da United World Wrestling reunindo medalhistas e lendas mundiais.',
      titleTemplate: () => `Medalha de Ouro no Golden Grand Prix UWW`,
      isTitle: true,
      minAge: 18,
      minFights: 8,
      minWins: 6,
      basePurse: 55000,
      purseMult: 480,
      diffMod: 1.28
    },
    {
      tier: 'ufc_2',
      category: 'ufc',
      categoryLabel: 'MUNDIAL SENIOR UWW',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `Campeonato Mundial de Wrestling UWW (Senior World Championship)`,
      tag: '👑 O Título Máximo da United World Wrestling',
      desc: 'O campeonato mundial absoluto da United World Wrestling. Consagra o melhor wrestler de cada categoria no planeta Terra.',
      titleTemplate: () => `Campeão Mundial Sênior de Wrestling (UWW World Championship)`,
      isTitle: true,
      minAge: 18,
      minFights: 10,
      minWins: 8,
      basePurse: 110000,
      purseMult: 800,
      diffMod: 1.30
    }
  ],

  // -----------------------------------------------------------------------
  // 7. KICKBOXING (K-1 Rules & Low Kicks) - 15 Campeonatos Reais
  // -----------------------------------------------------------------------
  kickboxing: [
    {
      tier: 'local_1',
      category: 'local',
      categoryLabel: 'MUNICIPAL / BASE',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Copa Municipal Aberta de Kickboxing K-1 (${city})`,
      tag: '🥊 Circuito de Base Municipal de K-1',
      desc: 'Estreia no ringue sob as regras dinâmicas do K-1 (socos, chutes e joelhada única permitida).',
      titleTemplate: (city) => `Medalha de Ouro Municipal de Kickboxing de ${city}`,
      isTitle: false,
      minAge: 8,
      minFights: 0,
      basePurse: 350,
      purseMult: 25,
      diffMod: 1.04
    },
    {
      tier: 'local_2',
      category: 'local',
      categoryLabel: 'INTERMUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: () => `Torneio Regional Low Kicks Open`,
      tag: '⚡ Circuito Intermunicipal de Low Kicks',
      desc: 'Confronto entre strikers regionais com caneladas pesadas na coxa e trocação franca.',
      titleTemplate: () => `Troféu Regional Low Kicks Open`,
      isTitle: false,
      minAge: 10,
      minFights: 1,
      basePurse: 650,
      purseMult: 35,
      diffMod: 1.07
    },
    {
      tier: 'local_3',
      category: 'local',
      categoryLabel: 'DESAFIO MUNICIPAL',
      badgeClass: 'badge-local',
      nameTemplate: (city) => `Desafio Metropolitano Striker K-1 (${city})`,
      tag: '🥇 Desafio dos Nocauteadores de Base',
      desc: 'Duelo metropolitano de alta voltagem entre as academias mais duras de trocação.',
      titleTemplate: (city) => `Taça Metropolitana Striker K-1 (${city})`,
      isTitle: false,
      minAge: 12,
      minFights: 1,
      basePurse: 900,
      purseMult: 45,
      diffMod: 1.10
    },
    {
      tier: 'estadual_1',
      category: 'estadual',
      categoryLabel: 'SELETIVA ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Torneio de Ranqueamento Estadual de Kickboxing (${state})`,
      tag: '🥊 Chaveamento Oficial da Federação',
      desc: 'Etapa que ranqueia os principais kickboxers para as disputas de cinturão do estado.',
      titleTemplate: (_, state) => `Troféu Ranqueamento Estadual de Kickboxing (${state})`,
      isTitle: false,
      minAge: 15,
      minFights: 2,
      basePurse: 1400,
      purseMult: 60,
      diffMod: 1.12
    },
    {
      tier: 'estadual_2',
      category: 'estadual',
      categoryLabel: 'CAMPEONATO ESTADUAL',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Campeonato Estadual Oficial de Kickboxing (${state})`,
      tag: '🏆 Cinturão Oficial da Federação Estadual',
      desc: 'A principal glória do kickboxing federado do estado sob chancela da federação.',
      titleTemplate: (_, state) => `Cinturão Estadual Oficial de Kickboxing (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 2,
      basePurse: 2400,
      purseMult: 80,
      diffMod: 1.15
    },
    {
      tier: 'estadual_3',
      category: 'estadual',
      categoryLabel: 'SUPER LUTA K-1',
      badgeClass: 'badge-estadual',
      nameTemplate: (_, state) => `Super Luta Estadual de K-1 Rules (${state})`,
      tag: '🥇 Super Luta dos Campeões Estaduais',
      desc: 'Confronto direto de 5 rounds entre os campeões de categorias adjacentes.',
      titleTemplate: (_, state) => `Troféu Super Luta Estadual de K-1 Rules (${state})`,
      isTitle: true,
      minAge: 15,
      minFights: 3,
      basePurse: 3800,
      purseMult: 110,
      diffMod: 1.17
    },
    {
      tier: 'nacional_1',
      category: 'nacional',
      categoryLabel: 'INTERESTADUAL',
      badgeClass: 'badge-nacional',
      nameTemplate: (city, state, country) => `Taça Interestadual de Kickboxing Pro (${country})`,
      tag: '🇧🇷 Duelo Interestadual de Strikers',
      desc: 'Confronto entre seleções estaduais com atletas de alto renome do Sul e Sudeste.',
      titleTemplate: () => `Taça Interestadual de Kickboxing Pro`,
      isTitle: true,
      minAge: 16,
      minFights: 4,
      basePurse: 4800,
      purseMult: 130,
      diffMod: 1.18
    },
    {
      tier: 'nacional_2',
      category: 'nacional',
      categoryLabel: 'ABERTO NACIONAL',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Aberto Nacional de Kickboxing Point & K-1`,
      tag: '🥊 Grande Torneio de Ranqueamento Nacional',
      desc: 'Competição aberta nacional com atletas de dezenas de equipes em busca de visibilidade.',
      titleTemplate: () => `Troféu Aberto Nacional de Kickboxing`,
      isTitle: false,
      minAge: 16,
      minFights: 4,
      basePurse: 6200,
      purseMult: 150,
      diffMod: 1.20
    },
    {
      tier: 'nacional_3',
      category: 'nacional',
      categoryLabel: 'BRASILEIRO CBKB / WAKO',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Campeonato Brasileiro de Kickboxing (CBKB / WAKO Brasil Oficial)`,
      tag: '🇧🇷 O Título Nacional Supremo da CBKB',
      desc: 'A principal competição de kickboxing do país chancelada pela Confederação Brasileira (CBKB/WAKO).',
      titleTemplate: () => `Campeão Brasileiro de Kickboxing (CBKB / WAKO)`,
      isTitle: true,
      minAge: 16,
      minFights: 5,
      basePurse: 8500,
      purseMult: 180,
      diffMod: 1.22
    },
    {
      tier: 'nacional_4',
      category: 'nacional',
      categoryLabel: 'COPA DO BRASIL PRO',
      badgeClass: 'badge-nacional',
      nameTemplate: () => `Copa do Brasil Oficial de Kickboxing Profissional`,
      tag: '👑 Cinturão Profissional da Copa do Brasil',
      desc: 'Disputa de cinturão profissional com regras completas chancelada pelos promotores da WAKO Pro.',
      titleTemplate: () => `Cinturão da Copa do Brasil de Kickboxing Pro`,
      isTitle: true,
      minAge: 16,
      minFights: 6,
      basePurse: 12000,
      purseMult: 220,
      diffMod: 1.24
    },
    {
      tier: 'continental_1',
      category: 'continental',
      categoryLabel: 'COPA MERCOSUL',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Copa Mercosul Pro K-1 Rules`,
      tag: '🌎 Disputa Continental de K-1',
      desc: 'Kickboxers do Brasil, Argentina, Chile e Paraguai se enfrentando em torneio eliminatório.',
      titleTemplate: () => `Troféu Mercosul de Kickboxing Pro`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 16000,
      purseMult: 260,
      diffMod: 1.25
    },
    {
      tier: 'continental_2',
      category: 'continental',
      categoryLabel: 'SUL-AMERICANO WAKO',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Campeonato Sul-Americano de Kickboxing (WAKO South America)`,
      tag: '🌎 O Cinturão Oficial da América do Sul',
      desc: 'A principal competição sul-americana regida pela WAKO South America.',
      titleTemplate: () => `Cinturão Sul-Americano WAKO de Kickboxing`,
      isTitle: true,
      minAge: 17,
      minFights: 6,
      basePurse: 22000,
      purseMult: 320,
      diffMod: 1.26
    },
    {
      tier: 'continental_3',
      category: 'continental',
      categoryLabel: 'PAN-AMERICANO WAKO',
      badgeClass: 'badge-continental',
      nameTemplate: () => `Pan-American Kickboxing Championship (WAKO Pan-Am)`,
      tag: '🌎 O Grande Título Pan-Americano da WAKO',
      desc: 'A elite continental das Américas disputando o título e as credenciais para o circuito mundial.',
      titleTemplate: () => `Campeão Pan-Americano WAKO de Kickboxing`,
      isTitle: true,
      minAge: 17,
      minFights: 7,
      basePurse: 32000,
      purseMult: 380,
      diffMod: 1.27
    },
    {
      tier: 'ufc_1',
      category: 'ufc',
      categoryLabel: 'K-1 WORLD GRAND PRIX',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `K-1 World Grand Prix Championship: Final de Ouro`,
      tag: '🥇 O Lendário Torneio dos Maiores Nocauteadores do Mundo',
      desc: 'O torneio mais icônico da história da trocação. Campeões mundiais de todas as artes se enfrentando até sobrar apenas um.',
      titleTemplate: () => `Campeão do K-1 World Grand Prix (Troféu de Ouro K-1)`,
      isTitle: true,
      minAge: 18,
      minFights: 8,
      minWins: 6,
      basePurse: 55000,
      purseMult: 480,
      diffMod: 1.28
    },
    {
      tier: 'ufc_2',
      category: 'ufc',
      categoryLabel: 'GLORY KICKBOXING',
      badgeClass: 'badge-ufc',
      nameTemplate: () => `Glory Kickboxing: Disputa de Cinturão Mundial de Peso`,
      tag: '👑 O Cinturão da Maior Liga de Kickboxing do Mundo',
      desc: 'O palco supremo do kickboxing moderno. Transmissões globais e os atletas mais temidos do mundo pelo cinturão do Glory.',
      titleTemplate: () => `Cinturão Mundial Indiscutível do Glory Kickboxing`,
      isTitle: true,
      minAge: 18,
      minFights: 10,
      minWins: 8,
      basePurse: 110000,
      purseMult: 800,
      diffMod: 1.30
    }
  ]
};

// =========================================================================
// GERADOR DINÂMICO DE OFERTAS BASEADO NO ESTILO DO LUTADOR E PROGRESSÃO
// =========================================================================
export function generateChampionshipOffers(fighter, worldEngine) {
  const f = fighter;
  const year = f.careerYear || 1;
  const olympicActive = isOlympicYear(year);
  const yearsToOlympics = getYearsToNextOlympics(year);

  const cityName = f.birthCity || 'Municipal';
  const stateName = f.birthState || 'Estadual';
  const countryName = f.nationality || 'Brasil';
  
  // GARANTE SELEÇÃO ESTRITA DA MODALIDADE DO LUTADOR (NUNCA MISTURA BOXE COM BJJ ETC.)
  const modId = (f.modality && TOURNAMENTS_DATABASE[f.modality]) ? f.modality : 'boxing';
  const tournamentList = TOURNAMENTS_DATABASE[modId];
  const offers = [];

  // 1. Gera os torneios da modalidade escolhida
  tournamentList.forEach(tourn => {
    const eventName = tourn.nameTemplate(cityName, stateName, countryName);
    const titleName = tourn.titleTemplate(cityName, stateName, countryName);

    // Checagem de Desbloqueio
    let isLocked = false;
    let lockReason = '';
    const lockRequirements = [];

    // Regra da idade mínima
    const hasMinAge = f.age >= tourn.minAge;
    lockRequirements.push({
      label: `Idade Mínima: ${tourn.minAge} anos`,
      met: hasMinAge,
      currentText: `${f.age}/${tourn.minAge} anos`
    });
    if (!hasMinAge) {
      isLocked = true;
      if (tourn.minAge >= 18) {
        lockReason = `🚫 PROIBIDO PARA MENORES DE 18 ANOS: As comissões atléticas e o regulamento do ${eventName} proíbem atletas menores de idade (Sua idade: ${f.age} anos).`;
      } else {
        lockReason = `A organização exige idade mínima de ${tourn.minAge} anos para participação (Sua idade: ${f.age} anos).`;
      }
    }

    // Regra de experiência de lutas
    if (tourn.minFights > 0) {
      const hasMinFights = f.record.fights >= tourn.minFights;
      lockRequirements.push({
        label: `Cartel: Mínimo de ${tourn.minFights} combates`,
        met: hasMinFights,
        currentText: `${f.record.fights}/${tourn.minFights} lutas`
      });
      if (!hasMinFights && !isLocked) {
        isLocked = true;
        lockReason = `Requer cartel de pelo menos ${tourn.minFights} lutas oficiais disputadas (Lutas atuais: ${f.record.fights}/${tourn.minFights}).`;
      }
    }

    // Regra de vitórias para ligas mundiais (UFC / Ligas Globais)
    if (tourn.minWins && tourn.minWins > 0) {
      const hasMinWins = f.record.wins >= tourn.minWins;
      lockRequirements.push({
        label: `Vitórias: Mínimo de ${tourn.minWins} triunfos`,
        met: hasMinWins,
        currentText: `${f.record.wins}/${tourn.minWins} vitórias`
      });
      if (!hasMinWins && !isLocked) {
        isLocked = true;
        lockReason = `Requer cartel vitorioso com pelo menos ${tourn.minWins} vitórias profissionais (Vitórias atuais: ${f.record.wins}/${tourn.minWins}).`;
      }
    }

    // Se estiver desbloqueado, gera adversário realista coerente com o tier e a modalidade
    let opp = null;
    let purse = 0;
    const oppTier = tourn.category === 'ufc' ? 'MUNDIAL' :
                    tourn.category === 'continental' ? 'ELITE' :
                    tourn.category === 'nacional' ? 'ELITE' :
                    tourn.category === 'estadual' ? 'MEDIANO' : 'AMADOR';

    const roundInfo = calculateChampionshipRounds(tourn.category, oppTier, modId, tourn.isTitle, false);

    if (!isLocked) {
      const rankTier = tourn.category === 'ufc'
        ? Math.max(1, (f.ranking || 8) - 3)
        : tourn.category === 'continental'
        ? Math.max(1, (f.ranking || 10) - 2)
        : tourn.category === 'nacional'
        ? Math.max(1, (f.ranking || 12) - 1)
        : tourn.category === 'estadual'
        ? Math.max(1, (f.ranking || 15) + 1)
        : (f.ranking || 18) + 4;

      opp = generateOpponent(f, {
        modality: modId,
        tier: oppTier,
        rankTier: rankTier,
        isTitleFight: tourn.isTitle
      });
      if (opp) {
        opp.rounds = roundInfo.rounds;
        opp.roundDurationSec = roundInfo.roundDurationSec;
        opp.roundsDescription = roundInfo.roundsDescription;
      }
      purse = Math.round(tourn.basePurse + f.fame * tourn.purseMult);
    }

    const modLabel = MODALITY_LABELS[modId] || 'Sua Modalidade';

    offers.push({
      category: tourn.category,
      categoryLabel: isLocked ? `${tourn.categoryLabel} 🔒` : tourn.categoryLabel,
      badgeClass: tourn.badgeClass,
      eventName: eventName,
      tag: isLocked && tourn.minAge >= 18 && f.age < 18 ? `🚫 Proibido para Menores (${f.age} anos)` : tourn.tag,
      description: isLocked ? lockReason : tourn.desc,
      opp: opp,
      purse: purse,
      isTitle: tourn.isTitle,
      titleName: titleName,
      isLocked: isLocked,
      lockReason: isLocked ? lockReason : null,
      lockRequirements: lockRequirements,
      matchType: 'MODALITY',
      matchTypeBadge: `🥊 LUTA NA SUA MODALIDADE: ${modLabel.toUpperCase()}`,
      styleClash: `${modLabel} Puro`,
      rulesDescription: `Combate oficial regido estritamente pelas regras de ${modLabel}. Valendo pontuação direta e ascensão no ranking da categoria.`,
      rounds: roundInfo.rounds,
      roundDurationSec: roundInfo.roundDurationSec,
      roundsDescription: roundInfo.roundsDescription,
      type: tourn.category.toUpperCase()
    });
  });

  // -----------------------------------------------------------------------
  // 15. DESAFIOS DE ESTILOS & SUPERLUTAS (LUTA LIVRE / ABERTO)
  // -----------------------------------------------------------------------
  const crossStyleEvents = [
    {
      id: 'cross_base',
      minAge: 14,
      minFights: 1,
      tier: 'AMADOR',
      nameTemplate: (city) => `Desafio Aberto de Artes Marciais (${city})`,
      tag: '⚔️ Choque Regional de Disciplinas',
      desc: 'Torneio aberto entre academias de modalidades distintas para testar a eficiência de cada disciplina.',
      basePurse: 850,
      purseMult: 35
    },
    {
      id: 'cross_regional',
      minAge: 16,
      minFights: 3,
      tier: 'MEDIANO',
      nameTemplate: (_, state) => `Copa Interdisciplinar Luta Livre & Vale-Tudo (${state})`,
      tag: '🔥 Superluta Aberta de Estilos',
      desc: 'Duelo aberto de grande repercussão estadual! O atleta de sua arte marcial enfrenta um especialista de modalidade rival.',
      basePurse: 2200,
      purseMult: 75
    },
    {
      id: 'cross_nacional',
      minAge: 17,
      minFights: 6,
      tier: 'ELITE',
      nameTemplate: (_, __, country) => `Grande Prêmio Nacional de Confronto de Estilos (${country})`,
      tag: '⚡ Superluta Transmitida em Rede Aberta',
      desc: 'Os maiores expoentes de cada disciplina marcial em combate aberto. Teste supremo contra um arsenal completamente diferente!',
      basePurse: 7500,
      purseMult: 160
    },
    {
      id: 'cross_mundial',
      minAge: 18,
      minFights: 10,
      minWins: 7,
      tier: 'MUNDIAL',
      nameTemplate: () => `World Open Masters: Guerra Global de Estilos & Luta Livre`,
      tag: '👑 A Maior Superluta Intermodalidades do Planeta',
      desc: 'O palco supremo do confronto de artes marciais mundiais! Transmissão em pay-per-view internacional, bolsa milionária e legado indiscutível.',
      basePurse: 48000,
      purseMult: 450
    }
  ];

  crossStyleEvents.forEach(cs => {
    const csEventName = cs.nameTemplate(cityName, stateName, countryName);
    let isLocked = false;
    let lockReason = '';
    const lockRequirements = [];

    const hasMinAge = f.age >= cs.minAge;
    lockRequirements.push({
      label: `Idade Mínima: ${cs.minAge} anos`,
      met: hasMinAge,
      currentText: `${f.age}/${cs.minAge} anos`
    });
    if (!hasMinAge) {
      isLocked = true;
      lockReason = `Exige idade mínima de ${cs.minAge} anos (Sua idade: ${f.age} anos).`;
    }

    if (cs.minFights > 0) {
      const hasMinFights = f.record.fights >= cs.minFights;
      lockRequirements.push({
        label: `Cartel: Mínimo de ${cs.minFights} combates`,
        met: hasMinFights,
        currentText: `${f.record.fights}/${cs.minFights} lutas`
      });
      if (!hasMinFights && !isLocked) {
        isLocked = true;
        lockReason = `Requer cartel de pelo menos ${cs.minFights} lutas (Lutas atuais: ${f.record.fights}/${cs.minFights}).`;
      }
    }

    if (cs.minWins && cs.minWins > 0) {
      const hasMinWins = f.record.wins >= cs.minWins;
      lockRequirements.push({
        label: `Vitórias: Mínimo de ${cs.minWins} vitórias`,
        met: hasMinWins,
        currentText: `${f.record.wins}/${cs.minWins} vitórias`
      });
      if (!hasMinWins && !isLocked) {
        isLocked = true;
        lockReason = `Requer cartel de pelo menos ${cs.minWins} vitórias profissionais (Vitórias atuais: ${f.record.wins}/${cs.minWins}).`;
      }
    }

    let opp = null;
    let purse = 0;
    const csRounds = cs.tier === 'MUNDIAL' ? 5 : cs.tier === 'ELITE' ? 5 : cs.tier === 'MEDIANO' ? 4 : 3;
    const csDuration = (f.modality === 'mma' || cs.tier === 'MUNDIAL') ? 300 : 180;
    const csDesc = `${csRounds} Rounds de ${Math.round(csDuration / 60)} min (Desafio Aberto de Estilos)`;

    if (!isLocked) {
      opp = generateOpponent(f, {
        isCrossStyle: true,
        tier: cs.tier,
        rankTier: cs.tier === 'MUNDIAL' ? 4 : cs.tier === 'ELITE' ? 12 : 25
      });
      if (opp) {
        opp.rounds = csRounds;
        opp.roundDurationSec = csDuration;
        opp.roundsDescription = csDesc;
      }
      purse = Math.round(cs.basePurse + f.fame * cs.purseMult);
    }

    offers.push({
      category: 'luta_livre',
      categoryLabel: isLocked ? '⚔️ LUTA LIVRE / ESTILOS 🔒' : '⚔️ LUTA LIVRE / DESAFIO DE ESTILOS',
      badgeClass: 'badge-luta-livre',
      eventName: opp ? `${csEventName} (${opp.styleClash})` : csEventName,
      tag: isLocked ? `🔒 Desafio Aberto (${cs.minAge}+ anos)` : (opp ? `⚔️ ${opp.styleClash.toUpperCase()}` : cs.tag),
      description: isLocked ? lockReason : (opp ? `${opp.rulesDescription}` : cs.desc),
      opp: opp,
      purse: purse,
      isTitle: false,
      titleName: `Troféu Desafio de Estilos (${csEventName})`,
      isLocked: isLocked,
      lockReason: isLocked ? lockReason : null,
      lockRequirements: lockRequirements,
      matchType: 'CROSS_STYLE',
      matchTypeBadge: '⚔️ DESAFIO DE ESTILOS / LUTA LIVRE',
      styleClash: opp ? opp.styleClash : 'Desafio de Estilos',
      rulesDescription: opp ? opp.rulesDescription : cs.desc,
      rounds: csRounds,
      roundDurationSec: csDuration,
      roundsDescription: csDesc,
      type: 'LUTA_LIVRE'
    });
  });

  // -----------------------------------------------------------------------
  // 16. JOGOS OLÍMPICOS MUNDIAIS (A CADA 4 ANOS)
  // -----------------------------------------------------------------------
  const olympicEligible = isOlympicEligible(f);

  if (olympicActive) {
    if (olympicEligible) {
      const oppOlympics = generateOpponent(f, {
        modality: modId,
        tier: 'MUNDIAL',
        rankTier: Math.max(1, Math.min(5, f.ranking || 3)),
        isTitleFight: true
      });
      if (oppOlympics) {
        oppOlympics.rounds = 3;
        oppOlympics.roundDurationSec = 180;
        oppOlympics.roundsDescription = '3 Rounds de 3 min (Regulamento Olímpico Oficial)';
      }
      offers.push({
        category: 'olimpiadas',
        categoryLabel: '🏅 JOGOS OLÍMPICOS MUNDIAIS (A CADA 4 ANOS)',
        badgeClass: 'badge-olympics active',
        eventName: `Jogos Olímpicos Mundiais • Torneio de Ouro`,
        tag: `🥇 ANO OLÍMPICO! Representando: ${countryName}`,
        description: `O maior evento esportivo da humanidade acontece apenas a cada 4 anos! Vista o uniforme de sua nação e dispute a glória imortal da Medalha de Ouro Olímpica!`,
        opp: oppOlympics,
        purse: Math.round(35000 + f.fame * 350),
        isTitle: true,
        titleName: `Medalha de Ouro nos Jogos Olímpicos (${countryName})`,
        isOlympic: true,
        isLocked: false,
        lockReason: null,
        lockRequirements: [],
        matchType: 'MODALITY',
        matchTypeBadge: `🥇 MODALIDADE OLÍMPICA: ${(MODALITY_LABELS[modId] || modId).toUpperCase()}`,
        styleClash: `${MODALITY_LABELS[modId] || 'Arte'} Olímpico Oficial`,
        rulesDescription: `Disputa oficial no maior evento poliesportivo do planeta, seguindo rigorosamente as diretrizes e regras olímpicas unificadas.`,
        rounds: 3,
        roundDurationSec: 180,
        roundsDescription: '3 Rounds de 3 min (Regulamento Olímpico Oficial)',
        type: 'OLIMPIADAS'
      });
    } else {
      const olympicReason = f.age < 16
        ? `O Comitê Olímpico Internacional exige idade mínima de 16 anos para os Jogos Olímpicos (Sua idade: ${f.age} anos).`
        : `A Confederação Olímpica exige índice mínimo de 6 combates oficiais disputados para convocação (Lutas atuais: ${f.record.fights}/6).`;

      offers.push({
        category: 'olimpiadas',
        categoryLabel: '🏅 JOGOS OLÍMPICOS (ANO ATIVO) 🔒',
        badgeClass: 'badge-olympics',
        eventName: `Jogos Olímpicos Mundiais (${countryName})`,
        tag: `🔒 Não Convocado: Ano ${year}`,
        description: olympicReason,
        opp: null,
        purse: 0,
        isTitle: true,
        titleName: `Medalha de Ouro nos Jogos Olímpicos (${countryName})`,
        isOlympic: true,
        isLocked: true,
        lockReason: olympicReason,
        lockRequirements: [
          { label: 'Ano de Jogos Olímpicos', met: true, currentText: `Ano ${year} (Ativo)` },
          { label: 'Idade Mínima: 16 anos', met: f.age >= 16, currentText: `${f.age}/16 anos` },
          { label: 'Índice de Convocação: 6+ lutas', met: f.record.fights >= 6, currentText: `${f.record.fights}/6 lutas` }
        ],
        type: 'OLIMPIADAS'
      });
    }
  } else {
    offers.push({
      category: 'olimpiadas',
      categoryLabel: '🏅 JOGOS OLÍMPICOS MUNDIAIS (A CADA 4 ANOS)',
      badgeClass: 'badge-olympics countdown',
      eventName: `Ciclo Olímpico em Andamento (${countryName})`,
      tag: `⏳ Próxima Edição: Ano ${year + yearsToOlympics} (Faltam ${yearsToOlympics} ano(s) / ${yearsToOlympics * 3} camps)`,
      description: `Os Jogos Olímpicos ocorrem rigorosamente a cada 4 anos. Acumule vitórias nas categorias de base para atingir idade mínima (16+) e índice para a convocação no Ano ${year + yearsToOlympics}!`,
      opp: null,
      purse: 0,
      isTitle: false,
      isOlympic: true,
      isLocked: true,
      lockReason: `Aguardando a próxima edição olímpica no Ano ${year + yearsToOlympics}.`,
      lockRequirements: [
        { label: `Próxima Edição: Ano ${year + yearsToOlympics}`, met: false, currentText: `Faltam ${yearsToOlympics} ano(s)` },
        { label: 'Idade Mínima: 16 anos', met: f.age >= 16, currentText: `${f.age}/16 anos` },
        { label: 'Índice de Convocação: 6+ lutas', met: f.record.fights >= 6, currentText: `${f.record.fights}/6 lutas` }
      ],
      type: 'OLIMPIADAS_INFO'
    });
  }

  return offers;
}
