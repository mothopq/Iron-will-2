// legendsData.js - Banco de Lendas dos Esportes de Combate para o sistema de roubo de genética

// 5 Atributos Universais (Presentes em todas as modalidades):
// 1. IQ (Fight IQ / Inteligência de Luta / Timing)
// 2. GAS (Cardio / Resistência Aeróbica / Pulmão)
// 3. VEL (Velocidade & Reflexos)
// 4. QUE (Queixo / Resistência a Impactos / Absorção)
// 5. FOR (Força Física & Explosão)

export const UNIVERSAL_ATTRIBUTES = [
  { id: 'fightIQ', short: 'IQ', label: 'Fight IQ', desc: 'Leitura de jogo, tempo de reação e antecipação' },
  { id: 'cardio', short: 'GAS', label: 'Cardio / Gás', desc: 'Fôlego para suportar rounds duros sem cansaço' },
  { id: 'speed', short: 'VEL', label: 'Velocidade', desc: 'Rapidez de reflexos e explosão motora' },
  { id: 'chin', short: 'QUE', label: 'Queixo', desc: 'Resistência a impactos e proteção contra nocautes' },
  { id: 'strength', short: 'FOR', label: 'Força', desc: 'Potência muscular e pressão estática' }
];

// Atributos Específicos por Modalidade:
export const MODALITY_SPECIFIC_ATTRIBUTES = {
  boxing: [
    { id: 'punchPower', short: 'POT', label: 'Potência', desc: 'Poder de nocaute em socos limpos' },
    { id: 'boxing', short: 'JAB', label: 'Mãos & Jab', desc: 'Precisão e volume com a mão da frente' },
    { id: 'reflexes', short: 'ESQ', label: 'Esquiva', desc: 'Jogo de pernas e pêndulo elusivo' }
  ],
  jiu_jitsu: [
    { id: 'bjj', short: 'SUB', label: 'Finalizações', desc: 'Ajuste de chaves e estrangulamentos' },
    { id: 'technique', short: 'PAS', label: 'Passagem', desc: 'Pressão e técnica para superar a guarda' },
    { id: 'coordination', short: 'GUA', label: 'Guarda', desc: 'Retenção de guarda e flexibilidade de quadril' }
  ],
  mma: [
    { id: 'punchPower', short: 'STR', label: 'Striking', desc: 'Trocação contundente em pé' },
    { id: 'wrestling', short: 'WRE', label: 'Wrestling', desc: 'Quedas e controle de grade' },
    { id: 'bjj', short: 'GNP', label: 'Chão & GnP', desc: 'Ground and pound e submissões' }
  ],
  muay_thai: [
    { id: 'kicking', short: 'CAN', label: 'Caneladas', desc: 'Poder destrutivo nos chutes baixos e médios' },
    { id: 'clinch', short: 'CLI', label: 'Clinch Thai', desc: 'Domínio de nuca, joelhos e cotovelos' },
    { id: 'toughness', short: 'RES', label: 'Calejamento', desc: 'Resistência física e canelas de ferro' }
  ],
  judo: [
    { id: 'wrestling', short: 'PRO', label: 'Projeções', desc: 'Alavancas de Ippon e quedas de grande amplitude' },
    { id: 'coordination', short: 'KUM', label: 'Pegada', desc: 'Kumi-kata dominante e controle de lapela' },
    { id: 'bjj', short: 'NEV', label: 'Ne-waza', desc: 'Imobilizações e finalizações no solo' }
  ],
  wrestling: [
    { id: 'wrestling', short: 'TAK', label: 'Quedas', desc: 'Double leg explosivo e single leg' },
    { id: 'toughness', short: 'SPR', label: 'Sprawl', desc: 'Defesa pesada contra entradas de perna' },
    { id: 'clinch', short: 'TOP', label: 'Controle', desc: 'Pressão esmagadora por cima e ride' }
  ],
  kickboxing: [
    { id: 'kicking', short: 'CHU', label: 'Chutes K-1', desc: 'Combinações de chutes altos e giratórios' },
    { id: 'punchPower', short: 'POT', label: 'Potência', desc: 'Golpes de punho combinados com caneladas' },
    { id: 'distanceControl', short: 'ALC', label: 'Distância', desc: 'Controle do raio de ação e blitz' }
  ]
};

// Função que converte o DNA de lenda/mediano em um nível inicial de iniciante (35 a 62)
// Para que o jogador não comece "full forte" e possa evoluir ao longo dos camps de 4 meses!
export function calculateStartingAttribute(stolenScore) {
  const score = stolenScore || 60;
  return Math.max(35, Math.min(62, Math.round(36 + (score - 45) * 0.48)));
}

// Lendas e Atletas Medianos por Modalidade (5 Universais + 3 Específicos)
export const LEGENDS_BY_MODALITY = {
  boxing: [
    {
      name: 'Mike Tyson',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'Iron Mike · Nocauteador Mais Jovem da História',
      stats: { fightIQ: 82, cardio: 75, speed: 86, chin: 82, strength: 88, punchPower: 89, boxing: 84, reflexes: 85 }
    },
    {
      name: 'Muhammad Ali',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'The Greatest · Mestre da Distância e do Pêndulo',
      stats: { fightIQ: 88, cardio: 85, speed: 89, chin: 84, strength: 76, punchPower: 78, boxing: 88, reflexes: 89 }
    },
    {
      name: 'Floyd Mayweather',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'Money · Defesa e Esquiva de Precisão',
      stats: { fightIQ: 89, cardio: 86, speed: 86, chin: 80, strength: 72, punchPower: 74, boxing: 89, reflexes: 89 }
    },
    {
      name: 'Arturo Gatti',
      tier: 'MEDIANO',
      tierBadge: '🥊 ATLETA MEDIANO / RAÇA',
      title: 'Thunder · Queixo de Granito e Coração de Aço',
      stats: { fightIQ: 62, cardio: 70, speed: 64, chin: 78, strength: 70, punchPower: 72, boxing: 65, reflexes: 60 }
    },
    {
      name: 'Micky Ward',
      tier: 'MEDIANO',
      tierBadge: '🥊 ATLETA MEDIANO / BRAWLER',
      title: 'Irish · Gancho no Fígado e Guerra na Grade',
      stats: { fightIQ: 60, cardio: 68, speed: 58, chin: 76, strength: 72, punchPower: 75, boxing: 63, reflexes: 58 }
    },
    {
      name: 'Emanuel Augustus',
      tier: 'PROMESSA',
      tierBadge: '⚡ JOVEM ESTILISTA',
      title: 'Drunken Master · Ritmo Imprevisível e Gingado',
      stats: { fightIQ: 70, cardio: 65, speed: 74, chin: 64, strength: 58, punchPower: 60, boxing: 72, reflexes: 75 }
    },
    {
      name: 'Gabriel Rosado',
      tier: 'VETERANO',
      tierBadge: '🛡️ VETERANO CASCA-GROSSA',
      title: 'King · Sobrevivente de Guerras Sangrentas',
      stats: { fightIQ: 66, cardio: 66, speed: 60, chin: 74, strength: 68, punchPower: 68, boxing: 67, reflexes: 62 }
    }
  ],
  jiu_jitsu: [
    {
      name: 'Rickson Gracie',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'Invicto · O Samurai Supremo da Arte Suave',
      stats: { fightIQ: 88, cardio: 82, speed: 78, chin: 80, strength: 82, bjj: 89, technique: 88, coordination: 88 }
    },
    {
      name: 'Roger Gracie',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'O Rei do Básico · Finalizações Imparáveis',
      stats: { fightIQ: 87, cardio: 80, speed: 72, chin: 80, strength: 84, bjj: 89, technique: 89, coordination: 84 }
    },
    {
      name: 'Paulão "Trator"',
      tier: 'MEDIANO',
      tierBadge: '🥊 ATLETA MEDIANO / FORÇA',
      title: 'Passador Pesado · Pressão Esmagadora de Quadril',
      stats: { fightIQ: 62, cardio: 65, speed: 58, chin: 72, strength: 78, bjj: 68, technique: 65, coordination: 60 }
    },
    {
      name: 'Zé da Guarda',
      tier: 'PROMESSA',
      tierBadge: '⚡ JOVEM GUARDEIRO',
      title: 'Flexibilidade Pura · Bote Rápido no Armlock',
      stats: { fightIQ: 65, cardio: 70, speed: 68, chin: 60, strength: 58, bjj: 72, technique: 70, coordination: 74 }
    },
    {
      name: 'Beto Casca-Grossa',
      tier: 'VETERANO',
      tierBadge: '🛡️ VETERANO DE TATAME',
      title: 'Faixa Preta Regional · Defesa Sólida e Amarrações',
      stats: { fightIQ: 68, cardio: 64, speed: 56, chin: 70, strength: 70, bjj: 68, technique: 66, coordination: 62 }
    }
  ],
  mma: [
    {
      name: 'Anderson Silva',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'Spider · Mestre da Trocação e Esquiva',
      stats: { fightIQ: 88, cardio: 80, speed: 88, chin: 78, strength: 76, punchPower: 86, wrestling: 72, bjj: 82 }
    },
    {
      name: 'Jon Jones',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'Bones · Controle de Distância e Imprevisibilidade',
      stats: { fightIQ: 89, cardio: 84, speed: 82, chin: 86, strength: 85, punchPower: 82, wrestling: 88, bjj: 84 }
    },
    {
      name: 'Khabib Nurmagomedov',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'The Eagle · Pressão de Solo e Controle de Grade',
      stats: { fightIQ: 86, cardio: 88, speed: 80, chin: 88, strength: 86, punchPower: 72, wrestling: 89, bjj: 85 }
    },
    {
      name: 'Nate Diaz',
      tier: 'MEDIANO',
      tierBadge: '🥊 MEDIANO / CASCA-GROSSA',
      title: 'Stockton Slugger · Cardio Infinito e Jiu-Jitsu Afiado',
      stats: { fightIQ: 68, cardio: 82, speed: 60, chin: 82, strength: 65, punchPower: 64, wrestling: 56, bjj: 76 }
    },
    {
      name: 'Chris Leben',
      tier: 'MEDIANO',
      tierBadge: '🥊 MEDIANO / BRAWLER',
      title: 'The Crippler · Queixo de Pedra e Trocação Aberta',
      stats: { fightIQ: 56, cardio: 64, speed: 58, chin: 82, strength: 74, punchPower: 76, wrestling: 54, bjj: 52 }
    },
    {
      name: 'Clay Guida',
      tier: 'VETERANO',
      tierBadge: '🛡️ VETERANO INCANSÁVEL',
      title: 'The Carpenter · Pressão Elétrica e Ritmo Alucinado',
      stats: { fightIQ: 62, cardio: 84, speed: 68, chin: 74, strength: 68, punchPower: 58, wrestling: 72, bjj: 58 }
    }
  ],
  muay_thai: [
    {
      name: 'Buakaw Banchamek',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'A Lenda de Ferro · Chutes Devastadores',
      stats: { fightIQ: 85, cardio: 86, speed: 82, chin: 86, strength: 85, kicking: 89, clinch: 86, toughness: 88 }
    },
    {
      name: 'Saenchai',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'O Mago · Jogo de Pernas e Esquivas Elusivas',
      stats: { fightIQ: 89, cardio: 84, speed: 89, chin: 80, strength: 72, kicking: 88, clinch: 84, toughness: 82 }
    },
    {
      name: 'Somchai "Canela Seca"',
      tier: 'MEDIANO',
      tierBadge: '🥊 MEDIANO / ESTÁDIO LOCAL',
      title: 'Lutador de Rajadamnern · Canelada Dura e Clinch',
      stats: { fightIQ: 60, cardio: 72, speed: 62, chin: 74, strength: 68, kicking: 74, clinch: 68, toughness: 76 }
    },
    {
      name: 'Petch "Furacão"',
      tier: 'PROMESSA',
      tierBadge: '⚡ JOVEM PROMESSA',
      title: 'Cotovelada Rápida · Fôlego e Agressividade',
      stats: { fightIQ: 64, cardio: 74, speed: 72, chin: 64, strength: 62, kicking: 70, clinch: 66, toughness: 68 }
    }
  ],
  judo: [
    {
      name: 'Teddy Riner',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'Colosso Francês · Domínio Físico e Pegada',
      stats: { fightIQ: 86, cardio: 80, speed: 78, chin: 88, strength: 89, wrestling: 89, coordination: 86, bjj: 80 }
    },
    {
      name: 'Kenji Pegada Forte',
      tier: 'MEDIANO',
      tierBadge: '🥊 MEDIANO / REGIONAL',
      title: 'Judoca Operário · Alavanca Clássica de Quadril',
      stats: { fightIQ: 62, cardio: 66, speed: 62, chin: 70, strength: 74, wrestling: 72, coordination: 70, bjj: 60 }
    },
    {
      name: 'Lucas Harai-Goshi',
      tier: 'PROMESSA',
      tierBadge: '⚡ JOVEM PROMESSA',
      title: 'Ippon Veloz · Transições Ágeis para o Solo',
      stats: { fightIQ: 66, cardio: 70, speed: 72, chin: 64, strength: 68, wrestling: 70, coordination: 72, bjj: 64 }
    }
  ],
  wrestling: [
    {
      name: 'Aleksandr Karelin',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'O Experimento Russo · Força Estática Brutal',
      stats: { fightIQ: 86, cardio: 86, speed: 78, chin: 89, strength: 89, wrestling: 89, toughness: 89, clinch: 89 }
    },
    {
      name: 'Dan Sprawl de Ferro',
      tier: 'MEDIANO',
      tierBadge: '🥊 MEDIANO / ESTADUAL',
      title: 'Defensor Pesado · Sprawl e Pressão na Grade',
      stats: { fightIQ: 62, cardio: 74, speed: 64, chin: 72, strength: 76, wrestling: 74, toughness: 74, clinch: 70 }
    },
    {
      name: 'Tyler Single-Leg',
      tier: 'PROMESSA',
      tierBadge: '⚡ PROMESSA UNIVERSITÁRIA',
      title: 'Entrada Baixa Veloz · Fôlego de Alta Pressão',
      stats: { fightIQ: 65, cardio: 80, speed: 74, chin: 64, strength: 70, wrestling: 72, toughness: 68, clinch: 64 }
    }
  ],
  kickboxing: [
    {
      name: 'Ernesto Hoost',
      tier: 'LENDA',
      tierBadge: '⭐ LENDA MUNDIAL',
      title: 'Mr. Perfect · Combinações Clássicas de K-1',
      stats: { fightIQ: 87, cardio: 82, speed: 82, chin: 82, strength: 85, kicking: 88, punchPower: 86, distanceControl: 85 }
    },
    {
      name: 'Marco "The Hammer"',
      tier: 'MEDIANO',
      tierBadge: '🥊 MEDIANO / BRAWLER',
      title: 'Trocador Rústico · Soco Forte e Chute Pesado',
      stats: { fightIQ: 60, cardio: 68, speed: 64, chin: 74, strength: 76, kicking: 70, punchPower: 74, distanceControl: 62 }
    },
    {
      name: 'Sven "Low Kick"',
      tier: 'PROMESSA',
      tierBadge: '⚡ JOVEM PROMESSA',
      title: 'Canela Calejada · Sequências de Boxe e Chute',
      stats: { fightIQ: 65, cardio: 72, speed: 70, chin: 66, strength: 68, kicking: 74, punchPower: 68, distanceControl: 68 }
    }
  ]
};

// Arquétipos de Estilo por Modalidade (com plano de jogo e eixos de radar)
export const STYLE_ARCHETYPES = {
  boxing: [
    {
      id: 'boxer_in_fighter',
      name: 'In-Fighter / Pressão',
      subtitle: 'Corpo a Corpo & Ganchos',
      desc: 'Encurta a distância sem medo de levar golpes para descarregar combinações brutais na curta.',
      gamePlan: 'Corte o ringue com pêndulo, cole a testa no peito do adversário e mine o corpo até abrir o queixo.',
      pros: 'Potência · Força · Queixo',
      cons: 'Alcance · Gás nos rounds finais',
      radarValues: [85, 75, 80, 95, 95, 95, 75, 80] // [IQ, GAS, VEL, QUE, FOR, POT, JAB, ESQ]
    },
    {
      id: 'boxer_out_boxer',
      name: 'Out-Boxer / Técnico',
      subtitle: 'Jogo de Pernas & Jab',
      desc: 'Mestre da distância. Usa o jab para pontuar e se move constantemente para não ser tocado.',
      gamePlan: 'Mantenha o adversário na ponta do jab, circule para o lado fraco dele e vença nos pontos com elegância.',
      pros: 'Velocidade · Jab · Esquiva',
      cons: 'Potência de Nocaute · Força Física',
      radarValues: [95, 90, 95, 75, 70, 75, 95, 95]
    },
    {
      id: 'boxer_counter',
      name: 'Counter-Puncher',
      subtitle: 'Precisão & Encontro',
      desc: 'Lê os padrões do oponente, faz ele errar por milímetros e conecta o golpe de encontro no queixo.',
      gamePlan: 'Provoque o ataque do rival, esquive na fração de segundo exata e golpeie o queixo desprotegido.',
      pros: 'Fight IQ · Precisão · Reflexos',
      cons: 'Volume de Golpes · Agressividade',
      radarValues: [98, 85, 92, 85, 80, 88, 88, 95]
    },
    {
      id: 'boxer_slugger',
      name: 'Slugger / Nocauteador',
      subtitle: 'Mão Pesada & Brawler',
      desc: 'Ignora a técnica refinada em busca de um único golpe fulminante capaz de apagar qualquer queixo.',
      gamePlan: 'Avance soltando pedradas com ambas as mãos até que um cruzado encontre o destino fatal.',
      pros: 'Poder de Nocaute · Queixo · Intimidação',
      cons: 'Velocidade · Defesa Pessoal',
      radarValues: [70, 70, 75, 98, 98, 99, 70, 65]
    },
    {
      id: 'boxer_balanced',
      name: 'Boxer-Puncher',
      subtitle: 'Equilibrado Completo',
      desc: 'Sabe boxear na longa com jabs precisos, mas tem pegada suficiente para nocautear na curta.',
      gamePlan: 'Adapte-se ao estilo do rival: se ele for técnico, pressione; se for brigador, boxeie na distância.',
      pros: 'Adaptação · Cardio · Versatilidade',
      cons: 'Sem atributo com 99 absoluto',
      radarValues: [88, 88, 88, 88, 88, 88, 88, 88]
    }
  ],
  jiu_jitsu: [
    {
      id: 'bjj_balanced',
      name: 'Equilibrado',
      subtitle: 'Experiência & Adaptação',
      desc: 'Generalista completo. Sem ponto forte gritante nem buraco grave — adapta o jogo ao adversário e à posição.',
      gamePlan: 'Leia o adversário, aceite posições diferentes e vença no ajuste.',
      pros: 'Experiência · Cardio · Defesa',
      cons: 'Força · Quedas',
      radarValues: [90, 88, 82, 85, 80, 88, 88, 85]
    },
    {
      id: 'bjj_guardeiro',
      name: 'Guardeiro',
      subtitle: 'Guarda & Raspagens',
      desc: 'Puxa para a guarda sem hesitar. Flexibilidade absurda, botes de triângulo e raspagens milimétricas.',
      gamePlan: 'Cole os ganchos, desestabilize a base do adversário com raspagens ou finalize por baixo.',
      pros: 'Flexibilidade · Raspagem · Escapes',
      cons: 'Quedas em Pé · Pressão por Cima',
      radarValues: [92, 85, 88, 78, 72, 94, 75, 96]
    },
    {
      id: 'bjj_passador',
      name: 'Passador',
      subtitle: 'Pressão & Toreando',
      desc: 'Base pesada e postura inabalável. Amassa a guarda rival até cravar a montada ou as costas.',
      gamePlan: 'Elimine os espaços das pernas dele, pressione com o ombro na mandíbula e passe com calma.',
      pros: 'Pressão Posicional · Força · Controle',
      cons: 'Velocidade de Escapes · Chão por Baixo',
      radarValues: [85, 88, 78, 88, 95, 85, 96, 75]
    },
    {
      id: 'bjj_wrestler',
      name: 'Wrestler / Quedas',
      subtitle: 'Double Leg & Domínio',
      desc: 'Não dá chances para o adversário puxar. Projeta com autoridade e joga por cima com explosão.',
      gamePlan: 'Domine a pegada na gola, entre com o quadril em velocidade e derrube já caindo estabilizado.',
      pros: 'Quedas · Explosão · Força',
      cons: 'Guarda Fechada · Flexibilidade',
      radarValues: [80, 92, 88, 88, 96, 80, 88, 75]
    },
    {
      id: 'bjj_submission_hunter',
      name: 'Finalizador',
      subtitle: 'Caçador de Posições Críticas',
      desc: 'Não luta por pontos. Seu único objetivo é caçar o braço, pescoço ou perna até a desistência.',
      gamePlan: 'Arrisque transições rápidas e encaixe chaves de surpresa em qualquer segundo de desatenção.',
      pros: 'Finalizações · Oportunismo · Timing',
      cons: 'Controle de Pontos · Defesa Conservadora',
      radarValues: [92, 80, 85, 80, 82, 99, 82, 84]
    }
  ],
  mma: [
    {
      id: 'mma_striker',
      name: 'Striker Especialista',
      subtitle: 'Trocação & Sprawl',
      desc: 'Mantém a luta em pé a qualquer custo, defendendo quedas e destruindo os oponentes com socos e chutes.',
      gamePlan: 'Defenda as entradas de perna com sprawl firme e castigue com combinações em pé.',
      pros: 'Striking · Defesa de Quedas · Nocaute',
      cons: 'Jiu-Jitsu de Solo por Baixo',
      radarValues: [88, 85, 92, 88, 85, 96, 92, 80]
    },
    {
      id: 'mma_wrestler',
      name: 'Wrestler & GnP',
      subtitle: 'Grade, Quedas & Marretadas',
      desc: 'Pressiona na grade, derruba e desce cotoveladas e socos impiedosos no solo.',
      gamePlan: 'Encurrale o rival na grade, derrube com double leg e castigue no ground and pound.',
      pros: 'Wrestling · Força · Controle de Grade',
      cons: 'Trocação Longa · Chutes',
      radarValues: [85, 95, 82, 92, 96, 85, 98, 92]
    },
    {
      id: 'mma_grappler',
      name: 'Finalizador de MMA',
      subtitle: 'BJJ Híbrido & Mochilada',
      desc: 'Usa o clinch e fintas para grudar nas costas do adversário e buscar o mata-leão da vitória.',
      gamePlan: 'Encurte no timing do golpe dele, trave as costas e arroche o pescoço.',
      pros: 'Submissões · Transições · Sangue Frio',
      cons: 'Poder de Nocaute em Pé',
      radarValues: [92, 88, 85, 85, 82, 84, 88, 96]
    },
    {
      id: 'mma_all_rounder',
      name: 'Híbrido Moderno',
      subtitle: 'Completo em Todas as Áreas',
      desc: 'Luta em pé, queda, passa guarda e golpeia onde o adversário tiver mais fraquezas.',
      gamePlan: 'Identifique o buraco no jogo do rival durante o round 1 e explore-o impiedosamente.',
      pros: 'Versatilidade · Fight IQ · Adaptação',
      cons: 'Sem especialização extrema em uma única arte',
      radarValues: [94, 90, 90, 88, 88, 88, 88, 88]
    }
  ],
  muay_thai: [
    {
      id: 'muay_bouk',
      name: 'Muay Bouk / Demolidor',
      subtitle: 'Pressão, Socos & Low Kicks',
      desc: 'Avança sem recuar um centímetro, disparando socos pesados e chutes nas pernas para desmantelar a base do adversário.',
      gamePlan: 'Marche para frente cortando os ângulos do ringue, castigue as coxas com low kicks potentes e liquide na trocação franca.',
      pros: 'Calejamento · Potência · Agressividade',
      cons: 'Pêndulo defensivo · Gás em lutas longas',
      radarValues: [80, 85, 78, 96, 94, 95, 82, 98]
    },
    {
      id: 'muay_femur',
      name: 'Muay Femur / Mestre Técnico',
      subtitle: 'Timing, Teep & Maestria',
      desc: 'O ápice da elegância e leitura marcial tailandesa. Dita a distância com o teep e contra-ataca com precisão cirúrgica.',
      gamePlan: 'Controle o ímpeto rival com chutes frontais (teep), esquive inclinando o tronco e devolva com chutes altos limpos.',
      pros: 'Fight IQ · Timing · Precisão de Chutes',
      cons: 'Trocação corpo a corpo · Força bruta',
      radarValues: [98, 88, 94, 80, 75, 96, 80, 82]
    },
    {
      id: 'muay_khao',
      name: 'Muay Khao / Joelhadas & Clinch',
      subtitle: 'Domínio de Nuca & Pulmão Infinito',
      desc: 'Mestre do clinch tradicional de duas mãos. Trava a cabeça do rival e crava joelhadas contínuas nas costelas e estômago.',
      gamePlan: 'Encurte a distância bloqueando golpes, trave a pegada dupla de nuca (plum) e mine a respiração dele com joelhadas pontiagudas.',
      pros: 'Clinch Thai · Fôlego / Cardio · Pressão',
      cons: 'Velocidade na longa · Esquiva de socos',
      radarValues: [88, 98, 82, 90, 92, 85, 99, 92]
    },
    {
      id: 'muay_sok',
      name: 'Muay Sok / Caçador de Cotovelos',
      subtitle: 'Navalha Curta & Golpes Giratórios',
      desc: 'Especialista letal no combate colado. Usa cotoveladas em diagonal, ascendentes e giratórias para cortar e abrir ferimentos decisivos.',
      gamePlan: 'Provoque o adversário para a média distância, penetre a guarda dele e desfira cotoveladas diagonais para corte ou nocaute imediato.',
      pros: 'Precisão Letal · Coragem · Reflexos',
      cons: 'Alcance contra chutes longos',
      radarValues: [90, 84, 92, 86, 85, 82, 94, 88]
    },
    {
      id: 'muay_tae',
      name: 'Muay Tae / Canela de Ferro',
      subtitle: 'Chutes Circulares Devastadores',
      desc: 'Baseia todo seu jogo na potência assombrosa do roundhouse kick. Quebra braços na guarda e destrói costelas com chutes sonoros.',
      gamePlan: 'Mantenha a distância intermediária, fustigue a linha de cintura e quebre os bloqueios com chutes de canela estalados.',
      pros: 'Poder nos Chutes · Calejamento · Impacto',
      cons: 'Velocidade de mãos · Defesa de quedas do clinch',
      radarValues: [86, 90, 86, 88, 90, 99, 84, 94]
    }
  ],
  judo: [
    {
      id: 'judo_seoi_nage',
      name: 'Seoi-Nage / Ippon Veloz',
      subtitle: 'Giro de Quadril & Alavanca de Ombro',
      desc: 'Entrada ultrarrápida sob o centro de gravidade do oponente. Uma fração de segundo é suficiente para projetar de costas ao tatame.',
      gamePlan: 'Aproveite o empurrão do adversário, gire o quadril em velocidade e arremesse com Ippon-Seoi-Nage perfeito.',
      pros: 'Velocidade de Entrada · Alavanca · Ippon',
      cons: 'Resistência contra oponentes muito mais pesados',
      radarValues: [92, 85, 96, 80, 82, 98, 88, 80]
    },
    {
      id: 'judo_ashi_waza',
      name: 'Ashi-Waza / Varreduras & Rasteiras',
      subtitle: 'Desequilíbrio, Timing & Osoto-Gari',
      desc: 'Usa a sensibilidade dos pés para varrer o apoio do rival no instante exato em que ele transfere o peso corporal.',
      gamePlan: 'Force o adversário a se mover pelo tatame, quebre o ritmo dele e aplique Deashi-Harai ou Osoto-Gari no contra-passo.',
      pros: 'Coordenação · Timing · Economia de Energia',
      cons: 'Força bruta estática de clinch',
      radarValues: [96, 90, 92, 82, 78, 92, 94, 82]
    },
    {
      id: 'judo_kumi_kata',
      name: 'Kumi-Kata / Pegada de Ferro',
      subtitle: 'Controle de Lapela, Manga & Pressão',
      desc: 'Vence as lutas antes mesmo do primeiro arremesso. Domina as pegadas no judogi, anula a mão boa do rival e impõe ritmo inabalável.',
      gamePlan: 'Destrua a pegada do oponente com puxadas firmes, trave a gola alta dele e force erros por advertência ou quedas calculadas.',
      pros: 'Força Estática · Pegada / Kumi-Kata · Controle Tático',
      cons: 'Velocidade de transição acrobática',
      radarValues: [90, 88, 78, 88, 96, 88, 99, 82]
    },
    {
      id: 'judo_ne_waza',
      name: 'Ne-Waza / Solo & Imobilização',
      subtitle: 'Queda Rápida, Osaekomi & Juji-Gatame',
      desc: 'Não perde tempo em disputas longas em pé. Puxa ou derruba e imediatamente transita para a imobilização de 20 segundos ou chave de braço.',
      gamePlan: 'Ataque com queda baixa e já caia com o peito colado no Osaekomi-waza até o cronômetro zerar o Ippon.',
      pros: 'Ne-waza / Chão · Finalizações · Transições',
      cons: 'Arremessos plásticos de grande amplitude',
      radarValues: [90, 84, 85, 84, 88, 85, 90, 98]
    },
    {
      id: 'judo_uchi_mata',
      name: 'Uchi-Mata / Grande Amplitude',
      subtitle: 'Projeção Aérea & Força Física',
      desc: 'Atleta imponente fisicamente que arremessa os oponentes pelos ares com a perna entre as coxas em um Uchi-Mata espetacular.',
      gamePlan: 'Encurte a postura, erga o adversário pela gola e finalize a rotação no ar com autoridade máxima.',
      pros: 'Força Física · Amplitude de Queda · Impacto',
      cons: 'Consumo de gás contra judocas velozes',
      radarValues: [86, 84, 82, 90, 98, 97, 92, 82]
    }
  ],
  wrestling: [
    {
      id: 'wrestling_freestyle',
      name: 'Freestyle / Double Leg Explosivo',
      subtitle: 'Entradas Baixas, Nível de Quadril & Velocidade',
      desc: 'Muda de nível em frações de segundo, mergulha nas pernas do oponente e completa o Double Leg com elevação espetacular.',
      gamePlan: 'Finte na cabeça, baixe o nível subitamente, capture as duas pernas e passe para as costas somando pontos de queda.',
      pros: 'Velocidade de Ataque · Double Leg · Explosão',
      cons: 'Controle prolongado no chão estilo folk',
      radarValues: [88, 90, 98, 85, 92, 99, 86, 84]
    },
    {
      id: 'wrestling_greco',
      name: 'Greco-Romana / Suplex & Tronco',
      subtitle: 'Clinch Colado, Cinturada & Arremessos Aéreos',
      desc: 'Especialista na luta da cintura para cima. Pressão esmagadora de peito no peito, underhooks dominantes e suplexes aéreos devastadores.',
      gamePlan: 'Ganhe os underhooks no clinch, dobre a postura do rival e lance um suplex de grande amplitude sobre os ombros.',
      pros: 'Força Estática · Suplex / Quedas Altas · Queixo',
      cons: 'Sem ataques diretos às pernas',
      radarValues: [86, 88, 80, 94, 99, 95, 92, 94]
    },
    {
      id: 'wrestling_folkstyle',
      name: 'Folkstyle / Mat Wrestling & Rides',
      subtitle: 'Pressão no Tapete, Quebra de Pulso & Rides',
      desc: 'Mestre universitário da luta de tapete. Quando coloca por baixo, monta um cadeado humano com controle de pulsos e pernas.',
      gamePlan: 'Derrube e não dê espaço para o adversário respirar; grampeie os pulsos dele e force o cansaço mental e físico.',
      pros: 'Top Control · Cardio Monstruoso · Pressão',
      cons: 'Finalizações diretas (regras olímpicas amadoras)',
      radarValues: [92, 99, 85, 90, 90, 92, 94, 99]
    },
    {
      id: 'wrestling_sprawl_brawl',
      name: 'Sprawl & Brawl / Defesa de Ferro',
      subtitle: 'Sprawl Pesado, Whizzer & Contra-Ataques',
      desc: 'Impossível de ser derrubado. Seu quadril pesa uma tonelada na cabeça de quem tenta entrar nas pernas, punindo nas reversões.',
      gamePlan: 'Espere o rival tentar a queda, marrete o sprawl com o peito nas costas dele, bloqueie com o whizzer e tome a posição dominante.',
      pros: 'Sprawl / Defesa de Queda · Toughness · Estabilidade',
      cons: 'Iniciativa ofensiva lenta na longa distância',
      radarValues: [90, 92, 86, 92, 94, 88, 99, 90]
    },
    {
      id: 'wrestling_pin_hunter',
      name: 'Caçador de Pin / Encostamento',
      subtitle: 'Half Nelson, Cradle & Encosto de Escápulas',
      desc: 'Não se contenta em vencer nos pontos. Seu único objetivo é girar o oponente com o Cradle até encostar as duas escápulas no tapete.',
      gamePlan: 'Aplique pressão descendente na nuca, trave o cradle travando joelho e cabeça e vire o oponente para o pin fatal.',
      pros: 'Poder de Decisão · Força de Alavanca · Oportunismo',
      cons: 'Gasto excessivo de energia em tentativas frustradas',
      radarValues: [88, 86, 84, 88, 96, 92, 88, 96]
    }
  ],
  kickboxing: [
    {
      id: 'kb_dutch',
      name: 'Dutch Style / Boxe & Low Kicks',
      subtitle: 'Combinações Holandesas & Chute na Coxa',
      desc: 'A clássica escola de ouro holandesa: socos em sequência 1-2-gancho no fígado terminando sempre com canelada pesada na coxa.',
      gamePlan: 'Feche os espaços com sequências de punho no rosto e finalize cada combinação com uma canelada potente na perna de apoio.',
      pros: 'Poder de Combinação · Pressão · Nocaute',
      cons: 'Esquiva de tronco · Chutes acrobáticos',
      radarValues: [88, 88, 88, 90, 92, 95, 94, 88]
    },
    {
      id: 'kb_outfighter',
      name: 'K-1 Out-Fighter / Elusivo',
      subtitle: 'Controle de Alcance, Blitz & Chutes Altos',
      desc: 'Move-se em círculos pela ponta dos pés, atrai o oponente para o vazio e conecta chutes na cabeça em velocidade relâmpago.',
      gamePlan: 'Mantenha a distância com chutes frontais, circule e dispare o high kick de encontro no momento em que ele avançar.',
      pros: 'Velocidade · Distância · Reflexos',
      cons: 'Trocação franca no clinch',
      radarValues: [95, 92, 96, 78, 76, 92, 85, 96]
    },
    {
      id: 'kb_pressure_knee',
      name: 'Pressão & Joelhada Frontal',
      subtitle: 'Guarda Alta Fechada & Joelhada no Plexo',
      desc: 'Avança com guarda dupla de concha, absorve os golpes nas luvas e perfura a guarda do rival com joelhadas diretas no estômago.',
      gamePlan: 'Encurrale nas cordas com guarda intransponível e crave joelhadas retas no plexo solar até minar o fôlego do oponente.',
      pros: 'Queixo / Absorção · Joelhadas · Pressão',
      cons: 'Velocidade de esquiva',
      radarValues: [85, 94, 82, 94, 92, 88, 92, 86]
    },
    {
      id: 'kb_heavy_slugger',
      name: 'Heavy Hitter / One-Shot KO',
      subtitle: 'Mãos de Marreta & Canelada Letal',
      desc: 'Potência brutal em ambos os braços e pernas. Troca golpes na certeza de que sua mão conecta mais pesado que a do rival.',
      gamePlan: 'Atraia o adversário para a troca aberta e solte um overhand ou cruzado com peso do corpo para apagar o rival.',
      pros: 'Potência Absoluta · Intimidação · Queixo',
      cons: 'Cardio para rounds finais · Volume técnico',
      radarValues: [78, 80, 84, 96, 98, 96, 98, 75]
    }
  ]
};

// Histórias de Origem (Passo 5)
export const BACKGROUND_STORIES = [
  {
    id: 'periferia',
    name: 'Cria da Favela / Periferia',
    subtitle: 'Raça, Fome & Coração',
    desc: 'Cresceu tendo que se defender cedo. A academia do bairro foi o refúgio contra caminhos errados.',
    benefits: 'Bônus: +10 Queixo, +10 Fome de Vitória, começa com pouco dinheiro ($250), mas gana infinita.'
  },
  {
    id: 'traditional_clan',
    name: 'Herdeiro de Clã Marcial',
    subtitle: 'Linhagem & Disciplina de Berço',
    desc: 'Filho ou neto de mestre lendário. Respira tatame desde os 4 anos de idade sob rigorosa cobrança.',
    benefits: 'Bônus: +8 Fight IQ, +10 Técnica, lealdade inicial alta com treinadores conceituados.'
  },
  {
    id: 'college_athlete',
    name: 'Atleta Universitário / Bolsista',
    subtitle: 'Condicionamento & Metodologia',
    desc: 'Base forjada no wrestling escolar ou atletismo de alta intensidade com acompanhamento físico.',
    benefits: 'Bônus: +12 Cardio, +8 Força Física, facilidade para controlar corte de peso.'
  },
  {
    id: 'street_brawler',
    name: 'Ex-Brigador de Rua Regenerado',
    subtitle: 'Mãos Pesadas & Instinto Cru',
    desc: 'Famoso por brigas violentas antes de encontrar a disciplina e o respeito das artes marciais.',
    benefits: 'Bônus: +12 Potência de Golpe, +6 Agressividade, necessita de foco no controle emocional.'
  }
];
