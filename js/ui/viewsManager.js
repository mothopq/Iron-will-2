// viewsManager.js - Renderizador e controlador de todas as telas e menus do jogo

import { gameState } from '../state.js';
import { soundFX } from '../audio.js';
import { MODALITIES, getAttributesForModality } from '../data/modalities.js';
import { WEIGHT_CLASSES } from '../data/weightClasses.js';
import { GYMS, EQUIPMENT } from '../data/gyms.js';
import { JOBS, HOUSING, AVAILABLE_SPONSORS } from '../systems/lifeEngine.js';
import { TRAINING_ACTIVITIES, getActivitiesForModality } from '../systems/trainingEngine.js';
import { generateOpponent } from '../models/OpponentGenerator.js';
import { CombatEngine } from '../systems/combatEngine.js';
import { CombatUI } from './combatUI.js';
import { getEligibleRandomEvent } from '../data/events.js';
import { CreationWizard } from '../creationWizard.js';
import { getSkillTier } from '../models/Fighter.js';
import { generateChampionshipOffers, isOlympicYear, getYearsToNextOlympics } from '../data/championships.js';
import { getStarterMovesForModality, getShopMoves, getMoveById } from '../data/movesData.js';
import { isSignificantEvent, generatePressConference } from '../systems/pressConferenceEngine.js';

export class ViewsManager {
  constructor() {
    this.currentCombatUI = null;
    this.fightOffers = [];
    this.selectedChampionshipFilter = 'all';
  }

  init() {
    this.bindNavEvents();
    this.checkInitialState();
  }

  // Verifica se existe lutador salvo ou abre a tela de criação
  checkInitialState() {
    try {
      if (gameState.fighter && gameState.fighter.name) {
        document.getElementById('creationScreen').classList.add('hidden');
        document.getElementById('mainAppContainer').classList.remove('hidden');
        this.updateHUD();
        this.switchTab('carreira');
      } else {
        document.getElementById('mainAppContainer').classList.add('hidden');
        document.getElementById('creationScreen').classList.remove('hidden');
        this.initCreationScreen();
      }
    } catch (err) {
      console.warn('Erro ao restaurar estado anterior do jogo, abrindo criador de lutador:', err);
      try {
        document.getElementById('mainAppContainer').classList.add('hidden');
        document.getElementById('creationScreen').classList.remove('hidden');
        this.initCreationScreen();
      } catch (e) {
        console.error('Falha crítica ao abrir wizard:', e);
      }
    }
  }

  // Navegação entre abas principais
  bindNavEvents() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundFX.playClick();
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Navegação Mobile (Bottom Navigation Bar)
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-tab]');
    mobileNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        soundFX.playClick();
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Drawer "Mais" Mobile
    const btnMore = document.getElementById('btnMobileMoreTabs');
    const drawer = document.getElementById('mobileMoreDrawer');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const backdrop = document.getElementById('drawerBackdrop');

    if (btnMore && drawer) {
      btnMore.addEventListener('click', () => {
        soundFX.playClick();
        drawer.classList.remove('hidden');
      });
    }

    const closeDrawer = () => {
      if (drawer) drawer.classList.add('hidden');
    };

    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Itens de Abas dentro do Drawer Mobile
    const drawerTabs = document.querySelectorAll('.drawer-item[data-tab]');
    drawerTabs.forEach(item => {
      item.addEventListener('click', (e) => {
        soundFX.playClick();
        closeDrawer();
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Ações Extras do Drawer Mobile
    const btnDrawerTheme = document.getElementById('btnDrawerTheme');
    if (btnDrawerTheme) {
      btnDrawerTheme.addEventListener('click', () => {
        soundFX.playClick();
        closeDrawer();
        if (window.themeManager && typeof window.themeManager.openModal === 'function') {
          window.themeManager.openModal();
        }
      });
    }

    const btnDrawerMute = document.getElementById('btnDrawerMute');
    const txtDrawerMute = document.getElementById('txtDrawerMute');
    if (btnDrawerMute) {
      btnDrawerMute.addEventListener('click', () => {
        const isMuted = soundFX.toggleMute();
        if (txtDrawerMute) txtDrawerMute.textContent = isMuted ? 'Áudio Desligado' : 'Áudio Ligado';
        if (muteBtn) muteBtn.textContent = isMuted ? '🔇 Áudio Desligado' : '🔊 Áudio Ligado';
      });
    }

    const btnDrawerReset = document.getElementById('btnDrawerReset');
    if (btnDrawerReset) {
      btnDrawerReset.addEventListener('click', () => {
        closeDrawer();
        this.promptResetCareer();
      });
    }

    // Botão de Áudio (Mute/Unmute)
    const muteBtn = document.getElementById('btnToggleMute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = soundFX.toggleMute();
        muteBtn.textContent = isMuted ? '🔇 Áudio Desligado' : '🔊 Áudio Ligado';
        if (txtDrawerMute) txtDrawerMute.textContent = isMuted ? 'Áudio Desligado' : 'Áudio Ligado';
      });
    }

    // Botão de Reset de Carreira no HUD
    const resetBtn = document.getElementById('btnResetCareer');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.promptResetCareer();
      });
    }

    // Botão de Reset de Carreira na tela de Carreira / Dashboard
    const resetDashBtn = document.getElementById('btnResetCareerDashboard');
    if (resetDashBtn) {
      resetDashBtn.addEventListener('click', () => {
        this.promptResetCareer();
      });
    }

    // Expõe globalmente para acesso rápido no console ou scripts
    window.resetCareer = () => this.promptResetCareer();
    window.resetGame = () => this.promptResetCareer();
  }

  // Modal estético in-game para confirmação segura de reinício de carreira
  promptResetCareer() {
    soundFX.playClick();
    const modal = document.getElementById('gameGeneralModal');
    const modalContent = document.getElementById('gameModalContent');

    const executeResetNow = () => {
      try {
        if (soundFX && typeof soundFX.playHeavyHit === 'function') {
          soundFX.playHeavyHit();
        } else if (soundFX && typeof soundFX.playClick === 'function') {
          soundFX.playClick();
        }
      } catch (e) {}

      try {
        if (gameState && typeof gameState.resetGame === 'function') {
          gameState.resetGame();
        }
        if (window.gameState && typeof window.gameState.resetGame === 'function') {
          window.gameState.resetGame();
        }
        localStorage.removeItem('iron_will_combat_legacy_save');
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Erro ao limpar storage no reset:', e);
      }

      if (modal) modal.classList.add('hidden');

      // Reseta imediatamente a interface do usuário para a tela de criação do início
      try {
        const mainApp = document.getElementById('mainAppContainer');
        const creation = document.getElementById('creationScreen');
        if (mainApp) mainApp.classList.add('hidden');
        if (creation) {
          creation.classList.remove('hidden');
          creation.innerHTML = '';
        }
        this.initCreationScreen();
      } catch (e) {
        console.warn('Erro ao resetar interface na memória:', e);
      }

      // E recarrega a página de forma limpa para garantir estado novo
      setTimeout(() => {
        try {
          const cleanUrl = window.location.href.split('?')[0].split('#')[0];
          window.location.replace(cleanUrl + '?reset=' + Date.now());
        } catch (e) {
          window.location.reload();
        }
      }, 60);
    };

    if (!modal || !modalContent) {
      executeResetNow();
      return;
    }

    modalContent.innerHTML = `
      <div style="text-align:center; padding:12px 6px;">
        <div style="font-size:3.2rem; margin-bottom:12px; filter:drop-shadow(0 0 16px rgba(230, 57, 70, 0.7));">⚠️</div>
        <h2 style="font-size:1.6rem; color:var(--primary); font-weight:800; letter-spacing:0.5px; margin-bottom:8px;">
          REINICIAR CARREIRA DO ZERO?
        </h2>
        <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.5; margin-bottom:16px;">
          Tem certeza absoluta que deseja apagar todos os dados e recomeçar do zero?<br>
          <strong style="color:var(--text-main);">Seu atleta, cartel, cinturões, dinheiro e histórico serão apagados definitivamente.</strong>
        </p>
        <p style="font-size:0.85rem; color:#f87171; margin-bottom:22px;">
          ⚡ Você irá direto para a tela de criação de um novo lutador.
        </p>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button id="btnConfirmResetYes" class="btn btn-primary" style="background:#e63946; border-color:#ff4d5a; padding:12px 24px; font-weight:800; font-size:0.95rem; cursor:pointer;">
            🚨 Sim, Apagar e Reiniciar
          </button>
          <button id="btnConfirmResetNo" class="btn btn-secondary" style="padding:12px 24px; font-size:0.95rem; cursor:pointer;">
            ✕ Cancelar e Continuar Jogando
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    const btnYes = modalContent.querySelector('#btnConfirmResetYes');
    const btnNo = modalContent.querySelector('#btnConfirmResetNo');

    if (btnYes) {
      btnYes.onclick = (e) => {
        if (e && typeof e.preventDefault === 'function') {
          e.preventDefault();
          e.stopPropagation();
        }
        executeResetNow();
      };
    }

    if (btnNo) {
      btnNo.onclick = (e) => {
        if (e && typeof e.preventDefault === 'function') {
          e.preventDefault();
          e.stopPropagation();
        }
        try { soundFX.playClick(); } catch(err){}
        modal.classList.add('hidden');
      };
    }
  }

  switchTab(tabName) {
    gameState.currentView = tabName;
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.add('hidden'));

    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Sincroniza abas da barra inferior mobile
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-tab]');
    mobileNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    const target = document.getElementById(`view-${tabName}`);
    if (target) {
      target.classList.remove('hidden');
    }

    this.updateHUD();

    // Renderização específica de cada tela
    switch (tabName) {
      case 'carreira':
        this.renderCarreiraView();
        break;
      case 'golpes':
        this.renderGolpesView();
        break;
      case 'lutas':
        this.renderLutasView();
        break;
      case 'ranking':
        this.renderRankingView();
        break;
      case 'academia':
        this.renderAcademiaView();
        break;
      case 'atributos':
        this.renderAtributosView();
        break;
      case 'vida':
        this.renderVidaView();
        break;
      case 'coletiva':
        this.renderColetivaView();
        break;
      case 'historico':
        this.renderHistoricoView();
        break;
      default:
        break;
    }
  }

  // Atualização da barra superior fixa (HUD)
  updateHUD() {
    try {
      const f = gameState.fighter;
      if (!f) return;

      const mod = MODALITIES[f.modality] || MODALITIES.boxing || { name: 'Combate' };

      const nameEl = document.getElementById('hudFighterName');
      if (nameEl) nameEl.textContent = f.nickname ? `${f.name} "${f.nickname}"` : (f.name || 'Lutador');

      const detailsEl = document.getElementById('hudFighterDetails');
      if (detailsEl) {
        const wKg = (typeof f.weightKg === 'number') ? f.weightKg.toFixed(1) : '70.0';
        const season = f.formattedSeason || 'Ano 1 • Camp 1/3';
        detailsEl.textContent = `Idade: ${f.age || 18} anos | ${wKg} kg | ${mod.name} | ${season}`;
      }

      const recEl = document.getElementById('hudRecord');
      if (recEl) {
        const r = f.record || { wins: 0, losses: 0, draws: 0, winsKO: 0, winsSub: 0 };
        recEl.textContent = `${r.wins || 0}-${r.losses || 0}-${r.draws || 0} (${r.winsKO || 0} KOs, ${r.winsSub || 0} Subs)`;
      }

      const rankEl = document.getElementById('hudRanking');
      if (rankEl) {
        const rankText = f.isChampion ? '🏆 CAMPEÃO MUNDIAL' : (f.ranking ? `#${f.ranking}` : 'Sem Ranking');
        rankEl.textContent = rankText;
      }

      const moneyEl = document.getElementById('hudMoney');
      if (moneyEl) moneyEl.textContent = `$${(f.money || 0).toLocaleString()}`;

      const fameEl = document.getElementById('hudFame');
      if (fameEl) fameEl.textContent = `${Math.round(f.fame || 0)}/100`;

      // Pontos de Habilidade (PH) e Experiência (XP)
      const spEl = document.getElementById('hudSkillPoints');
      if (spEl) spEl.textContent = `${f.skillPoints || 0} PH`;

      const xpEl = document.getElementById('hudXP');
      if (xpEl) xpEl.textContent = `${f.xp || 0} XP`;

      // Energia e Fadiga
      const energyBar = document.getElementById('hudEnergyBar');
      const energyVal = document.getElementById('hudEnergyVal');
      const energy = typeof f.energy === 'number' ? f.energy : 100;
      if (energyBar) energyBar.style.width = `${energy}%`;
      if (energyVal) energyVal.textContent = `${Math.round(energy)}%`;

      // Próxima Luta no banner
      const nextFightEl = document.getElementById('hudNextFight');
      if (nextFightEl) {
        if (f.scheduledFight && f.scheduledFight.opponent) {
          const fightIcon = f.scheduledFight.isOlympic ? '🥇' : (f.scheduledFight.isTitleFight ? '🏆' : '🥊');
          nextFightEl.innerHTML = `${fightIcon} Combate Agendado: <strong>vs. ${f.scheduledFight.opponent.name || 'Adversário'}</strong> [${f.scheduledFight.opponent.tierBadge || 'ADVERSÁRIO'}] no <strong>${f.scheduledFight.eventName || 'Evento'}</strong>`;
          nextFightEl.className = 'hud-fight-banner active';
        } else {
          nextFightEl.innerHTML = `⚡ Nenhum combate agendado para este camp de 4 meses. Acesse o menu <strong>LUTAS</strong> para assinar um contrato.`;
          nextFightEl.className = 'hud-fight-banner idle';
        }
      }
    } catch (err) {
      console.warn('Aviso no updateHUD:', err);
    }
  }

  // ==========================================
  // 1. TELA DE CRIAÇÃO DO LUTADOR (WIZARD 6 PASSOS)
  // ==========================================
  initCreationScreen() {
    const wizard = new CreationWizard((fighterConfig) => {
      gameState.initNewGame(fighterConfig);
      this.checkInitialState();
    });
    wizard.init();
  }

  // ==========================================
  // 2. TELA CARREIRA (DASHBOARD PRINCIPAL)
  // ==========================================
  renderCarreiraView() {
    try {
      const f = gameState.fighter;
      if (!f) return;

      const nameEl = document.getElementById('carreiraBioName');
      if (nameEl) nameEl.textContent = f.name || 'Lutador';

      const nickEl = document.getElementById('carreiraBioNick');
      if (nickEl) nickEl.textContent = f.nickname ? `"${f.nickname}"` : '';

      const phaseEl = document.getElementById('carreiraBioPhase');
      if (phaseEl) phaseEl.textContent = `Fase da Carreira: ${f.careerPhase || 'Amador'}`;

      const stateStr = f.birthState ? `, ${f.birthState}` : '';
      const originEl = document.getElementById('carreiraBioOrigin');
      if (originEl) originEl.textContent = `Origem: ${f.birthCity || 'Origem'}${stateStr} (${f.nationality || 'Brasil'})`;

      const stanceEl = document.getElementById('carreiraBioStance');
      if (stanceEl) stanceEl.textContent = `Base: ${f.stance || 'Destro'} | Estilo: ${f.style || 'Equilibrado'}`;
    
    const physEl = document.getElementById('carreiraBioPhysical');
    if (physEl) {
      physEl.textContent = `Físico: ${f.heightCm}cm • ${f.weightKg}kg • Envergadura: ${f.reachCm}cm`;
    }

    document.getElementById('carreiraBioWeeks').textContent = f.formattedSeason;

    // Galeria de Troféus e Medalhas Olímpicas
    const trophiesList = document.getElementById('carreiraTrophiesList');
    if (trophiesList) {
      trophiesList.innerHTML = '';
      const items = [];
      if (f.olympicGoldMedals && f.olympicGoldMedals > 0) {
        items.push({ icon: '🥇', label: `${f.olympicGoldMedals}x Medalha de Ouro nos Jogos Olímpicos`, isGold: true });
      }
      if (f.olympicSilverMedals && f.olympicSilverMedals > 0) {
        items.push({ icon: '🥈', label: `${f.olympicSilverMedals}x Medalha de Prata nos Jogos Olímpicos`, isGold: false });
      }
      if (f.titlesHeld && f.titlesHeld.length > 0) {
        f.titlesHeld.forEach(t => {
          const titleStr = typeof t === 'string' ? t : (t.title || 'Título');
          if (!titleStr.includes('Medalha de Ouro') && !titleStr.includes('Medalha de Prata')) {
            items.push({ icon: titleStr.includes('UFC') ? '👑' : '🏆', label: titleStr, isGold: true });
          }
        });
      }

      if (items.length === 0) {
        trophiesList.innerHTML = '<span class="trophy-empty-msg">Nenhum título ou medalha conquistada ainda. Dispute campeonatos e as Olimpíadas!</span>';
      } else {
        items.forEach(item => {
          const div = document.createElement('div');
          div.className = `trophy-item ${item.isGold ? 'gold-item' : ''}`;
          div.innerHTML = `<span>${item.icon}</span> <strong>${item.label}</strong>`;
          trophiesList.appendChild(div);
        });
      }
    }

    // Status de Lesões
    const injuriesContainer = document.getElementById('carreiraInjuriesContainer');
    injuriesContainer.innerHTML = '';
    if (f.injuries.length === 0) {
      injuriesContainer.innerHTML = '<div class="alert-status safe">✅ 100% Saudável! Nenhuma lesão ativa no momento.</div>';
    } else {
      f.injuries.forEach(inj => {
        const div = document.createElement('div');
        div.className = 'alert-status danger';
        div.innerHTML = `⚠️ <strong>${inj.name}</strong> (${inj.location}) - Gravidade: ${inj.severity} | Recuperação ativa neste camp.`;
        injuriesContainer.appendChild(div);
      });
    }

    // Notícias do Mundo
    const newsFeed = document.getElementById('carreiraNewsFeed');
    newsFeed.innerHTML = '';
    gameState.worldEngine.worldNews.slice(0, 5).forEach(news => {
      const p = document.createElement('div');
      p.className = 'news-item';
      p.innerHTML = `📰 ${news}`;
      newsFeed.appendChild(p);
    });

    // Próxima Luta Card
    const nextCard = document.getElementById('carreiraNextFightCard');
    if (f.scheduledFight) {
      const opp = f.scheduledFight.opponent;
      const isCross = f.scheduledFight.matchType === 'CROSS_STYLE' || (opp && opp.modality !== f.modality);
      const matchBadge = f.scheduledFight.matchTypeBadge || (isCross ? '⚔️ DESAFIO DE ESTILOS / LUTA LIVRE' : '🥊 LUTA NA SUA MODALIDADE');
      const clashTitle = f.scheduledFight.styleClash || (opp ? opp.styleClash : '');
      const rulesDesc = f.scheduledFight.rulesDescription || (opp ? opp.rulesDescription : '');

      nextCard.innerHTML = `
        <div class="scheduled-card">
          <div class="scheduled-header">
            <h4>${f.scheduledFight.eventName}</h4>
            <span class="badge ${f.scheduledFight.isOlympic ? 'badge-gold' : 'badge-primary'}">
              ${f.scheduledFight.isOlympic ? '🥇 DISPUTA DE OURO OLÍMPICO' : (f.scheduledFight.isTitleFight ? '🏆 DISPUTA DE CINTURÃO' : 'LUTA OFICIAL')}
            </span>
          </div>

          <!-- Banner de Formato da Luta: Modalidade vs Luta Livre -->
          <div class="match-format-banner ${isCross ? 'banner-cross-style' : 'banner-pure-modality'}" style="margin:8px 0 12px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
              <span class="match-format-pill ${isCross ? 'pill-cross' : 'pill-pure'}">${matchBadge}</span>
              <strong style="color:${isCross ? '#c084fc' : '#38bdf8'}; font-size:0.84rem;">${clashTitle}</strong>
            </div>
            ${rulesDesc ? `<p class="match-format-desc" style="margin:4px 0 0 0; font-size:0.8rem; line-height:1.35;">${rulesDesc}</p>` : ''}
          </div>

          <div class="scheduled-body">
            <div class="opp-info">
              <h3>vs. ${opp.name}</h3>
              <p><span class="badge ${opp.tier === 'MEDIANO' ? 'badge-mediano' : opp.tier === 'AMADOR' ? 'badge-promessa' : 'badge-gold'}">${opp.tierBadge || 'ATLETA'}</span></p>
              <p>Cartel: <strong>${opp.record.wins}-${opp.record.losses}-${opp.record.draws}</strong> | Estilo: ${opp.style}</p>
              <p>Bolsa Oficial: <strong class="text-gold">$${f.scheduledFight.purse.toLocaleString()}</strong> | Duração: <strong>${f.scheduledFight.roundsDescription || `${f.scheduledFight.rounds || 3} Rounds`}</strong></p>
            </div>
            <div class="countdown">
              <span class="count-number">CAMP</span>
              <span class="count-label">Pronto para Lutar</span>
            </div>
          </div>

          ${gameState.activePressConference ? (
            gameState.activePressConference.completed ? `
              <div class="press-status-badge completed" style="margin-top:10px; padding:8px 12px; background:rgba(34, 197, 94, 0.15); border:1px solid #22c55e; border-radius:8px; font-size:0.85rem; color:#86efac; text-align:center;">
                🎙️ <strong>Coletiva de Imprensa Concluída!</strong> Manchetes publicadas e bônus aplicados.
              </div>
            ` : `
              <div class="press-status-badge pending" style="margin-top:10px; padding:10px 14px; background:rgba(245, 158, 11, 0.15); border:1px solid #f59e0b; border-radius:8px; text-align:left;">
                <div style="font-weight:bold; color:#fbbf24; font-size:0.92rem; margin-bottom:4px;">🎙️ COLETIVA DE IMPRENSA OFICIAL CONVOCADA!</div>
                <p style="margin:0 0 8px 0; font-size:0.82rem; color:#cbd5e1;">A mídia internacional aguarda suas respostas e a Encarada Oficial antes do combate!</p>
                <button class="btn btn-warning btn-sm" id="btnGoToPressFromDashboard" style="width:100%; font-weight:bold; background:#f59e0b; color:#000;">
                  🎙️ Ir para a Coletiva de Imprensa
                </button>
              </div>
            `
          ) : ''}

          <button id="btnEnterCombatNow" class="btn btn-primary btn-pulse" style="width:100%; margin-top:12px;">
            🥊 Entrar no Ringue / Octógono Agora!
          </button>
        </div>
      `;

      const btnPressDash = document.getElementById('btnGoToPressFromDashboard');
      if (btnPressDash) {
        btnPressDash.onclick = () => this.switchTab('coletiva');
      }

      document.getElementById('btnEnterCombatNow').onclick = () => {
        this.startCombat(f.scheduledFight.opponent, {
          isTitleFight: f.scheduledFight.isTitleFight,
          isOlympic: f.scheduledFight.isOlympic,
          titleName: f.scheduledFight.titleName,
          category: f.scheduledFight.category,
          eventName: f.scheduledFight.eventName,
          purse: f.scheduledFight.purse,
          matchType: f.scheduledFight.matchType,
          matchTypeBadge: f.scheduledFight.matchTypeBadge,
          styleClash: f.scheduledFight.styleClash,
          rulesDescription: f.scheduledFight.rulesDescription,
          rounds: f.scheduledFight.rounds,
          roundDurationSec: f.scheduledFight.roundDurationSec,
          roundsDescription: f.scheduledFight.roundsDescription
        });
      };
    } else {
      const curFights = f.fightsInCurrentCamp || 0;
      const maxF = f.maxFightsPerCamp || 6;
      if (curFights >= maxF) {
        nextCard.innerHTML = `
          <div class="empty-schedule-card" style="border:2px solid #22c55e; background:rgba(34, 197, 94, 0.08); text-align:center; padding:18px;">
            <div style="font-size:2rem; margin-bottom:4px;">🎉</div>
            <h4 style="color:#22c55e; margin:0 0 6px 0; font-size:1.15rem;">CAMP CONCLUÍDO COM SUCESSO! (${curFights}/${maxF} LUTAS)</h4>
            <p style="color:#cbd5e1; font-size:0.88rem; margin:0 0 14px 0;">Você já completou o limite de ${maxF} lutas programadas para este camp. O calendário agora está liberado para avançar 4 meses para a próxima temporada!</p>
            <button class="btn btn-success btn-pulse" id="btnAdvanceCampFromDashboard" style="padding:10px 20px; font-weight:800; font-size:0.95rem;">
              ⏩ Concluir Camp & Avançar 4 Meses
            </button>
          </div>
        `;
        const btnAdv = document.getElementById('btnAdvanceCampFromDashboard');
        if (btnAdv) {
          btnAdv.onclick = () => {
            soundFX.playClick();
            this.advanceCalendarCamp();
          };
        }
      } else {
        nextCard.innerHTML = `
          <div class="empty-schedule-card">
            <div style="display:inline-block; padding:4px 10px; border-radius:6px; background:rgba(56, 189, 248, 0.12); color:#38bdf8; font-weight:700; font-size:0.82rem; margin-bottom:8px;">
              🥊 Lutas no Camp: ${curFights} / ${maxF} (Faltam ${maxF - curFights} para avançar os meses)
            </div>
            <p>Você não tem nenhuma luta marcada no camp atual de 4 meses.</p>
            <button class="btn btn-secondary" id="btnGoToFightOffers">Ver Ofertas de Contrato Disponíveis</button>
          </div>
        `;
        document.getElementById('btnGoToFightOffers').onclick = () => this.switchTab('lutas');
      }
    }

    // Painel de Habilidades Principais (Escala Nível 0 a 100)
    const skillsGrid = document.getElementById('carreiraCoreSkillsGrid');
    if (skillsGrid) {
      skillsGrid.innerHTML = '';
      const eff = f.getEffectiveAttributes();

      // Arte específica dependendo da modalidade
      let martialAttr = 'boxing';
      let martialLabel = 'Boxe & Mãos';
      let martialIcon = '🥊';
      if (f.modality === 'jiu_jitsu') {
        martialAttr = 'bjj';
        martialLabel = 'BJJ & Solo';
        martialIcon = '🥋';
      } else if (f.modality === 'muay_thai') {
        martialAttr = 'kicking';
        martialLabel = 'Caneladas Thai';
        martialIcon = '🦵';
      } else if (f.modality === 'wrestling') {
        martialAttr = 'wrestling';
        martialLabel = 'Quedas / Wrestling';
        martialIcon = '🤼';
      } else if (f.modality === 'judo') {
        martialAttr = 'wrestling';
        martialLabel = 'Projeções Judô';
        martialIcon = '🤼‍♂️';
      } else if (f.modality === 'kickboxing') {
        martialAttr = 'kicking';
        martialLabel = 'Chutes K-1';
        martialIcon = '💥';
      } else if (f.modality === 'mma') {
        martialAttr = 'punchPower';
        martialLabel = 'Striking MMA';
        martialIcon = '⚡';
      }

      const coreAttrs = [
        { key: 'fightIQ', icon: '🧠', label: 'Fight QI' },
        { key: 'strength', icon: '💪', label: 'Força' },
        { key: 'cardio', icon: '🫁', label: 'Cardio / Gás' },
        { key: 'speed', icon: '⚡', label: 'Velocidade' },
        { key: 'chin', icon: '🗿', label: 'Queixo' },
        { key: 'punchPower', icon: '💥', label: 'Potência' },
        { key: 'defense', icon: '🛡️', label: 'Defesa' },
        { key: martialAttr, icon: martialIcon, label: martialLabel }
      ];

      coreAttrs.forEach(item => {
        const baseVal = Math.round(f.attributes[item.key] || 0);
        const effVal = Math.round(eff[item.key] || 0);
        const isPenalty = effVal < baseVal;
        const tier = getSkillTier(effVal);

        const card = document.createElement('div');
        card.className = 'core-skill-card';
        card.innerHTML = `
          <div class="core-skill-header">
            <span class="core-skill-icon">${item.icon}</span>
            <span class="core-skill-name">${item.label}</span>
            <span class="skill-tier-badge ${tier.badgeClass}">${tier.tier}</span>
          </div>
          <div class="core-skill-level-row">
            <span class="core-skill-level-text ${isPenalty ? 'text-danger' : ''}">NÍVEL ${effVal}</span>
            <span class="core-skill-level-max">/ 100</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${isPenalty ? 'bg-danger' : ''}" style="width:${effVal}%; background-color:${isPenalty ? '#ef4444' : tier.color};"></div>
          </div>
          ${isPenalty ? `<span class="core-skill-penalty-tag text-danger">⚠️ -${baseVal - effVal}</span>` : ''}
        `;
        skillsGrid.appendChild(card);
      });

      const btnViewAll = document.getElementById('btnGoToAllAttributes');
      if (btnViewAll) {
        btnViewAll.onclick = () => this.switchTab('atributos');
      }
    }

    // Botão de Avançar Camp de 4 Meses
    const btnAdvance = document.getElementById('btnAdvanceWeekOnly');
    if (btnAdvance) {
      const curFights = f.fightsInCurrentCamp || 0;
      const maxF = f.maxFightsPerCamp || 6;
      if (curFights >= maxF) {
        btnAdvance.className = 'btn btn-success btn-pulse';
        btnAdvance.textContent = `⏩ Concluir Camp (${curFights}/${maxF}) • Avançar 4 Meses`;
      } else {
        btnAdvance.className = 'btn btn-secondary';
        btnAdvance.textContent = `⏩ Avançar Camp (${curFights}/${maxF} Lutas Feitas)`;
      }
      btnAdvance.onclick = () => {
        soundFX.playClick();
        this.advanceCalendarCamp();
      };
    }

    // Botão de Reiniciar Carreira no Dashboard
    const btnResetDash = document.getElementById('btnResetCareerDashboard');
    if (btnResetDash) {
      btnResetDash.onclick = () => {
        this.promptResetCareer();
      };
    }
    } catch (err) {
      console.error('Erro ao renderizar tela de carreira:', err);
    }
  }

  // Avança um ciclo de 4 Meses (Camp / Quadrimestre) no calendário
  advanceCalendarCamp() {
    const f = gameState.fighter;
    const maxFights = f.maxFightsPerCamp || 6;
    const currentFights = f.fightsInCurrentCamp || 0;

    // Regra mandatória: Limite de 6 lutas por camp; os meses NÃO avançam se não cumprir o limite!
    if (currentFights < maxFights) {
      const remaining = maxFights - currentFights;
      try { soundFX.playClick(); } catch(e){}
      const modal = document.getElementById('gameGeneralModal');
      const content = document.getElementById('gameModalContent');
      if (modal && content) {
        content.innerHTML = `
          <div style="text-align:center; padding:12px 6px;">
            <div style="font-size:3rem; margin-bottom:8px;">⚠️</div>
            <h3 style="color:#ef4444; margin-bottom:8px; font-size:1.3rem;">CRONOGRAMA DO CAMP INCOMPLETO!</h3>
            <p style="color:#cbd5e1; font-size:0.95rem; line-height:1.5; margin-bottom:14px;">
              Cada camp é programado para <strong>${maxFights} lutas oficiais</strong> ao longo do ciclo de 4 meses.<br>
              Você disputou <strong>${currentFights} de ${maxFights} lutas</strong> (faltam <strong>${remaining}</strong> luta${remaining > 1 ? 's' : ''}).
            </p>
            <div style="background:rgba(239, 68, 68, 0.12); border:1px solid rgba(239, 68, 68, 0.35); border-radius:10px; padding:12px; margin-bottom:18px; color:#fca5a5; font-size:0.9rem; text-align:left;">
              <strong>📅 Regra do Calendário:</strong> Os meses só avançam após você disputar as ${maxFights} lutas programadas deste camp. Vá até a aba <strong>Lutas</strong> e dispute os combates restantes!
            </div>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button class="btn btn-primary" id="btnGoToLutasFromCampAlert" style="font-size:1rem; font-weight:800; padding:12px 20px;">
                🥊 Ir para Ofertas de Luta (${currentFights}/${maxFights})
              </button>
              <button class="btn btn-secondary" id="btnCloseCampAlert" style="padding:12px 18px;">
                Fechar
              </button>
            </div>
          </div>
        `;
        modal.classList.remove('hidden');
        document.getElementById('btnGoToLutasFromCampAlert').onclick = () => {
          modal.classList.add('hidden');
          this.switchTab('lutas');
        };
        document.getElementById('btnCloseCampAlert').onclick = () => {
          modal.classList.add('hidden');
        };
      } else {
        alert(`Você disputou ${currentFights} de ${maxFights} lutas. É necessário completar as ${maxFights} lutas do camp para que os meses avancem! Faltam ${remaining} luta(s).`);
      }
      return;
    }

    const oldAge = f.age;

    // Avança relógio do lutador (1 Camp = 4 Meses)
    f.advanceCamp();
    const newAge = f.age;
    const hadBirthday = newAge > oldAge;

    // Recuperação natural de energia e redução de fadiga entre camps
    f.energy = Math.min(100, (f.energy || 100) + 35);
    f.fatigue = Math.max(0, (f.fatigue || 0) - 40);

    // Verificação de marcos de desbloqueio de campeonatos por idade
    let birthdayMilestone = null;
    if (hadBirthday) {
      if (newAge === 15) {
        birthdayMilestone = {
          age: newAge,
          title: '🎉 15 ANOS COMPLETADOS! CAMPEONATO ESTADUAL DESBLOQUEADO!',
          desc: `Parabéns pelos 15 anos! A Federação Estadual de ${f.birthState || 'sua região'} agora autoriza sua inscrição na disputa do Campeonato Estadual oficial!`
        };
        gameState.worldEngine.addNews(`🎂 ${f.name} completou 15 anos de idade e recebeu licença federativa para disputar o Campeonato Estadual!`);
      } else if (newAge === 16) {
        birthdayMilestone = {
          age: newAge,
          title: '🎉 16 ANOS COMPLETADOS! CAMPEONATO NACIONAL & ÍNDICE OLÍMPICO!',
          desc: `Você atingiu 16 anos! A Confederação Nacional agora permite sua classificação para a Taça Nacional e o Comitê Olímpico abriu seu índice convocatório!`
        };
        gameState.worldEngine.addNews(`🎂 ${f.name} fez 16 anos! O atleta agora é elegível para o circuito Nacional e para os Jogos Olímpicos.`);
      } else if (newAge === 17) {
        birthdayMilestone = {
          age: newAge,
          title: '🌎 17 ANOS COMPLETADOS! CAMPEONATOS CONTINENTAIS & SUL-AMERICANA!',
          desc: `Você atingiu 17 anos! As confederações continentais autorizam sua participação na Copa Sul-Americana e no circuito Pan-Americano oficial!`
        };
        gameState.worldEngine.addNews(`🌎 ${f.name} fez 17 anos! O atleta agora é elegível para os torneios Continentais e a Copa Sul-Americana.`);
      } else if (newAge === 18) {
        birthdayMilestone = {
          age: newAge,
          title: '👑 MAIORIDADE ALCANÇADA (18 ANOS)! UFC & GRANDES LIGAS LIBERADAS!',
          desc: `Você completou 18 anos! As comissões atléticas mundiais agora autorizam contratos profissionais no UFC e grandes ligas mundiais! Construa cartel e busque o topo do mundo!`
        };
        gameState.worldEngine.addNews(`👑 ${f.name} atingiu a maioridade aos 18 anos! Olheiros do UFC e das maiores ligas mundiais monitoram suas lutas.`);
      } else {
        birthdayMilestone = {
          age: newAge,
          title: `🎂 PARABÉNS! VOCÊ COMPLETOU ${newAge} ANOS!`,
          desc: `Mais um ano de evolução e dedicação marcial. Sua experiência e maturidade de ringue continuam em ascensão contínua.`
        };
      }
    }

    // Processa Finanças do Camp de 4 Meses
    const fin = gameState.lifeEngine.processCampFinances();

    // Simula mundo autônomo
    gameState.worldEngine.simulateAutonomousFights();

    // Eventos aleatórios do ciclo de 4 meses (35% de chance por camp)
    if (Math.random() < 0.35) {
      const dilemma = getEligibleRandomEvent(f);
      this.showDilemmaModal(dilemma);
    }

    gameState.saveGame();
    this.updateHUD();

    // Exibe o resumo do avanço da temporada
    this.showCampSummaryModal(fin, birthdayMilestone);
  }

  // Modal comemorativo de aniversário e novo campeonato liberado
  showBirthdayModal(milestone) {
    soundFX.playFanfare();
    const modal = document.getElementById('gameGeneralModal');
    const content = document.getElementById('gameModalContent');

    content.innerHTML = `
      <div class="birthday-unlock-banner" style="margin-top:10px;">
        <h4>${milestone.title}</h4>
        <p>${milestone.desc}</p>
      </div>
      <button class="btn btn-primary" id="btnCloseBirthdayModal" style="width:100%; margin-top:16px;">
        Ver Campeonatos e Ofertas →
      </button>
    `;

    modal.classList.remove('hidden');
    document.getElementById('btnCloseBirthdayModal').onclick = () => {
      modal.classList.add('hidden');
      this.switchTab('lutas');
    };
  }

  // Retrocompatibilidade
  advanceCalendarWeek() {
    this.advanceCalendarCamp();
  }

  // Modal de Resumo do Camp de 4 Meses
  showCampSummaryModal(fin, birthdayMilestone = null) {
    if (birthdayMilestone) {
      soundFX.playFanfare();
    }
    const modal = document.getElementById('gameGeneralModal');
    const content = document.getElementById('gameModalContent');
    const f = gameState.fighter;

    let birthdayBannerHtml = birthdayMilestone ? `
      <div class="birthday-unlock-banner">
        <h4>${birthdayMilestone.title}</h4>
        <p>${birthdayMilestone.desc}</p>
      </div>
    ` : '';

    content.innerHTML = `
      <div class="camp-summary-header">
        <span class="badge badge-gold">TEMPORADA CONCLUÍDA</span>
        <h3>⏩ ${f.formattedSeason}</h3>
      </div>

      <div class="summary-body" style="margin-top:12px;">
        ${birthdayBannerHtml}

        <div class="alert-status safe" style="margin-bottom:12px;">
          ✅ <strong>Camp de 4 Meses Finalizado!</strong> Fôlego e energia restaurados para os próximos desafios.
        </div>

        <h4 class="summary-section-title">💰 Balanço Financeiro da Temporada:</h4>
        <div class="finance-camp-box">
          <p>Receitas (Trabalho + Patrocínio): <strong class="text-success">+$${fin.totalIncome.toLocaleString()}</strong></p>
          <p>Despesas (Academia + Moradia + Dieta): <strong class="text-danger">-$${fin.totalExpenses.toLocaleString()}</strong></p>
          <p>Saldo Líquido da Temporada: <strong class="${fin.netBalance >= 0 ? 'text-success' : 'text-danger'}">${fin.netBalance >= 0 ? '+' : ''}$${fin.netBalance.toLocaleString()}</strong></p>
        </div>
      </div>
      <button class="btn btn-primary" id="btnCloseSummaryModal" style="width:100%; margin-top:16px;">
        Continuar Carreira
      </button>
    `;

    modal.classList.remove('hidden');
    document.getElementById('btnCloseSummaryModal').onclick = () => {
      modal.classList.add('hidden');
      this.switchTab(gameState.currentView || 'carreira');
    };
  }

  // Modal de Dilema Narrativo com Consequências Reais
  showDilemmaModal(dilemma) {
    const modal = document.getElementById('gameGeneralModal');
    const content = document.getElementById('gameModalContent');

    let optionsHtml = dilemma.options.map((opt, idx) => `
      <button class="btn btn-choice" data-idx="${idx}">
        <strong>${opt.text}</strong>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="dilemma-header">
        <span class="badge badge-gold">DECISÃO IMPORTANTE</span>
        <h3>${dilemma.title}</h3>
      </div>
      <p class="dilemma-desc">${dilemma.description}</p>
      <div class="dilemma-options">${optionsHtml}</div>
    `;

    modal.classList.remove('hidden');

    const choiceBtns = content.querySelectorAll('.btn-choice');
    choiceBtns.forEach(btn => {
      btn.onclick = (e) => {
        soundFX.playClick();
        const idx = parseInt(e.currentTarget.dataset.idx);
        const chosen = dilemma.options[idx];

        // Aplica consequências
        const f = gameState.fighter;
        if (chosen.effect.money) f.money += chosen.effect.money;
        if (chosen.effect.fame) f.fame = Math.min(100, f.fame + chosen.effect.fame);
        if (chosen.effect.moral) f.morale = Math.min(100, Math.max(0, f.morale + chosen.effect.moral));
        if (chosen.effect.stress) f.stress = Math.min(100, Math.max(0, f.stress + chosen.effect.stress));
        if (chosen.effect.fightIQ) f.attributes.fightIQ += chosen.effect.fightIQ;

        gameState.saveGame();

        content.innerHTML = `
          <h3>Consequência</h3>
          <p class="dilemma-result">${chosen.effect.narrative}</p>
          <button class="btn btn-primary" id="btnCloseDilemmaDone">Entendido</button>
        `;
        document.getElementById('btnCloseDilemmaDone').onclick = () => {
          modal.classList.add('hidden');
          this.updateHUD();
          this.switchTab(gameState.currentView);
        };
      };
    });
  }

  // ==========================================
  // 4. TELA DE LUTAS & CONTRATOS
  // ==========================================
  renderLutasView() {
    const f = gameState.fighter;
    const container = document.getElementById('fightOffersContainer');
    const olympicBadge = document.getElementById('lutasOlympicStatusBadge');
    const olympicBanner = document.getElementById('olympicCycleBanner');
    const filterBar = document.getElementById('champFilterBar');

    if (!container) return;
    container.innerHTML = '';

    const currentYear = f.careerYear || 1;
    const isOlympic = isOlympicYear(currentYear);
    const yearsToNext = getYearsToNextOlympics(currentYear);

    // 1. Atualiza Banner de Modalidade Ativa do Lutador
    const modalityBanner = document.getElementById('lutasModalityHeaderBanner');
    if (modalityBanner) {
      const modalityInfo = {
        boxing: {
          icon: '🥊',
          title: 'MODALIDADE ATUAL: BOXE PROFISSIONAL (NOBRE ARTE)',
          badge: 'CIRCUITO EXCLUSIVO DE BOXE',
          desc: 'Você está no circuito oficial de Boxe. Todos os 15 campeonatos e adversários disputam estritamente combates da Nobre Arte (sem mistura com outras modalidades).'
        },
        jiu_jitsu: {
          icon: '🥋',
          title: 'MODALIDADE ATUAL: JIU-JITSU BRASILEIRO (BJJ)',
          badge: 'CIRCUITO EXCLUSIVO DE ARTE SUAVE',
          desc: 'Você está no circuito oficial de BJJ (Gi & No-Gi). Todos os 15 campeonatos e adversários disputam estritamente combates da Arte Suave (sem socos ou boxe).'
        },
        mma: {
          icon: '⚡',
          title: 'MODALIDADE ATUAL: MMA (ARTES MARCIAIS MISTAS)',
          badge: 'CIRCUITO EXCLUSIVO DE VALE-TUDO & CAGE',
          desc: 'Você está no circuito unificado de MMA. Todos os 15 campeonatos e adversários competem no octógono com regras completas de artes marciais mistas.'
        },
        muay_thai: {
          icon: '🦵',
          title: 'MODALIDADE ATUAL: MUAY THAI TRADICIONAL (8 ARMAS)',
          badge: 'CIRCUITO EXCLUSIVO DE MUAY THAI',
          desc: 'Você está no circuito oficial dos estádios de Muay Thai. Todos os 15 campeonatos e adversários competem exclusivamente na Arte das Oito Armas.'
        },
        judo: {
          icon: '🥋',
          title: 'MODALIDADE ATUAL: JUDÔ OLÍMPICO (CAMINHO SUAVE)',
          badge: 'CIRCUITO EXCLUSIVO DE JUDÔ',
          desc: 'Você está no circuito oficial da Federação de Judô (CBJ/FIJ). Todos os 15 campeonatos e adversários competem estritamente no tatame com regras de Ippon.'
        },
        wrestling: {
          icon: '🤼',
          title: 'MODALIDADE ATUAL: WRESTLING (LUTA OLÍMPICA)',
          badge: 'CIRCUITO EXCLUSIVO DE WRESTLING',
          desc: 'Você está no circuito oficial da Confederação de Wrestling (CBW/UWW). Todos os 15 campeonatos e adversários competem estritamente no tapete de luta olímpica.'
        },
        kickboxing: {
          icon: '🔥',
          title: 'MODALIDADE ATUAL: KICKBOXING (K-1 RULES)',
          badge: 'CIRCUITO EXCLUSIVO DE KICKBOXING',
          desc: 'Você está no circuito oficial de Kickboxing da WAKO/K-1. Todos os 15 campeonatos e adversários competem estritamente sob as regras de Kickboxing.'
        }
      };

      const curMod = modalityInfo[f.modality] || modalityInfo.boxing;
      modalityBanner.className = 'lutas-modality-banner';
      modalityBanner.innerHTML = `
        <div class="modality-banner-left">
          <span class="mod-icon">${curMod.icon}</span>
          <div>
            <h3 class="mod-title">${curMod.title}</h3>
            <p class="mod-subtitle">${curMod.desc}</p>
          </div>
        </div>
        <div class="modality-banner-tag">${curMod.badge}</div>
      `;
    }

    // 2. Atualiza Status e Banner Olímpico
    if (olympicBadge) {
      if (isOlympic) {
        olympicBadge.className = 'olympic-badge-status active';
        olympicBadge.innerHTML = '🥇 ANO OLÍMPICO ATIVO (A CADA 4 ANOS)';
      } else {
        olympicBadge.className = 'olympic-badge-status';
        olympicBadge.innerHTML = `🏅 Ciclo Olímpico • Faltam ${yearsToNext} ano(s)`;
      }
    }

    if (olympicBanner) {
      if (isOlympic) {
        olympicBanner.className = 'olympic-banner-card active-year';
        olympicBanner.innerHTML = `
          <div>
            <span style="font-size:0.75rem; font-weight:800; color:#ffd166; letter-spacing:1px; text-transform:uppercase;">
              ⭐ JOGOS OLÍMPICOS MUNDIAIS • ANO ${currentYear}
            </span>
            <h3 style="color:#fff; margin:4px 0 6px 0; font-size:1.15rem;">
              Represente o ${f.nationality} em busca da Imortalidade do Ouro Olímpico!
            </h3>
            <p style="color:#e2e8f0; font-size:0.85rem; margin:0;">
              O evento que acontece rigorosamente a cada 4 anos está aberto neste camp! Dispute a Medalha de Ouro Oficial!
            </p>
          </div>
          <button class="btn btn-primary" id="btnFilterOlympicNow" style="padding:10px 18px; font-weight:800; font-size:0.85rem; white-space:nowrap;">
            🥇 Ver Disputa Olímpica
          </button>
        `;
        const btnFilt = olympicBanner.querySelector('#btnFilterOlympicNow');
        if (btnFilt) {
          btnFilt.onclick = () => {
            this.selectedChampionshipFilter = 'olimpiadas';
            this.renderLutasView();
          };
        }
      } else {
        olympicBanner.className = 'olympic-banner-card countdown-year';
        olympicBanner.innerHTML = `
          <div>
            <span style="font-size:0.75rem; font-weight:800; color:#38bdf8; letter-spacing:1px; text-transform:uppercase;">
              ⏳ CICLO OLÍMPICO EM ANDAMENTO • PRÓXIMA EDIÇÃO: ANO ${currentYear + yearsToNext}
            </span>
            <h3 style="color:#fff; margin:4px 0 6px 0; font-size:1.1rem;">
              Faltam ${yearsToNext} ano(s) (${yearsToNext * 3} camps) para os Jogos Olímpicos
            </h3>
            <p style="color:#94a3b8; font-size:0.85rem; margin:0;">
              As Olimpíadas ocorrem a cada 4 anos. Continue acumulando vitórias em circuitos municipais, estaduais e nacionais para chegar convocado como cabeça de chave!
            </p>
          </div>
          <span style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:8px 14px; border-radius:8px; font-weight:800; font-size:0.85rem; white-space:nowrap;">
            🏅 Ano ${currentYear + yearsToNext}
          </span>
        `;
      }
    }

    // 2. Eventos dos Botões de Filtro
    if (filterBar) {
      const filterBtns = filterBar.querySelectorAll('.btn-champ-filter');
      filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        btn.classList.toggle('active', this.selectedChampionshipFilter === filter);
        btn.onclick = () => {
          soundFX.playClick();
          this.selectedChampionshipFilter = filter;
          this.renderLutasView();
        };
      });
    }

    // 3. Se já tiver luta marcada no camp
    if (f.scheduledFight) {
      const opp = f.scheduledFight.opponent;
      const oppTierClass = (opp.tier || 'amador').toLowerCase();
      const isCrossStyle = f.scheduledFight.matchType === 'CROSS_STYLE' || (opp && opp.modality !== f.modality);
      const matchBadge = f.scheduledFight.matchTypeBadge || (isCrossStyle ? '⚔️ DESAFIO DE ESTILOS / LUTA LIVRE' : '🥊 LUTA NA SUA MODALIDADE');
      const clashTitle = f.scheduledFight.styleClash || (opp ? opp.styleClash : (isCrossStyle ? 'Choque de Disciplinas' : 'Regras da Categoria'));
      const rulesDesc = f.scheduledFight.rulesDescription || (opp ? opp.rulesDescription : 'Combate oficial sob o regulamento da categoria.');

      container.innerHTML = `
        <div class="scheduled-full-banner">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <span class="badge ${f.scheduledFight.isOlympic ? 'badge-gold' : 'badge-primary'}">
              ${f.scheduledFight.isOlympic ? '🥇 COMBATE OLÍMPICO OFICIAL' : (f.scheduledFight.isTitleFight ? '🏆 DISPUTA DE TÍTULO' : 'CONTRATO OFICIAL')}
            </span>
            <span style="color:#94a3b8; font-size:0.85rem;">Pronto para entrar no combate</span>
          </div>
          <h3 style="font-size:1.4rem; color:#fff; margin-bottom:6px;">${f.scheduledFight.eventName}</h3>

          <!-- Banner de Formato da Luta: Modalidade Pura vs Luta Livre -->
          <div class="match-format-banner ${isCrossStyle ? 'banner-cross-style' : 'banner-pure-modality'}" style="margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <span class="match-format-pill ${isCrossStyle ? 'pill-cross' : 'pill-pure'}">${matchBadge}</span>
              <strong style="color:${isCrossStyle ? '#c084fc' : '#38bdf8'}; font-size:0.9rem;">${clashTitle}</strong>
            </div>
            <p class="match-format-desc" style="margin:6px 0 0 0; font-size:0.84rem; line-height:1.4;">${rulesDesc}</p>
          </div>

          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
            <span style="font-size:1.1rem; color:#fff;">Você enfrentará <strong>${opp.name}</strong></span>
            <span class="badge-tier-pill tier-${oppTierClass}">${opp.tierBadge || 'ADVERSÁRIO'}</span>
          </div>
          <div style="font-size:0.9rem; color:#cbd5e1; margin-bottom:8px;">
            Estilo: <strong>${opp.style}</strong> | Cartel: <strong>${opp.record.wins}V-${opp.record.losses}D</strong>
          </div>
          <div class="opp-strength-box" style="margin-bottom:10px;">
            <span class="strength-label">Ponto Forte do Rival:</span>
            <strong class="strength-val">${opp.strength || 'Técnica e Condicionamento'}</strong>
          </div>
          ${opp.story ? `
            <div class="opp-story-card" style="margin-bottom:14px;">
              <span class="story-quote-icon">❝</span>
              <p class="story-text">${opp.story}</p>
            </div>
          ` : ''}
          <p style="color:#cbd5e1; font-size:0.9rem; margin-bottom:12px;">
            Bolsa oficial acordada: <strong class="text-gold">$${f.scheduledFight.purse.toLocaleString()}</strong> | Duração: <strong>${f.scheduledFight.roundsDescription || `${f.scheduledFight.rounds || 3} Rounds`}</strong>
          </p>

          ${gameState.activePressConference ? (
            gameState.activePressConference.completed ? `
              <div class="press-status-badge completed" style="margin-bottom:12px; padding:8px 12px; background:rgba(34, 197, 94, 0.15); border:1px solid #22c55e; border-radius:8px; font-size:0.85rem; color:#86efac;">
                🎙️ <strong>Coletiva de Imprensa Concluída!</strong> Manchetes publicadas e bônus aplicados.
              </div>
            ` : `
              <div class="press-status-badge pending" style="margin-bottom:12px; padding:10px 14px; background:rgba(245, 158, 11, 0.15); border:1px solid #f59e0b; border-radius:8px; text-align:left;">
                <div style="font-weight:bold; color:#fbbf24; font-size:0.92rem; margin-bottom:4px;">🎙️ COLETIVA DE IMPRENSA OFICIAL AGUARDANDO SUA PRESENÇA!</div>
                <p style="margin:0 0 8px 0; font-size:0.82rem; color:#cbd5e1;">A imprensa internacional e o rival estão no palco. Responda às perguntas e faça a encarada oficial antes de subir ao ringue!</p>
                <button class="btn btn-warning btn-sm" id="btnGoToPressFromLutas" style="width:100%; font-weight:bold; background:#f59e0b; color:#000;">
                  🎙️ Ir para a Coletiva de Imprensa Agora
                </button>
              </div>
            `
          ) : ''}

          <button class="btn btn-primary btn-pulse" id="btnGoToCombatFromLutas" style="padding:14px 28px; font-size:1.1rem; font-weight:800; width:100%;">
            🥊 Entrar no Ringue / Octógono Agora!
          </button>
        </div>
      `;

      const btnPress = document.getElementById('btnGoToPressFromLutas');
      if (btnPress) {
        btnPress.onclick = () => this.switchTab('coletiva');
      }

      document.getElementById('btnGoToCombatFromLutas').onclick = () => {
        this.startCombat(f.scheduledFight.opponent, {
          isTitleFight: f.scheduledFight.isTitleFight,
          isOlympic: f.scheduledFight.isOlympic,
          titleName: f.scheduledFight.titleName,
          category: f.scheduledFight.category,
          eventName: f.scheduledFight.eventName,
          purse: f.scheduledFight.purse,
          matchType: f.scheduledFight.matchType,
          matchTypeBadge: f.scheduledFight.matchTypeBadge,
          styleClash: f.scheduledFight.styleClash,
          rulesDescription: f.scheduledFight.rulesDescription,
          rounds: f.scheduledFight.rounds,
          roundDurationSec: f.scheduledFight.roundDurationSec,
          roundsDescription: f.scheduledFight.roundsDescription
        });
      };
      return;
    }

    // 4. Verificação de Teto de 6 Lutas por Camp
    const curFights = f.fightsInCurrentCamp || 0;
    const maxF = f.maxFightsPerCamp || 6;
    if (!f.scheduledFight && curFights >= maxF) {
      container.innerHTML = `
        <div class="empty-schedule-card" style="grid-column: 1 / -1; border:2px solid #22c55e; background:rgba(34, 197, 94, 0.08); text-align:center; padding:30px 20px;">
          <div style="font-size:3rem; margin-bottom:10px;">🏆</div>
          <h2 style="color:#22c55e; margin:0 0 8px 0; font-size:1.5rem;">LIMITE DE 6 LUTAS DO CAMP ATINGIDO!</h2>
          <p style="color:#e2e8f0; font-size:1rem; max-width:600px; margin:0 auto 16px auto; line-height:1.5;">
            Parabéns! Você completou com sucesso todas as <strong>6 lutas programadas</strong> para este ciclo de 4 meses.<br>
            O calendário da carreira agora está liberado para avançar os 4 meses e iniciar a nova temporada de treinamentos e combates.
          </p>
          <button class="btn btn-success btn-pulse" id="btnAdvanceCampFromLutasScreen" style="padding:14px 32px; font-size:1.1rem; font-weight:800;">
            ⏩ Concluir Camp & Avançar 4 Meses
          </button>
        </div>
      `;
      const btnAdv = document.getElementById('btnAdvanceCampFromLutasScreen');
      if (btnAdv) {
        btnAdv.onclick = () => {
          soundFX.playClick();
          this.advanceCalendarCamp();
        };
      }
      return;
    }

    // Banner de Indicador de Progresso das 6 Lutas no Camp Atual
    const progressCard = document.createElement('div');
    progressCard.className = 'camp-progress-bar-card';
    progressCard.style.cssText = 'grid-column: 1 / -1; margin-bottom:14px; background:rgba(15, 23, 42, 0.85); border:1px solid rgba(56, 189, 248, 0.35); border-radius:12px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;';
    progressCard.innerHTML = `
      <div>
        <div style="font-size:0.75rem; font-weight:800; color:#38bdf8; letter-spacing:1px; text-transform:uppercase;">
          📅 CRONOGRAMA DA TEMPORADA • QUADRIMESTRE ATUAL (4 MESES)
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:#fff; margin:2px 0;">
          Lutas Disputadas neste Camp: <span style="color:#ffd166;">${curFights} de ${maxF}</span>
        </div>
        <div style="font-size:0.84rem; color:#94a3b8;">
          ${curFights >= maxF 
            ? '<span style="color:#22c55e; font-weight:bold;">✓ Limite de 6 lutas cumprido! Calendário liberado para avançar os meses.</span>' 
            : `Restam <strong>${maxF - curFights} luta(s)</strong> para cumprir o limite do camp e liberar o avanço dos meses.`}
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        ${[1, 2, 3, 4, 5, 6].map(num => `
          <div style="width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem; background:${num <= curFights ? '#22c55e' : 'rgba(255,255,255,0.06)'}; color:${num <= curFights ? '#000' : '#64748b'}; border:1px solid ${num <= curFights ? '#22c55e' : 'rgba(255,255,255,0.15)'};" title="Luta ${num} do Camp">
            ${num <= curFights ? '✓' : num}
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(progressCard);

    // 5. Gera ofertas de campeonatos completos
    const allOffers = generateChampionshipOffers(f, gameState.worldEngine);
    const filteredOffers = this.selectedChampionshipFilter === 'all'
      ? allOffers
      : allOffers.filter(o => o.category === this.selectedChampionshipFilter);

    if (filteredOffers.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-schedule-card';
      emptyMsg.style.gridColumn = '1 / -1';
      emptyMsg.innerHTML = `
        <p>Nenhuma oferta disponível para a categoria selecionada neste camp.</p>
        <button class="btn btn-secondary" id="btnResetFilterOffers">Mostrar Todos os Campeonatos</button>
      `;
      container.appendChild(emptyMsg);
      document.getElementById('btnResetFilterOffers').onclick = () => {
        this.selectedChampionshipFilter = 'all';
        this.renderLutasView();
      };
      return;
    }

    filteredOffers.forEach(offer => {
      const card = document.createElement('div');
      const isOlympicOffer = offer.isOlympic || offer.category === 'olimpiadas';
      const isLocked = offer.isLocked;

      card.className = `fight-offer-card ${offer.isTitle ? 'title-offer' : ''} ${isOlympicOffer ? 'olympic-offer-card' : ''} ${isLocked ? 'locked-card' : ''}`;

      if (isLocked) {
        // Renderização detalhada dos critérios de desbloqueio
        let reqsHtml = '';
        if (offer.lockRequirements && offer.lockRequirements.length > 0) {
          reqsHtml = `
            <div class="lock-requirements-box">
              <div class="lock-req-header">
                <span>📋 Critérios de Desbloqueio & Regulamento:</span>
              </div>
              <div class="lock-req-list">
                ${offer.lockRequirements.map(req => `
                  <div class="lock-req-item ${req.met ? 'met' : 'pending'}">
                    <span class="req-status-icon">${req.met ? '✔' : '🔒'}</span>
                    <span class="req-label-text">${req.label}</span>
                    <span class="req-pill-badge ${req.met ? 'badge-met' : 'badge-pending'}">
                      ${req.currentText} ${req.met ? '• OK' : '• PENDENTE'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        // Determina o texto explicativo do botão desabilitado
        let btnDisabledText = '🔒 Conteúdo Bloqueado por Regulamento';
        if (offer.category === 'ufc') {
          btnDisabledText = f.age < 18 
            ? `🚫 Proibido para Menores de 18 Anos (${f.age}/18 anos)` 
            : `🔒 Requer Mínimo de 8 Lutas e 6 Vitórias (${f.record.fights}/8 lutas • ${f.record.wins}/6 vitórias)`;
        } else if (offer.category === 'estadual') {
          btnDisabledText = f.age < 15 
            ? `🔒 Requer 15+ Anos (${f.age}/15 anos)` 
            : `🔒 Requer 2+ Lutas Municipais (${f.record.fights}/2 lutas)`;
        } else if (offer.category === 'nacional') {
          btnDisabledText = f.age < 16 
            ? `🔒 Requer 16+ Anos (${f.age}/16 anos)` 
            : `🔒 Requer 5+ Lutas ou Título Estadual (${f.record.fights}/5 lutas)`;
        } else if (offer.category === 'continental') {
          btnDisabledText = f.age < 17 
            ? `🔒 Requer 17+ Anos (${f.age}/17 anos)` 
            : `🔒 Requer 6+ Lutas ou Título Nacional (${f.record.fights}/6 lutas)`;
        } else if (offer.category === 'olimpiadas') {
          btnDisabledText = offer.type === 'OLIMPIADAS_INFO' 
            ? `⏳ Aguardando Próximo Ciclo Olímpico (Faltam ${yearsToNext} ano(s))` 
            : (f.age < 16 ? `🔒 Requer 16+ Anos para os Jogos (${f.age}/16 anos)` : `🔒 Requer Índice de 6+ Lutas (${f.record.fights}/6 lutas)`);
        }

        const isMinorUfc = offer.category === 'ufc' && f.age < 18;

        card.innerHTML = `
          <div class="offer-header-row">
            <div class="offer-badge ${offer.badgeClass}">${offer.categoryLabel}</div>
            <span class="locked-status-pill">🔒 BLOQUEADO</span>
          </div>
          <h4 style="font-size:1.12rem; color:#fff; margin:6px 0 4px 0;">${offer.eventName}</h4>
          <p class="offer-locked-tag ${isMinorUfc ? 'tag-warning-minor' : ''}">${offer.tag}</p>
          <p class="offer-desc-text">${offer.description}</p>
          ${reqsHtml}
          <button class="btn btn-secondary btn-locked-action" disabled>
            ${btnDisabledText}
          </button>
        `;
      } else {
        const oppTierClass = (offer.opp.tier || 'amador').toLowerCase();
        const isCrossStyle = offer.matchType === 'CROSS_STYLE' || (offer.opp && offer.opp.modality !== f.modality);
        const formatBadge = isCrossStyle ? '⚔️ DESAFIO DE ESTILOS / LUTA LIVRE' : (offer.matchTypeBadge || '🥊 LUTA NA SUA MODALIDADE');
        const formatClash = offer.styleClash || (offer.opp ? offer.opp.styleClash : 'Regras da Categoria');
        const formatRules = offer.rulesDescription || (offer.opp ? offer.opp.rulesDescription : 'Regras oficiais da categoria.');

        card.innerHTML = `
          <div class="offer-header-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
            <div class="offer-badge ${offer.badgeClass}">${offer.categoryLabel}</div>
            <span class="match-format-pill ${isCrossStyle ? 'pill-cross' : 'pill-pure'}">${formatBadge}</span>
          </div>
          <h4 style="font-size:1.1rem; color:#fff; margin-bottom:4px;">${offer.eventName}</h4>

          <!-- Banner Descritivo de Modalidade vs Luta Livre -->
          <div class="match-format-banner ${isCrossStyle ? 'banner-cross-style' : 'banner-pure-modality'}" style="margin:8px 0 10px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
              <strong style="color:${isCrossStyle ? '#c084fc' : '#38bdf8'}; font-size:0.85rem;">${formatClash}</strong>
            </div>
            <p class="match-format-desc" style="margin:4px 0 0 0; font-size:0.8rem; line-height:1.35;">${formatRules}</p>
          </div>

          <p style="color:#ffd166; font-size:0.82rem; font-weight:700; margin-bottom:10px;">${offer.tag}</p>
          <p style="color:#94a3b8; font-size:0.84rem; line-height:1.4; margin-bottom:12px;">${offer.description}</p>
          
          <div class="offer-opponent">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
              <h3 style="margin:0; font-size:1.05rem; color:#fff;">vs. ${offer.opp.name}</h3>
              <span class="badge-tier-pill tier-${oppTierClass}">${offer.opp.tierBadge || 'ATLETA'}</span>
            </div>
            
            <div class="opp-info-grid">
              <div>Cartel: <strong>${offer.opp.record.wins}V - ${offer.opp.record.losses}D - ${offer.opp.record.draws}E</strong></div>
              <div>Origem: <strong>${offer.opp.originDisplay || offer.opp.nationality}</strong></div>
              <div>Idade: <strong>${offer.opp.age} anos</strong></div>
              <div>Estilo: <strong>${offer.opp.style}</strong></div>
              <div style="grid-column: 1 / -1;">Perfil: <strong>${offer.opp.personality}</strong></div>
            </div>

            <div class="opp-strength-box">
              <span class="strength-label">Ponto Forte:</span>
              <strong class="strength-val">${offer.opp.strength || 'Força & Técnica'}</strong>
            </div>

            ${offer.opp.story ? `
              <div class="opp-story-card">
                <span class="story-quote-icon">❝</span>
                <p class="story-text">${offer.opp.story}</p>
              </div>
            ` : ''}

            <div class="opp-purse-row">
              <span>Bolsa Oficial em Disputa:</span>
              <strong class="text-gold">$${offer.purse.toLocaleString()}</strong>
            </div>
          </div>
          <button class="btn btn-primary btn-sign-contract" style="width:100%;">
            ${offer.isOlympic ? '🥇 Assinar e Disputar o Ouro Olímpico' : (offer.isTitle ? '🏆 Assinar Disputa de Cinturão' : 'Assinar Contrato para este Camp')}
          </button>
        `;

        card.querySelector('.btn-sign-contract').onclick = () => {
          if ((f.fightsInCurrentCamp || 0) >= (f.maxFightsPerCamp || 6)) {
            alert('Você já completou o limite de 6 lutas deste camp! Avance a temporada (4 meses) para iniciar o próximo ciclo de lutas.');
            return;
          }
          soundFX.playCash();
          f.scheduledFight = {
            opponent: offer.opp,
            campsRemaining: 0,
            weeksRemaining: 0,
            eventName: offer.eventName,
            purse: offer.purse,
            isTitleFight: offer.isTitle,
            isOlympic: offer.isOlympic || false,
            titleName: offer.titleName || '',
            category: offer.category,
            matchType: offer.matchType || (isCrossStyle ? 'CROSS_STYLE' : 'MODALITY'),
            matchTypeBadge: formatBadge,
            styleClash: formatClash,
            rulesDescription: formatRules,
            rounds: offer.rounds,
            roundDurationSec: offer.roundDurationSec,
            roundsDescription: offer.roundsDescription
          };

          // Gera Coletiva de Imprensa Oficial se for evento de destaque
          if (isSignificantEvent(f.scheduledFight)) {
            gameState.activePressConference = generatePressConference(f, f.scheduledFight);
          } else {
            gameState.activePressConference = null;
          }

          gameState.saveGame();
          this.updateHUD();

          if (gameState.activePressConference) {
            soundFX.playFanfare();
            const openPC = confirm(`🎙️ COLETIVA DE IMPRENSA CONVOCADA!\n\nEste é um evento de enorme repercussão mundial (${f.scheduledFight.eventName})!\n\nA imprensa esportiva internacional e o seu adversário estão no palco para responder aos jornalistas e realizar a Encarada Oficial.\n\nDeseja abrir a Coletiva de Imprensa agora?`);
            if (openPC) {
              this.switchTab('coletiva');
              return;
            }
          }

          this.renderLutasView();
        };
      }

      container.appendChild(card);
    });
  }

  // ==========================================
  // 5. INÍCIO DO COMBATE JOGÁVEL
  // ==========================================
  startCombat(opponent, options = {}) {
    const f = gameState.fighter;

    // Instancia o motor de combate
    const combatEngine = new CombatEngine(f, opponent, f.modality, options);

    // Oculta tudo e mostra a tela de combate
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    const combatView = document.getElementById('view-combate');
    combatView.classList.remove('hidden');

    // Inicializa a UI do combate
    this.currentCombatUI = new CombatUI(combatEngine, (fightSummary) => {
      this.finishCombatAndRecord(fightSummary, opponent);
    });

    soundFX.playBell();
    this.currentCombatUI.init();
  }

  // Processa o encerramento do combate
  finishCombatAndRecord(summary, opponent) {
    const f = gameState.fighter;

    // Registra no Cartel do Lutador
    f.recordFightResult(summary);

    // Concede Pontos de Habilidade (1 a 5 PH) e XP de combate conforme o desempenho e dificuldade
    const rewards = f.awardFightRewards(summary, opponent);

    const isWin = summary.winner === 'player';
    let victoryHonorsHtml = '';

    // Conquistas especiais de Campeonatos e Olimpíadas
    if (isWin) {
      if (summary.isOlympic) {
        f.olympicGoldMedals = (f.olympicGoldMedals || 0) + 1;
        f.titlesHeld = f.titlesHeld || [];
        const goldTitle = `🥇 Medalha de Ouro nos Jogos Olímpicos (${f.nationality} - Ano ${f.careerYear})`;
        f.titlesHeld.unshift(goldTitle);
        f.fame = Math.min(100, f.fame + 25);
        gameState.worldEngine.addNews(`🏆 HISTÓRICO! ${f.name} conquistou a MEDALHA DE OURO OLÍMPICA para o ${f.nationality}!`);
        soundFX.playFanfare();
        victoryHonorsHtml = `
          <div class="alert-status safe" style="margin:12px 0; background:rgba(255,209,102,0.18); border:2px solid #ffd166; color:#ffd166;">
            🥇 <strong>CAMPEÃO OLÍMPICO!</strong> Você conquistou a histórica Medalha de Ouro representando o ${f.nationality}!
          </div>
        `;
      } else if (summary.category === 'ufc' && summary.isTitleFight) {
        f.isChampion = true;
        f.titlesHeld = f.titlesHeld || [];
        const ufcTitle = summary.titleName || 'Cinturão Mundial do UFC';
        if (!f.titlesHeld.includes(ufcTitle)) f.titlesHeld.unshift(ufcTitle);
        f.fame = Math.min(100, f.fame + 20);
        gameState.worldEngine.setChampion(f);
        gameState.worldEngine.addNews(`👑 NOVO CAMPEÃO MUNDIAL! ${f.name} é o novo detentor do cinturão do UFC!`);
        soundFX.playFanfare();
        victoryHonorsHtml = `
          <div class="alert-status safe" style="margin:12px 0; background:rgba(239,68,68,0.15); border:2px solid #ef4444; color:#fff;">
            👑 <strong>NOVO CAMPEÃO MUNDIAL!</strong> Você agora ostenta o cinturão mais cobiçado do mundo!
          </div>
        `;
      } else if (summary.category === 'continental' && summary.isTitleFight) {
        f.titlesHeld = f.titlesHeld || [];
        const contTitle = summary.titleName || 'Campeonato Sul-Americano';
        if (!f.titlesHeld.includes(contTitle)) f.titlesHeld.unshift(contTitle);
        f.fame = Math.min(100, f.fame + 16);
        gameState.worldEngine.addNews(`🌎 CAMPEÃO CONTINENTAL! ${f.name} conquistou o título da América do Sul: ${contTitle}!`);
        soundFX.playFanfare();
        victoryHonorsHtml = `
          <div class="alert-status safe" style="margin:12px 0; background:rgba(6,182,212,0.18); border:2px solid #06b6d4; color:#fff;">
            🌎 <strong>CAMPEÃO CONTINENTAL SUL-AMERICANO!</strong> Você conquistou o título: ${contTitle}!
          </div>
        `;
      } else if (summary.isTitleFight && summary.titleName) {
        f.titlesHeld = f.titlesHeld || [];
        if (!f.titlesHeld.includes(summary.titleName)) {
          f.titlesHeld.unshift(summary.titleName);
          gameState.worldEngine.addNews(`🏆 ${f.name} sagrou-se campeão: ${summary.titleName}!`);
          soundFX.playFanfare();
          victoryHonorsHtml = `
            <div class="alert-status safe" style="margin:12px 0; background:rgba(168,85,247,0.15); border:2px solid #a855f7; color:#fff;">
              🏆 <strong>NOVO TÍTULO CONQUISTADO:</strong> ${summary.titleName}!
            </div>
          `;
        }
      }

      // Atualiza Ranking Mundial
      gameState.worldEngine.updatePlayerRankOnWin(opponent);
    } else if (summary.winner === 'opponent') {
      if (summary.isOlympic) {
        f.olympicSilverMedals = (f.olympicSilverMedals || 0) + 1;
        f.titlesHeld = f.titlesHeld || [];
        const silverTitle = `🥈 Medalha de Prata nos Jogos Olímpicos (${f.nationality} - Ano ${f.careerYear})`;
        f.titlesHeld.unshift(silverTitle);
        gameState.worldEngine.addNews(`🥈 ${f.name} lutou bravamente e garantiu a Medalha de Prata Olímpica para o ${f.nationality}!`);
        victoryHonorsHtml = `
          <div class="alert-status safe" style="margin:12px 0; background:rgba(148,163,184,0.18); border:1px solid #94a3b8; color:#cbd5e1;">
            🥈 <strong>MEDALHISTA DE PRATA!</strong> Você subiu ao pódio dos Jogos Olímpicos!
          </div>
        `;
      }
      gameState.worldEngine.updatePlayerRankOnLoss();
    }

    gameState.saveGame();
    this.updateHUD();

    // Monta HTML de Recompensas de PH e XP
    let rewardsBadgeHtml = '';
    if (isWin) {
      rewardsBadgeHtml = `
        <div class="fight-rewards-summary-box">
          <div class="reward-pill-row">
            <div class="reward-pill ph-pill">
              <span class="pill-icon">🥋</span>
              <div class="pill-text">
                <strong>+${rewards.earnedPH} Pontos de Habilidade (PH)</strong>
                <small>${rewards.phReason}</small>
              </div>
            </div>
            <div class="reward-pill xp-pill">
              <span class="pill-icon">⚡</span>
              <div class="pill-text">
                <strong>+${rewards.earnedXP} Pontos de XP</strong>
                <small>Evolua suas habilidades até o Teto do seu DNA</small>
              </div>
            </div>
          </div>
          <div class="reward-balance-summary">
            <span>Saldo Atual: <strong>${rewards.currentPH} PH</strong> para comprar golpes • <strong>${rewards.currentXP} XP</strong> para upar atributos</span>
          </div>
        </div>
      `;
    } else {
      rewardsBadgeHtml = `
        <div class="fight-rewards-summary-box">
          <div class="reward-pill-row">
            <div class="reward-pill xp-pill">
              <span class="pill-icon">⚡</span>
              <div class="pill-text">
                <strong>+${rewards.earnedXP} XP de Combate</strong>
                <small>Experiência adquirida no cage/ringue para fortalecer seus atributos</small>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Status do Camp Atual (Limite de 6 Lutas)
    const curFights = f.fightsInCurrentCamp || 0;
    const maxF = f.maxFightsPerCamp || 6;
    let campStatusHtml = '';
    if (curFights >= maxF) {
      campStatusHtml = `
        <div class="alert-status safe" style="margin:12px 0; background:rgba(34, 197, 94, 0.15); border:1px solid #22c55e; color:#86efac; padding:12px 14px; border-radius:10px; text-align:left;">
          🎯 <strong>LIMITE DE 6 LUTAS DO CAMP ATINGIDO (${curFights}/${maxF})!</strong><br>
          <span style="font-size:0.86rem; color:#cbd5e1;">Você completou todos os combates programados para este quadrimestre. O calendário agora está pronto para avançar os 4 meses da temporada!</span>
        </div>
      `;
    } else {
      campStatusHtml = `
        <div style="margin:10px 0; padding:10px 14px; background:rgba(56, 189, 248, 0.1); border:1px solid rgba(56, 189, 248, 0.3); border-radius:10px; font-size:0.88rem; color:#bae6fd; text-align:left;">
          🥊 <strong>Cronograma do Camp:</strong> ${curFights} de ${maxF} lutas realizadas (restam <strong>${maxF - curFights}</strong> para liberar o avanço dos meses).
        </div>
      `;
    }

    // Exibe modal de glória/derrota
    const modal = document.getElementById('gameGeneralModal');
    const content = document.getElementById('gameModalContent');

    content.innerHTML = `
      <div class="result-box ${isWin ? 'win' : 'loss'}">
        <h2>${isWin ? '🏆 VITÓRIA CONQUISTADA!' : 'DERROTA'}</h2>
        <h3>${summary.eventName}</h3>
        ${victoryHonorsHtml}
        <p><strong>Resultado Oficial:</strong> ${summary.methodDescription} (${summary.method}) no Round ${summary.round} [${summary.time}]</p>
        <p>Bolsa Recebida: <strong class="text-gold">+$${summary.purseEarned.toLocaleString()}</strong></p>
        <p>Evolução de Fama: +${Math.round(f.fame)}</p>
        ${rewardsBadgeHtml}
        ${campStatusHtml}
      </div>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:16px;">
        <button class="btn btn-secondary" id="btnGoToShopAfterFight">🥋 Loja de Golpes</button>
        ${curFights >= maxF ? `
          <button class="btn btn-success btn-pulse" id="btnAdvanceCampFromFightModal" style="font-weight:800;">
            ⏩ Concluir Camp & Avançar 4 Meses
          </button>
        ` : `
          <button class="btn btn-primary" id="btnGoToLutasAfterFight">🥊 Próxima Luta (${curFights}/${maxF})</button>
        `}
        <button class="btn btn-secondary" id="btnReturnToDashboard">Painel</button>
      </div>
    `;

    modal.classList.remove('hidden');

    const btnShop = document.getElementById('btnGoToShopAfterFight');
    if (btnShop) {
      btnShop.onclick = () => {
        modal.classList.add('hidden');
        this.switchTab('golpes');
      };
    }

    const btnNextFight = document.getElementById('btnGoToLutasAfterFight');
    if (btnNextFight) {
      btnNextFight.onclick = () => {
        modal.classList.add('hidden');
        this.switchTab('lutas');
      };
    }

    const btnAdvCamp = document.getElementById('btnAdvanceCampFromFightModal');
    if (btnAdvCamp) {
      btnAdvCamp.onclick = () => {
        modal.classList.add('hidden');
        this.advanceCalendarCamp();
      };
    }

    document.getElementById('btnReturnToDashboard').onclick = () => {
      modal.classList.add('hidden');
      this.switchTab('carreira');
    };
  }

  // ==========================================
  // 6. TELA DE RANKING MUNDIAL
  // ==========================================
  renderRankingView() {
    const listContainer = document.getElementById('rankingListContainer');
    const playerStatusEl = document.getElementById('rankingPlayerStatusCard');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const f = gameState.fighter;
    const champ = gameState.worldEngine.getChampion();
    const ranked = gameState.worldEngine.getRankedFighters();

    // 1. Atualiza o Card de Status do Jogador no Topo
    if (playerStatusEl) {
      if (f.isChampion) {
        playerStatusEl.className = 'ranking-player-hero-status status-champion';
        playerStatusEl.innerHTML = `
          <div class="player-hero-status-inner">
            <span class="status-hero-icon">🏆</span>
            <div>
              <div class="status-hero-title">VOCÊ É O CAMPEÃO MUNDIAL INDISCUTÍVEL!</div>
              <div class="status-hero-sub">Dono do cinturão unificado. Defenda seu reinado contra os principais desafiantes!</div>
            </div>
          </div>
        `;
      } else if (f.ranking !== null && f.ranking !== undefined) {
        let tierLabel = 'Top 50 • Circuito Nacional';
        let tierClass = 'status-top50';
        if (f.ranking <= 5) {
          tierLabel = 'Elite Mundial • Desafiante Principal ao Cinturão';
          tierClass = 'status-top5';
        } else if (f.ranking <= 15) {
          tierLabel = 'Top 15 • Contender Internacional';
          tierClass = 'status-top15';
        } else if (f.ranking <= 30) {
          tierLabel = 'Top 30 • Ranqueado Global';
          tierClass = 'status-top30';
        }

        playerStatusEl.className = `ranking-player-hero-status ${tierClass}`;
        playerStatusEl.innerHTML = `
          <div class="player-hero-status-inner">
            <span class="status-hero-icon">⭐</span>
            <div>
              <div class="status-hero-title">SUA POSIÇÃO: #${f.ranking} DO RANKING MUNDIAL</div>
              <div class="status-hero-sub">${tierLabel} • Vitórias sobre atletas ranqueados avançam seu posto!</div>
            </div>
          </div>
        `;
      } else {
        playerStatusEl.className = 'ranking-player-hero-status status-unranked';
        playerStatusEl.innerHTML = `
          <div class="player-hero-status-inner">
            <span class="status-hero-icon">🛡️</span>
            <div>
              <div class="status-hero-title">STATUS ATUAL: NÃO-RANQUEADO NO CIRCUITO MUNDIAL</div>
              <div class="status-hero-sub">Dispute e vença combates no circuito municipal e estadual para ingressar no Top 50!</div>
            </div>
          </div>
        `;
      }
    }

    // 2. Card do Campeão Mundial (#0)
    const isPlayerChamp = f.isChampion;
    const champCard = document.createElement('div');
    champCard.className = `ranking-card champion-card ${isPlayerChamp ? 'player-rank-card' : ''}`;
    champCard.innerHTML = `
      <div class="rank-pos">🏆 CINTURÃO</div>
      <div class="rank-info">
        <h3>${isPlayerChamp ? `${f.name} (VOCÊ)` : champ.name}</h3>
        <p>Cartel: <strong>${isPlayerChamp ? `${f.record.wins}-${f.record.losses}` : `${champ.record.wins}-${champ.record.losses}-${champ.record.draws || 0}`}</strong> | Nacionalidade: ${isPlayerChamp ? f.nationality : champ.nationality} | Estilo: ${isPlayerChamp ? f.style : champ.style}</p>
      </div>
      <span class="badge badge-gold">CAMPEÃO DA CATEGORIA</span>
    `;
    listContainer.appendChild(champCard);

    // 3. Top 50 Fighters com Tiers e Divisões
    let currentTierCategory = '';

    ranked.forEach(opp => {
      const rankNum = opp.rank;
      let tierName = '';
      let tierBadgeClass = '';
      let tierHeaderTitle = '';

      if (rankNum <= 5) {
        tierName = 'ELITE MUNDIAL';
        tierBadgeClass = 'badge-tier-top5';
        if (rankNum === 1) {
          tierHeaderTitle = '🌟 ELITE MUNDIAL & DESAFIANTES AO CINTURÃO (TOP 1 AO #5)';
        }
      } else if (rankNum <= 15) {
        tierName = 'CONTENDER MUNDIAL';
        tierBadgeClass = 'badge-tier-top15';
        if (rankNum === 6) {
          tierHeaderTitle = '⚔️ CONTENDERS MUNDIAIS & DESAFIANTES DE PESO (TOP 6 AO #15)';
        }
      } else if (rankNum <= 30) {
        tierName = 'RANQUEADO GLOBAL';
        tierBadgeClass = 'badge-tier-top30';
        if (rankNum === 16) {
          tierHeaderTitle = '🌍 RANQUEADOS DO CIRCUITO INTERNACIONAL (TOP 16 AO #30)';
        }
      } else {
        tierName = 'CIRCUITO NACIONAL';
        tierBadgeClass = 'badge-tier-top50';
        if (rankNum === 31) {
          tierHeaderTitle = '🛡️ CIRCUITO DE ACESSO & GATEKEEPERS DA DIVISÃO (TOP 31 AO #50)';
        }
      }

      // Se entrou em nova categoria de tier, cria um cabeçalho separador
      if (tierHeaderTitle && currentTierCategory !== tierHeaderTitle) {
        currentTierCategory = tierHeaderTitle;
        const tierDivider = document.createElement('div');
        tierDivider.className = 'ranking-tier-divider-bar';
        tierDivider.innerHTML = `<span>${tierHeaderTitle}</span>`;
        listContainer.appendChild(tierDivider);
      }

      const isPlayerHere = f.ranking === rankNum;
      const card = document.createElement('div');
      card.className = `ranking-card ${isPlayerHere ? 'player-rank-card' : ''}`;
      
      const fighterName = isPlayerHere ? `${f.name} (VOCÊ)` : opp.name;
      const fighterRecord = isPlayerHere ? `${f.record.wins}V - ${f.record.losses}D` : `${opp.record.wins}V - ${opp.record.losses}D`;
      const fighterNat = isPlayerHere ? f.nationality : opp.nationality;
      const fighterStyle = isPlayerHere ? f.style : opp.style;
      const fighterStrength = opp.strength ? ` • ${opp.strength}` : '';

      card.innerHTML = `
        <div class="rank-pos">#${rankNum}</div>
        <div class="rank-info">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <h4 style="margin:0; font-size:1.05rem; color:${isPlayerHere ? '#ffd166' : '#fff'};">${fighterName}</h4>
            <span class="badge-tier-pill ${tierBadgeClass}">${tierName}</span>
          </div>
          <p style="margin:4px 0 0 0; color:#94a3b8; font-size:0.82rem;">Cartel: <strong>${fighterRecord}</strong> | País: <strong>${fighterNat}</strong> | Estilo: <strong>${fighterStyle}</strong>${fighterStrength}</p>
        </div>
        <span class="rank-style">${fighterStyle}</span>
      `;
      listContainer.appendChild(card);
    });
  }

  // ==========================================
  // 7. TELA DE ACADEMIA & EQUIPAMENTOS
  // ==========================================
  renderAcademiaView() {
    const f = gameState.fighter;
    const gymContainer = document.getElementById('gymsListContainer');
    gymContainer.innerHTML = '';

    GYMS.forEach(gym => {
      const isCurrent = f.gymId === gym.id;
      const canAfford = f.money >= gym.monthlyFee && f.fame >= gym.minFame;

      const card = document.createElement('div');
      card.className = `gym-card ${isCurrent ? 'current-gym' : ''}`;
      card.innerHTML = `
        <div class="gym-header">
          <h3>${gym.name}</h3>
          <span class="badge ${isCurrent ? 'badge-gold' : 'badge-normal'}">${isCurrent ? 'SUA ACADEMIA' : gym.tier}</span>
        </div>
        <p class="gym-desc">${gym.description}</p>
        <p><strong>Treinador:</strong> ${gym.coach.name} (${gym.coach.specialty})</p>
        <p><strong>Bônus de Corner:</strong> ${gym.coach.adviceBonus}</p>
        <p><strong>Mensalidade:</strong> $${gym.monthlyFee}/mês (Fama mín: ${gym.minFame})</p>
        ${isCurrent ? '<button class="btn btn-secondary" disabled>Academia Atual</button>' :
          `<button class="btn btn-primary btn-join-gym" ${!canAfford ? 'disabled' : ''}>
            ${canAfford ? 'Mudar para esta Equipe' : 'Bloqueado (Fama ou $ insuficiente)'}
          </button>`
        }
      `;

      const joinBtn = card.querySelector('.btn-join-gym');
      if (joinBtn) {
        joinBtn.onclick = () => {
          soundFX.playCash();
          f.gymId = gym.id;
          gameState.saveGame();
          this.updateHUD();
          this.renderAcademiaView();
        };
      }

      gymContainer.appendChild(card);
    });

    // Loja de Equipamentos
    const eqContainer = document.getElementById('equipmentShopContainer');
    eqContainer.innerHTML = '';
    EQUIPMENT.forEach(eq => {
      const alreadyOwned = f.inventory.includes(eq.id);
      const canBuy = f.money >= eq.price && !alreadyOwned;

      const card = document.createElement('div');
      card.className = 'equip-card';
      card.innerHTML = `
        <h4>${eq.name}</h4>
        <p>${eq.description}</p>
        <p>Preço: <strong class="text-gold">$${eq.price}</strong></p>
        ${alreadyOwned ? '<button class="btn btn-secondary" disabled>Já Adquirido ✅</button>' :
          `<button class="btn btn-primary btn-buy-equip" ${!canBuy ? 'disabled' : ''}>
            ${canBuy ? 'Comprar Equipamento' : 'Saldo Insuficiente'}
          </button>`
        }
      `;

      const buyBtn = card.querySelector('.btn-buy-equip');
      if (buyBtn) {
        buyBtn.onclick = () => {
          soundFX.playCash();
          f.money -= eq.price;
          f.inventory.push(eq.id);
          // Aplica bônus
          Object.entries(eq.bonus).forEach(([attr, b]) => {
            if (f.attributes[attr] !== undefined) f.attributes[attr] += b;
          });
          gameState.saveGame();
          this.updateHUD();
          this.renderAcademiaView();
        };
      }

      eqContainer.appendChild(card);
    });
  }

  // ==========================================
  // 7.5. TELA DE GOLPES & ARSENAL (COMPRA COM PH)
  // ==========================================
  renderGolpesView() {
    const f = gameState.fighter;
    const mod = MODALITIES[f.modality] || MODALITIES.boxing;

    const phValEl = document.getElementById('golpesPhValue');
    if (phValEl) phValEl.textContent = `${f.skillPoints || 0} PH`;

    // Atualiza cabeçalhos da seção para refletir estritamente a modalidade do atleta
    const starterHeaderTitle = document.querySelector('#view-golpes .starter-moves-header-title');
    if (starterHeaderTitle) {
      starterHeaderTitle.textContent = `${mod.icon} SEUS 5 GOLPES BÁSICOS FUNDAMENTAIS (${mod.name.toUpperCase()})`;
    }
    const starterHeaderSub = document.querySelector('#view-golpes .starter-moves-header-sub');
    if (starterHeaderSub) {
      starterHeaderSub.textContent = `O alicerce da sua modalidade (${mod.name}). Todos os atletas deste estilo nascem equipados com estes 5 fundamentos.`;
    }

    const shopHeaderTitle = document.querySelector('#view-golpes .shop-moves-header-title');
    if (shopHeaderTitle) {
      shopHeaderTitle.textContent = `💥 LOJA DE GOLPES ESPECIAIS DE ${mod.name.toUpperCase()}`;
    }
    const shopHeaderSub = document.querySelector('#view-golpes .shop-moves-header-sub');
    if (shopHeaderSub) {
      const artTerm = mod.id === 'boxing' ? 'nocautes e combinações lendárias de Boxe' :
                      mod.id === 'jiu_jitsu' ? 'finalizações técnicas e raspagens de Jiu-Jitsu' :
                      mod.id === 'muay_thai' ? 'cotoveladas, joelhadas e chutes devastadores de Muay Thai' :
                      mod.id === 'judo' ? 'projeções perfeitas de Ippon e imobilizações de Judô' :
                      mod.id === 'wrestling' ? 'quedas explosivas e suplexes de Wrestling' :
                      `técnicas exclusivas da nobre arte do ${mod.name}`;
      shopHeaderSub.textContent = `Arsenal exclusivo: ${artTerm}. Técnicas de outras artes marciais são estritamente isoladas e não aparecem para o seu estilo.`;
    }

    // 1. Renderiza os 5 Golpes Básicos Equipados
    const starterContainer = document.getElementById('starterMovesGrid');
    if (starterContainer) {
      starterContainer.innerHTML = '';
      const starterKeys = getStarterMovesForModality(f.modality);

      starterKeys.forEach(moveId => {
        const m = getMoveById(moveId);
        if (!m) return;

        const card = document.createElement('div');
        card.className = 'move-card starter-move-card';
        card.innerHTML = `
          <div class="move-card-header">
            <span class="move-icon">${m.icon}</span>
            <div class="move-title-wrap">
              <h4 class="move-name">${m.name}</h4>
              <span class="move-phase-badge phase-${m.phase.toLowerCase()}">${m.phase === 'STANDUP' ? '🥊 Em Pé' : m.phase === 'CLINCH' ? '🤼 Clinch' : '🥋 Solo'}</span>
            </div>
            <span class="badge badge-safe">BÁSICO EQUIPADO</span>
          </div>
          <p class="move-desc">${m.desc}</p>
          <div class="move-stats-row">
            <span class="stat-tag damage">💥 Dano: <strong>${m.damage}</strong></span>
            <span class="stat-tag stamina">🫁 Gás: <strong>${m.staminaCost > 0 ? `-${m.staminaCost}` : `+${Math.abs(m.staminaCost)}`}</strong></span>
            ${m.koChance ? `<span class="stat-tag chance">⚡ KO: <strong>${Math.round(m.koChance * 100)}%</strong></span>` : ''}
            ${m.subChance ? `<span class="stat-tag chance">🥋 Sub: <strong>${Math.round(m.subChance * 100)}%</strong></span>` : ''}
          </div>
          <div class="move-card-footer">
            <button class="btn btn-secondary btn-sm" disabled style="width:100%; opacity:0.85;">
              ✅ Equipado de Fábrica (${mod.name})
            </button>
          </div>
        `;
        starterContainer.appendChild(card);
      });
    }

    // 2. Renderiza a Loja de Golpes Especiais Desbloqueáveis com PH
    // FILTRA ESTRITAMENTE PELA MODALIDADE DO LUTADOR (Ex: Boxeador só vê golpes de Boxe)
    const shopContainer = document.getElementById('shopMovesGrid');
    if (shopContainer) {
      shopContainer.innerHTML = '';
      const shopMoves = getShopMoves(f.modality);

      shopMoves.forEach(m => {
        const isUnlocked = f.unlockedMoves && f.unlockedMoves.includes(m.id);
        const canAfford = (f.skillPoints || 0) >= m.cost;

        const card = document.createElement('div');
        card.className = `move-card shop-move-card ${isUnlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
          <div class="move-card-header">
            <span class="move-icon">${m.icon}</span>
            <div class="move-title-wrap">
              <h4 class="move-name">${m.name}</h4>
              <span class="move-phase-badge phase-${m.phase.toLowerCase()}">${m.phase === 'STANDUP' ? '🥊 Em Pé' : m.phase === 'CLINCH' ? '🤼 Clinch' : '🥋 Solo'}</span>
            </div>
            <span class="badge ${isUnlocked ? 'badge-safe' : 'badge-gold'}">${isUnlocked ? 'DESBLOQUEADO' : `⭐ ${m.cost} PH`}</span>
          </div>
          <p class="move-desc">${m.desc}</p>
          <div class="move-stats-row">
            <span class="stat-tag damage">💥 Dano: <strong>${m.damage}</strong></span>
            <span class="stat-tag stamina">🫁 Gás: <strong>-${m.staminaCost}</strong></span>
            ${m.koChance ? `<span class="stat-tag chance">⚡ KO: <strong>${Math.round(m.koChance * 100)}%</strong></span>` : ''}
            ${m.subChance ? `<span class="stat-tag chance">🥋 Sub: <strong>${Math.round(m.subChance * 100)}%</strong></span>` : ''}
          </div>
          ${m.effectText ? `<div class="move-effect-preview">✨ <em>"${m.effectText}"</em></div>` : ''}
          <div class="move-card-footer">
            ${isUnlocked ? 
              `<button class="btn btn-secondary btn-sm" disabled style="width:100%; color:#34d399; font-weight:700;">
                ✅ Desbloqueado no Arsenal
              </button>` :
              `<button class="btn btn-primary btn-sm btn-buy-move" data-move-id="${m.id}" ${!canAfford ? 'disabled' : ''} style="width:100%;">
                ${canAfford ? `🔓 Desbloquear Golpe (${m.cost} PH)` : `🔒 Faltam Pontos (${f.skillPoints || 0}/${m.cost} PH)`}
              </button>`
            }
          </div>
        `;

        const buyBtn = card.querySelector('.btn-buy-move');
        if (buyBtn) {
          buyBtn.onclick = () => {
            soundFX.playCash();
            const res = f.unlockMove(m.id);
            if (res.success) {
              soundFX.playFanfare();
              gameState.saveGame();
              this.updateHUD();
              this.renderGolpesView();
            }
          };
        }

        shopContainer.appendChild(card);
      });
    }
  }

  // ==========================================
  // 8. TELA DE ATRIBUTOS & CONDIÇÃO (SISTEMA DE XP & TETO DE DNA)
  // ==========================================
  renderAtributosView() {
    const f = gameState.fighter;
    const mod = MODALITIES[f.modality] || MODALITIES.boxing;

    // Atualiza cabeçalhos dinâmicos com isolamento estrito de modalidade
    const titleEl = document.querySelector('#view-atributos .atributos-header-title');
    if (titleEl) {
      titleEl.textContent = `${mod.icon} ATRIBUTOS DE ${mod.name.toUpperCase()} & TETO GENÉTICO`;
    }
    const subEl = document.querySelector('#view-atributos .atributos-header-sub');
    if (subEl) {
      subEl.textContent = `Atributos e fundamentos exclusivos da modalidade ${mod.name}. Invista seu XP para evoluir até o limite genético herdado das lendas mundiais. Habilidades de outras artes marciais são estritamente isoladas.`;
    }

    // Atualiza Saldo de XP no Banner
    const xpValEl = document.getElementById('atributosXpValue');
    if (xpValEl) xpValEl.textContent = `${f.xp || 0} XP`;

    const container = document.getElementById('attributesGrid');
    container.innerHTML = '';

    const eff = f.getEffectiveAttributes();

    // FILTRAGEM ESTRITA: Exibe exclusivamente os atributos da modalidade do lutador!
    const modAttrs = getAttributesForModality(f.modality);

    modAttrs.forEach(attrObj => {
      const attr = attrObj.id;
      const label = attrObj.label;
      const icon = attrObj.icon || '⚡';
      const desc = attrObj.desc || '';

      const baseVal = Math.round(f.attributes[attr] || 0);
      const effVal = Math.round(eff[attr] || 0);
      const isPenalty = effVal < baseVal;
      const tier = getSkillTier(effVal);

      // Teto Genético herdado das Lendas ("aquelas habilidades que nois pega dos cara é o nosso maximo")
      const maxDna = (f.dnaMaxAttributes && f.dnaMaxAttributes[attr] !== undefined) 
        ? f.dnaMaxAttributes[attr] 
        : 70;
      const isAtMaxDna = baseVal >= maxDna;
      const cost = f.getXpCostForAttribute(attr);
      const check = f.canUpgradeAttributeWithXp(attr);

      const card = document.createElement('div');
      card.className = `attribute-card ${isAtMaxDna ? 'at-dna-ceiling' : ''}`;
      card.innerHTML = `
        <div class="attr-header-row">
          <div class="attr-identity">
            <span class="attr-name">${icon} ${label}</span>
            <span class="skill-tier-badge ${tier.badgeClass}">${tier.tier}</span>
          </div>
          <div class="attr-level-badge-box">
            <span class="level-label-small">NÍVEL</span>
            <span class="level-number-big ${isPenalty ? 'text-danger' : ''}">${effVal}</span>
            <span class="level-max-small">/ 100</span>
          </div>
        </div>

        <p class="attr-tech-desc" style="font-size:0.78rem; color:#8e9aaf; margin: 6px 0 10px; line-height:1.35;">${desc}</p>

        <!-- Indicador de Teto Genético de DNA herdado das lendas -->
        <div class="dna-ceiling-banner">
          <span class="dna-ceiling-icon">🧬</span>
          <span class="dna-ceiling-label">TETO MÁXIMO DE DNA:</span>
          <strong class="dna-ceiling-val text-gold">${maxDna}</strong>
          ${isAtMaxDna ? '<span class="dna-max-badge">🔒 LIMITE GENÉTICO ALCANÇADO</span>' : ''}
        </div>

        <!-- Barra de Progresso com marcador visual do Teto de DNA -->
        <div class="progress-bar-bg relative-track">
          <div class="progress-bar-fill ${isPenalty ? 'bg-danger' : ''}" style="width:${effVal}%; background-color:${isPenalty ? '#ef4444' : tier.color};"></div>
          <div class="dna-ceiling-marker" style="left:${maxDna}%;" title="Teto de DNA: Nível ${maxDna}"></div>
        </div>

        ${isPenalty ? `<div class="penalty-text text-danger">⚠️ Penalizado (-${baseVal - effVal} por lesão ou fadiga extrema)</div>` : ''}

        <!-- Ação de Evolução com XP -->
        <div class="attr-upgrade-footer">
          ${isAtMaxDna ? 
            `<button class="btn btn-secondary btn-sm btn-dna-locked" disabled style="width:100%; opacity:0.8;">
              🔒 Teto Genético Atingido (Máx: ${maxDna})
            </button>` :
            check.canUpgrade ?
            `<button class="btn btn-primary btn-sm btn-upgrade-attr" data-attr="${attr}" style="width:100%;">
              ⚡ Upar para Nível ${baseVal + 1} (${cost} XP)
            </button>` :
            `<button class="btn btn-secondary btn-sm btn-upgrade-disabled" disabled style="width:100%; opacity:0.65;">
              Falta XP (${f.xp || 0}/${cost} XP)
            </button>`
          }
        </div>
      `;

      const upBtn = card.querySelector('.btn-upgrade-attr');
      if (upBtn) {
        upBtn.onclick = () => {
          soundFX.playClick();
          const res = f.upgradeAttributeWithXp(attr);
          if (res.success) {
            soundFX.playCash();
            gameState.saveGame();
            this.updateHUD();
            this.renderAtributosView();
          }
        };
      }

      container.appendChild(card);
    });
  }

  // ==========================================
  // 9. TELA DE VIDA & REDES SOCIAIS
  // ==========================================
  renderVidaView() {
    const f = gameState.fighter;
    const life = gameState.lifeEngine;

    // Empregos
    const jobsContainer = document.getElementById('jobsListContainer');
    jobsContainer.innerHTML = '';
    JOBS.forEach(j => {
      const isCur = life.currentJob.id === j.id;
      const card = document.createElement('div');
      card.className = `life-card ${isCur ? 'active-life' : ''}`;
      card.innerHTML = `
        <h4>${j.name}</h4>
        <p>${j.description}</p>
        <p>Salário: <strong>+$${j.weeklyPay}/semana</strong> | Cansaço: +${j.fatigueAdd}% fadiga</p>
        ${isCur ? '<button class="btn btn-secondary" disabled>Emprego Atual</button>' :
          `<button class="btn btn-primary btn-set-job" ${f.fame < j.minFame ? 'disabled' : ''}>
            ${f.fame >= j.minFame ? 'Trabalhar Aqui' : `Exige Fama ${j.minFame}`}
          </button>`
        }
      `;
      const btn = card.querySelector('.btn-set-job');
      if (btn) {
        btn.onclick = () => {
          soundFX.playClick();
          life.setJob(j.id);
          gameState.saveGame();
          this.renderVidaView();
        };
      }
      jobsContainer.appendChild(card);
    });

    // Moradia
    const housingContainer = document.getElementById('housingListContainer');
    housingContainer.innerHTML = '';
    HOUSING.forEach(h => {
      const isCur = life.currentHousing.id === h.id;
      const card = document.createElement('div');
      card.className = `life-card ${isCur ? 'active-life' : ''}`;
      card.innerHTML = `
        <h4>${h.name}</h4>
        <p>${h.description}</p>
        <p>Custo: <strong>-$${h.weeklyCost}/semana</strong> | Bônus de Recuperação: ${h.recoveryBonus}x</p>
        ${isCur ? '<button class="btn btn-secondary" disabled>Moradia Atual</button>' :
          `<button class="btn btn-primary btn-set-housing">Mudar para cá</button>`
        }
      `;
      const btn = card.querySelector('.btn-set-housing');
      if (btn) {
        btn.onclick = () => {
          soundFX.playClick();
          life.setHousing(h.id);
          gameState.saveGame();
          this.renderVidaView();
        };
      }
      housingContainer.appendChild(card);
    });

    // Redes Sociais
    document.getElementById('socialFollowersCount').textContent = f.followers.toLocaleString();
    document.getElementById('socialFameScore').textContent = `${Math.round(f.fame)}/100`;

    document.getElementById('btnPostTraining').onclick = () => {
      soundFX.playClick();
      const res = life.postSocialMedia('training');
      alert(`${res.message}\n+${res.followerGain} Seguidores!`);
      gameState.saveGame();
      this.renderVidaView();
      this.updateHUD();
    };

    document.getElementById('btnPostTrashTalk').onclick = () => {
      soundFX.playClick();
      const res = life.postSocialMedia('trash_talk');
      alert(`${res.message}\n+${res.followerGain} Seguidores!`);
      gameState.saveGame();
      this.renderVidaView();
      this.updateHUD();
    };

    document.getElementById('btnPostHumble').onclick = () => {
      soundFX.playClick();
      const res = life.postSocialMedia('humble_marcial');
      alert(`${res.message}\n+${res.followerGain} Seguidores!`);
      gameState.saveGame();
      this.renderVidaView();
      this.updateHUD();
    };
  }

  // ==========================================
  // 10. TELA DE COLETIVA DE IMPRENSA (EVENTOS SIGNIFICATIVOS)
  // ==========================================
  renderColetivaView() {
    const f = gameState.fighter;
    const container = document.getElementById('coletivaContainer');
    if (!container) return;
    container.innerHTML = '';

    const pc = gameState.activePressConference;

    // Se NÃO houver coletiva ativa convocada
    if (!pc) {
      container.innerHTML = `
        <div class="coletiva-idle-box">
          <div class="coletiva-idle-header">
            <span class="coletiva-mic-icon">🎙️</span>
            <h2>SALA DE IMPRENSA & CONFERÊNCIA OFICIAL</h2>
            <p class="coletiva-idle-subtitle">Nenhuma coletiva de imprensa agendada no momento.</p>
          </div>

          <div class="coletiva-info-card">
            <h3>📋 QUANDO AS COLETIVAS SÃO CONVOCADAS?</h3>
            <p>A imprensa esportiva internacional (ESPN, The Ring Magazine, SporTV, TV aberta) apenas convoca conferências ao vivo com bancada e encarada oficial para <strong>Eventos de Grande Magnitude</strong>:</p>
            <div class="coletiva-triggers-grid">
              <div class="trigger-pill">👑 <strong>Disputas de Cinturão Mundial</strong> (Títulos Mundiais Unificados)</div>
              <div class="trigger-pill">🏅 <strong>Jogos Olímpicos Mundiais</strong> (Disputa de Ouro e Prata)</div>
              <div class="trigger-pill">⚔️ <strong>Desafios de Estilos & Luta Livre</strong> (Superlutas de Artes Marciais)</div>
              <div class="trigger-pill">🌟 <strong>Duelos contra o Top 10 Mundial</strong> (Contenders e Desafiantes de Elite)</div>
            </div>
            <p style="margin-top:14px; font-size:0.88rem; color:#94a3b8;">
              Assine um contrato para um desses campeonatos no menu <strong>LUTAS</strong> para ter sua coletiva transmitida e desestabilizar o rival na encarada!
            </p>
            <button class="btn btn-primary" id="btnGoToLutasFromPress" style="margin-top:16px; padding:12px 24px; font-weight:700;">
              🥊 Explorar Campeonatos & Assinar Luta
            </button>
          </div>
        </div>
      `;

      const btnGo = document.getElementById('btnGoToLutasFromPress');
      if (btnGo) btnGo.onclick = () => this.switchTab('lutas');
      return;
    }

    // Se a coletiva JÁ FOI CONCLUÍDA
    if (pc.completed) {
      container.innerHTML = `
        <div class="coletiva-completed-box">
          <div class="coletiva-completed-header">
            <span class="badge badge-safe">✔ COLETIVA REALIZADA COM SUCESSO</span>
            <h2>🎙️ REPERCUSSÃO MUNDIAL DA COLETIVA DE IMPRENSA</h2>
            <p class="text-gold" style="font-size:1.15rem; font-weight:700; margin:8px 0;">"${pc.finalHeadline || pc.questions[0].options[0].headline}"</p>
          </div>

          <div class="coletiva-recap-grid">
            <div class="recap-card">
              <h4>📰 Manchete dos Jornais</h4>
              <p style="color:#e2e8f0; font-style:italic; line-height:1.4;">${pc.finalHeadline || 'A encarada entre os dois atletas gerou grande repercussão nos veículos esportivos mundiais!'}</p>
            </div>
            <div class="recap-card">
              <h4>🔥 Bônus Acumulados</h4>
              <ul style="padding-left:18px; margin:6px 0; color:#86efac; font-size:0.9rem; line-height:1.6;">
                <li>+${pc.totalFameGain || 35} Pontos de Fama Internacional</li>
                <li>+${pc.totalMoralGain || 20} de Moral e Autoestima</li>
                ${pc.totalCashBonus ? `<li>+$${pc.totalCashBonus.toLocaleString()} em Bônus de Mídia/PPV</li>` : ''}
                <li>Encarada Oficial realizada e postura assimilada!</li>
              </ul>
            </div>
          </div>

          <div style="display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap;">
            <button class="btn btn-primary btn-pulse" id="btnGoToCombatFromPress" style="padding:14px 28px; font-weight:800; font-size:1.05rem;">
              🥊 Entrar no Ringue / Octógono Agora!
            </button>
            <button class="btn btn-secondary" id="btnBackToDashFromPress" style="padding:14px 24px;">
              📊 Painel de Carreira
            </button>
          </div>
        </div>
      `;

      const btnComb = document.getElementById('btnGoToCombatFromPress');
      if (btnComb) {
        btnComb.onclick = () => {
          this.startCombat(f.scheduledFight.opponent, {
            isTitleFight: f.scheduledFight.isTitleFight,
            isOlympic: f.scheduledFight.isOlympic,
            titleName: f.scheduledFight.titleName,
            category: f.scheduledFight.category,
            eventName: f.scheduledFight.eventName,
            purse: f.scheduledFight.purse,
            matchType: f.scheduledFight.matchType,
            matchTypeBadge: f.scheduledFight.matchTypeBadge,
            styleClash: f.scheduledFight.styleClash,
            rulesDescription: f.scheduledFight.rulesDescription,
            rounds: f.scheduledFight.rounds,
            roundDurationSec: f.scheduledFight.roundDurationSec,
            roundsDescription: f.scheduledFight.roundsDescription
          });
        };
      }

      const btnDash = document.getElementById('btnBackToDashFromPress');
      if (btnDash) btnDash.onclick = () => this.switchTab('carreira');
      return;
    }

    // Se a coletiva ESTÁ ATIVA E PRONTA PARA SER JOGADA
    pc.selectedAnswers = pc.selectedAnswers || {};

    let questionsHtml = pc.questions.map((q) => {
      const selectedOptId = pc.selectedAnswers[q.id];

      const optionsHtml = q.options.map(opt => {
        const isSelected = selectedOptId === opt.id;
        return `
          <button class="coletiva-option-btn ${isSelected ? 'selected' : ''}" data-qid="${q.id}" data-optid="${opt.id}">
            <div class="opt-badge-row">
              <span class="opt-type-badge">${opt.badge}</span>
              ${isSelected ? '<span class="selected-tag">✔ ESCOLHIDO</span>' : ''}
            </div>
            <div class="opt-speech-text">${opt.text}</div>
            <div class="opt-effect-preview">${opt.effectDesc}</div>
          </button>
        `;
      }).join('');

      return `
        <div class="coletiva-question-block" id="block-${q.id}">
          <div class="journalist-badge-header">
            <span class="journalist-outlet-pill">${q.outletBadge}</span>
            <strong class="journalist-name">${q.journalistName} (${q.mediaOutlet})</strong>
          </div>
          <div class="journalist-question-text">
            "${q.question}"
          </div>
          <div class="coletiva-options-grid">
            ${optionsHtml}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="coletiva-stage-wrapper">
        <!-- Banner Principal da Coletiva -->
        <div class="coletiva-hero-banner">
          <div class="coletiva-badges-row">
            <span class="badge badge-gold">🎙️ COLETIVA OFICIAL AO VIVO</span>
            <span class="badge badge-red">${pc.isOlympic ? '🏅 JOGOS OLÍMPICOS' : pc.isTitle ? '👑 DISPUTA DE CINTURÃO' : '⚔️ EVENTO MUNDIAL'}</span>
            <span class="badge badge-secondary">${pc.rounds} ROUNDS OFICIAIS</span>
          </div>
          <h2>${f.scheduledFight.eventName}</h2>
          <p class="coletiva-host-intro">${pc.hostIntro}</p>
        </div>

        <!-- Púlpito do Rival -->
        <div class="coletiva-rival-podium">
          <div class="rival-podium-header">
            <span class="mic-icon">🎤</span>
            <strong style="color:#f87171;">DECLARAÇÃO DO RIVAL: ${pc.opponent.name.toUpperCase()}</strong>
          </div>
          <div class="rival-podium-quote">
            ${pc.rivalOpeningQuote}
          </div>
        </div>

        <!-- Rodadas de Perguntas da Imprensa -->
        <div class="coletiva-questions-wrapper">
          <h3 style="margin-bottom:14px; font-size:1.2rem; color:#fff;">🎙️ PERGUNTAS DA MÍDIA INTERNACIONAL & ENCARADA</h3>
          ${questionsHtml}
        </div>

        <!-- Bloco de Encerramento e Publicação -->
        <div class="coletiva-submit-bar">
          <button class="btn btn-primary btn-pulse" id="btnSubmitPressConference" style="padding:16px 32px; font-size:1.15rem; font-weight:800; width:100%;">
            📸 Concluir Coletiva de Imprensa & Publicar Manchetes
          </button>
        </div>
      </div>
    `;

    // Bind dos cliques nas opções
    container.querySelectorAll('.coletiva-option-btn').forEach(btn => {
      btn.onclick = () => {
        soundFX.playClick();
        const qid = btn.dataset.qid;
        const optid = btn.dataset.optid;
        pc.selectedAnswers[qid] = optid;
        this.renderColetivaView();
      };
    });

    // Botão Concluir
    const btnSubmit = document.getElementById('btnSubmitPressConference');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        const answeredCount = Object.keys(pc.selectedAnswers).length;
        if (answeredCount < pc.questions.length) {
          alert(`Por favor, responda a todas as perguntas da imprensa e faça a encarada oficial antes de concluir! (${answeredCount}/${pc.questions.length} respondidas)`);
          return;
        }

        soundFX.playFanfare();
        soundFX.playCrowdRoar();

        let totalFame = 0;
        let totalMoral = 0;
        let totalCash = 0;
        let totalFightIq = 0;
        let mainHeadline = '';

        pc.questions.forEach(q => {
          const chosenOptId = pc.selectedAnswers[q.id];
          const opt = q.options.find(o => o.id === chosenOptId);
          if (opt) {
            totalFame += opt.fameGain || 0;
            totalMoral += opt.moralGain || 0;
            totalCash += opt.cashBonus || 0;
            totalFightIq += opt.fightIqGain || 0;
            if (opt.headline && !mainHeadline) {
              mainHeadline = opt.headline;
            }
          }
        });

        f.fame = Math.min(100, f.fame + totalFame);
        f.morale = Math.min(100, f.morale + totalMoral);
        f.money += totalCash;
        if (totalFightIq > 0) {
          f.attributes.fightIQ = Math.min(99, (f.attributes.fightIQ || 50) + totalFightIq);
        }

        pc.completed = true;
        pc.totalFameGain = totalFame;
        pc.totalMoralGain = totalMoral;
        pc.totalCashBonus = totalCash;
        pc.finalHeadline = mainHeadline;

        if (mainHeadline) {
          gameState.worldEngine.worldNews.unshift(`🎙️ [COLETIVA DE IMPRENSA] ${mainHeadline}`);
        }

        gameState.saveGame();
        this.updateHUD();
        this.renderColetivaView();
      };
    }
  }

  // ==========================================
  // 11. TELA DE HISTÓRICO DE LUTAS
  // ==========================================
  renderHistoricoView() {
    const f = gameState.fighter;
    const container = document.getElementById('fightHistoryList');
    container.innerHTML = '';

    if (f.fightHistory.length === 0) {
      container.innerHTML = '<p class="empty-msg">Nenhuma luta realizada até o momento. Sua história está apenas começando!</p>';
      return;
    }

    f.fightHistory.forEach(fight => {
      const isWin = fight.result === 'Vitória';
      const card = document.createElement('div');
      card.className = `history-card ${isWin ? 'win-card' : 'loss-card'}`;
      card.innerHTML = `
        <div class="hist-header">
          <span class="badge ${isWin ? 'badge-win' : 'badge-loss'}">${fight.result.toUpperCase()}</span>
          <span class="hist-date">${fight.dateFormatted} | ${fight.eventName}</span>
        </div>
        <div class="hist-body">
          <h3>vs. ${fight.opponentName}</h3>
          <p><strong>Método:</strong> ${fight.methodDescription} (${fight.method})</p>
          <p><strong>Tempo:</strong> Round ${fight.round} aos ${fight.time} | Modalidade: ${fight.modality}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

export const viewsManager = new ViewsManager();
