// events.js - Eventos aleatórios e decisões de carreira com consequências reais

export const NARRATIVE_EVENTS = [
  {
    id: 'short_notice_title_fight',
    title: 'Chamada de Emergência: Disputa de Cinturão!',
    description: 'O desafiante principal quebrou a costela a 10 dias do grande evento. A organização te ligou às 2 da manhã oferecendo a disputa pelo cinturão mundial na luta principal!',
    category: 'carreira',
    options: [
      {
        text: 'Aceitar a luta imediatamente! É a chance da minha vida!',
        effect: {
          moral: +25,
          fame: +20,
          stress: +35,
          energy: -20,
          narrative: 'A notícia explodiu no mundo das lutas! Você é visto como um guerreiro corajoso, mas seu camp será minúsculo.'
        }
      },
      {
        text: 'Recusar educadamente. Não entro em ringue sem o camp adequado.',
        effect: {
          moral: -5,
          fame: -5,
          stress: -10,
          narrative: 'Os promotores ficaram frustrados, mas seu treinador elogiou sua maturidade profissional.'
        }
      },
      {
        text: 'Exigir o triplo da bolsa e peso combinado (catchweight).',
        effect: {
          money: +8000,
          reputation: 'Negociador Duro',
          stress: +15,
          narrative: 'A organização aceitou a contraproposta sob pressão! Você garantiu uma bolsa histórica.'
        }
      }
    ]
  },
  {
    id: 'underground_sparring',
    title: 'Desafio na Academia Rival',
    description: 'Um lutador famoso de uma equipe rival apareceu na porta da sua academia com câmeras gravando e desafiou você para um sparring pesado com portas fechadas.',
    category: 'honra',
    options: [
      {
        text: 'Colocar as luvas e resolver agora mesmo diante de todos!',
        effect: {
          fame: +15,
          injuryRoll: 0.35, // 35% de chance de corte/lesão
          fightIQ: +2,
          stress: +20,
          narrative: 'Foi uma guerra sangrenta! O vídeo vazou na internet e viralizou, aumentando absurdamente sua fama underground.'
        }
      },
      {
        text: 'Chamar a polícia e expulsá-los por desrespeito ao dojô.',
        effect: {
          reputation: 'Disciplinado',
          fame: -10,
          moral: -10,
          narrative: 'Você preservou a integridade da academia, mas os comentários nas redes sociais te chamaram de covarde.'
        }
      },
      {
        text: 'Desafiar para resolver no card oficial da próxima edição.',
        effect: {
          fame: +10,
          moral: +10,
          hypeRival: true,
          narrative: 'Você canalizou a tensão para criar um clássico de bilheteria com rivalidade declarada!'
        }
      }
    ]
  },
  {
    id: 'supplement_sponsor_dilemma',
    title: 'Contrato de Patrocínio Suspeito',
    description: 'Uma empresa estrangeira de suplementos te ofereceu uma quantia altíssima, mas corre o boato de que seus produtos contêm substâncias proibidas contaminadas.',
    category: 'financas',
    options: [
      {
        text: 'Assinar o contrato e receber a grana adiantada ($15.000).',
        effect: {
          money: +15000,
          stress: +25,
          dopingRisk: true,
          narrative: 'O dinheiro salvou suas contas, mas agora você treme toda vez que a agência antidopagem bate na porta.'
        }
      },
      {
        text: 'Recusar o contrato e manter sua carreira limpa.',
        effect: {
          reputation: 'Atleta Limpo e Ítegro',
          moral: +15,
          stress: -10,
          narrative: 'Você segue com o bolso apertado, mas com a consciência serena e credibilidade intacta.'
        }
      }
    ]
  },
  {
    id: 'elite_camp_invitation',
    title: 'Convite para Camp de Elite na Tailândia / EUA',
    description: 'Um renomado mestre internacional viu suas últimas lutas e te convidou para uma temporada de 3 meses na equipe dele, cobrindo acomodação e treinos com lendas.',
    category: 'evolucao',
    options: [
      {
        text: 'Aceitar e viajar para elevar o nível com os melhores do mundo!',
        effect: {
          money: -2500, // Custo de passagem e visto
          technique: +4,
          boxing: +3,
          kicking: +3,
          wrestling: +3,
          bjj: +3,
          fightIQ: +5,
          narrative: 'A experiência mudou sua visão sobre esportes de combate! Você absorveu técnicas de campeões mundiais.'
        }
      },
      {
        text: 'Ficar na sua academia local por lealdade ao seu primeiro mestre.',
        effect: {
          coachLoyalty: +30,
          moral: +10,
          narrative: 'Seu treinador ficou emocionado com sua lealdade. O laço de vocês é agora inquebrável.'
        }
      }
    ]
  },
  {
    id: 'street_provocation',
    title: 'Provocação em Casa Noturna',
    description: 'Durante uma saída de fim de semana, um indivíduo embriagado reconhece você e começa a te empurrar e xingar na frente de outras pessoas para se exibir.',
    category: 'vida',
    options: [
      {
        text: 'Manter a calma, respirar fundo e sair do local como um verdadeiro profissional.',
        effect: {
          moral: +10,
          fightIQ: +2,
          reputation: 'Maduro & Controlado',
          narrative: 'Você provou que um artista marcial não usa suas armas fora da arena.'
        }
      },
      {
        text: 'Desferir um cruzado e nocautear o provocador na hora.',
        effect: {
          money: -3000, // Custos advocatícios
          stress: +40,
          reputation: 'Encrenqueiro',
          fame: +10,
          narrative: 'Ele caiu desacordado na hora. O vídeo foi parar na delegacia e quase custou sua licença de atleta!'
        }
      }
    ]
  }
];

export function getEligibleRandomEvent(fighter) {
  // Retorna evento baseado no momento da carreira
  const randomIndex = Math.floor(Math.random() * NARRATIVE_EVENTS.length);
  return NARRATIVE_EVENTS[randomIndex];
}
