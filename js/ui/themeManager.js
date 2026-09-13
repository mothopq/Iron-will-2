// js/ui/themeManager.js - Gerenciador de Temas e Personalização de Cores do Jogo

import { soundFX } from '../audio.js';

export const THEME_PRESETS = [
  {
    id: 'crimson-noir',
    name: 'Rubro-Negro Brutal',
    desc: 'Preto profundo e Vermelho Carmesim estilo Fight Night',
    badge: 'PADRÃO',
    primary: '#e63946',
    primaryDark: '#991b1b',
    primaryLight: '#ff4d5a',
    bgDark: '#07080b',
    bgCard: '#11141c',
    glow: 'rgba(230, 57, 70, 0.45)',
    glowSubtle: 'rgba(230, 57, 70, 0.12)',
    borderSubtle: 'rgba(230, 57, 70, 0.18)',
    borderActive: 'rgba(230, 57, 70, 0.85)',
    colors: ['#07080b', '#11141c', '#e63946']
  },
  {
    id: 'gold-noir',
    name: 'Ouro & Preto Campeão',
    desc: 'Preto ônix e Dourado Metálico de cinturão unificado',
    badge: 'CAMPEÃO',
    primary: '#f59e0b',
    primaryDark: '#b45309',
    primaryLight: '#fbbf24',
    bgDark: '#09090b',
    bgCard: '#141417',
    glow: 'rgba(245, 158, 11, 0.45)',
    glowSubtle: 'rgba(245, 158, 11, 0.12)',
    borderSubtle: 'rgba(245, 158, 11, 0.20)',
    borderActive: 'rgba(245, 158, 11, 0.85)',
    colors: ['#09090b', '#141417', '#f59e0b']
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    desc: 'Preto breu e Ciano Elétrico Tokyo Underground',
    badge: 'CYBER',
    primary: '#00f0ff',
    primaryDark: '#0284c7',
    primaryLight: '#38bdf8',
    bgDark: '#060810',
    bgCard: '#0d121f',
    glow: 'rgba(0, 240, 255, 0.45)',
    glowSubtle: 'rgba(0, 240, 255, 0.12)',
    borderSubtle: 'rgba(0, 240, 255, 0.18)',
    borderActive: 'rgba(0, 240, 255, 0.85)',
    colors: ['#060810', '#0d121f', '#00f0ff']
  },
  {
    id: 'venom-green',
    name: 'Venom Esmeralda',
    desc: 'Preto carvão e Verde Esmeralda ácido',
    badge: 'TÓXICO',
    primary: '#10b981',
    primaryDark: '#047857',
    primaryLight: '#34d399',
    bgDark: '#050906',
    bgCard: '#0d1710',
    glow: 'rgba(16, 185, 129, 0.45)',
    glowSubtle: 'rgba(16, 185, 129, 0.12)',
    borderSubtle: 'rgba(16, 185, 129, 0.18)',
    borderActive: 'rgba(16, 185, 129, 0.85)',
    colors: ['#050906', '#0d1710', '#10b981']
  },
  {
    id: 'royal-purple',
    name: 'Púrpura Real',
    desc: 'Preto abismo e Roxo Ametista Meia-Noite',
    badge: 'ROYALE',
    primary: '#a855f7',
    primaryDark: '#7e22ce',
    primaryLight: '#c084fc',
    bgDark: '#08060f',
    bgCard: '#130e22',
    glow: 'rgba(168, 85, 247, 0.45)',
    glowSubtle: 'rgba(168, 85, 247, 0.12)',
    borderSubtle: 'rgba(168, 85, 247, 0.18)',
    borderActive: 'rgba(168, 85, 247, 0.85)',
    colors: ['#08060f', '#130e22', '#a855f7']
  },
  {
    id: 'ember-orange',
    name: 'Laranja Brasa',
    desc: 'Preto cinza e Laranja Forja Incandescente',
    badge: 'FOGO',
    primary: '#f97316',
    primaryDark: '#c2410c',
    primaryLight: '#fb923c',
    bgDark: '#0a0705',
    bgCard: '#17100b',
    glow: 'rgba(249, 115, 22, 0.45)',
    glowSubtle: 'rgba(249, 115, 22, 0.12)',
    borderSubtle: 'rgba(249, 115, 22, 0.18)',
    borderActive: 'rgba(249, 115, 22, 0.85)',
    colors: ['#0a0705', '#17100b', '#f97316']
  }
];

export class ThemeManager {
  constructor() {
    this.currentTheme = 'crimson-noir';
    this.customColors = null;
    this.modalEl = null;
  }

  init() {
    this.modalEl = document.getElementById('themeCustomizerModal');
    this.loadSavedTheme();
    this.bindEvents();
  }

  loadSavedTheme() {
    try {
      const saved = localStorage.getItem('fighter_sim_theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          this.applyTheme(parsed.id, parsed.custom, false);
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar tema salvo:', e);
    }
    // Padrão solicitado pelo usuário: Preto com Vermelho (crimson-noir)
    this.applyTheme('crimson-noir', null, false);
  }

  applyTheme(themeId, custom = null, save = true) {
    this.currentTheme = themeId;
    this.customColors = custom;

    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);

    if (themeId === 'custom' && custom) {
      // Aplica cores personalizadas dinâmicas
      root.style.setProperty('--primary', custom.primary);
      root.style.setProperty('--primary-dark', custom.primaryDark || custom.primary);
      root.style.setProperty('--primary-light', custom.primaryLight || custom.primary);
      root.style.setProperty('--bg-dark', custom.bgDark);
      root.style.setProperty('--bg-card', custom.bgCard);
      root.style.setProperty('--border-subtle', `${custom.primary}2e`);
      root.style.setProperty('--border-active', `${custom.primary}cc`);
      root.style.setProperty('--primary-glow', `${custom.primary}66`);
      root.style.setProperty('--primary-glow-subtle', `${custom.primary}1f`);
      root.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -10%, ${custom.primary}33 0%, transparent 60%), linear-gradient(180deg, ${custom.bgDark} 0%, #030304 100%)`);
    } else {
      // Remove inline styles para os presets
      ['--primary', '--primary-dark', '--primary-light', '--bg-dark', '--bg-card', '--border-subtle', '--border-active', '--primary-glow', '--primary-glow-subtle', '--bg-gradient'].forEach(prop => {
        root.style.removeProperty(prop);
      });
    }

    if (save) {
      localStorage.setItem('fighter_sim_theme', JSON.stringify({
        id: themeId,
        custom: custom
      }));
    }
  }

  bindEvents() {
    // Botão de abrir tema no HUD
    const btnOpen = document.getElementById('btnOpenThemeModal');
    if (btnOpen) {
      btnOpen.onclick = () => {
        soundFX.playClick();
        this.openModal();
      };
    }

    // Botão de abrir tema no Wizard / Criação
    const btnWizard = document.getElementById('btnWizardTheme');
    if (btnWizard) {
      btnWizard.onclick = () => {
        soundFX.playClick();
        this.openModal();
      };
    }
  }

  openModal() {
    if (!this.modalEl) this.modalEl = document.getElementById('themeCustomizerModal');
    if (!this.modalEl) return;

    this.renderModalContent();
    this.modalEl.classList.remove('hidden');
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  renderModalContent() {
    if (!this.modalEl) return;

    const modalBox = this.modalEl.querySelector('.theme-customizer-box') || this.modalEl.querySelector('.modal-box');
    if (!modalBox) return;

    modalBox.innerHTML = `
      <div class="theme-modal-header">
        <div>
          <h2>🎨 Personalização de Cores & Visual</h2>
          <p>Escolha um tema profissional ou personalize as cores de luz, fundo e destaques.</p>
        </div>
        <button id="btnCloseThemeModalX" class="btn btn-secondary btn-sm" style="font-size:1.2rem; padding:6px 12px;">✕</button>
      </div>

      <div class="theme-section-title">TEMAS PREDEFINIDOS (SELEÇÃO RÁPIDA)</div>
      <div class="theme-presets-grid" id="themePresetsGrid">
        ${THEME_PRESETS.map(preset => {
          const isActive = this.currentTheme === preset.id;
          return `
            <div class="theme-preset-card ${isActive ? 'active' : ''}" data-theme-id="${preset.id}">
              <div class="preset-top">
                <span class="preset-name">${preset.name}</span>
                <span class="preset-badge" style="background:${preset.primary}22; color:${preset.primary}; border:1px solid ${preset.primary}55;">
                  ${isActive ? '✓ ATIVO' : preset.badge}
                </span>
              </div>
              <p class="preset-desc">${preset.desc}</p>
              <div class="preset-palette-preview">
                <span class="color-dot" style="background:${preset.bgDark}; border:1px solid rgba(255,255,255,0.2);" title="Fundo Escuro"></span>
                <span class="color-dot" style="background:${preset.bgCard}; border:1px solid rgba(255,255,255,0.2);" title="Card"></span>
                <span class="color-dot" style="background:${preset.primary}; box-shadow:0 0 10px ${preset.glow};" title="Destaque"></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="theme-section-title" style="margin-top:24px;">PALETA PERSONALIZADA (CUSTOM COLOR PICKER)</div>
      <div class="custom-palette-box">
        <div class="custom-inputs-row">
          <div class="custom-input-group">
            <label>Cor de Destaque / Luz (Neon)</label>
            <div class="color-picker-wrap">
              <input type="color" id="customColorPrimary" value="${this.customColors?.primary || '#e63946'}">
              <span id="customHexPrimary">${this.customColors?.primary || '#e63946'}</span>
            </div>
          </div>
          <div class="custom-input-group">
            <label>Cor de Fundo dos Cards</label>
            <div class="color-picker-wrap">
              <input type="color" id="customColorCard" value="${this.customColors?.bgCard || '#11141c'}">
              <span id="customHexCard">${this.customColors?.bgCard || '#11141c'}</span>
            </div>
          </div>
          <div class="custom-input-group">
            <label>Cor do Fundo Geral (Background)</label>
            <div class="color-picker-wrap">
              <input type="color" id="customColorBg" value="${this.customColors?.bgDark || '#07080b'}">
              <span id="customHexBg">${this.customColors?.bgDark || '#07080b'}</span>
            </div>
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
          <button id="btnApplyCustomTheme" class="btn btn-primary btn-sm">
            ✨ Aplicar Cores Personalizadas
          </button>
          <button id="btnResetToDefaultTheme" class="btn btn-secondary btn-sm">
            🩸 Restaurar Padrão (Preto com Vermelho)
          </button>
        </div>
      </div>

      <div style="margin-top:26px; text-align:right;">
        <button id="btnDoneThemeModal" class="btn btn-primary" style="padding:12px 28px; font-size:1rem;">
          ✓ Concluir & Salvar
        </button>
      </div>
    `;

    // Eventos de seleção dos cards predefinidos
    modalBox.querySelectorAll('.theme-preset-card').forEach(card => {
      card.onclick = () => {
        soundFX.playClick();
        const id = card.dataset.themeId;
        this.applyTheme(id, null, true);
        this.renderModalContent();
      };
    });

    // Eventos do seletor customizado
    const colorPrim = modalBox.querySelector('#customColorPrimary');
    const hexPrim = modalBox.querySelector('#customHexPrimary');
    if (colorPrim && hexPrim) {
      colorPrim.oninput = (e) => { hexPrim.textContent = e.target.value; };
    }

    const colorCard = modalBox.querySelector('#customColorCard');
    const hexCard = modalBox.querySelector('#customHexCard');
    if (colorCard && hexCard) {
      colorCard.oninput = (e) => { hexCard.textContent = e.target.value; };
    }

    const colorBg = modalBox.querySelector('#customColorBg');
    const hexBg = modalBox.querySelector('#customHexBg');
    if (colorBg && hexBg) {
      colorBg.oninput = (e) => { hexBg.textContent = e.target.value; };
    }

    const btnApplyCustom = modalBox.querySelector('#btnApplyCustomTheme');
    if (btnApplyCustom) {
      btnApplyCustom.onclick = () => {
        soundFX.playClick();
        const p = colorPrim.value;
        const c = colorCard.value;
        const b = colorBg.value;
        this.applyTheme('custom', { primary: p, bgCard: c, bgDark: b }, true);
        this.renderModalContent();
      };
    }

    const btnReset = modalBox.querySelector('#btnResetToDefaultTheme');
    if (btnReset) {
      btnReset.onclick = () => {
        soundFX.playClick();
        this.applyTheme('crimson-noir', null, true);
        this.renderModalContent();
      };
    }

    // Botões de fechar
    const btnCloseX = modalBox.querySelector('#btnCloseThemeModalX');
    if (btnCloseX) btnCloseX.onclick = () => this.closeModal();

    const btnDone = modalBox.querySelector('#btnDoneThemeModal');
    if (btnDone) btnDone.onclick = () => {
      soundFX.playClick();
      this.closeModal();
    };

    // Fechar ao clicar fora da caixa
    this.modalEl.onclick = (e) => {
      if (e.target === this.modalEl) this.closeModal();
    };
  }
}

export const themeManager = new ThemeManager();
