// js/ui/skillCheckEngine.js - Motor de Skill Check estilo Dead by Daylight para esquiva interativa de golpes pesados

import { soundFX } from '../audio.js';

export class SkillCheckEngine {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.feedbackEl = null;
    this.warningEl = null;
    this.animId = null;
    this.isActive = false;
    this.resolvePromise = null;
    this.keyHandler = null;
    this.clickHandler = null;
  }

  init() {
    this.overlay = document.getElementById('dbdSkillCheckOverlay');
    this.container = document.getElementById('dbdSkillCheckContainer');
    this.canvas = document.getElementById('dbdSkillCheckCanvas');
    this.feedbackEl = document.getElementById('dbdSkillCheckFeedback');
    this.warningEl = document.getElementById('dbdWarningBanner');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Dispara o Skill Check estilo Dead by Daylight
   * @param {Object} options
   * @param {string} options.moveName Nome do golpe que está vindo
   * @param {string} options.opponentName Nome do adversário
   * @param {number} options.playerReflexes Reflexos do jogador (30 a 100)
   * @param {number} options.opponentSpeed Velocidade do rival (30 a 100)
   * @returns {Promise<'GREAT' | 'SUCCESS' | 'FAIL'>}
   */
  startCheck({ moveName = 'GOLPE PESADO', opponentName = 'Rival', playerReflexes = 50, opponentSpeed = 50 }) {
    if (!this.overlay || !this.canvas) this.init();
    if (!this.overlay || !this.canvas) return Promise.resolve('FAIL');

    if (this.isActive) {
      this.cleanup();
    }

    this.isActive = true;
    soundFX.playSkillCheckCue();

    if (this.warningEl) {
      this.warningEl.textContent = `⚠️ ${opponentName.toUpperCase()} LANÇOU ${moveName.toUpperCase()}! ESQUIVE!`;
    }
    if (this.feedbackEl) {
      this.feedbackEl.className = 'dbd-feedback-text';
      this.feedbackEl.textContent = '';
    }

    this.overlay.classList.remove('hidden');

    return new Promise(resolve => {
      this.resolvePromise = resolve;

      // Parâmetros do Círculo
      // A zona de sucesso fica posicionada aleatoriamente entre 110° e 230°
      const zoneStartDeg = Math.floor(Math.random() * 110) + 120;
      // O tamanho da zona de sucesso escala com os reflexos do jogador
      const successArcDeg = Math.max(38, Math.min(75, 38 + (playerReflexes * 0.38)));
      const greatArcDeg = Math.max(10, Math.min(18, 10 + (playerReflexes * 0.10)));

      // Duração da rotação completa (em ms)
      const totalDurationMs = Math.max(1050, 1450 - (opponentSpeed * 4));

      const startTime = performance.now();
      let hasResponded = false;

      const finishWith = (result) => {
        if (hasResponded) return;
        hasResponded = true;

        if (result === 'GREAT') {
          soundFX.playSkillCheckGreat();
          if (this.feedbackEl) {
            this.feedbackEl.className = 'dbd-feedback-text great';
            this.feedbackEl.textContent = '⚡ ESQUIVA PERFEITA & CONTRAGOLPE!';
          }
        } else if (result === 'SUCCESS') {
          soundFX.playSkillCheckSuccess();
          if (this.feedbackEl) {
            this.feedbackEl.className = 'dbd-feedback-text success';
            this.feedbackEl.textContent = '💨 ESQUIVA CIRÚRGICA!';
          }
        } else {
          soundFX.playSkillCheckFail();
          if (this.feedbackEl) {
            this.feedbackEl.className = 'dbd-feedback-text fail';
            this.feedbackEl.textContent = '💥 ESQUIVA FALHOU!';
          }
        }

        // Aguarda 400ms para o jogador ver o feedback antes de sumir
        setTimeout(() => {
          this.cleanup();
          resolve(result);
        }, 420);
      };

      // Listener de Tecla (Barra de Espaço ou Enter)
      this.keyHandler = (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          checkCurrentAngle();
        }
      };

      // Listener de Clique/Touch
      this.clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        checkCurrentAngle();
      };

      window.addEventListener('keydown', this.keyHandler, { capture: true });
      this.container.addEventListener('click', this.clickHandler);
      this.container.addEventListener('touchstart', this.clickHandler, { passive: false });
      this.overlay.addEventListener('click', this.clickHandler);
      this.overlay.addEventListener('touchstart', this.clickHandler, { passive: false });

      const checkCurrentAngle = () => {
        if (hasResponded) return;
        const elapsed = performance.now() - startTime;
        const currentDeg = (elapsed / totalDurationMs) * 360;

        const greatEnd = zoneStartDeg + greatArcDeg;
        const successEnd = zoneStartDeg + successArcDeg;

        if (currentDeg >= zoneStartDeg && currentDeg <= greatEnd) {
          finishWith('GREAT');
        } else if (currentDeg > greatEnd && currentDeg <= successEnd) {
          finishWith('SUCCESS');
        } else {
          finishWith('FAIL');
        }
      };

      // Loop de renderização visual via Canvas
      const render = (now) => {
        if (!this.isActive) return;

        const elapsed = now - startTime;
        const currentDeg = (elapsed / totalDurationMs) * 360;

        this.drawDial(currentDeg, zoneStartDeg, successArcDeg, greatArcDeg);

        // Se a agulha passou da zona de sucesso sem apertar, ou completou os 360 graus -> FAIL automático!
        const successEnd = zoneStartDeg + successArcDeg;
        if (!hasResponded && currentDeg > successEnd + 15) {
          finishWith('FAIL');
          return;
        }

        if (!hasResponded && currentDeg < 360) {
          this.animId = requestAnimationFrame(render);
        }
      };

      this.animId = requestAnimationFrame(render);
    });
  }

  drawDial(currentDeg, zoneStartDeg, successArcDeg, greatArcDeg) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = 95;
    const lineWidth = 16;

    ctx.clearRect(0, 0, w, h);

    // Ajuste de ângulo: 0 graus no DBD começa no topo (-90 graus no sistema do Canvas)
    const degToRad = (d) => ((d - 90) * Math.PI) / 180;

    // 1. Trilha de Fundo (Track Cinza Escuro Translúcido)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Zona de Sucesso Normal (Teal / Ciano Neon)
    ctx.beginPath();
    ctx.arc(cx, cy, r, degToRad(zoneStartDeg), degToRad(zoneStartDeg + successArcDeg));
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Zona de Acerto Crítico (Great Success - Dourado / Branco Puro)
    ctx.beginPath();
    ctx.arc(cx, cy, r, degToRad(zoneStartDeg), degToRad(zoneStartDeg + greatArcDeg));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Marcador inicial e final da zona
    ctx.beginPath();
    ctx.arc(cx, cy, r, degToRad(zoneStartDeg), degToRad(zoneStartDeg + 1.5));
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = lineWidth + 4;
    ctx.stroke();

    // 4. Ponteiro / Agulha Rotativa (Vermelho Neon com ponta brilhante)
    const needleRad = degToRad(currentDeg);
    const needleLen = r + 16;
    const nx = cx + Math.cos(needleRad) * needleLen;
    const ny = cy + Math.sin(needleRad) * needleLen;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Ponta da agulha
    ctx.beginPath();
    ctx.arc(nx, ny, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  cleanup() {
    this.isActive = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler, { capture: true });
      this.keyHandler = null;
    }
    if (this.clickHandler) {
      if (this.container) {
        this.container.removeEventListener('click', this.clickHandler);
        this.container.removeEventListener('touchstart', this.clickHandler);
      }
      if (this.overlay) {
        this.overlay.removeEventListener('click', this.clickHandler);
        this.overlay.removeEventListener('touchstart', this.clickHandler);
      }
      this.clickHandler = null;
    }
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export const skillCheckEngine = new SkillCheckEngine();
