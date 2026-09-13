// worldEngine.js - Simulação autônoma do mundo das lutas, rankings mundiais (Top 50 + Campeão) e notícias

import { generateOpponent } from '../models/OpponentGenerator.js';

export class WorldEngine {
  constructor(player) {
    this.player = player;
    this.rankings = this.initDivisionRankings();
    this.worldNews = [
      'Bem-vindo ao circuito profissional de esportes de combate. O mundo está atento aos novos talentos.',
      'A Federação Internacional anunciou o ranking oficial unificado com os 50 melhores atletas do planeta.',
      'Veteranos da divisão estão na mira de jovens prospects famintos por glória.',
      'Desafios de estilos (Luta Livre e superlutas abertas) movimentam as arenas mundiais.'
    ];
  }

  // Inicializa o ranking completo: Campeão (#0) + Top 50 Mundiais (#1 ao #50)
  initDivisionRankings() {
    const list = [];
    
    // Campeão Atual (#0)
    const champion = generateOpponent(this.player, { isTitleFight: true, tier: 'MUNDIAL' });
    champion.title = 'Campeão Mundial Indiscutível';
    champion.rank = 0; // 0 = Campeão
    champion.record.wins = 28 + Math.floor(Math.random() * 8);
    champion.record.losses = Math.floor(Math.random() * 2);
    champion.name = champion.shortName + ' [CAMPEÃO MUNDIAL]';
    list.push(champion);

    // #1 ao #50 (Estratificado por Tiers Reais de Elite, Contenders, Médios e Gatekeepers)
    for (let r = 1; r <= 50; r++) {
      let tier = 'AMADOR';
      let minWins = 6;
      let maxWins = 12;
      let maxLosses = 8;

      if (r <= 5) {
        tier = 'MUNDIAL';
        minWins = 20;
        maxWins = 27;
        maxLosses = 3;
      } else if (r <= 15) {
        tier = 'ELITE';
        minWins = 15;
        maxWins = 22;
        maxLosses = 5;
      } else if (r <= 30) {
        tier = 'MEDIANO';
        minWins = 11;
        maxWins = 17;
        maxLosses = 7;
      } else {
        tier = 'MEDIANO';
        minWins = 7;
        maxWins = 13;
        maxLosses = 9;
      }

      const opp = generateOpponent(this.player, { rankTier: r, tier: tier });
      opp.rank = r;
      opp.record.wins = minWins + Math.floor(Math.random() * (maxWins - minWins + 1));
      opp.record.losses = Math.floor(Math.random() * maxLosses);
      opp.record.fights = opp.record.wins + opp.record.losses + (opp.record.draws || 0);
      list.push(opp);
    }

    return list;
  }

  // Garante que saves antigos ou migrações tenham os 51 lutadores completos
  ensureFullRoster() {
    if (!this.rankings || this.rankings.length === 0) {
      this.rankings = this.initDivisionRankings();
      return;
    }

    // Se tiver menos de 51 lutadores, preenche os ranks faltantes até o #50
    const currentLen = this.rankings.length;
    if (currentLen < 51) {
      for (let r = currentLen; r <= 50; r++) {
        const opp = generateOpponent(this.player, { rankTier: r, tier: r <= 30 ? 'MEDIANO' : 'AMADOR' });
        opp.rank = r;
        opp.record.wins = Math.max(6, 14 - Math.floor(r / 5) + Math.floor(Math.random() * 4));
        opp.record.losses = 2 + Math.floor(Math.random() * 6);
        opp.record.fights = opp.record.wins + opp.record.losses;
        this.rankings.push(opp);
      }
    }
  }

  getChampion() {
    this.ensureFullRoster();
    return this.rankings[0];
  }

  getRankedFighters() {
    this.ensureFullRoster();
    return this.rankings.slice(1);
  }

  // Simula lutas entre lutadores autônomos do Top 50 toda semana
  simulateAutonomousFights() {
    this.ensureFullRoster();
    if (this.rankings.length < 10) return;

    // Simula 2 a 3 lutas no ranking por semana
    const bouts = Math.floor(Math.random() * 2) + 2;
    for (let b = 0; b < bouts; b++) {
      // Sorteia lutadores em faixas próximas de ranking (ex: intervalo de 8 posições)
      const idx1 = Math.floor(Math.random() * (this.rankings.length - 1)) + 1;
      const spread = Math.floor(Math.random() * 7) + 1;
      let idx2 = Math.min(this.rankings.length - 1, Math.max(1, idx1 + (Math.random() > 0.5 ? spread : -spread)));
      if (idx1 === idx2) {
        idx2 = idx1 === 1 ? 2 : idx1 - 1;
      }

      const f1 = this.rankings[idx1];
      const f2 = this.rankings[idx2];
      if (!f1 || !f2) continue;

      const f1Attrs = f1.attributes || {};
      const f2Attrs = f2.attributes || {};
      const f1Power = ((f1Attrs.punchPower || 60) + (f1Attrs.fightIQ || 60) + (f1Attrs.chin || 60)) / 3;
      const f2Power = ((f2Attrs.punchPower || 60) + (f2Attrs.fightIQ || 60) + (f2Attrs.chin || 60)) / 3;

      const f1Wins = (f1Power + Math.random() * 26) > (f2Power + Math.random() * 26);
      const winner = f1Wins ? f1 : f2;
      const loser = f1Wins ? f2 : f1;

      winner.record.wins++;
      loser.record.losses++;

      const winIdx = f1Wins ? idx1 : idx2;
      const loseIdx = f1Wins ? idx2 : idx1;

      // Se o lutador de ranking inferior venceu o de ranking superior: troca de posições!
      if (winIdx > loseIdx) {
        this.rankings[loseIdx] = winner;
        this.rankings[winIdx] = loser;
        winner.rank = loseIdx;
        loser.rank = winIdx;

        if (loseIdx <= 15) {
          this.addNews(`ZEBRA NO TOP 15! #${winIdx} ${winner.shortName} surpreendeu #${loseIdx} ${loser.shortName} e subiu no ranking mundial!`);
        }
      }
    }

    // Ocasionalmente, o campeão defende o título contra o Desafiante #1
    if (Math.random() < 0.08) {
      this.simulateTitleFight();
    }
  }

  // Simula disputa autônoma de cinturão mundial
  simulateTitleFight() {
    this.ensureFullRoster();
    const champ = this.rankings[0];
    const contender = this.rankings[1];
    if (!champ || !contender) return;

    const champRoll = ((champ.attributes.chin || 70) + (champ.attributes.fightIQ || 70)) + Math.random() * 28;
    const contRoll = ((contender.attributes.punchPower || 70) + (contender.attributes.fightIQ || 70)) + Math.random() * 28;

    if (contRoll > champRoll + 18) {
      // Novo campeão mundial
      this.rankings[0] = contender;
      this.rankings[1] = champ;
      contender.rank = 0;
      champ.rank = 1;
      contender.name = contender.shortName + ' [CAMPEÃO MUNDIAL]';
      this.addNews(`NOVO CAMPEÃO MUNDIAL! #${contender.shortName} destrona ${champ.shortName} com um nocaute histórico!`);
    } else {
      champ.record.wins++;
      contender.record.losses++;
      this.addNews(`E AINDA CAMPEÃO! ${champ.shortName} vence ${contender.shortName} e mantém o cinturão mundial unificado.`);
    }
  }

  addNews(text) {
    this.worldNews.unshift(text);
    if (this.worldNews.length > 25) this.worldNews.pop();
  }

  // Atualiza o ranking do jogador após uma vitória com progressão realista e gradual
  updatePlayerRankOnWin(opponent) {
    this.ensureFullRoster();
    if (this.player.isChampion) {
      this.addNews(`DOMÍNIO ABSOLUTO! ${this.player.name} defende com sucesso o cinturão mundial unificado!`);
      return;
    }

    // Caso 1: Venceu o Campeão Mundial (#0)
    if (opponent.rank === 0 || (opponent.name && opponent.name.includes('[CAMPEÃO]')) || opponent.title === 'Campeão Mundial Indiscutível') {
      this.player.isChampion = true;
      this.player.ranking = 0;
      this.player.titlesHeld = this.player.titlesHeld || [];
      this.player.titlesHeld.unshift({
        title: 'Cinturão Mundial Unificado',
        modality: this.player.modality,
        dateWon: `Semana ${this.player.careerWeeks}`
      });
      this.addNews(`COROAÇÃO HISTÓRICA! ${this.player.name} VENCEU O CAMPEÃO MUNDIAL E É O NOVO REI DA CATEGORIA!`);
      return;
    }

    // Caso 2: Jogador é Não-Ranqueado (ranking === null)
    if (this.player.ranking === null) {
      const isOppRanked = opponent.rank && opponent.rank > 0 && opponent.rank <= 50;
      const hasMinFightsToRank = (this.player.record.wins >= 3) || isOppRanked;

      if (hasMinFightsToRank) {
        // Estreia oficial no Top 50 entre a 48ª e 50ª colocação
        const entryRank = isOppRanked ? Math.min(50, Math.max(42, opponent.rank)) : 50;
        this.player.ranking = entryRank;
        this.addNews(`ESTREIA NO TOP 50! Com performance sólida, ${this.player.name} ingressa oficialmente na #${this.player.ranking} posição do ranking mundial!`);
      } else {
        this.addNews(`${this.player.name} soma mais um triunfo no circuito de base (${this.player.record.wins}V-${this.player.record.losses}D), aproximando-se da entrada no Top 50.`);
      }
      return;
    }

    // Caso 3: Jogador já está no Top 50 (#50 ao #1)
    const currentRank = this.player.ranking;
    const isOppRanked = opponent.rank && opponent.rank > 0 && opponent.rank <= 50;
    let climb = 0;

    if (!isOppRanked) {
      // Venceu oponente sem ranking: defende a posição e só sobe se estiver nos rankings inferiores
      if (currentRank > 35) {
        climb = 1;
      } else {
        climb = 0;
        this.addNews(`${this.player.name} defende sua posição #${currentRank} com vitória segura sobre adversário fora do ranking.`);
        return;
      }
    } else {
      // Venceu oponente ranqueado
      if (currentRank > 30) {
        // Faixa #50 ao #31: sobe 2 a 3 posições
        climb = Math.floor(Math.random() * 2) + 2;
      } else if (currentRank > 15) {
        // Faixa #30 ao #16: sobe 1 a 2 posições
        climb = Math.floor(Math.random() * 2) + 1;
      } else if (currentRank > 5) {
        // Faixa #15 ao #6 (Top 15): sobe estritamente 1 posição por combate
        climb = 1;
      } else if (currentRank > 1) {
        // Faixa #5 ao #2 (Elite Mundial): sobe apenas contra atletas de rank igual ou superior
        if (opponent.rank <= currentRank) {
          climb = 1;
        } else {
          climb = 0;
          this.addNews(`${this.player.name} defende com autoridade a posição #${currentRank} contra #${opponent.rank} ${opponent.shortName}.`);
          return;
        }
      } else {
        // Já é o Desafiante Número 1 (#1)!
        climb = 0;
        this.addNews(`${this.player.name} confirma o status de DESAFIANTE NÚMERO 1 (#1) e exige a luta pelo cinturão mundial!`);
        return;
      }
    }

    const previousRank = this.player.ranking;
    this.player.ranking = Math.max(1, currentRank - climb);

    if (this.player.ranking < previousRank) {
      this.addNews(`SUBIDA NO RANKING! ${this.player.name} avança da posição #${previousRank} para #${this.player.ranking} do ranking mundial!`);
    }
  }

  // Queda no ranking em caso de derrota
  updatePlayerRankOnLoss() {
    this.ensureFullRoster();
    if (this.player.isChampion) {
      this.player.isChampion = false;
      this.player.ranking = 2;
      this.addNews(`${this.player.name} perdeu o cinturão mundial e agora recua para a posição #2 dos desafiantes.`);
      return;
    }

    if (this.player.ranking !== null) {
      const drop = this.player.ranking <= 15 ? 2 : (Math.floor(Math.random() * 3) + 2);
      const newRank = this.player.ranking + drop;

      if (newRank > 50) {
        this.player.ranking = null;
        this.addNews(`Revés amargo! Com o acúmulo de resultados, ${this.player.name} deixa o Top 50 mundial e retorna ao circuito regional sem ranking.`);
      } else {
        this.player.ranking = newRank;
        this.addNews(`Após o revés no combate, ${this.player.name} recua para a posição #${this.player.ranking} do ranking mundial.`);
      }
    }
  }
}

