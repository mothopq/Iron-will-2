// avatarRenderer.js - Renderizador procedual dinâmico do lutador em Canvas 2D

export function renderFighterAvatar(canvas, fighter, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const skinColor = fighter.appearance?.skinTone || '#d29a73';
  const hairColor = fighter.appearance?.hairColor || '#221814';
  const hairStyle = fighter.appearance?.hairStyle || 'fade';
  const beardStyle = fighter.appearance?.beard || 'none';
  const shortsColor = fighter.appearance?.shortsColor || '#d90429';
  const glovesColor = fighter.appearance?.glovesColor || '#111111';

  const cuts = options.cuts || 0;
  const isHurt = options.isHurt || false;
  const isKnockedDown = options.isKnockedDown || false;
  const isFlipped = options.isFlipped || false;

  ctx.save();

  if (isFlipped) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }

  // Se estiver em Knockdown, rotaciona ligeiramente o lutador
  if (isKnockedDown) {
    ctx.translate(w * 0.5, h * 0.8);
    ctx.rotate(Math.PI * 0.35);
    ctx.translate(-w * 0.5, -h * 0.8);
  }

  const cx = w * 0.5;
  const cy = h * 0.5;

  // 1. Sombra no chão
  ctx.beginPath();
  ctx.ellipse(cx, h - 12, w * 0.32, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fill();

  // 2. Pernas e Coxas Musculosas
  ctx.fillStyle = skinColor;
  // Perna Esquerda
  ctx.fillRect(cx - 32, cy + 40, 18, 55);
  // Perna Direita
  ctx.fillRect(cx + 14, cy + 40, 18, 55);

  // 3. Calção de Luta
  ctx.fillStyle = shortsColor;
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy + 20);
  ctx.lineTo(cx + 40, cy + 20);
  ctx.lineTo(cx + 36, cy + 52);
  ctx.lineTo(cx, cy + 45);
  ctx.lineTo(cx - 36, cy + 52);
  ctx.closePath();
  ctx.fill();

  // Detalhe dourado do cós do calção
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(cx - 40, cy + 20, 80, 5);

  // 4. Tronco / Peitoral Musculoso
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.moveTo(cx - 42, cy - 25);
  ctx.lineTo(cx + 42, cy - 25);
  ctx.lineTo(cx + 36, cy + 22);
  ctx.lineTo(cx - 36, cy + 22);
  ctx.closePath();
  ctx.fill();

  // Definição muscular (peitoral e abdômen)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 2.5;
  // Peitoral
  ctx.beginPath();
  ctx.moveTo(cx - 36, cy - 8);
  ctx.quadraticCurveTo(cx - 18, cy + 2, cx, cy - 6);
  ctx.quadraticCurveTo(cx + 18, cy + 2, cx + 36, cy - 8);
  ctx.stroke();
  // Linha central
  ctx.beginPath();
  ctx.moveTo(cx, cy - 6);
  ctx.lineTo(cx, cy + 20);
  ctx.stroke();

  // 5. Braços e Guarda com Luvas
  ctx.fillStyle = skinColor;
  // Braço Esquerdo (levantado em guarda)
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy - 20);
  ctx.lineTo(cx - 34, cy - 4);
  ctx.lineTo(cx - 18, cy - 26);
  ctx.lineWidth = 14;
  ctx.strokeStyle = skinColor;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Luva Esquerda
  ctx.fillStyle = glovesColor;
  ctx.beginPath();
  ctx.arc(cx - 16, cy - 30, 13, 0, Math.PI * 2);
  ctx.fill();

  // Braço Direito (Guarda fechada alta)
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy - 20);
  ctx.lineTo(cx + 34, cy - 4);
  ctx.lineTo(cx + 18, cy - 32);
  ctx.lineWidth = 14;
  ctx.strokeStyle = skinColor;
  ctx.stroke();

  // Luva Direita
  ctx.fillStyle = glovesColor;
  ctx.beginPath();
  ctx.arc(cx + 18, cy - 36, 13, 0, Math.PI * 2);
  ctx.fill();

  // 6. Cabeça e Pescoço
  // Pescoço forte
  ctx.fillStyle = skinColor;
  ctx.fillRect(cx - 16, cy - 40, 32, 20);

  // Cabeça / Rosto
  ctx.beginPath();
  ctx.ellipse(cx, cy - 50, 25, 28, 0, 0, Math.PI * 2);
  ctx.fillStyle = skinColor;
  ctx.fill();

  // Olhos
  ctx.fillStyle = '#111';
  if (isHurt || cuts > 40) {
    // Olho esquerdo inchado/fechado
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#600';
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 52);
    ctx.lineTo(cx - 6, cy - 52);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(cx - 11, cy - 52, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Olho direito
  ctx.beginPath();
  ctx.arc(cx + 11, cy - 52, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Sobrancelhas bravas / focadas
  ctx.strokeStyle = hairColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy - 57);
  ctx.lineTo(cx - 5, cy - 54);
  ctx.moveTo(cx + 5, cy - 54);
  ctx.lineTo(cx + 18, cy - 57);
  ctx.stroke();

  // Nariz
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 52);
  ctx.lineTo(cx + 3, cy - 45);
  ctx.lineTo(cx - 1, cy - 45);
  ctx.stroke();

  // Boca / Protetor bucal
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 8, cy - 38, 16, 4);

  // 7. Cabelo
  ctx.fillStyle = hairColor;
  if (hairStyle === 'fade') {
    ctx.beginPath();
    ctx.arc(cx, cy - 62, 23, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 24, cy - 62, 48, 10);
  } else if (hairStyle === 'long' || hairStyle === 'dreads') {
    ctx.beginPath();
    ctx.arc(cx, cy - 62, 25, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    ctx.fillRect(cx - 27, cy - 65, 54, 25);
  } else if (hairStyle === 'bald') {
    // Careca, apenas brilho
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 68, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Curto clássico
    ctx.beginPath();
    ctx.arc(cx, cy - 60, 24, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // 8. Barba
  if (beardStyle !== 'none') {
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(cx, cy - 46, 24, Math.PI * 0.2, Math.PI * 0.8);
    ctx.lineWidth = 7;
    ctx.strokeStyle = hairColor;
    ctx.stroke();
  }

  // 9. Danos Visuais de Batalha (Cortes e Sangue)
  if (cuts > 0) {
    ctx.fillStyle = '#d90429';
    // Corte no supercílio
    ctx.fillRect(cx - 16, cy - 58, 8, 3);
    // Gota de sangue descendo
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 55);
    ctx.lineTo(cx - 14, cy - 43);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#b00020';
    ctx.stroke();
  }

  // Gotas de suor
  if (options.stamina && options.stamina < 60) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(cx + 20, cy - 48, 1.8, 0, Math.PI * 2);
    ctx.arc(cx - 18, cy - 12, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
