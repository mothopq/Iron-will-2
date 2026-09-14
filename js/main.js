import { gameState } from './state.js';
import { viewsManager } from './ui/viewsManager.js';
import { themeManager } from './ui/themeManager.js';
import { soundFX } from './audio.js';


// Expõe no window imediatamente para depuração e interoperabilidade
window.gameState = gameState;
window.viewsManager = viewsManager;
window.themeManager = themeManager;
window.forceResetGame = () => {
  try {
    if (gameState && typeof gameState.resetGame === 'function') {
      gameState.resetGame();
    }
    localStorage.clear();
    sessionStorage.clear();
  } catch(e){
    console.warn('Erro ao limpar storage:', e);
  }
  try {
    const mainApp = document.getElementById('mainAppContainer');
    const creation = document.getElementById('creationScreen');
    if (mainApp) mainApp.classList.add('hidden');
    if (creation) {
      creation.classList.remove('hidden');
      creation.innerHTML = '';
    }
    if (viewsManager && typeof viewsManager.initCreationScreen === 'function') {
      viewsManager.initCreationScreen();
    }
  } catch(e){}
  setTimeout(() => {
    try {
      const cleanUrl = window.location.href.split('?')[0].split('#')[0];
      window.location.replace(cleanUrl + '?reset=' + Date.now());
    } catch(e) {
      window.location.reload();
    }
  }, 50);
};

window.resetCareer = (showPrompt = true) => {
  if (showPrompt && viewsManager && typeof viewsManager.promptResetCareer === 'function') {
    viewsManager.promptResetCareer();
  } else {
    window.forceResetGame();
  }
};
window.resetGame = window.resetCareer;

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

