// combatUI.js - Controlador visual da arena de combate interativa com telemetria tática e opções situacionais dinâmicas

import { soundFX } from '../audio.js';
import { getMoveById } from '../data/movesData.js';
import { MODALITY_LABELS } from '../models/OpponentGenerator.js';
import { skillCheckEngine } from './skillCheckEngine.js';

export class CombatUI {
  constructor(combatEngine, onFightFinished) {
    this.engine = combatEngine;
    this.onFightFinished = onFightFinished;
    this.logContainer = null;
  }

  init() {
    this.logContainer = document.getElementById('combatLogList');
    skillCheckEngine.init();

    // Vincula o motor de Skill Check estilo Dead by Daylight ao motor de combate
    this.engine.onSkillCheck = async (params) => {
      return await skillCheckEngine.startCheck(params);
    };

    this.updateHUD();
    this.renderActionButtons();
    this.renderLogs();
  }

  updateHUD() {
    const pStats = this.engine.fighterStats.player;
    const oStats = this.engine.fighterStats.opponent;

    // Timer e Round
    const roundBadge = document.getElementById('combatRoundBadge');
    if (roundBadge) roundBadge.textContent = `ROUND ${this.engine.currentRound} / ${this.engine.totalRounds}`;

    // Header de Formato do Combate (Modalidade Pura vs Luta Livre)
    const formatHeader = document.getElementById('combatMatchFormatHeader');
    if (formatHeader) {
      const isCross = this.engine.matchType === 'CROSS_STYLE' || (this.engine.opponent.modality !== this.engine.player.modality);
      const pModLabel = MODALITY_LABELS[this.engine.player.modality] || this.engine.modality.name;
      const oModLabel = MODALITY_LABELS[this.engine.opponent.modality] || this.engine.opponent.modality;
      formatHeader.className = `combat-format-header-tag ${isCross ? 'header-cross' : 'header-pure'}`;
      formatHeader.innerHTML = isCross
        ? `⚔️ DESAFIO DE ESTILOS: <strong>${this.engine.styleClash || `${pModLabel} vs. ${oModLabel}`}</strong>`
        : `🥊 <strong>${this.engine.styleClash || `${pModLabel} Puro`}</strong>`;
    }

    const timerBadge = document.getElementById('combatTimerBadge');
    if (timerBadge) timerBadge.textContent = this.engine.getFormattedTime();

    const phaseBadge = document.getElementById('combatPhaseBadge');
    if (phaseBadge) {
      let phaseName = 'EM PÉ (TROCAÇÃO)';
      if (this.engine.phase === 'CLINCH') phaseName = 'CLINCH / GRADE';
      if (this.engine.phase === 'GROUND') {
        const topName = this.engine.groundTopFighter === 'player' ? 'Você por cima' : `${this.engine.opponent.shortName} por cima`;
        phaseName = `SOLO (${this.engine.groundPosition} - ${topName})`;
      }
      phaseBadge.textContent = phaseName;
    }

    // Nomes e Detalhes
    const pNameEl = document.getElementById('combatPlayerName');
    if (pNameEl) pNameEl.textContent = this.engine.player.name;

    const pModLabel = MODALITY_LABELS[this.engine.player.modality] || this.engine.modality.name;
    const pSubEl = document.getElementById('combatPlayerSub');
    if (pSubEl) pSubEl.textContent = `${this.engine.player.style || 'Lutador'} • ${pModLabel}`;

    const oNameEl = document.getElementById('combatOpponentName');
    if (oNameEl) oNameEl.textContent = this.engine.opponent.name;

    const oModLabel = MODALITY_LABELS[this.engine.opponent.modality] || this.engine.opponent.modality;
    const oSubEl = document.getElementById('combatOpponentSub');
    if (oSubEl) {
      const oTier = this.engine.opponent.tierBadge ? `[${this.engine.opponent.tierBadge}] ` : '';
      const oOrigin = this.engine.opponent.originDisplay ? ` • 📍 ${this.engine.opponent.originDisplay}` : (this.engine.opponent.nationality ? ` • 📍 ${this.engine.opponent.nationality}` : '');
      const oStrength = this.engine.opponent.strength ? ` • ${this.engine.opponent.strength}` : '';
      oSubEl.textContent = `${oTier}${this.engine.opponent.style || 'Desafiante'} (${oModLabel})${oOrigin}${oStrength}`;
    }

    // Badges de Condição Física em Tempo Real (Sem Rostos/Personagens!)
    this.updateConditionBadge('pStatusBadge', pStats, true);
    this.updateConditionBadge('oStatusBadge', oStats, false);

    // Telemetria em Tempo Real (Golpes, Quedas, etc.)
    this.setText('pStatStrikes', `${pStats.strikesLanded}/${pStats.strikesThrown}`);
    this.setText('pStatSig', `${pStats.sigStrikesLanded}`);
    this.setText('pStatTd', `${pStats.takedownsLanded}`);
    this.setText('pStatKd', `${pStats.knockdowns}`);

    this.setText('oStatStrikes', `${oStats.strikesLanded}/${oStats.strikesThrown}`);
    this.setText('oStatSig', `${oStats.sigStrikesLanded}`);
    this.setText('oStatTd', `${oStats.takedownsLanded}`);
    this.setText('oStatKd', `${oStats.knockdowns}`);

    // Barras de Integridade Anatômica do Jogador
    this.setBar('pHeadBar', 'pHeadVal', pStats.headHP, pStats.maxHead || 100);
    this.setBar('pBodyBar', 'pBodyVal', pStats.bodyHP, pStats.maxBody || 100);
    this.setBar('pLegsBar', 'pLegsVal', pStats.legsHP, pStats.maxLegs || 100);
    this.setBar('pStaminaBar', 'pStaminaVal', pStats.stamina, pStats.maxStamina || 100);
    this.setBar('pChinBar', 'pChinVal', pStats.chinHP, pStats.maxChin || 100);

    // Barras de Integridade Anatômica do Adversário
    this.setBar('oHeadBar', 'oHeadVal', oStats.headHP, oStats.maxHead || 100);
    this.setBar('oBodyBar', 'oBodyVal', oStats.bodyHP, oStats.maxBody || 100);
    this.setBar('oLegsBar', 'oLegsVal', oStats.legsHP, oStats.maxLegs || 100);
    this.setBar('oStaminaBar', 'oStaminaVal', oStats.stamina, oStats.maxStamina || 100);
    this.setBar('oChinBar', 'oChinVal', oStats.chinHP, oStats.maxChin || 100);

    // Banner Dinâmico da Situação do Combate
    const situation = this.engine.getCurrentSituation();
    const sitBanner = document.getElementById('combatSituationBanner');
    const sitLabel = document.getElementById('combatSitLabel');
    const sitDesc = document.getElementById('combatSitDesc');
    const dockBadge = document.getElementById('dockSituationBadge');

    if (sitBanner && situation) {
      sitBanner.className = `combat-situation-banner ${situation.badgeClass || 'situation-neutral'}`;
    }
    if (sitLabel && situation) sitLabel.textContent = situation.label;
    if (sitDesc && situation) sitDesc.textContent = situation.desc;
    if (dockBadge && situation) dockBadge.textContent = situation.id.replace(/_/g, ' ');
  }

  updateConditionBadge(badgeId, stats, isPlayer) {
    const el = document.getElementById(badgeId);
    if (!el) return;

    const chinThreshold = stats.maxChin ? stats.maxChin * 0.22 : 45;
    const headThreshold = stats.maxHead ? stats.maxHead * 0.20 : 35;

    if (stats.chinHP <= chinThreshold || stats.headHP <= headThreshold) {
      el.className = 'combat-condition-badge status-danger';
      el.textContent = isPlayer ? '🚨 GROGUE / BALANÇADO' : '⚡ BALANÇADO / QUEIXO TRÊMULO';
    } else if (stats.cuts >= 30) {
      el.className = 'combat-condition-badge status-cut';
      el.textContent = `🩸 CORTE SANGRANDO (${stats.cuts}%)`;
    } else if (stats.stamina <= 30) {
      el.className = 'combat-condition-badge status-warning';
      el.textContent = '🫁 EXAUSTO / SEM GÁS';
    } else if (stats.legsHP <= (stats.maxLegs ? stats.maxLegs * 0.35 : 45)) {
      el.className = 'combat-condition-badge status-warning';
      el.textContent = '🦵 PERNA AVARIADA';
    } else {
      el.className = 'combat-condition-badge status-healthy';
      el.textContent = '🟢 EM PLENA FORMA';
    }
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  setBar(barId, valId, currentVal, maxVal = 100) {
    const bar = document.getElementById(barId);
    const valEl = document.getElementById(valId);
    const max = maxVal > 0 ? maxVal : 100;
    const pct = Math.max(0, Math.min(100, Math.round((currentVal / max) * 100)));
    if (bar) bar.style.width = `${pct}%`;
    if (valEl) valEl.textContent = `${pct}%`;
  }

  renderActionButtons() {
    const container = document.getElementById('combatActionsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (this.engine.isOver) {
      const btnEnd = document.createElement('button');
      btnEnd.className = 'btn btn-primary btn-pulse';
      btnEnd.style.cssText = 'grid-column: 1 / -1; padding: 18px; font-size: 1.15rem;';
      btnEnd.textContent = '🏆 Ver Resultado Oficial & Voltar para a Carreira';
      btnEnd.onclick = () => {
        skillCheckEngine.cleanup();
        soundFX.playClick();
        if (this.onFightFinished) this.onFightFinished(this.engine.getFightSummary());
      };
      container.appendChild(btnEnd);
      return;
    }

    if (this.engine.isBetweenRounds) {
      const title = document.createElement('div');
      title.className = 'corner-title';
      title.style.cssText = 'grid-column: 1 / -1; text-align: center; font-weight: 700; color: #f59e0b; margin-bottom: 8px;';
      title.textContent = 'MINUTO DE INTERVALO: INSTRUÇÃO DO CÓRNER';
      container.appendChild(title);

      const actions = [
        { id: 'deep_breaths', label: 'Respirar Fundo (+35% Gás)', desc: 'Recupera oxigênio e estamina', icon: '🫁' },
        { id: 'ice_vaseline', label: 'Gelo & Vaselina', desc: 'Estanca cortes e reduz inchaço', icon: '🧊' },
        { id: 'tactical_advice', label: 'Ouvir Instruções do Corner', desc: 'Recupera o queixo e foco mental', icon: '🗣️' }
      ];

      actions.forEach(act => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-action-corner';
        btn.innerHTML = `<strong>${act.icon} ${act.label}</strong><small>${act.desc}</small>`;
        btn.onclick = () => {
          this.engine.applyCornerAction(act.id);
          this.refreshAll();
        };
        container.appendChild(btn);
      });
      return;
    }

    // VERIFICA SE ESTÁ NA PAUSA TÁTICA (A CADA 4 GOLPES)
    if (this.engine.isTacticalPause) {
      const pStats = this.engine.fighterStats.player;
      const oStats = this.engine.fighterStats.opponent;

      const pauseBox = document.createElement('div');
      pauseBox.className = 'tactical-pause-card';
      pauseBox.style.cssText = 'grid-column: 1 / -1; background: #131722; border: 1px solid rgba(255, 209, 102, 0.35); border-radius: 12px; padding: 20px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6); text-align: center;';
      pauseBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="font-size:0.82rem; font-weight:800; color:#ffd166; letter-spacing:1px; background:rgba(255,209,102,0.15); padding:4px 12px; border-radius:999px;">
            ⏸️ PAUSA TÁTICA • 4 GOLPES CONCLUÍDOS
          </span>
          <span style="font-size:0.85rem; font-weight:700; color:#94a3b8;">
            Tempo no Round: ${this.engine.getFormattedTime()}
          </span>
        </div>
        <p style="color:#cbd5e1; font-size:0.95rem; line-height:1.5; margin-bottom:16px;">
          Sequência de <strong>4 trocas de golpes finalizada</strong>. Os lutadores circulam no centro do ringue/octógono, recuperam o fôlego e analisam a distância para o próximo avanço.
        </p>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:18px;">
          <div style="background:#0d1017; border:1px solid rgba(255,255,255,0.08); padding:8px 14px; border-radius:8px;">
            <span style="font-size:0.75rem; color:#94a3b8; display:block;">Sua Estamina</span>
            <strong style="color:#34d399; font-size:1.05rem;">${Math.round(pStats.stamina)}%</strong>
          </div>
          <div style="background:#0d1017; border:1px solid rgba(255,255,255,0.08); padding:8px 14px; border-radius:8px;">
            <span style="font-size:0.75rem; color:#94a3b8; display:block;">Estamina Rival</span>
            <strong style="color:#f59e0b; font-size:1.05rem;">${Math.round(oStats.stamina)}%</strong>
          </div>
          <div style="background:#0d1017; border:1px solid rgba(255,255,255,0.08); padding:8px 14px; border-radius:8px;">
            <span style="font-size:0.75rem; color:#94a3b8; display:block;">Total de Golpes no Round</span>
            <strong style="color:#ffd166; font-size:1.05rem;">${pStats.strikesThrown + oStats.strikesThrown}</strong>
          </div>
        </div>
        <button id="btnResumeTacticalPause" class="btn btn-primary btn-pulse" style="width:100%; padding:15px; font-size:1.1rem; font-weight:800;">
          ▶️ RETOMAR COMBATE (PRÓXIMOS 4 GOLPES)
        </button>
      `;

      pauseBox.querySelector('#btnResumeTacticalPause').onclick = () => {
        soundFX.playClick();
        this.engine.resumeFromTacticalPause();
        this.refreshAll();
      };

      container.appendChild(pauseBox);
      return;
    }

    // BARRA DE CADÊNCIA (4 GOLPES ATÉ A PAUSA)
    const cadenceBar = document.createElement('div');
    cadenceBar.className = 'combat-cadence-bar';
    cadenceBar.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; background: #0e1118; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 8px 16px; margin-bottom: 8px;';
    
    const count = this.engine.strikesInSequence || 0;
    const dotsHtml = [1, 2, 3, 4].map(n => `
      <span style="display:inline-block; width:22px; height:22px; border-radius:50%; text-align:center; line-height:22px; font-size:0.75rem; font-weight:800; margin:0 3px; background:${n <= count ? '#ffd166' : '#222836'}; color:${n <= count ? '#000' : '#64748b'}; border:1px solid ${n <= count ? '#ffd166' : 'rgba(255,255,255,0.08)'};">
        ${n}
      </span>
    `).join('');

    cadenceBar.innerHTML = `
      <span style="font-size:0.78rem; font-weight:800; color:#94a3b8; letter-spacing:0.5px;">SEQUÊNCIA ATUAL:</span>
      <div>${dotsHtml}</div>
      <span style="font-size:0.75rem; font-weight:700; color:#cbd5e1;">${4 - count} golpe(s) até a pausa tática</span>
    `;
    container.appendChild(cadenceBar);

    // AÇÕES DINÂMICAS ADAPTADAS AO QUE ESTÁ ACONTECENDO NA LUTA
    const actions = this.getAvailableActions();

    actions.forEach(act => {
      const btn = document.createElement('button');
      btn.className = `btn btn-combat ${act.cls || ''}`;
      btn.innerHTML = `<strong>${act.label}</strong><small>${act.desc}</small>`;
      btn.onclick = async () => {
        container.querySelectorAll('button').forEach(b => b.disabled = true);
        await this.engine.executeExchange(act.id);
        this.refreshAll();
      };
      container.appendChild(btn);
    });
  }

  getAvailableActions() {
    const mod = this.engine.modality;
    const situation = this.engine.getCurrentSituation();
    const sitId = situation ? situation.id : 'STANDUP_NEUTRAL';
    const actions = [];

    // -------------------------------------------------------------
    // SITUAÇÃO 1: JOGADOR BALANÇADO / GROGUE (Modo Sobrevivência)
    // -------------------------------------------------------------
    if (sitId === 'PLAYER_ROCKED') {
      actions.push({
        id: 'turtle_guard',
        label: '🛡️ Guarda Concha Total',
        desc: 'Esconde a cabeça entre as luvas e absorve impactos (+Queixo)',
        cls: 'btn-survival'
      });
      actions.push({
        id: 'survival_clinch',
        label: '🤼 Amarrar no Clinch',
        desc: 'Mergulha e trava os braços do rival para parar o ataque',
        cls: 'btn-survival'
      });
      actions.push({
        id: 'circle_evade',
        label: '🏃 Circular & Sair da Grade',
        desc: 'Jogo de pernas lateral evasivo para escapar da linha de tiro',
        cls: 'btn-defend'
      });
      actions.push({
        id: 'hail_mary_counter',
        label: '⚡ Golpe do Desespero de Encontro',
        desc: 'Arrisca um cruzado kamikaze para virar a luta milagrosamente',
        cls: 'btn-power'
      });
      return actions;
    }

    // SITUAÇÃO 2: ADVERSÁRIO GROGUE / BALANÇADO
    // O jogador não fica mais restrito a 'blitz' ou 'tiro certeiro'. O arsenal completo
    // (5 golpes da modalidade + golpes especiais desbloqueados) permanece 100% livre para ser usado!


    // -------------------------------------------------------------
    // SITUAÇÃO 3: LUTA NO SOLO (Diferenciado por Montada, Costas, Guarda)
    // -------------------------------------------------------------
    if (sitId === 'GROUND_MOUNT') {
      actions.push({
        id: 'ground_and_pound',
        label: '💥 Marretadas da Montada',
        desc: 'Cotovelos e socos pesados de cima para baixo',
        cls: 'btn-finisher'
      });
      actions.push({
        id: 'armbar_mount',
        label: '🥋 Chave de Braço (Armlock)',
        desc: 'Gira o quadril e busca a finalização imediata',
        cls: 'btn-sub'
      });
      actions.push({
        id: 'head_arm_choke',
        label: '🥋 Katagatame (Estrangulamento)',
        desc: 'Arrocha o pescoço e apaga o adversário',
        cls: 'btn-sub'
      });
      actions.push({
        id: 'stand_up',
        label: '🧗 Ficar em Pé',
        desc: 'Levanta e manda a luta voltar em pé',
        cls: 'btn-defend'
      });
      return actions;
    }

    if (sitId === 'GROUND_BACK') {
      actions.push({
        id: 'rear_naked_choke',
        label: '🥋 Mata-Leão Ajustado (RNC)',
        desc: 'Braço no pescoço e mão na nuca para finalizar',
        cls: 'btn-sub btn-pulse'
      });
      actions.push({
        id: 'ground_and_pound',
        label: '💥 Socos na Orelha e Costelas',
        desc: 'Castigo contínuo para abrir a defesa do pescoço',
        cls: 'btn-power'
      });
      actions.push({
        id: 'pass_guard',
        label: '🔄 Transicionar para Montada',
        desc: 'Gira para a barriga do adversário',
        cls: 'btn-grapple'
      });
      actions.push({
        id: 'stand_up',
        label: '🧗 Levantar',
        desc: 'Voltar a luta em pé',
        cls: 'btn-defend'
      });
      return actions;
    }

    if (sitId === 'GROUND_TOP_GUARD') {
      if (mod.hasGroundGame && mod.allowedStrikes.length > 0) {
        actions.push({
          id: 'ground_and_pound',
          label: '🥊 Ground and Pound na Guarda',
          desc: 'Marretadas pesadas na linha de frente',
          cls: 'btn-power'
        });
      }
      actions.push({
        id: 'pass_guard',
        label: '🥋 Passar para Montada',
        desc: 'Aumenta o controle posicional dominante',
        cls: 'btn-grapple'
      });
      actions.push({
        id: 'take_back',
        label: '🥋 Pegar as Costas',
        desc: 'Ganchos e domínio da nuca',
        cls: 'btn-sub'
      });
      actions.push({
        id: 'submission_attempt',
        label: '🥋 Buscar Finalização',
        desc: 'Chave de braço ou estrangulamento',
        cls: 'btn-sub'
      });
      actions.push({
        id: 'stand_up',
        label: '🧗 Levantar e Chamar em Pé',
        desc: 'Sair do solo',
        cls: 'btn-defend'
      });
      return actions;
    }

    if (sitId === 'GROUND_BOTTOM') {
      actions.push({
        id: 'sweep',
        label: '🔄 Tentar Raspagem',
        desc: 'Inverter a posição e cair montado',
        cls: 'btn-grapple'
      });
      actions.push({
        id: 'submission_attempt',
        label: '🥋 Triângulo da Guarda',
        desc: 'Finalização surpresa por baixo',
        cls: 'btn-sub'
      });
      actions.push({
        id: 'tie_up_guard',
        label: '🤼 Fechar Guarda e Amarrar',
        desc: 'Cola o peito do rival até o árbitro mandar levantar',
        cls: 'btn-defend'
      });
      actions.push({
        id: 'stand_up',
        label: '🧗 Escalar Grade & Levantar',
        desc: 'Ficar em pé na raça e na explosão',
        cls: 'btn-defend'
      });
      return actions;
    }

    // -------------------------------------------------------------
    // SITUAÇÃO 4: CLINCH / CORPO A CORPO
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // SITUAÇÃO 4: CLINCH / CORPO A CORPO
    // -------------------------------------------------------------
    if (sitId === 'CLINCH') {
      if (mod.id === 'boxing') {
        actions.push({
          id: 'body_rip_short',
          label: '🥊 Gancho Curto no Fígado',
          desc: 'Golpeia na curta distância colado às costelas do rival',
          cls: 'btn-power'
        });
        actions.push({
          id: 'uppercut_inside',
          label: '🥊 Uppercut Curto por Dentro',
          desc: 'Fura a guarda por baixo na separação do árbitro',
          cls: 'btn-power'
        });
        actions.push({
          id: 'tie_up_arms',
          label: '🔒 Travar Braços do Oponente',
          desc: 'Amorfa o ataque e força o árbitro a comandar "BREAK"',
          cls: 'btn-defend'
        });
        actions.push({
          id: 'break_clinch',
          label: '🚪 Romper Clinch no Passo Atrás',
          desc: 'Empurra com antebraço e volta à média distância',
          cls: 'btn-defend'
        });
        return actions;
      }

      if (mod.hasKnees) {
        actions.push({
          id: 'clinch_knee',
          label: '💥 Joelhada no Corpo',
          desc: 'Esmaga as costelas e tira o oxigênio',
          cls: 'btn-power'
        });
      }
      if (mod.hasElbows) {
        actions.push({
          id: 'clinch_elbow',
          label: '⚡ Cotovelada Curta',
          desc: 'Abre e aprofunda cortes no supercílio',
          cls: 'btn-power'
        });
      }
      if (mod.hasTakedowns) {
        actions.push({
          id: 'clinch_trip',
          label: '🤼 Rasteira / Queda de Judô',
          desc: 'Projetar o rival no solo',
          cls: 'btn-grapple'
        });
      }
      actions.push({
        id: 'cage_press',
        label: '🛡️ Pressionar na Grade e Amarrar',
        desc: 'Desgasta o gás do oponente na isometria',
        cls: 'btn-defend'
      });
      actions.push({
        id: 'break_clinch',
        label: '🚪 Romper Clinch',
        desc: 'Empurrar com antebraço e voltar à distância',
        cls: 'btn-defend'
      });
      return actions;
    }

    // -------------------------------------------------------------
    // SITUAÇÕES ESPECIAIS EM PÉ: CORTE, FADIGA, PERNA
    // -------------------------------------------------------------

    // Se o adversário está sangrando muito por corte
    if (sitId === 'OPPONENT_CUT') {
      actions.push({
        id: 'target_the_cut',
        label: '🩸 Castigar o Corte Aberto',
        desc: 'Mirar socos retos na ferida para forçar TKO médico!',
        cls: 'btn-target-cut'
      });
    }

    // Se o adversário está sem gás
    if (sitId === 'OPPONENT_GASSED') {
      actions.push({
        id: 'body_punishment',
        label: '🥊 Castigo na Linha de Cintura',
        desc: 'Gancho no fígado para liquidar o resto do fôlego!',
        cls: 'btn-power'
      });
      actions.push({
        id: 'increase_pace',
        label: '⚡ Aumentar Ritmo e Sufocar',
        desc: 'Pressionar sem dar tempo de respirar',
        cls: 'btn-strike'
      });
    }

    // Se o jogador está sem gás
    if (sitId === 'PLAYER_GASSED') {
      actions.push({
        id: 'pace_and_jab',
        label: '🌬️ Pautar com Jab & Respirar',
        desc: 'Jab leve para manter distância e recuperar gás (+Fôlego)',
        cls: 'btn-strike'
      });
      actions.push({
        id: 'rest_in_clinch',
        label: '🤼 Travar no Clinch & Descansar',
        desc: 'Controlar a postura no clinch e respirar (+Fôlego)',
        cls: 'btn-clinch'
      });
      actions.push({
        id: 'defensive_footwork',
        label: '👣 Jogo de Pernas Evasivo',
        desc: 'Recuar sem golpear para oxigenar os músculos',
        cls: 'btn-defend'
      });
      // Não bloqueia os outros golpes; apenas oferece opções de descanso
    }

    // Se o adversário está com a perna avariada
    if (sitId === 'OPPONENT_LEGS_HURT' && mod.hasKicks) {
      actions.push({
        id: 'finish_leg_kick',
        label: '🦵 Chute Baixo Decisivo (Buscar TKO)',
        desc: 'Canelada precisa para desgastar a base avariada e forçar o TKO!',
        cls: 'btn-kick btn-pulse'
      });
    }

    // -------------------------------------------------------------
    // GOLPES PADRÃO DA MODALIDADE (Trocação Neutra)
    // -------------------------------------------------------------
    if (mod.id === 'jiu_jitsu') {
      actions.push({
        id: 'takedown',
        label: '🤼 Mergulho de Queda (Double Leg)',
        desc: 'Mergulha nas duas pernas para arrastar ao tatame',
        cls: 'btn-grapple'
      });
      actions.push({
        id: 'clinch_trip',
        label: '🥋 Clinch & Queda de Judô',
        desc: 'Trava as golas e desfere rasteira precisa',
        cls: 'btn-grapple'
      });
      actions.push({
        id: 'counter_stance',
        label: '🛡️ Base Baixa & Sprawl Preventivo',
        desc: 'Defende tentativas de queda do rival',
        cls: 'btn-defend'
      });
    } else if (mod.id === 'judo') {
      actions.push({
        id: 'takedown',
        label: '🤼 Entrada de Ippon (Seoi Nage)',
        desc: 'Giro de quadril explosivo para projetar com impacto total',
        cls: 'btn-grapple'
      });
      actions.push({
        id: 'clinch_trip',
        label: '🤼 Ceifada Osoto Gari',
        desc: 'Varre a perna do rival desequilibrado',
        cls: 'btn-grapple'
      });
      actions.push({
        id: 'counter_stance',
        label: '🛡️ Shisei (Postura Defensiva)',
        desc: 'Equilíbrio inquebrável contra projeções rivais',
        cls: 'btn-defend'
      });
    } else {
      // Boxe, Muay Thai, Kickboxing, MMA, Wrestling
      actions.push({
        id: 'jab',
        label: 'Jab de Medição',
        desc: 'Rápido, baixo custo de gás, pontua na distância',
        cls: 'btn-strike'
      });

      actions.push({
        id: 'combo_1_2',
        label: 'Combinação 1-2',
        desc: 'Jab + Direto no queixo com precisão',
        cls: 'btn-strike'
      });

      actions.push({
        id: 'power_overhand',
        label: 'Overhand Potente',
        desc: 'Alto impacto no queixo, risco de contra-golpe',
        cls: 'btn-power'
      });

      if (mod.hasKicks) {
        actions.push({
          id: 'low_kick',
          label: 'Chute Baixo na Coxa',
          desc: 'Destrói a base e mobilidade do oponente',
          cls: 'btn-kick'
        });
        actions.push({
          id: 'head_kick',
          label: 'Chute Alto na Cabeça',
          desc: 'Risco de nocaute fulminante',
          cls: 'btn-power'
        });
      }

      if (mod.hasTakedowns) {
        actions.push({
          id: 'takedown',
          label: 'Mergulho de Queda (Double Leg)',
          desc: 'Levar a luta para o solo',
          cls: 'btn-grapple'
        });
      }

      if (mod.hasClinchStrikes || mod.id === 'boxing') {
        actions.push({
          id: 'clinch',
          label: mod.id === 'boxing' ? 'Entrar no Clinch de Boxe' : 'Entrar no Clinch',
          desc: 'Travar o adversário na curta distância',
          cls: 'btn-clinch'
        });
      }

      actions.push({
        id: 'counter_stance',
        label: mod.id === 'boxing' ? 'Pêndulo & Esquiva Ativa' : 'Pêndulo & Contra-Ataque',
        desc: 'Foco em esquiva e precisão de encontro',
        cls: 'btn-defend'
      });
    }

    // -------------------------------------------------------------
    // GOLPES ESPECIAIS DESBLOQUEADOS NO ARSENAL (Comprados com PH)
    // -------------------------------------------------------------
    const unlocked = this.engine.player?.unlockedMoves || [];
    const currentPhase = this.engine.phase;

    unlocked.forEach(moveId => {
      const move = getMoveById(moveId);
      if (!move || move.isBasic) return;

      // FILTRAGEM ESTRITA: O golpe DEVE pertencer à modalidade da luta atual
      // No Boxe, NUNCA aparecem golpes de Jiu-Jitsu, Muay Thai ou Wrestling
      if (move.modalities && !move.modalities.includes(mod.id) && mod.id !== 'mma') {
        return;
      }

      // Verifica se o golpe é compatível com a fase atual do combate
      const isMatch = (move.phase === currentPhase) ||
        (currentPhase === 'CLINCH' && (move.id === 'suplex_slam' || move.id === 'kimura_trap')) ||
        (currentPhase === 'GROUND' && (move.phase === 'GROUND' || move.category === 'submission'));

      if (isMatch) {
        // Se já não estiver na lista
        if (!actions.some(a => a.id === move.id)) {
          actions.unshift({
            id: move.id,
            label: `${move.icon} ${move.name} ⭐`,
            desc: `[Arsenal] ${move.desc.substring(0, 52)}... (${move.damage} Dano | ${move.staminaCost} Gás)`,
            cls: 'btn-special-move btn-pulse'
          });
        }
      }
    });

    return actions;
  }

  renderLogs() {
    if (!this.logContainer) return;
    this.logContainer.innerHTML = '';

    this.engine.actionLog.slice(0, 16).forEach(item => {
      const el = document.createElement('div');
      el.className = `combat-log-item log-${item.type}`;
      el.innerHTML = `<span class="log-time">[R${item.round} ${item.time}]</span> ${item.text}`;
      this.logContainer.appendChild(el);
    });
  }

  refreshAll() {
    this.updateHUD();
    this.renderActionButtons();
    this.renderLogs();
  }
}
