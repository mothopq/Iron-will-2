// main.js - Inicializador principal da aplicação

import { gameState } from './state.js?v=20260913_fix_v5';
import { viewsManager } from './ui/viewsManager.js?v=20260913_fix_v5';
import { themeManager } from './ui/themeManager.js?v=20260913_fix_v5';
import { soundFX } from './audio.js?v=20260913_fix_v5';

// Expõe no window imediatamente para depuração e interoperabilidade
window.gameState = gameState;
window.viewsManager = viewsManager;
window.themeManager = themeManager;

function initApp() {
  console.log('[Iron Will] Iniciando motor do simulador...');
  try {
    // 1. Inicializa tema e personalização de cores
    if (themeManager && typeof themeManager.init === 'function') {
      themeManager.init();
    }

    // 2. Carrega save se existir
    gameState.loadGame();

    // 3. Inicializa gerenciador de views (carrega dashboard ou tela de criação)
    viewsManager.init();

    // 4. Interação inicial para destravar o áudio na Web Audio API
    const unlockAudio = () => {
      soundFX.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    console.log('[Iron Will] Simulador carregado e pronto para combate!');
  } catch (err) {
    console.error('[Iron Will FATAL ERROR]:', err);
    const box = document.getElementById('debugErrorOverlay');
    if (box) {
      box.innerHTML += `<p style="color:#f87171;">Erro no initApp: ${err.message}</p>`;
    }
  }
}

// Inicializa imediatamente se o DOM já estiver pronto (o script fica no final de body)
if (document.body) {
  initApp();
} else {
  window.addEventListener('DOMContentLoaded', initApp);
}

