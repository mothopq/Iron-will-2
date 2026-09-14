// OpponentGenerator.js - Gerador avançado de oponentes com histórias, estilos autênticos e pontos fortes
import { LOCATIONS_DATA, getStatesByCountry, getCitiesByState } from '../data/locations.js';

export const MODALITY_STYLES = {
  boxing: [
    { id: 'boxer_slugger', name: 'Pegador / Slugger', strength: '🔥 Força Bruta & Nocaute Devastador', bias: { punchPower: 1.35, strength: 1.25, chin: 1.15, speed: 0.85, defense: 0.85 } },
    { id: 'boxer_outfighter', name: 'Out-Boxer / Estilista', strength: '⚡ Jab Cirúrgico & Controle de Distância', bias: { boxing: 1.3, distanceControl: 1.3, reflexes: 1.2, speed: 1.15, punchPower: 0.85 } },
    { id: 'boxer_swarmer', name: 'Swarmer / Pressão Infight', strength: '🫁 Cardio Infinito & Volume no Corpo', bias: { cardio: 1.35, aggression: 1.3, chin: 1.2, speed: 1.1, distanceControl: 0.85 } },
    { id: 'boxer_counter', name: 'Contragolpeador Elusivo', strength: '🧠 Reflexos Felinos & Timing Cirúrgico', bias: { reflexes: 1.35, defense: 1.3, boxing: 1.2, punchPower: 1.1, cardio: 0.9 } },
    { id: 'boxer_puncher', name: 'Boxer-Puncher Completo', strength: '🛡️ Queixo de Aço & Técnica Equilibrada', bias: { boxing: 1.2, punchPower: 1.2, chin: 1.2, cardio: 1.1, speed: 1.1 } }
  ],
  jiu_jitsu: [
    { id: 'bjj_guardeiro', name: 'Guardeiro Elástico & Flexível', strength: '🐍 Guarda Impenetrável & Triângulos', bias: { bjj: 1.4, coordination: 1.25, reflexes: 1.15, strength: 0.85, boxing: 0.5 } },
    { id: 'bjj_passador', name: 'Passador de Pressão & Amasso', strength: '🔥 Força no Top Control & Joelho na Barriga', bias: { bjj: 1.35, strength: 1.3, cardio: 1.2, speed: 0.9, boxing: 0.5 } },
    { id: 'bjj_leglocker', name: 'Caçador de Leg Locks (No-Gi)', strength: '⚡ Ataques Rápidos de Calcanhar e Chaves de Pé', bias: { bjj: 1.45, reflexes: 1.25, coordination: 1.2, chin: 0.9, boxing: 0.5 } },
    { id: 'bjj_berimbolo', name: 'Jogo Moderno & Berimbolo', strength: '🧠 Pegada de Costas Acrobática & Inversões', bias: { bjj: 1.35, speed: 1.25, coordination: 1.3, strength: 0.9, boxing: 0.5 } },
    { id: 'bjj_wrestler', name: 'Quedador Agressivo (Judô/Wrestling)', strength: '🛡️ Quedas Explosivas & Defesa Intransponível', bias: { wrestling: 1.35, bjj: 1.25, strength: 1.25, cardio: 1.15, boxing: 0.6 } }
  ],
  mma: [
    { id: 'mma_striker', name: 'Striker Nocauteador', strength: '🔥 Mãos Pesadas & Defesa de Quedas', bias: { boxing: 1.3, kicking: 1.2, punchPower: 1.3, wrestling: 1.1, bjj: 0.8 } },
    { id: 'mma_wrestler', name: 'Wrestler Dominante', strength: '🫁 Quedas Implacáveis & Ground and Pound', bias: { wrestling: 1.4, strength: 1.3, cardio: 1.25, kicking: 0.7, boxing: 0.85 } },
    { id: 'mma_grappler', name: 'Especialista em Finalizações', strength: '🐍 Transições no Chão & Submissions Rápidas', bias: { bjj: 1.4, wrestling: 1.2, coordination: 1.2, punchPower: 0.85, kicking: 0.7 } },
    { id: 'mma_allrounder', name: 'Atleta Híbrido Completo', strength: '🧠 QI Marcial & Fluidez em Todas as Áreas', bias: { boxing: 1.15, wrestling: 1.15, bjj: 1.15, cardio: 1.2, speed: 1.15 } },
    { id: 'mma_brawler', name: 'Brigador de Cage & Queixo', strength: '🛡️ Queixo de Titânio & Trocação Franca', bias: { punchPower: 1.3, chin: 1.35, cardio: 1.15, defense: 0.85, reflexes: 0.9 } }
  ],
  muay_thai: [
    { id: 'mt_muay_femur', name: 'Muay Femur (Técnico Cirúrgico)', strength: '⚡ Esquivas Milimétricas & Teep Preciso', bias: { kicking: 1.3, reflexes: 1.35, distanceControl: 1.3, speed: 1.2, chin: 0.9 } },
    { id: 'mt_muay_khao', name: 'Muay Khao (Guerreiro dos Joelhos)', strength: '🫁 Clinch Asfixiante & Joelhadas nas Costelas', bias: { clinch: 1.4, cardio: 1.35, strength: 1.25, chin: 1.2, boxing: 0.85 } },
    { id: 'mt_muay_mat', name: 'Muay Mat (Demolidor de Punhos)', strength: '🔥 Cruzados Explosivos & Low Kicks Cortantes', bias: { punchPower: 1.35, kicking: 1.25, boxing: 1.2, chin: 1.2, defense: 0.85 } },
    { id: 'mt_muay_tae', name: 'Muay Tae (Especialista em Chutes)', strength: '🛡️ Caneladas de Ferro & Bloqueios Sólidos', bias: { kicking: 1.4, defense: 1.25, strength: 1.2, speed: 1.1, wrestling: 0.5 } },
    { id: 'mt_muay_bouk', name: 'Muay Bouk (Tanque de Guerra)', strength: '🔥 Avanço Implacável & Cotoveladas em Linha', bias: { aggression: 1.35, chin: 1.3, punchPower: 1.25, cardio: 1.2, defense: 0.85 } }
  ],
  judo: [
    { id: 'judo_uchimata', name: 'Mestre do Uchi-Mata', strength: '🔥 Alavancas Aéreas & Ippon Espetacular', bias: { judo: 1.4, coordination: 1.3, strength: 1.25, reflexes: 1.15, boxing: 0.4 } },
    { id: 'judo_seoinage', name: 'Especialista em Seoi-Nage', strength: '⚡ Entradas Baixas Explosivas & Velocidade', bias: { judo: 1.35, speed: 1.3, reflexes: 1.25, cardio: 1.2, punchPower: 0.5 } },
    { id: 'judo_kumikata', name: 'Dominador de Pegada (Kumi-Kata)', strength: '🐍 Pegada Sufocante no Judogi & Asfixia', bias: { judo: 1.35, strength: 1.3, defense: 1.3, cardio: 1.15, boxing: 0.4 } },
    { id: 'judo_newaza', name: 'Especialista em Solo (Newaza)', strength: '🧠 Imobilizações Rápidas & Armlocks', bias: { bjj: 1.35, judo: 1.3, coordination: 1.25, chin: 1.1, boxing: 0.4 } },
    { id: 'judo_ashiwaza', name: 'Técnico de Rasteiras (Ashi-Waza)', strength: '🛡️ O-Soto-Gari & Desequilíbrios Perfeitos', bias: { judo: 1.35, reflexes: 1.3, distanceControl: 1.25, speed: 1.2, boxing: 0.4 } }
  ],
  wrestling: [
    { id: 'wrestling_freestyle', name: 'Wrestler Estilo Livre', strength: '⚡ Double-Leg Relâmpago & Quedas Rápidas', bias: { wrestling: 1.4, speed: 1.3, cardio: 1.25, reflexes: 1.2, boxing: 0.4 } },
    { id: 'wrestling_greco', name: 'Luta Greco-Romana', strength: '🔥 Arremessos de Tronco & Clinch Superior', bias: { wrestling: 1.4, strength: 1.35, chin: 1.2, clinch: 1.3, boxing: 0.4 } },
    { id: 'wrestling_power', name: 'Força Bruta & Elevações', strength: '🔥 Quedas de Grande Amplitude & Arremessos', bias: { strength: 1.45, wrestling: 1.35, punchPower: 1.1, speed: 0.85, boxing: 0.4 } },
    { id: 'wrestling_chain', name: 'Chain Wrestler Contínuo', strength: '🫁 Transições Ininterruptas até o Chão', bias: { wrestling: 1.35, cardio: 1.4, coordination: 1.25, reflexes: 1.15, boxing: 0.4 } },
    { id: 'wrestling_mat', name: 'Controle Absoluto de Tapete', strength: '🛡️ Encaixe de Pin & Imobilização Pesada', bias: { wrestling: 1.4, strength: 1.3, defense: 1.3, cardio: 1.2, boxing: 0.4 } }
  ],
  kickboxing: [
    { id: 'kb_k1_pressao', name: 'Striker Estilo K-1', strength: '🔥 Combinações de Punho & Joelhada Voadora', bias: { boxing: 1.25, kicking: 1.25, punchPower: 1.3, knees: 1.3, chin: 1.1 } },
    { id: 'kb_lowkicker', name: 'Caçador de Pernas', strength: '🛡️ Low Kicks Destrutivos que Minam o Apoio', bias: { kicking: 1.4, strength: 1.25, defense: 1.2, cardio: 1.15, wrestling: 0.4 } },
    { id: 'kb_dutch', name: 'Estilo Holandês (Dutch Kickboxing)', strength: '🫁 Volume Intenso de Mãos & Chute Alto', bias: { boxing: 1.3, kicking: 1.25, cardio: 1.3, punchPower: 1.2, reflexes: 1.1 } },
    { id: 'kb_counter', name: 'Sniper de Contragolpe', strength: '⚡ Timing Preciso & Direto de Encontro', bias: { reflexes: 1.35, distanceControl: 1.3, speed: 1.25, boxing: 1.2, chin: 0.95 } },
    { id: 'kb_flashy', name: 'Chutador Imprevisível', strength: '🧠 Chutes Giratórios & Variações Aéreas', bias: { kicking: 1.35, speed: 1.3, coordination: 1.35, reflexes: 1.2, defense: 0.9 } }
  ]
};

// Histórias artesanais autênticas distribuídas por tier e modalidade
const ROSTER_HISTORIES = {
  AMADOR: [
    'Trabalha como entregador de aplicativo durante o dia e treina à noite num galpão simples. Entra no ringue com a fome de quem precisa vencer para pagar o aluguel.',
    'Cria de projeto social da periferia, calçou as luvas aos 13 anos para superar o bullying e hoje é o orgulho de toda a sua comunidade local.',
    'Ex-atleta de atletismo com explosão muscular impressionante. Migrou para as lutas há apenas dois anos e já coleciona nocautes relâmpagos na base.',
    'Irmão caçula de lutadores profissionais respeitados. Cresceu no corner dos mais velhos e agora quer provar que seu talento é ainda maior.',
    'Estudante universitário que usa o dinheiro das bolsas municipais para pagar a faculdade. Luta com inteligência tática apurada e disciplina de ferro.',
    'Garoto tímido fora das cordas, mas um predador impiedoso dentro do combate. Já venceu três torneios regionais de estreantes consecutivos.'
  ],
  MEDIANO: [
    'Veterano cascudo de academia tradicional com mais de 25 lutas oficiais. É o lendário "porteiro da divisão": quem quer chegar ao topo precisa primeiro suportar sua pressão.',
    'Conhecido nos circuitos regionais por possuir um queixo quase desumano. Já levou socos limpos de campeões e continuou marchando para a frente sorrindo.',
    'Ex-campeão metropolitano que já fez guerras de 5 rounds decididas nos pontos. Não se assusta com pressão e sabe amarrar a luta quando o adversário cansa.',
    'Atleta rústico do interior que concilia a roça com treinos diários em sacos pesados. Tem uma força física natural que surpreende os lutadores da capital.',
    'Fez carreira como sparring dos maiores nomes do país e agora decidiu focar no próprio cartel. Experiência de sobra e malícia de ringue em cada clinch.',
    'Especialista em anular os pontos fortes dos favoritos. Já estragou a festa de dezenas de promessas invictas com seu estilo calculista e paciente.'
  ],
  ELITE: [
    'Invicto há 9 combates consecutivos com vitórias fulminantes. Apontado pelos olheiros e comentaristas como o maior prospecto de sua geração.',
    'Campeão estadual da divisão e medalhista em torneios internacionais. Vem de um camp impecável com preparação física de nível olímpico.',
    'Ex-desafiante número 1 que perdeu o cinturão por decisão dividida contestada. Entra em busca de redenção com foco total e determinação inabalável.',
    'Fenômeno técnico que nunca sofreu um knockdown em toda a sua trajetória. Antecipa as combinações adversárias como se lesse o futuro.',
    'Com mais de 80% de vitórias antes do gongo final, é o atleta mais respeitado do circuito nacional. Seus golpes impõem respeito imediato em qualquer adversário.',
    'Campeão do prestigiado torneio nacional, patrocinado pelas maiores marcas esportivas. Um atleta completo que não possui brechas no jogo.'
  ],
  MUNDIAL: [
    'Lenda viva das artes marciais e astro das grandes transmissões mundiais em pay-per-view. Uma máquina de combate venerada por milhões de fãs pelo mundo.',
    'Detentor de múltiplos cinturões mundiais e rei peso-por-peso. Enfrentou e derrotou os melhores do planeta em Tóquio, Las Vegas e Nova York.',
    'Monstro sagrado com 90% de taxa de nocautes ou finalizações. Suas lutas são espetáculos mundiais decididos pela potência da sua pegada.',
    'Campeão olímpico e mundial consecutivo. Sua precisão técnica e frieza implacável são estudadas como manual de perfeição por mestres de todos os continentes.',
    'Um dos campeões mais dominantes da história moderna. Nunca perdeu uma luta por interrupção e impõe um ritmo que quebra o psicológico de qualquer rival.'
  ]
};

const FIRST_NAMES = {
  Brasil: [
    'Lucas', 'Carlos', 'Gabriel', 'Rafael', 'Matheus', 'Thiago', 'Anderson', 'José', 'Rodrigo', 'Wanderley',
    'Renato', 'Danilo', 'Felipe', 'Murilo', 'Enzo', 'Davi', 'Caio', 'Vitor', 'Charles', 'Alex',
    'Gilbert', 'Deiveson', 'Glover', 'Lyoto', 'Maurício', 'Demian', 'Ronaldo', 'Fabrício', 'Robson',
    'Hebert', 'Esquiva', 'Acelino', 'Diego', 'Bruno', 'Leonardo', 'Marcos', 'Gustavo', 'Eduardo',
    'Leandro', 'Marcio', 'Claudio', 'Fabio', 'Ricardo', 'Samuel', 'Igor', 'Alan', 'Wagner', 'Everton',
    'Pedro', 'Henrique', 'Breno', 'Cauã', 'Luciano', 'Jonas', 'Cleber', 'Adriano', 'Julio', 'Cesar'
  ],
  Argentina: [
    'Santiago', 'Guido', 'Lautaro', 'Esteban', 'Emiliano', 'Facundo', 'Juan', 'Mateo', 'Nicolás', 'Lucas',
    'Rodrigo', 'Agustín', 'Tomás', 'Joaquín', 'Leandro', 'Mariano', 'Sebastián', 'Franco', 'Diego', 'Martín'
  ],
  Colômbia: [
    'Carlos', 'Diego', 'Andrés', 'Jhon', 'Brayan', 'Camilo', 'Sebastián', 'Alejandro', 'Fabián', 'Cristian', 'David', 'Mateo'
  ],
  Chile: [
    'Ignacio', 'Sebastián', 'Felipe', 'Matías', 'Diego', 'Cristóbal', 'Bastián', 'Gonzalo', 'Rodrigo', 'Claudio'
  ],
  Uruguai: [
    'Eduardo', 'Gastón', 'Martín', 'Bruno', 'Matías', 'Federico', 'Joaquín', 'Alfonso', 'Maximiliano', 'Diego'
  ],
  EUA: [
    'Jon', 'Dustin', 'Max', 'Justin', 'Colby', 'Sean', 'Cody', 'Michael', 'Alexander', 'Daniel',
    'Derrick', 'Marcus', 'Brandon', 'Corey', 'Bryce', 'Calvin', 'Kevin', 'Curtis', 'Brian', 'Anthony'
  ],
  Rússia: [
    'Islam', 'Khabib', 'Fedor', 'Petr', 'Magomed', 'Sergei', 'Zabit', 'Shamil', 'Ilyas', 'Viktor',
    'Igor', 'Buvaisar', 'Movsar', 'Tagir', 'Abubakar', 'Said', 'Askar', 'Anatoly', 'Rustam', 'Dmitry'
  ],
  Tailândia: [
    'Buakaw', 'Saenchai', 'Rodtang', 'Superlek', 'Sitthichai', 'Nong-O', 'Petchmorakot', 'Somchai',
    'Tawanchai', 'Capitan', 'Samy', 'Sangmanee', 'Yodwicha', 'Panpayak', 'Kulabdam', 'Superbon'
  ],
  Japão: [
    'Kazushi', 'Takanori', 'Shinya', 'Kyoji', 'Naoya', 'Tenshin', 'Yushin', 'Tatsuro', 'Kosei', 'Shohei',
    'Ren', 'Yuki', 'Hiroto', 'Kenji', 'Takashi', 'Ryo', 'Kazuki', 'Daiki', 'Masato', 'Takeru'
  ],
  México: [
    'Saúl', 'Juan', 'Julio', 'Marco', 'Érik', 'Salvador', 'Brandon', 'Yair', 'Canelo', 'Mateo',
    'Alejandro', 'Carlos', 'Diego', 'Javier', 'Emiliano', 'Miguel', 'Óscar', 'Héctor', 'Raúl', 'Rubén'
  ],
  Cuba: [
    'Yoel', 'Guillermo', 'Erislandy', 'Robeisy', 'Yordenis', 'Lázaro', 'Julio César', 'Arlen', 'Roniel', 'Andy'
  ],
  França: [
    'Ciryl', 'Benoît', 'Nassourdine', 'Teddy', 'Alexis', 'Julien', 'Antoine', 'Kévin', 'Fares', 'Morgan'
  ],
  'Reino Unido': [
    'Leon', 'Tom', 'Michael', 'Paddy', 'Arnold', 'Darren', 'Jack', 'Paul', 'Dan', 'Nathaniel'
  ]
};

const LAST_NAMES = {
  Brasil: [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Ribeiro', 'Barbosa', 'Machida',
    'Nogueira', 'Guimarães', 'Alencar', 'Menezes', 'Cavalcanti', 'Carvalho', 'Almeida', 'Gomes', 'Martins',
    'Araújo', 'Melo', 'Rocha', 'Costa', 'Nascimento', 'Teixeira', 'Moreira', 'Correia', 'Cardoso', 'Dias',
    'Ramos', 'Duarte', 'Freitas', 'Vieira', 'Barros', 'Moura', 'Batista', 'Pinto', 'Pacheco', 'Campos', 'Fonseca',
    'Medeiros', 'Borges', 'Farias', 'Coelho', 'Bezerra', 'Magalhães', 'Tavares', 'Barreto', 'Dantas', 'Figueiredo'
  ],
  Argentina: [
    'Ponzinibbio', 'Cannetti', 'Rossi', 'Fernández', 'Gómez', 'Álvarez', 'Romero', 'Díaz', 'Benítez',
    'Torres', 'Acuña', 'Martínez', 'Sosa', 'López', 'Castro', 'Giménez', 'Carrizo', 'Morales'
  ],
  Colômbia: [
    'Morales', 'Rentería', 'Murillo', 'Ospina', 'Henao', 'García', 'Valencia', 'Montoya', 'Castaño', 'Zapata'
  ],
  Chile: [
    'Bahamondes', 'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Morales'
  ],
  Uruguai: [
    'Rodríguez', 'González', 'Pérez', 'Suárez', 'Cavani', 'Godín', 'García', 'Cáceres', 'Torres', 'Varela'
  ],
  EUA: [
    'Poirier', 'Holloway', 'Gaethje', 'Jones', 'Covington', 'O\'Malley', 'Johnson', 'Smith', 'Williams', 'Miller',
    'Davis', 'Chandler', 'Ferguson', 'Sandhagen', 'Sterling', 'Cormier', 'Usman', 'Burns', 'Ceijudo', 'Blaydes'
  ],
  Rússia: [
    'Makhachev', 'Nurmagomedov', 'Emelianenko', 'Yan', 'Ankalaev', 'Pavlovich', 'Magomedov', 'Volkov',
    'Bogomolov', 'Evloev', 'Chimaev', 'Sharaputdinov', 'Khabibilov', 'Umarov', 'Saitiev', 'Karelin'
  ],
  Tailândia: [
    'Banchamek', 'P.K.Saenchai', 'Jitmuangnon', 'Kiatmoo9', 'Fairtex', 'Sor Rungvisai', 'Yokkao', 'Singpatong',
    'Muaythaigym', 'Por Pramuk', 'Sitmonchai', 'Sor Vorapin'
  ],
  Japão: [
    'Sakuraba', 'Gomi', 'Aoki', 'Horiguchi', 'Inoue', 'Nasukawa', 'Ono', 'Takahashi', 'Matsunaga', 'Taira',
    'Asakura', 'Miura', 'Yamamoto', 'Watanabe', 'Tanaka', 'Ito', 'Nakamura', 'Kobayashi', 'Sato', 'Suzuki'
  ],
  México: [
    'Álvarez', 'Chávez', 'Barrera', 'Morales', 'Sánchez', 'Moreno', 'Rodríguez', 'López', 'Rosales',
    'Hernández', 'Gutiérrez', 'Navarrete', 'Valdez', 'Márquez', 'Estrada', 'Castillo', 'Corona', 'Vargas'
  ],
  Cuba: [
    'Romero', 'Rigondeaux', 'Lara', 'Ramírez', 'Ugás', 'La Cruz', 'Savón', 'Iglesias', 'Cruz', 'Álvarez'
  ],
  França: [
    'Gane', 'Saint Denis', 'Imavov', 'Riner', 'Dupont', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard'
  ],
  'Reino Unido': [
    'Edwards', 'Aspinall', 'Bisping', 'Pimblett', 'Allen', 'Till', 'Shore', 'Wood', 'Hardy', 'McCann'
  ]
};

const NICKNAMES_BR = [
  'O Pitbull', 'Navalha', 'Martelo de Ferro', 'O Cirurgião', 'Demolidor',
  'A Sombra', 'Sniper', 'Anaconda', 'Tornado', 'Carniça', 'O Exterminador',
  'Mão de Pedra', 'General', 'Cobra Assassina', 'Fantasma', 'Relâmpago',
  'Trator', 'Fenômeno', 'Dinamite', 'Monstro', 'Leão', 'Canela de Ferro',
  'Caveira', 'Cachorro Louco', 'Tubarão', 'Pantera', 'Furacão', 'O Açougueiro',
  'Fera Negra', 'Gladiador', 'Carreta', 'Queixo de Aço', 'O Demônio'
];

const NICKNAMES_INTL = [
  'The Predator', 'The Hammer', 'The Assassin', 'The Eagle', 'The Diamond',
  'Bones', 'Iron', 'The Iceman', 'The Last Samurai', 'El Matador', 'El Terrible',
  'The Dragon', 'The Tiger', 'Golden Boy', 'The Russian Tank', 'The Flash',
  'The Phenom', 'War Machine', 'The Sniper', 'The Viper', 'The Spartan'
];

const PERSONALITIES = [
  'Showman Provocador / Trash Talker',
  'Frio, Cirúrgico & Implacável',
  'Guerreiro Tradicional com Honra Marcial',
  'Brutamontes Intimidador & Agressivo',
  'Veterano Resiliente, Calmo & Calculista'
];

export const MODALITY_LABELS = {
  boxing: 'Boxe (Nobre Arte)',
  jiu_jitsu: 'Jiu-Jitsu (BJJ)',
  mma: 'MMA (Artes Marciais Mistas)',
  muay_thai: 'Muay Thai (8 Armas)',
  judo: 'Judô Olímpico',
  wrestling: 'Wrestling (Luta Olímpica)',
  kickboxing: 'Kickboxing (K-1 Rules)'
};

export function getAlternativeModality(currentModality) {
  const allModalities = ['boxing', 'jiu_jitsu', 'mma', 'muay_thai', 'judo', 'wrestling', 'kickboxing'];
  const rivals = allModalities.filter(m => m !== currentModality);
  return rivals[Math.floor(Math.random() * rivals.length)];
}

// ---------------------------------------------------------------------------
// RESOLUÇÃO GEOGRÁFICA DO JOGADOR
// ---------------------------------------------------------------------------
export function resolvePlayerLocation(player) {
  const country = player?.nationality || 'Brasil';
  const countryData = LOCATIONS_DATA[country] || LOCATIONS_DATA['Brasil'];
  const states = countryData.states || [];

  let rawState = (player?.birthState || '').trim();
  let foundState = null;

  if (rawState) {
    foundState = states.find(s =>
      rawState.toLowerCase().includes(s.name.toLowerCase()) ||
      rawState.toLowerCase().includes(`(${s.code.toLowerCase()})`) ||
      rawState.toLowerCase() === s.code.toLowerCase()
    );
  }

  if (!foundState) {
    const defCode = (countryData.defaultState || 'SP').toLowerCase();
    foundState = states.find(s => s.code.toLowerCase() === defCode) || states[0] || {
      name: 'São Paulo',
      code: 'SP',
      cities: ['São Paulo', 'Campinas', 'Santos', 'Santo André', 'São Bernardo do Campo', 'Ribeirão Preto']
    };
  }

  const playerCity = player?.birthCity || (foundState.cities && foundState.cities[0]) || 'São Paulo';

  return {
    country: countryData.country || country,
    state: foundState,
    stateName: foundState.name,
    stateCode: foundState.code,
    cities: foundState.cities || [],
    playerCity: playerCity
  };
}

// ---------------------------------------------------------------------------
// GERADOR GEOGRÁFICO DE OPONENTES POR CATEGORIA DE CAMPEONATO
// Garante que campeonatos municipais, estaduais e nacionais NUNCA tenham gringos!
// ---------------------------------------------------------------------------
export function generateOpponentLocation(player, options = {}) {
  const category = (options.category || '').toLowerCase();
  const modality = options.modality || player?.modality || 'boxing';
  const playerLoc = resolvePlayerLocation(player);
  const playerCountry = playerLoc.country; // ex: 'Brasil'
  const playerState = playerLoc.state;     // ex: { name: 'São Paulo', code: 'SP', cities: [...] }
  const playerCity = playerLoc.playerCity; // ex: 'São Paulo'

  // 1. LOCAL / MUNICIPAL / INTERMUNICIPAL / BASE REGIONAL ('local', 'base')
  // Regra: 100% do mesmo país e do mesmo estado do jogador! Cidades rivais do mesmo estado.
  if (category === 'local' || category === 'base' || category === 'municipal' || category === 'intermunicipal') {
    const stateCities = (playerState.cities && playerState.cities.length > 0)
      ? playerState.cities
      : ['São Paulo', 'Campinas', 'Santos', 'Santo André', 'Sorocaba', 'Ribeirão Preto'];

    const rivalCities = stateCities.filter(c => c.toLowerCase() !== playerCity.toLowerCase());
    const chosenCity = rivalCities.length > 0
      ? rivalCities[Math.floor(Math.random() * rivalCities.length)]
      : stateCities[0];

    return {
      country: playerCountry,
      stateName: playerState.name,
      stateCode: playerState.code,
      city: chosenCity,
      originDisplay: `${chosenCity}, ${playerState.code} (${playerCountry})`,
      isForeign: false
    };
  }

  // 2. ESTADUAL (Seletiva Estadual, Campeonato Estadual Oficial, Supercopa Estadual) ('estadual')
  // Regra: 100% do mesmo país e do mesmo estado do jogador! Representantes das cidades daquele estado.
  if (category === 'estadual') {
    const stateCities = (playerState.cities && playerState.cities.length > 0)
      ? playerState.cities
      : ['São Paulo', 'Campinas', 'Santos', 'Santo André', 'Sorocaba', 'Ribeirão Preto'];

    const chosenCity = stateCities[Math.floor(Math.random() * stateCities.length)];

    return {
      country: playerCountry,
      stateName: playerState.name,
      stateCode: playerState.code,
      city: chosenCity,
      originDisplay: `${chosenCity}, ${playerState.code} (${playerCountry})`,
      isForeign: false
    };
  }

  // 3. NACIONAL (Interestadual, Copa Brasil, Campeonato Brasileiro Oficial, Nacional Pro) ('nacional')
  // Regra: 100% do mesmo país do jogador (Brasil)! ZERO estrangeiros!
  // Representa a elite de outros estados da federação brasileira.
  if (category === 'nacional') {
    const countryData = LOCATIONS_DATA[playerCountry] || LOCATIONS_DATA['Brasil'];
    const allStates = countryData.states || [playerState];

    // 85% de probabilidade de ser de outro estado para representar o confronto interestadual nacional
    const otherStates = allStates.filter(s => s.code !== playerState.code);
    const chosenState = (otherStates.length > 0 && Math.random() < 0.85)
      ? otherStates[Math.floor(Math.random() * otherStates.length)]
      : playerState;

    const chosenCities = (chosenState.cities && chosenState.cities.length > 0)
      ? chosenState.cities
      : ['Belo Horizonte', 'Rio de Janeiro', 'Curitiba', 'Salvador', 'Porto Alegre'];
    const chosenCity = chosenCities[Math.floor(Math.random() * chosenCities.length)];

    return {
      country: playerCountry,
      stateName: chosenState.name,
      stateCode: chosenState.code,
      city: chosenCity,
      originDisplay: `${chosenCity}, ${chosenState.code} (${playerCountry})`,
      isForeign: false
    };
  }

  // 4. CONTINENTAL (Copa Mercosul, Sul-Americano Oficial, Pan-Americano) ('continental')
  // Regra: Países da América do Sul e continente latino!
  if (category === 'continental') {
    const continentalPool = [
      { country: 'Brasil', weight: 25 },
      { country: 'Argentina', weight: 25 },
      { country: 'Colômbia', weight: 15 },
      { country: 'Chile', weight: 12 },
      { country: 'Uruguai', weight: 10 },
      { country: 'México', weight: 13 }
    ];

    const totalWeight = continentalPool.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let pickedCountry = 'Argentina';
    for (const item of continentalPool) {
      if (rand < item.weight) {
        pickedCountry = item.country;
        break;
      }
      rand -= item.weight;
    }

    if (pickedCountry === playerCountry) {
      const countryData = LOCATIONS_DATA[playerCountry] || LOCATIONS_DATA['Brasil'];
      const allStates = countryData.states || [playerState];
      const otherStates = allStates.filter(s => s.code !== playerState.code);
      const chosenState = otherStates.length > 0 ? otherStates[Math.floor(Math.random() * otherStates.length)] : playerState;
      const chosenCity = chosenState.cities[Math.floor(Math.random() * chosenState.cities.length)];
      return {
        country: playerCountry,
        stateName: chosenState.name,
        stateCode: chosenState.code,
        city: chosenCity,
        originDisplay: `${chosenCity}, ${chosenState.code} (${playerCountry})`,
        isForeign: false
      };
    }

    const southAmericanCities = {
      'Argentina': ['Buenos Aires', 'Córdoba', 'Rosário', 'Mendoza', 'Mar del Plata', 'La Plata'],
      'Colômbia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'],
      'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'Antofagasta', 'Viña del Mar'],
      'Uruguai': ['Montevidéu', 'Punta del Este', 'Salto', 'Paysandú', 'Maldonado'],
      'México': ['Cidade do México', 'Guadalajara', 'Tijuana', 'Monterrey', 'Culiacán', 'Puebla']
    };

    const cList = southAmericanCities[pickedCountry] || ['Metrópole'];
    const chosenCity = cList[Math.floor(Math.random() * cList.length)];

    return {
      country: pickedCountry,
      stateName: '',
      stateCode: '',
      city: chosenCity,
      originDisplay: `${chosenCity} (${pickedCountry})`,
      isForeign: true
    };
  }

  // 5. LUTA LIVRE / DESAFIO DE ESTILOS ('luta_livre')
  if (category === 'luta_livre') {
    const oppTier = options.tier || 'AMADOR';
    if (oppTier === 'AMADOR') {
      return generateOpponentLocation(player, { ...options, category: 'local' });
    }
    if (oppTier === 'MEDIANO') {
      return generateOpponentLocation(player, { ...options, category: 'nacional' });
    }
    if (oppTier === 'ELITE') {
      return Math.random() < 0.5
        ? generateOpponentLocation(player, { ...options, category: 'nacional' })
        : generateOpponentLocation(player, { ...options, category: 'continental' });
    }
    // MUNDIAL: prossegue para o pool internacional
  }

  // 6. MUNDIAL / UFC / OLIMPÍADAS / INTERNACIONAL
  // Regra: Atletas de elite mundial condizentes com a tradição da modalidade
  const natPool = modality === 'muay_thai'
    ? ['Tailândia', 'Brasil', 'Tailândia', 'França', 'EUA', 'Rússia', 'Japão']
    : modality === 'judo'
    ? ['Japão', 'Brasil', 'Rússia', 'França', 'Cuba', 'Japão']
    : modality === 'wrestling'
    ? ['Rússia', 'EUA', 'Cuba', 'Brasil', 'Rússia', 'EUA']
    : modality === 'boxing'
    ? ['EUA', 'México', 'Cuba', 'Rússia', 'Brasil', 'EUA', 'Reino Unido']
    : modality === 'jiu_jitsu'
    ? ['Brasil', 'Brasil', 'EUA', 'EUA', 'Rússia', 'Japão']
    : ['Brasil', 'EUA', 'Rússia', 'México', 'Japão', 'Tailândia', 'Cuba'];

  const chosenCountry = options.nationality || natPool[Math.floor(Math.random() * natPool.length)];

  const intlCities = {
    'Brasil': ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Belo Horizonte', 'Salvador', 'Manaus', 'Brasília'],
    'EUA': ['Las Vegas', 'Nova York', 'Los Angeles', 'Miami', 'Chicago', 'Denver', 'Houston', 'Filadélfia'],
    'Rússia': ['Makhachkala (Daguestão)', 'Moscou', 'Grozny (Chechênia)', 'São Petersburgo', 'Vladikavkaz', 'Kazan'],
    'Tailândia': ['Bangkok', 'Phuket', 'Chiang Mai', 'Buriram', 'Pattaya', 'Nakhon Ratchasima'],
    'Japão': ['Tóquio', 'Osaka', 'Nagoya', 'Fukuoka', 'Sapporo', 'Yokohama', 'Okinawa'],
    'México': ['Guadalajara', 'Tijuana', 'Cidade do México', 'Culiacán', 'Monterrey', 'Hermosillo'],
    'Cuba': ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara'],
    'França': ['Paris', 'Marselha', 'Lyon', 'Toulouse', 'Nice'],
    'Reino Unido': ['Londres', 'Manchester', 'Liverpool', 'Birmingham', 'Glasgow'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Rosário']
  };

  const cList = intlCities[chosenCountry] || ['Metrópole'];
  const chosenCity = cList[Math.floor(Math.random() * cList.length)];

  return {
    country: chosenCountry,
    stateName: '',
    stateCode: '',
    city: chosenCity,
    originDisplay: `${chosenCity} (${chosenCountry})`,
    isForeign: chosenCountry !== playerCountry
  };
}

export function generateOpponent(player, options = {}) {
  const isCrossStyle = !!options.isCrossStyle || (options.modality && options.modality !== player?.modality);
  const modality = options.modality || (isCrossStyle ? getAlternativeModality(player?.modality) : (player?.modality || 'boxing'));
  const stylesPool = MODALITY_STYLES[modality] || MODALITY_STYLES.boxing;

  // Determina localização e nacionalidade estritamente coerentes com a categoria do torneio
  const oppLoc = generateOpponentLocation(player, { ...options, modality: modality });
  const nat = oppLoc.country;

  const fNames = FIRST_NAMES[nat] || FIRST_NAMES['Brasil'];
  const lNames = LAST_NAMES[nat] || LAST_NAMES['Brasil'];

  const firstName = fNames[Math.floor(Math.random() * fNames.length)];
  const lastName = lNames[Math.floor(Math.random() * lNames.length)];

  // Apelidos em português para atletas brasileiros/locais e internacionais para gringos mundiais
  const nickPool = (!oppLoc.isForeign || nat === 'Brasil') ? NICKNAMES_BR : NICKNAMES_INTL;
  const nickname = Math.random() > 0.25 ? nickPool[Math.floor(Math.random() * nickPool.length)] : '';
  const fullName = nickname ? `${firstName} "${nickname}" ${lastName}` : `${firstName} ${lastName}`;


  const styleObj = stylesPool[Math.floor(Math.random() * stylesPool.length)];
  const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];

  // Nível de habilidade ajustado proporcional ao jogador
  const playerAvgStat = Object.values(player.attributes).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(player.attributes).length);

  // Determina Tier baseado nas opções ou na média
  let oppTier = options.tier;
  if (!oppTier) {
    if (options.rankTier && options.rankTier <= 5) oppTier = 'MUNDIAL';
    else if (options.rankTier && options.rankTier <= 15) oppTier = 'ELITE';
    else if (options.rankTier && options.rankTier <= 35) oppTier = 'MEDIANO';
    else if (options.isTitleFight) oppTier = player.fame > 40 ? 'MUNDIAL' : player.fame > 20 ? 'ELITE' : 'MEDIANO';
    else oppTier = player.record.fights > 7 ? 'MEDIANO' : 'AMADOR';
  }

  let difficultyMod = 1.0;
  let oppTierBadge = '🥋 AMADOR / BASE';
  let minStatFloor = 38;

  if (oppTier === 'MUNDIAL') {
    difficultyMod = 1.36;
    oppTierBadge = '👑 MUNDIAL / LENDA';
    minStatFloor = 76;
  } else if (oppTier === 'ELITE') {
    difficultyMod = 1.22;
    oppTierBadge = '⭐ ELITE CONTENDER';
    minStatFloor = 62;
  } else if (oppTier === 'MEDIANO') {
    difficultyMod = 1.10;
    oppTierBadge = '⚔️ MEDIANO CASCUDO';
    minStatFloor = 50;
  } else {
    difficultyMod = 1.00;
    oppTierBadge = '🥊 AMADOR PROMESSA';
    minStatFloor = 38;
  }

  if (options.isTitleFight) {
    difficultyMod += 0.10;
  }

  const baseStat = Math.max(minStatFloor, Math.min(98, Math.round(playerAvgStat * difficultyMod)));

  // Atributos do oponente com cobertura universal
  const attributes = {};
  const standardCombatKeys = [
    'punchPower', 'chin', 'cardio', 'speed', 'reflexes', 'fightIQ', 'strength', 'defense',
    'boxing', 'kicking', 'bjj', 'wrestling', 'clinch', 'judo', 'takedownDefense'
  ];
  const allKeys = new Set([...Object.keys(player.attributes || {}), ...standardCombatKeys]);

  allKeys.forEach(attr => {
    const styleMultiplier = (styleObj.bias && styleObj.bias[attr]) || 1.0;
    const variation = (Math.random() * 10 - 5);
    attributes[attr] = Math.max(20, Math.min(99, Math.round(baseStat * styleMultiplier + variation)));
  });

  // Cartel condizente com a fase
  const baseFights = oppTier === 'MUNDIAL' ? 24 + Math.floor(Math.random() * 12) :
                     oppTier === 'ELITE' ? 14 + Math.floor(Math.random() * 8) :
                     oppTier === 'MEDIANO' ? 9 + Math.floor(Math.random() * 8) :
                     Math.max(1, Math.round(player.record.fights + Math.random() * 3 - 1));

  const winRate = oppTier === 'MUNDIAL' ? 0.88 + Math.random() * 0.08 :
                  oppTier === 'ELITE' ? 0.78 + Math.random() * 0.12 :
                  oppTier === 'MEDIANO' ? 0.55 + Math.random() * 0.15 :
                  0.50 + Math.random() * 0.25;

  const wins = Math.max(0, Math.round(baseFights * winRate));
  const losses = Math.max(0, baseFights - wins);

  // Seleciona história rica condizente com o tier
  const tierStories = ROSTER_HISTORIES[oppTier] || ROSTER_HISTORIES.AMADOR;
  const story = tierStories[Math.floor(Math.random() * tierStories.length)];

  // Formato da Luta: Modalidade pura vs Desafio de Estilos (Luta Livre)
  const playerModLabel = MODALITY_LABELS[player.modality] || 'Sua Arte';
  const oppModLabel = MODALITY_LABELS[modality] || 'Arte Rival';

  let matchType = 'MODALITY';
  let matchTypeBadge = `🥊 LUTA NA SUA MODALIDADE: ${playerModLabel.toUpperCase()}`;
  let matchTypeLabel = 'Luta na Sua Modalidade';
  let styleClash = `${playerModLabel} Puro`;
  let rulesDescription = `Combate oficial disputado rigorosamente sob o regulamento de ${playerModLabel}. Valendo pontuação e avanço oficial no ranking da divisão.`;

  if (isCrossStyle) {
    matchType = 'CROSS_STYLE';
    matchTypeBadge = '⚔️ DESAFIO DE ESTILOS / LUTA LIVRE';
    matchTypeLabel = 'Desafio de Estilos (Luta Livre)';
    styleClash = `${playerModLabel} vs. ${oppModLabel}`;
    rulesDescription = options.rulesDescription || `Superluta aberta de estilos e disciplinas marciais! Sua maestria em ${playerModLabel} colocada à prova contra o arsenal de ${oppModLabel} do adversário. Regras híbridas de confronto aberto entre artes!`;
  }

  return {
    id: 'opp_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    name: fullName,
    shortName: `${firstName} ${lastName}`,
    nickname: nickname,
    nationality: nat,
    birthCountry: oppLoc.country,
    birthState: oppLoc.stateName,
    birthStateCode: oppLoc.stateCode,
    birthCity: oppLoc.city,
    originDisplay: oppLoc.originDisplay,
    isForeign: oppLoc.isForeign,
    age: oppTier === 'MUNDIAL' ? Math.max(24, Math.min(37, 28 + Math.floor(Math.random() * 8))) :
         oppTier === 'ELITE' ? Math.max(20, Math.min(33, 23 + Math.floor(Math.random() * 8))) :
         oppTier === 'MEDIANO' ? Math.max(19, Math.min(36, 25 + Math.floor(Math.random() * 10))) :
         player.age < 18 ? Math.max(8, Math.min(17, Math.round(player.age + (Math.random() * 2 - 1)))) :
         Math.max(18, Math.min(26, Math.round(player.age + (Math.random() * 4 - 2)))),
    heightCm: Math.round(player.heightCm + (Math.random() * 8 - 4)),
    weightKg: player.weightKg,
    reachCm: Math.round(player.reachCm + (Math.random() * 10 - 5)),
    modality: modality,
    style: styleObj.name,
    styleId: styleObj.id,
    strength: styleObj.strength,
    story: story,
    personality: personality,
    attributes: attributes,
    tier: oppTier,
    tierBadge: oppTierBadge,
    matchType: matchType,
    matchTypeBadge: matchTypeBadge,
    matchTypeLabel: matchTypeLabel,
    styleClash: styleClash,
    rulesDescription: rulesDescription,
    record: {
      fights: baseFights,
      wins: wins,
      losses: losses,
      draws: Math.random() > 0.7 ? 1 : 0,
      winsKO: Math.round(wins * (modality === 'jiu_jitsu' ? 0.1 : modality === 'judo' ? 0.3 : 0.6)),
      winsSub: Math.round(wins * (modality === 'jiu_jitsu' ? 0.75 : modality === 'judo' ? 0.5 : modality === 'mma' ? 0.3 : 0.05)),
      winsDec: Math.round(wins * 0.25)
    },
    appearance: {
      skinTone: ['#f8d9b6', '#e0ac69', '#8d5524', '#c68642', '#50331b'][Math.floor(Math.random() * 5)],
      hairColor: ['#111111', '#4a2c11', '#8b5a2b', '#2b2b2b'][Math.floor(Math.random() * 4)],
      shortsColor: ['#0056b3', '#28a745', '#dc3545', '#343a40', '#6f42c1'][Math.floor(Math.random() * 5)]
    },
    isRival: !!options.isRival
  };
}
