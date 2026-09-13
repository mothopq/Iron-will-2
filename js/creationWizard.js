// creationWizard.js - Controlador do fluxo de criação em 6 passos baseado nas referências visuais

import { soundFX } from './audio.js';
import { MODALITIES, getAttributeKeysForModality } from './data/modalities.js';
import { 
  UNIVERSAL_ATTRIBUTES, 
  MODALITY_SPECIFIC_ATTRIBUTES, 
  LEGENDS_BY_MODALITY, 
  STYLE_ARCHETYPES, 
  BACKGROUND_STORIES,
  calculateStartingAttribute
} from './data/legendsData.js';
import { getSkillTier } from './models/Fighter.js';
import { LOCATIONS_DATA, getStatesByCountry, getCitiesByState } from './data/locations.js';

export class CreationWizard {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.currentStep = 1; // 1 to 5
    this.totalSteps = 5;

    // Estado acumulado da criação
    this.draft = {
      name: 'Alexandre Silva',
      nickname: 'O Fenômeno',
      gender: 'Masculino',
      nationality: 'Brasil',
      birthState: 'São Paulo',
      birthStateCode: 'SP',
      birthCity: 'São Paulo',
      initialAge: 18,
      heightCm: 178,
      weightKg: 70.3,
      reachCm: 182,
      modality: 'boxing', // Definido no Passo 2
      styleId: 'boxer_balanced',
      chosenStyle: null,
      stolenAttributes: {}, // Atributos roubados das lendas
      storyId: 'periferia'
    };

    // Estado do Step 3 (Roubo de Atributos)
    this.stolenCount = 0;
    this.stolenTarget = 8; // Falta 8
    this.currentLegendIndex = 0;
    this.currentLegendPool = [];
  }

  init() {
    this.renderStep(1);
  }

  // Renderiza o cabeçalho com a barra de progresso em pills
  renderHeader() {
    const steps = [
      { num: 1, id: 'identidade', label: 'IDENTIDADE' },
      { num: 2, id: 'estilo', label: 'MODALIDADE & ESTILO' },
      { num: 3, id: 'genetica', label: 'GENÉTICA' },
      { num: 4, id: 'historia', label: 'HISTÓRIA' },
      { num: 5, id: 'confirmar', label: 'CONFIRMAR' }
    ];

    const pillsHtml = steps.map(s => `
      <div class="wizard-pill ${s.num === this.currentStep ? 'active' : s.num < this.currentStep ? 'completed' : ''}">
        ${s.label}
      </div>
    `).join('');

    const stepNames = ['QUEM É VOCÊ?', 'ESCOLHA SUA ARTE & ESTILO', 'ROUBE O DNA DAS LENDAS', 'SUA ORIGEM', 'CONFIRMAÇÃO'];

    return `
      <div class="wizard-header-top-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 4px;">
        <span class="game-logo-badge" style="font-weight:800; font-size:0.85rem; color:var(--text-muted); letter-spacing:1px;">⚔️ IRON WILL: COMBAT LEGACY</span>
        <button id="btnWizardTheme" class="btn btn-secondary btn-sm" style="border-radius:20px; font-size:0.8rem;" type="button">🎨 Cores & Tema</button>
      </div>
      <div class="wizard-nav-pills">
        ${pillsHtml}
      </div>
      <div class="wizard-step-counter">
        <span class="step-title-small">${stepNames[this.currentStep - 1]}</span>
        <span class="step-fraction">${this.currentStep} / ${this.totalSteps}</span>
      </div>
      <div class="wizard-progress-track">
        <div class="wizard-progress-bar" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
      </div>
    `;
  }

  // Alterna o conteúdo do container do wizard
  renderStep(stepNum) {
    this.currentStep = stepNum;
    const container = document.getElementById('creationScreen');
    if (!container) return;

    let bodyHtml = '';
    switch (stepNum) {
      case 1:
        bodyHtml = this.renderStep1Identidade();
        break;
      case 2:
        bodyHtml = this.renderStep2Estilo();
        break;
      case 3:
        bodyHtml = this.renderStep3Genetica();
        break;
      case 4:
        bodyHtml = this.renderStep4Historia();
        break;
      case 5:
        bodyHtml = this.renderStep5Confirmar();
        break;
    }

    container.innerHTML = `
      <div class="wizard-container">
        ${this.renderHeader()}
        <div class="wizard-body">
          ${bodyHtml}
        </div>
      </div>
    `;

    // Conecta eventos da tela recém-gerada
    this.bindStepEvents(stepNum);
    if (window.themeManager && typeof window.themeManager.bindEvents === 'function') {
      window.themeManager.bindEvents();
    }
  }

  // ================================================================
  // PASSO 1: IDENTIDADE (Visual Idêntico à Imagem 1)
  // ================================================================
  renderStep1Identidade() {
    return `
      <div class="step-hero">
        <h1 class="hero-title">IDENTIDADE</h1>
        <p class="hero-sub">Diga quem é e de onde vem. A <strong>genética</strong> — idade, físico e talento — vem sorteada no próximo passo.</p>
      </div>

      <div class="essential-badge-bar">
        <span class="badge-label">ESSENCIAL</span>
        <span class="badge-status">3/3 PRONTOS</span>
      </div>
      <div class="checklist-tags">
        <span class="check-tag active">✔ NOME</span>
        <span class="check-tag active">✔ GÊNERO</span>
        <span class="check-tag active">✔ ESTADO</span>
      </div>

      <div class="wizard-form-group">
        <label>NOME DO ATLETA</label>
        <input type="text" id="wizName" class="wizard-input" value="${this.draft.name}" placeholder="Ex: Alexandre Silva">
      </div>

      <div class="wizard-form-group">
        <label>APELIDO DE GUERRA</label>
        <input type="text" id="wizNickname" class="wizard-input" value="${this.draft.nickname}" placeholder="Ex: O Fenômeno">
      </div>

      <div class="wizard-form-group">
        <label>GÊNERO</label>
        <div class="toggle-buttons-row">
          <button class="btn-toggle-choice ${this.draft.gender === 'Masculino' ? 'selected' : ''}" data-gender="Masculino">MASCULINO</button>
          <button class="btn-toggle-choice ${this.draft.gender === 'Feminino' ? 'selected' : ''}" data-gender="Feminino">FEMININO</button>
        </div>
      </div>

      <div class="wizard-form-group">
        <label>PAÍS DE ORIGEM</label>
        <div class="toggle-buttons-row">
          <button class="btn-toggle-country ${this.draft.nationality === 'Brasil' ? 'selected' : ''}" data-nat="Brasil">🇧🇷 BRASIL</button>
          <button class="btn-toggle-country ${this.draft.nationality === 'Estados Unidos' ? 'selected' : ''}" data-nat="Estados Unidos">🇺🇸 UNITED STATES</button>
          <button class="btn-toggle-country ${this.draft.nationality === 'Japão' ? 'selected' : ''}" data-nat="Japão">🇯🇵 JAPÃO</button>
          <button class="btn-toggle-country ${this.draft.nationality === 'Tailândia' ? 'selected' : ''}" data-nat="Tailândia">🇹🇭 TAILÂNDIA</button>
          <button class="btn-toggle-country ${this.draft.nationality === 'Rússia' ? 'selected' : ''}" data-nat="Rússia">🇷🇺 RÚSSIA</button>
        </div>
      </div>

      <!-- Seleção de Estado e Cidade com Busca Estilizada (Idêntico à foto de referência) -->
      <div class="geo-selection-grid">
        <!-- Coluna: Estado de Origem -->
        <div class="geo-picker-card">
          <div class="geo-picker-header">
            <span class="geo-picker-title">ESTADO DE ORIGEM</span>
            <span class="geo-picker-selected" id="badgeSelectedState">${this.draft.birthState} (${this.draft.birthStateCode})</span>
          </div>
          <div class="dropdown-search-box">
            <input type="text" id="wizSearchState" class="wizard-search-input" placeholder="Buscar estado..." autocomplete="off">
          </div>
          <div id="wizStateList" class="dropdown-list-box">
            <!-- Opções renderizadas via JavaScript -->
          </div>
        </div>

        <!-- Coluna: Cidade Natal -->
        <div class="geo-picker-card">
          <div class="geo-picker-header">
            <span class="geo-picker-title">CIDADE NATAL</span>
            <span class="geo-picker-selected" id="badgeSelectedCity">${this.draft.birthCity}</span>
          </div>
          <div class="dropdown-search-box">
            <input type="text" id="wizSearchCity" class="wizard-search-input" placeholder="Buscar cidade..." autocomplete="off">
          </div>
          <div id="wizCityList" class="dropdown-list-box">
            <!-- Opções renderizadas via JavaScript -->
          </div>
        </div>
      </div>

      <div class="wizard-form-group">
        <label>IDADE INICIAL: <strong class="text-gold" id="wizAgeVal">${this.draft.initialAge} anos</strong></label>
        <div class="range-wrap">
          <input type="range" id="wizAgeSlider" min="8" max="40" value="${this.draft.initialAge}" class="wizard-slider">
          <div class="range-labels">
            <span>8 anos (Infância)</span>
            <span>18 anos (Prime)</span>
            <span>40 anos (Veterano)</span>
          </div>
        </div>
        <p id="wizAgeInfo" class="slider-info-text"></p>
      </div>

      <div class="wizard-footer-actions" style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <button id="btnQuickStart" class="btn-wizard-action secondary" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.5); color: #ffd166; font-weight: 800;">
          ⚡ INÍCIO RÁPIDO (CRIAR E JOGAR AGORA)
        </button>
        <button id="btnStep1Continue" class="btn-wizard-action primary">CONTINUAR PASSO A PASSO →</button>
      </div>
    `;
  }

  // ================================================================
  // PASSO 2: MODALIDADE & ESTILO DE LUTA (Visual Idêntico à Imagem 3)
  // ================================================================
  renderStep2Estilo() {
    const modalitiesList = [
      { id: 'boxing', name: 'Boxe (Nobre Arte)', icon: '🥊' },
      { id: 'jiu_jitsu', name: 'Jiu-Jitsu (Arte Suave)', icon: '🥋' },
      { id: 'mma', name: 'MMA / Vale-Tudo', icon: '⚡' },
      { id: 'muay_thai', name: 'Muay Thai', icon: '🦵' },
      { id: 'judo', name: 'Judô Olímpico', icon: '🤼' },
      { id: 'wrestling', name: 'Wrestling / Luta Livre', icon: '🤼‍♂️' },
      { id: 'kickboxing', name: 'Kickboxing K-1', icon: '💥' }
    ];

    const modPills = modalitiesList.map(m => `
      <button class="btn-modality-pill ${this.draft.modality === m.id ? 'active' : ''}" data-mod="${m.id}">
        ${m.icon} ${m.name}
      </button>
    `).join('');

    const archetypes = STYLE_ARCHETYPES[this.draft.modality] || STYLE_ARCHETYPES.boxing;
    const currentArch = archetypes.find(a => a.id === this.draft.styleId) || archetypes[0];
    this.draft.chosenStyle = currentArch;

    const currentModObj = modalitiesList.find(m => m.id === this.draft.modality) || modalitiesList[0];
    const modIcon = currentModObj.icon || '🥋';

    const cardsHtml = archetypes.map(a => `
      <div class="style-select-card ${a.id === currentArch.id ? 'selected' : ''}" data-style="${a.id}">
        <div class="style-card-img-placeholder">
          <span class="style-card-icon">${modIcon}</span>
        </div>
        <div class="style-card-meta">
          <h4 class="style-card-title">${a.name}</h4>
          <span class="style-card-sub">▸ ${a.subtitle}</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="step-hero">
        <h1 class="hero-title">ESTILO DE LUTA</h1>
        <p class="hero-sub">O estilo molda seus atributos iniciais e como você joga no tatame. Toque para comparar.</p>
      </div>

      <div class="modality-pills-row">
        ${modPills}
      </div>

      <div class="style-cards-grid">
        ${cardsHtml}
      </div>

      <!-- Detalhes do Estilo Selecionado com Gráfico Radar -->
      <div class="style-detail-box">
        <div class="style-info-col">
          <h2 class="style-detail-title">${currentArch.name}</h2>
          <p class="style-detail-desc">${currentArch.desc}</p>

          <div class="game-plan-box">
            <span class="plan-label">PLANO DE JOGO</span>
            <p class="plan-text">${currentArch.gamePlan}</p>
          </div>

          <div class="pros-cons-row">
            <div class="tag-pro"><span class="badge-tag forte">FORTE</span> ${currentArch.pros}</div>
            <div class="tag-con"><span class="badge-tag fraco">FRACO</span> ${currentArch.cons}</div>
          </div>
        </div>

        <div class="style-radar-col">
          <div class="radar-chart-wrap" id="radarChartContainer">
            ${this.generateRadarSVG(currentArch.radarValues)}
          </div>
        </div>
      </div>

      <div class="wizard-footer-actions">
        <button id="btnBackToStep1" class="btn-wizard-action secondary">← VOLTAR</button>
        <button id="btnStep2Continue" class="btn-wizard-action primary">CONTINUAR →</button>
      </div>
    `;
  }

  // Gera o Gráfico Radar SVG estilizado com 8 eixos
  generateRadarSVG(values = [80, 80, 80, 80, 80, 80, 80, 80]) {
    const size = 200;
    const center = size / 2;
    const radius = 75;
    const numAxes = 8;

    // Círculos de teia concêntricos
    let webCircles = '';
    [0.25, 0.5, 0.75, 1.0].forEach(rRatio => {
      const r = radius * rRatio;
      let points = [];
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      webCircles += `<polygon points="${points.join(' ')}" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1"/>`;
    });

    // Eixos radiais
    let axisLines = '';
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      axisLines += `<line x1="${center}" y1="${center}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1"/>`;
    }

    // Polígono de Atributos do Lutador (Dourado translúcido)
    let polyPoints = [];
    for (let i = 0; i < numAxes; i++) {
      const val = values[i] || 70;
      const r = (val / 100) * radius;
      const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      polyPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="radar-svg">
        ${webCircles}
        ${axisLines}
        <polygon points="${polyPoints.join(' ')}" fill="rgba(255, 209, 102, 0.28)" stroke="#ffd166" stroke-width="2.5"/>
      </svg>
    `;
  }

  // ================================================================
  // PASSO 3: GENÉTICA / HERANÇA DE ATRIBUTOS (ESCALA NÍVEL 0 A 100)
  // ================================================================
  renderStep3Genetica() {
    // Carrega pool de lendas da modalidade escolhida no passo 2
    if (this.currentLegendPool.length === 0) {
      const pool = LEGENDS_BY_MODALITY[this.draft.modality] || LEGENDS_BY_MODALITY.boxing;
      this.currentLegendPool = [...pool];
    }

    const currentLegend = this.currentLegendPool[this.currentLegendIndex % this.currentLegendPool.length];

    // Atributos disponíveis: 5 Universais + 3 Específicos da Modalidade
    const universal = UNIVERSAL_ATTRIBUTES;
    const specific = MODALITY_SPECIFIC_ATTRIBUTES[this.draft.modality] || MODALITY_SPECIFIC_ATTRIBUTES.boxing;
    const allAttrSlots = [...universal, ...specific];

    const cardsHtml = allAttrSlots.map(attr => {
      const score = Math.max(0, Math.min(100, Math.round(currentLegend.stats[attr.id] || 70)));
      const isAlreadyStolen = this.draft.stolenAttributes[attr.id] !== undefined;
      const tier = getSkillTier(score);
      return `
        <div class="legend-attr-card ${isAlreadyStolen ? 'disabled' : ''}" data-attr-id="${attr.id}" data-attr-score="${score}" data-attr-label="${attr.label}">
          <div class="attr-card-header">
            <span class="attr-card-code">${attr.short}</span>
            <span class="attr-help-icon">${isAlreadyStolen ? '🔒' : '✨'}</span>
          </div>
          <span class="attr-card-name">${attr.label}</span>
          <div class="attr-level-box-100">
            <span class="attr-level-val">NÍVEL ${score}</span>
            <span class="attr-level-max">/ 100</span>
          </div>
          <div class="attr-card-tier-row">
            <span class="skill-tier-badge ${tier.badgeClass}">${tier.tier}</span>
          </div>
          <div class="attr-mini-bar-bg">
            <div class="attr-mini-bar-fill" style="width:${score}%; background-color:${tier.color};"></div>
          </div>
          ${isAlreadyStolen ? '<span class="attr-card-badge-disabled">JÁ HERDADO</span>' : ''}
        </div>
      `;
    }).join('');

    const remaining = this.stolenTarget - this.stolenCount;
    const tierBadge = currentLegend.tierBadge || '⭐ LENDA MUNDIAL';

    return `
      <div class="legend-banner-hero ${currentLegend.tier === 'MEDIANO' ? 'hero-mediano' : ''}">
        <div class="banner-badge-row">
          <span class="badge ${currentLegend.tier === 'MEDIANO' ? 'badge-mediano' : currentLegend.tier === 'PROMESSA' ? 'badge-promessa' : 'badge-gold'}">${tierBadge}</span>
        </div>
        <h1 class="banner-legend-name">${currentLegend.name.toUpperCase()}</h1>
        <span class="banner-legend-tag">${currentLegend.title}</span>
      </div>

      <div class="steal-action-bar">
        <span class="steal-title">HERDE 1 HABILIDADE DO ATLETA (NÍVEIS DE 0 A 100)</span>
        <span class="steal-countdown">Falta escolher <strong class="text-gold">${remaining}</strong></span>
      </div>

      <div class="legend-stats-grid">
        ${cardsHtml}
      </div>

      <div class="stolen-summary-chips" id="stolenSummaryChips">
        <!-- Mostra atributos já herdados com escala 0 a 100 -->
        ${this.renderStolenChips()}
      </div>

      <div class="wizard-footer-actions">
        <button id="btnBackToStep2" class="btn-wizard-action secondary">← VOLTAR</button>
        ${this.stolenCount >= this.stolenTarget ? 
          `<button id="btnStep3Continue" class="btn-wizard-action primary">CONTINUAR →</button>` : 
          `<button class="btn-wizard-action secondary" disabled>Herde mais ${remaining} atributos para avançar</button>`
        }
      </div>
    `;
  }

  renderStolenChips() {
    const entries = Object.entries(this.draft.stolenAttributes);
    if (entries.length === 0) return '<span class="empty-stolen-text">Nenhum atributo herdado ainda. Selecione um card acima para começar!</span>';

    const universal = UNIVERSAL_ATTRIBUTES;
    const specific = MODALITY_SPECIFIC_ATTRIBUTES[this.draft.modality] || MODALITY_SPECIFIC_ATTRIBUTES.boxing;
    const allAttrSlots = [...universal, ...specific];

    return entries.map(([id, val]) => {
      const tier = getSkillTier(val);
      const attrObj = allAttrSlots.find(a => a.id === id);
      const name = attrObj ? attrObj.label : id;
      return `
        <span class="chip-stolen">
          ${name}: <strong>Nível ${val} / 100</strong> <span class="skill-tier-badge ${tier.badgeClass}">${tier.tier}</span>
        </span>
      `;
    }).join('');
  }

  // ================================================================
  // PASSO 4: HISTÓRIA & ORIGEM NARRATIVA
  // ================================================================
  renderStep4Historia() {
    const storiesHtml = BACKGROUND_STORIES.map(st => `
      <div class="story-select-card ${st.id === this.draft.storyId ? 'selected' : ''}" data-story="${st.id}">
        <div class="story-header">
          <h3>${st.name}</h3>
          <span class="story-sub">▸ ${st.subtitle}</span>
        </div>
        <p class="story-desc">${st.desc}</p>
        <div class="story-benefits">${st.benefits}</div>
      </div>
    `).join('');

    return `
      <div class="step-hero">
        <h1 class="hero-title">ORIGEM & HISTÓRIA</h1>
        <p class="hero-sub">Onde você forjou seu caráter? Cada início traz vantagens, desvantagens e cicatrizes diferentes.</p>
      </div>

      <div class="stories-grid">
        ${storiesHtml}
      </div>

      <div class="wizard-footer-actions">
        <button id="btnBackToStep3" class="btn-wizard-action secondary">← VOLTAR</button>
        <button id="btnStep4Continue" class="btn-wizard-action primary">CONTINUAR →</button>
      </div>
    `;
  }

  // ================================================================
  // ================================================================
  // PASSO 5: CONFIRMAR (Tale of the Tape Oficial)
  // ================================================================
  renderStep5Confirmar() {
    const mod = MODALITIES[this.draft.modality] || MODALITIES.boxing;
    const arch = this.draft.chosenStyle;
    const story = BACKGROUND_STORIES.find(s => s.id === this.draft.storyId) || BACKGROUND_STORIES[0];

    const universal = UNIVERSAL_ATTRIBUTES;
    const specific = MODALITY_SPECIFIC_ATTRIBUTES[this.draft.modality] || MODALITY_SPECIFIC_ATTRIBUTES.boxing;
    const allAttrSlots = [...universal, ...specific];

    const previewAttrsHtml = allAttrSlots.map(attr => {
      const val = this.draft.stolenAttributes[attr.id] || (attr.id === 'fightIQ' ? 40 : 38);
      const tier = getSkillTier(val);
      return `
        <div class="tale-attr-item">
          <div class="tale-attr-header">
            <span class="tale-attr-name">${attr.label}</span>
            <span class="skill-tier-badge ${tier.badgeClass}">${tier.tier}</span>
          </div>
          <div class="tale-attr-level-row">
            <span class="tale-attr-val">NÍVEL ${val}</span>
            <span class="tale-attr-max">/ 100</span>
          </div>
          <div class="tale-attr-bar-bg">
            <div class="tale-attr-bar-fill" style="width:${val}%; background-color:${tier.color};"></div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="step-hero">
        <h1 class="hero-title">TALE OF THE TAPE</h1>
        <p class="hero-sub">Tudo pronto para a pesagem oficial. Revise sua ficha e assine sua licença de combate.</p>
      </div>

      <div class="confirm-tale-card">
        <div class="tale-header">
          <span class="badge badge-gold">LICENÇA PROFISSIONAL OFICIAL</span>
          <h2>${this.draft.name.toUpperCase()}</h2>
          <p class="text-gold">"${this.draft.nickname}"</p>
        </div>

        <div class="tale-columns">
          <div class="tale-col-bio">
            <p><strong>Nacionalidade:</strong> ${this.draft.nationality}</p>
            <p><strong>Origem / Cidade:</strong> ${this.draft.birthCity}, ${this.draft.birthState} (${this.draft.birthStateCode})</p>
            <p><strong>Idade Inicial:</strong> ${this.draft.initialAge} anos</p>
            <p><strong>Altura:</strong> ${this.draft.heightCm} cm | <strong>Envergadura:</strong> ${this.draft.reachCm} cm</p>
            <p><strong>Peso Inicial:</strong> ${this.draft.weightKg} kg</p>
          </div>

          <div class="tale-col-fight">
            <p><strong>Modalidade:</strong> ${mod.icon} ${mod.name}</p>
            <p><strong>Estilo de Luta:</strong> ${arch ? arch.name : 'Equilibrado'}</p>
            <p><strong>Origem:</strong> ${story.name}</p>
            <p><strong>DNA Herdado:</strong> ${Object.keys(this.draft.stolenAttributes).length} atributos de atletas</p>
          </div>
        </div>

        <div class="tale-attributes-showcase">
          <h4 class="tale-attrs-title">⚡ ATRIBUTOS & HABILIDADES (NÍVEL 0 A 100)</h4>
          <div class="tale-attrs-grid">
            ${previewAttrsHtml}
          </div>
        </div>

        <button id="btnFinishAndLaunch" class="btn btn-primary btn-pulse" style="width:100%; margin-top:24px; padding:16px; font-size:1.15rem;">
          🥊 COMEÇAR JORNADA PROFISSIONAL
        </button>
      </div>

      <div class="wizard-footer-actions">
        <button id="btnBackToStep4" class="btn-wizard-action secondary">← VOLTAR</button>
      </div>
    `;
  }

  // ================================================================
  // CONEXÃO DE EVENTOS DE CADA PASSO
  // ================================================================
  bindStepEvents(stepNum) {
    if (stepNum === 1) {
      const nameInput = document.getElementById('wizName');
      const nickInput = document.getElementById('wizNickname');
      const ageSlider = document.getElementById('wizAgeSlider');
      const ageVal = document.getElementById('wizAgeVal');
      const ageInfo = document.getElementById('wizAgeInfo');

      const updateAge = (age) => {
        this.draft.initialAge = age;
        ageVal.textContent = `${age} anos`;
        if (age <= 13) ageInfo.textContent = 'Fase Infantil: Treino motriz e campeonatos de base. Carreira longa.';
        else if (age <= 17) ageInfo.textContent = 'Fase Juvenil: Rápido aprendizado e torneios amadores.';
        else if (age <= 28) ageInfo.textContent = 'Ápice / Prime: Vigor físico máximo para estrear no profissional.';
        else ageInfo.textContent = 'Veterano Tardio: Começa experiente, com relógio biológico acelerado.';
      };

      ageSlider.oninput = (e) => updateAge(parseInt(e.target.value));
      updateAge(this.draft.initialAge);

      // Elementos do seletor geográfico
      const badgeState = document.getElementById('badgeSelectedState');
      const badgeCity = document.getElementById('badgeSelectedCity');
      const stateSearchInput = document.getElementById('wizSearchState');
      const citySearchInput = document.getElementById('wizSearchCity');
      const stateListEl = document.getElementById('wizStateList');
      const cityListEl = document.getElementById('wizCityList');

      const renderStatesList = (filterQuery = '') => {
        const states = getStatesByCountry(this.draft.nationality);
        const q = filterQuery.toLowerCase().trim();
        const filtered = states.filter(s => 
          !q || 
          s.name.toLowerCase().includes(q) || 
          s.code.toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
          stateListEl.innerHTML = `<div class="dropdown-no-results">Nenhum estado encontrado para "${filterQuery}"</div>`;
          return;
        }

        stateListEl.innerHTML = filtered.map(s => {
          const isSelected = s.code.toLowerCase() === (this.draft.birthStateCode || '').toLowerCase();
          return `
            <div class="dropdown-option-item ${isSelected ? 'selected' : ''}" data-state-code="${s.code}" data-state-name="${s.name}">
              <span class="item-main">${s.name}</span>
              <span class="item-sub">(${s.code})</span>
            </div>
          `;
        }).join('');

        // Delegação de cliques na lista de estados
        stateListEl.onclick = (e) => {
          const item = e.target.closest('.dropdown-option-item');
          if (!item) return;

          soundFX.playClick();
          const code = item.dataset.stateCode;
          const name = item.dataset.stateName;
          this.draft.birthStateCode = code;
          this.draft.birthState = name;
          
          stateSearchInput.value = `${name} (${code})`;
          badgeState.textContent = `${name} (${code})`;

          // Atualiza cidades do estado recém-selecionado
          const availableCities = getCitiesByState(this.draft.nationality, code);
          if (!availableCities.includes(this.draft.birthCity)) {
            this.draft.birthCity = availableCities[0] || 'Capital';
          }
          citySearchInput.value = this.draft.birthCity;
          badgeCity.textContent = this.draft.birthCity;

          renderStatesList(stateSearchInput.value);
          renderCitiesList('');
        };
      };

      const renderCitiesList = (filterQuery = '') => {
        const availableCities = getCitiesByState(this.draft.nationality, this.draft.birthStateCode);
        const q = filterQuery.toLowerCase().trim();
        const filtered = availableCities.filter(c => 
          !q || c.toLowerCase().includes(q)
        );

        let html = '';
        if (filtered.length === 0) {
          html = `<div class="dropdown-no-results">Nenhuma cidade encontrada na lista</div>`;
        } else {
          html = filtered.map(c => {
            const isSelected = c.toLowerCase() === (this.draft.birthCity || '').toLowerCase();
            return `
              <div class="dropdown-option-item ${isSelected ? 'selected' : ''}" data-city-name="${c}">
                <span class="item-main">${c}</span>
              </div>
            `;
          }).join('');
        }

        // Se o usuário digitou uma cidade não listada, permite adicionar personalizada!
        if (q && !availableCities.some(c => c.toLowerCase() === q)) {
          html += `
            <div class="dropdown-custom-add" id="btnAddCustomCity">
              + Usar "${filterQuery}" como Cidade
            </div>
          `;
        }

        cityListEl.innerHTML = html;

        // Delegação de cliques na lista de cidades
        cityListEl.onclick = (e) => {
          const customBtn = e.target.closest('#btnAddCustomCity');
          if (customBtn) {
            soundFX.playClick();
            const customName = filterQuery.trim();
            this.draft.birthCity = customName;
            citySearchInput.value = customName;
            badgeCity.textContent = customName;
            renderCitiesList(filterQuery);
            return;
          }

          const item = e.target.closest('.dropdown-option-item');
          if (!item) return;

          soundFX.playClick();
          const cityName = item.dataset.cityName;
          this.draft.birthCity = cityName;
          citySearchInput.value = cityName;
          badgeCity.textContent = cityName;
          renderCitiesList(citySearchInput.value);
        };
      };

      // Inicializa listas
      renderStatesList('');
      renderCitiesList('');

      // Conecta inputs de pesquisa
      stateSearchInput.oninput = (e) => renderStatesList(e.target.value);
      citySearchInput.oninput = (e) => renderCitiesList(e.target.value);

      // Botões de Gênero
      document.querySelectorAll('.btn-toggle-choice').forEach(btn => {
        btn.onclick = (e) => {
          soundFX.playClick();
          document.querySelectorAll('.btn-toggle-choice').forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          this.draft.gender = e.currentTarget.dataset.gender;
        };
      });

      // Botões de País
      document.querySelectorAll('.btn-toggle-country').forEach(btn => {
        btn.onclick = (e) => {
          soundFX.playClick();
          document.querySelectorAll('.btn-toggle-country').forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          const newNat = e.currentTarget.dataset.nat;
          this.draft.nationality = newNat;

          // Atualiza estado e cidade padrão para o novo país
          const states = getStatesByCountry(newNat);
          const defaultState = states[0];
          this.draft.birthStateCode = defaultState.code;
          this.draft.birthState = defaultState.name;
          this.draft.birthCity = defaultState.cities[0] || 'Capital';

          stateSearchInput.value = `${defaultState.name} (${defaultState.code})`;
          badgeState.textContent = `${defaultState.name} (${defaultState.code})`;
          citySearchInput.value = this.draft.birthCity;
          badgeCity.textContent = this.draft.birthCity;

          renderStatesList('');
          renderCitiesList('');
        };
      });

      const btnQuick = document.getElementById('btnQuickStart');
      if (btnQuick) {
        btnQuick.onclick = () => {
          soundFX.playCash();
          this.draft.name = nameInput.value.trim() || 'Alexandre Silva';
          this.draft.nickname = nickInput.value.trim() || 'O Fenômeno';
          if (badgeCity && badgeCity.textContent) {
            this.draft.birthCity = badgeCity.textContent;
          }
          if (badgeState && badgeState.textContent) {
            this.draft.birthState = badgeState.textContent;
          }
          if (this.onComplete) {
            this.onComplete(this.buildFinalFighterConfig());
          }
        };
      }

      document.getElementById('btnStep1Continue').onclick = () => {
        soundFX.playClick();
        this.draft.name = nameInput.value.trim() || 'Alexandre Silva';
        this.draft.nickname = nickInput.value.trim() || 'O Fenômeno';
        
        // Garante que a cidade e estado selecionados permaneçam consistentes
        if (badgeCity && badgeCity.textContent) {
          this.draft.birthCity = badgeCity.textContent;
        }
        if (badgeState && badgeState.textContent) {
          this.draft.birthState = badgeState.textContent;
        }
        this.renderStep(2);
      };
    } else if (stepNum === 2) {
      // Pills de Modalidade
      document.querySelectorAll('.btn-modality-pill').forEach(btn => {
        btn.onclick = (e) => {
          soundFX.playClick();
          const target = e.target.closest('.btn-modality-pill');
          if (!target) return;
          this.draft.modality = target.dataset.mod;
          // Reseta a pool de lendas, atributos roubados e estilo padrão
          this.currentLegendPool = [];
          this.draft.stolenAttributes = {};
          this.stolenCount = 0;
          this.currentLegendIndex = 0;
          this.draft.styleId = (STYLE_ARCHETYPES[this.draft.modality] || STYLE_ARCHETYPES.boxing)[0].id;
          this.renderStep(2);
        };
      });

      // Seleção de Cards de Estilo
      document.querySelectorAll('.style-select-card').forEach(card => {
        card.onclick = (e) => {
          soundFX.playClick();
          const target = e.target.closest('.style-select-card');
          if (!target) return;
          this.draft.styleId = target.dataset.style;
          this.renderStep(2);
        };
      });

      document.getElementById('btnBackToStep1').onclick = () => this.renderStep(1);
      document.getElementById('btnStep2Continue').onclick = () => {
        soundFX.playClick();
        this.renderStep(3);
      };
    } else if (stepNum === 3) {
      // Cartas de Atributo para Herdar
      document.querySelectorAll('.legend-attr-card').forEach(card => {
        card.onclick = (e) => {
          const target = e.target.closest('.legend-attr-card');
          if (!target) return;

          if (this.stolenCount >= this.stolenTarget) return;

          const attrId = target.dataset.attrId;
          // Se já foi herdado anteriormente, dá feedback sonoro e visual imediato!
          if (this.draft.stolenAttributes[attrId] !== undefined) {
            target.classList.add('already-stolen-anim');
            setTimeout(() => target.classList.remove('already-stolen-anim'), 400);
            return;
          }

          soundFX.playClick();
          const score = Math.max(0, Math.min(100, parseInt(target.dataset.attrScore) || 70));

          // Registra atributo herdado diretamente na escala de Nível 0 a 100
          this.draft.stolenAttributes[attrId] = score;
          this.stolenCount++;

          // Rola para o próximo atleta do pool
          this.currentLegendIndex++;

          // Re-renderiza a tela do passo 3
          this.renderStep(3);
        };
      });

      document.getElementById('btnBackToStep2').onclick = () => this.renderStep(2);
      const btnCont = document.getElementById('btnStep3Continue');
      if (btnCont) {
        btnCont.onclick = () => {
          soundFX.playClick();
          this.renderStep(4);
        };
      }
    } else if (stepNum === 4) {
      document.querySelectorAll('.story-select-card').forEach(card => {
        card.onclick = (e) => {
          soundFX.playClick();
          document.querySelectorAll('.story-select-card').forEach(c => c.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          this.draft.storyId = e.currentTarget.dataset.story;
        };
      });

      document.getElementById('btnBackToStep3').onclick = () => this.renderStep(3);
      document.getElementById('btnStep4Continue').onclick = () => {
        soundFX.playClick();
        this.renderStep(5);
      };
    } else if (stepNum === 5) {
      document.getElementById('btnBackToStep4').onclick = () => this.renderStep(4);
      document.getElementById('btnFinishAndLaunch').onclick = () => {
        soundFX.playCash();
        if (this.onComplete) {
          this.onComplete(this.buildFinalFighterConfig());
        }
      };
    }
  }

  // Constrói a configuração final com atributos e tetos genéticos de DNA herdados das lendas
  buildFinalFighterConfig() {
    const d = this.draft;
    const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));

    // Gera estritamente os atributos pertinentes à modalidade do lutador
    const allAttrKeys = getAttributeKeysForModality(d.modality);

    // 1. TETO GENÉTICO DE DNA:
    // "aquelas habilidades que nois pega dos cara é o nosso maximo"
    const dnaMaxAttributes = {};
    allAttrKeys.forEach(key => {
      if (d.stolenAttributes && d.stolenAttributes[key] !== undefined) {
        // Atributo herdado diretamente de uma lenda mundial (ex: 95, 96)
        dnaMaxAttributes[key] = clamp(d.stolenAttributes[key], 60, 99);
      } else {
        // Atributo comum de atleta comum que não teve bênção de lenda
        dnaMaxAttributes[key] = 70;
      }
    });

    // 2. ATRIBUTOS DE PARTIDA (Nível de Início de Carreira):
    // Começa em nível jovem/amador proporcional ao seu teto, dando margem para evoluir com XP até o teto de DNA
    const baseAttrs = {};
    allAttrKeys.forEach(key => {
      const maxCap = dnaMaxAttributes[key];
      // Se herdou potencial de lenda (> 80), o jovem já nasce com vocação superior (~52% do teto)
      const starterRatio = maxCap >= 85 ? 0.52 : 0.48;
      baseAttrs[key] = clamp(maxCap * starterRatio, 28, maxCap);
    });

    return {
      name: d.name,
      nickname: d.nickname,
      initialAge: d.initialAge,
      gender: d.gender,
      heightCm: d.heightCm,
      weightKg: d.weightKg,
      reachCm: d.reachCm,
      nationality: d.nationality,
      birthState: `${d.birthState} (${d.birthStateCode})`,
      birthCity: d.birthCity,
      modality: d.modality,
      style: d.chosenStyle ? d.chosenStyle.name : 'Equilibrado',
      appearance: d.appearance,
      attributes: baseAttrs,
      dnaMaxAttributes: dnaMaxAttributes,
      skillPoints: 0, // Inicia com 0 PH (ganha de 1 a 5 por vitória)
      xp: 120, // Inicia com 120 XP para os primeiros upgrades
      storyId: d.storyId
    };
  }
}
