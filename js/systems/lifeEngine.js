// lifeEngine.js - Finanças, empregos, moradia, patrocínios, redes sociais e estilo de vida

import { GYMS } from '../data/gyms.js';

export const JOBS = [
  { id: 'none', name: 'Atleta em Tempo Integral', weeklyPay: 0, fatigueAdd: 0, minFame: 0, description: '100% focado no treinamento e na carreira.' },
  { id: 'delivery', name: 'Entregador de Aplicativo', weeklyPay: 260, fatigueAdd: 10, minFame: 0, description: 'Trabalho cansativo no trânsito, mas garante o básico.' },
  { id: 'security', name: 'Segurança de Casa Noturna', weeklyPay: 390, fatigueAdd: 14, minFame: 0, description: 'Madrugadas em pé lidando com confusão. Exige porte físico.' },
  { id: 'coach_assistant', name: 'Instrutor de Lutas na Academia', weeklyPay: 580, fatigueAdd: 8, minFame: 20, description: 'Dá aulas para iniciantes e crianças. Mantém você no dojô.' }
];

export const HOUSING = [
  { id: 'shared_room', name: 'Quarto Compartilhado', weeklyCost: 110, recoveryBonus: 0.9, description: 'Barulho, pouco espaço, mas cabe no orçamento apertado.' },
  { id: 'modest_flat', name: 'Apartamento Simples', weeklyCost: 240, recoveryBonus: 1.0, description: 'Espaço próprio e sossego para descansar após o treino.' },
  { id: 'pro_condo', name: 'Condomínio com Academia & Sauna', weeklyCost: 620, recoveryBonus: 1.2, description: 'Excelente infraestrutura para otimizar o sono e a alimentação.' },
  { id: 'luxury_mansion', name: 'Mansão de Campeão', weeklyCost: 2100, recoveryBonus: 1.4, description: 'O ápice do sucesso financeiro. Piscina, crioterapia e cozinheiro particular.' }
];

export const AVAILABLE_SPONSORS = [
  { id: 'local_supplements', name: 'Iron Nutrition Suplementos', weeklyPay: 180, minFame: 15, signed: false },
  { id: 'fight_apparel', name: 'Gladiator Fight Wear', weeklyPay: 450, minFame: 35, signed: false },
  { id: 'energy_drink', name: 'Thunder Energy Drink', weeklyPay: 1100, minFame: 60, signed: false },
  { id: 'global_brand', name: 'Apex Worldwide Athletics', weeklyPay: 3800, minFame: 85, signed: false }
];

export class LifeEngine {
  constructor(fighter) {
    this.fighter = fighter;
    this.currentJob = JOBS[1]; // Entregador no início
    this.currentHousing = HOUSING[0]; // Quarto compartilhado
    this.activeSponsors = [];
  }

  setJob(jobId) {
    const found = JOBS.find(j => j.id === jobId);
    if (found && this.fighter.fame >= found.minFame) {
      this.currentJob = found;
      return true;
    }
    return false;
  }

  setHousing(housingId) {
    const found = HOUSING.find(h => h.id === housingId);
    if (found) {
      this.currentHousing = found;
      return true;
    }
    return false;
  }

  signSponsor(sponsorId) {
    const sp = AVAILABLE_SPONSORS.find(s => s.id === sponsorId);
    if (sp && this.fighter.fame >= sp.minFame && !this.activeSponsors.some(s => s.id === sp.id)) {
      this.activeSponsors.push(sp);
      return true;
    }
    return false;
  }

  // Balanço financeiro do Camp de 4 Meses (16 semanas)
  processCampFinances() {
    const currentGym = GYMS.find(g => g.id === this.fighter.gymId) || GYMS[0];
    const campGymCost = currentGym.monthlyFee * 4;
    const campHousingCost = this.currentHousing.weeklyCost * 16;
    const campFoodCost = 140 * 16; // Alimentação de atleta por 4 meses

    const totalExpenses = campGymCost + campHousingCost + campFoodCost;

    // Receitas de 4 meses de trabalho e patrocinadores
    const jobIncome = this.currentJob.weeklyPay * 16;
    const sponsorIncome = this.activeSponsors.reduce((sum, sp) => sum + sp.weeklyPay, 0) * 16;
    const totalIncome = jobIncome + sponsorIncome;

    const netBalance = totalIncome - totalExpenses;
    this.fighter.money += netBalance;

    // Se o saldo ficar negativo, gera estresse
    if (this.fighter.money < 0) {
      this.fighter.stress = Math.min(100, this.fighter.stress + 15);
      this.fighter.morale = Math.max(10, this.fighter.morale - 10);
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      breakdown: {
        jobIncome,
        sponsorIncome,
        gymCost: campGymCost,
        housingCost: campHousingCost,
        foodCost: campFoodCost
      }
    };
  }

  // Balanço financeiro semanal (para compatibilidade)
  processWeeklyFinances() {
    return this.processCampFinances();
  }

  // Publicar nas Redes Sociais
  postSocialMedia(postType) {
    let followerGain = 0;
    let fameGain = 0;
    let stressDelta = 0;
    let message = '';

    if (postType === 'training') {
      followerGain = Math.round(50 + Math.random() * 80 + this.fighter.fame * 15);
      fameGain = 0.5;
      message = 'Você postou um vídeo impecável de manopla e sparring! A comunidade das lutas elogiou sua técnica.';
    } else if (postType === 'trash_talk') {
      followerGain = Math.round(150 + Math.random() * 250 + this.fighter.fame * 30);
      fameGain = 2.0;
      stressDelta = +8;
      message = 'Você provocou os rivais da categoria nas redes! Os comentários explodiram e o engajamento foi astronômico.';
    } else if (postType === 'humble_marcial') {
      followerGain = Math.round(40 + Math.random() * 60 + this.fighter.fame * 10);
      this.fighter.morale = Math.min(100, this.fighter.morale + 8);
      stressDelta = -5;
      message = 'Você compartilhou uma mensagem de respeito ao seu mestre e dedicação aos treinos. Imagem respeitada.';
    }

    this.fighter.followers += followerGain;
    this.fighter.fame = Math.min(100, this.fighter.fame + fameGain);
    this.fighter.stress = Math.max(0, Math.min(100, this.fighter.stress + stressDelta));

    return { message, followerGain, fameGain };
  }
}
