// state.js - Gerenciamento de estado global e persistência no localStorage

import { Fighter } from './models/Fighter.js';
import { WorldEngine } from './systems/worldEngine.js';
import { LifeEngine } from './systems/lifeEngine.js';
import { TrainingEngine } from './systems/trainingEngine.js';

const STORAGE_KEY = 'iron_will_combat_legacy_save';

export class GameState {
  constructor() {
    this.fighter = null;
    this.worldEngine = null;
    this.lifeEngine = null;
    this.trainingEngine = null;
    this.currentView = 'carreira';
    this.activeDilemma = null;
  }

  // Cria um novo lutador e inicializa os motores
  initNewGame(fighterConfig) {
    this.fighter = new Fighter(fighterConfig);
    this.worldEngine = new WorldEngine(this.fighter);
    this.lifeEngine = new LifeEngine(this.fighter);
    this.trainingEngine = new TrainingEngine(this.fighter);
    this.saveGame();
  }

  // Reseta completamente o estado do jogo e apaga o save
  resetGame() {
    this.fighter = null;
    this.worldEngine = null;
    this.lifeEngine = null;
    this.trainingEngine = null;
    this.activeDilemma = null;
    this.currentView = 'carreira';
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Erro ao limpar storage no resetGame:', e);
    }
  }

  // Salva no LocalStorage
  saveGame() {
    if (!this.fighter) return;
    try {
      const data = {
        fighter: this.fighter,
        worldNews: this.worldEngine ? this.worldEngine.worldNews : [],
        rankings: this.worldEngine ? this.worldEngine.rankings : [],
        currentJob: this.lifeEngine ? this.lifeEngine.currentJob : null,
        currentHousing: this.lifeEngine ? this.lifeEngine.currentHousing : null,
        activeSponsors: this.lifeEngine ? this.lifeEngine.activeSponsors : [],
        weeklySchedule: this.trainingEngine ? this.trainingEngine.weeklySchedule : null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Não foi possível salvar no localStorage:', err);
    }
  }

  // Carrega do LocalStorage
  loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.fighter) return false;

      this.fighter = new Fighter(data.fighter);
      // Restaura dados específicos
      Object.assign(this.fighter, data.fighter);
      // Higieniza o arsenal para garantir isolamento estrito por modalidade
      if (typeof this.fighter.sanitizeMoves === 'function') {
        this.fighter.sanitizeMoves();
      }

      this.worldEngine = new WorldEngine(this.fighter);
      if (data.rankings && data.rankings.length > 0) {
        this.worldEngine.rankings = data.rankings;
      }
      this.worldEngine.ensureFullRoster();
      if (data.worldNews) {
        this.worldEngine.worldNews = data.worldNews;
      }

      this.lifeEngine = new LifeEngine(this.fighter);
      if (data.currentJob) this.lifeEngine.currentJob = data.currentJob;
      if (data.currentHousing) this.lifeEngine.currentHousing = data.currentHousing;
      if (data.activeSponsors) this.lifeEngine.activeSponsors = data.activeSponsors;

      this.trainingEngine = new TrainingEngine(this.fighter);
      if (data.weeklySchedule) this.trainingEngine.weeklySchedule = data.weeklySchedule;

      return true;
    } catch (err) {
      console.warn('Falha ao restaurar savegame:', err);
      return false;
    }
  }
}

export const gameState = new GameState();

