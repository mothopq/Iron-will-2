// locations.js - Base de dados geográfica de Países, Estados/Províncias e Cidades para a criação de lutadores

export const LOCATIONS_DATA = {
  'Brasil': {
    country: 'Brasil',
    flag: '🇧🇷',
    defaultState: 'SP',
    states: [
      {
        name: 'Acre',
        code: 'AC',
        cities: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasiléia', 'Senador Guiomard', 'Plácido de Castro']
      },
      {
        name: 'Alagoas',
        code: 'AL',
        cities: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares', 'São Miguel dos Campos', 'Delmiro Gouveia']
      },
      {
        name: 'Amapá',
        code: 'AP',
        cities: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Porto Grande', 'Mazagão', 'Tartarugalzinho']
      },
      {
        name: 'Amazonas',
        code: 'AM',
        cities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tabatinga', 'Tefé', 'Maués', 'Humaitá', 'São Gabriel da Cachoeira']
      },
      {
        name: 'Bahia',
        code: 'BA',
        cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Ilhéus', 'Porto Seguro', 'Lauro de Freitas', 'Jequié', 'Alagoinhas', 'Barreiras', 'Teixeira de Freitas', 'Simões Filho']
      },
      {
        name: 'Ceará',
        code: 'CE',
        cities: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá', 'Canindé']
      },
      {
        name: 'Distrito Federal',
        code: 'DF',
        cities: ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Plano Piloto', 'Águas Claras', 'Guará', 'Gama', 'Sobradinho', 'Santa Maria', 'Recanto das Emas']
      },
      {
        name: 'Espírito Santo',
        code: 'ES',
        cities: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'Colatina', 'Guarapari', 'São Mateus', 'Aracruz']
      },
      {
        name: 'Goiás',
        code: 'GO',
        cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Itumbiara', 'Jataí', 'Formosa', 'Senador Canedo', 'Catalão']
      },
      {
        name: 'Maranhão',
        code: 'MA',
        cities: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês']
      },
      {
        name: 'Mato Grosso',
        code: 'MT',
        cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Sorriso', 'Lucas do Rio Verde', 'Primavera do Leste', 'Barra do Garças', 'Cáceres']
      },
      {
        name: 'Mato Grosso do Sul',
        code: 'MS',
        cities: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina', 'Sidrolândia', 'Aquidauana', 'Maracaju']
      },
      {
        name: 'Minas Gerais',
        code: 'MG',
        cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Poços de Caldas', 'Patos de Minas', 'Pouso Alegre', 'Varginha']
      },
      {
        name: 'Pará',
        code: 'PA',
        cities: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança', 'Tucuruí', 'Altamira']
      },
      {
        name: 'Paraíba',
        code: 'PB',
        cities: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Mamanguape']
      },
      {
        name: 'Paraná',
        code: 'PR',
        cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Toledo', 'Apucarana', 'Pinhais', 'Campo Largo', 'Arapongas']
      },
      {
        name: 'Pernambuco',
        code: 'PE',
        cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão', 'Igarassu', 'São Lourenço da Mata']
      },
      {
        name: 'Piauí',
        code: 'PI',
        cities: ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'União', 'Altos', 'Esperantina']
      },
      {
        name: 'Rio de Janeiro',
        code: 'RJ',
        cities: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda', 'Macaé', 'Magé', 'Itaboraí', 'Cabo Frio', 'Angra dos Reis', 'Nova Friburgo', 'Barra Mansa', 'Mesquita', 'Teresópolis']
      },
      {
        name: 'Rio Grande do Norte',
        code: 'RN',
        cities: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Ceará-Mirim', 'Macaíba', 'Caicó', 'Açu', 'Currais Novos', 'São José de Mipibu']
      },
      {
        name: 'Rio Grande do Sul',
        code: 'RS',
        cities: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Santa Cruz do Sul', 'Bento Gonçalves']
      },
      {
        name: 'Rondônia',
        code: 'RO',
        cities: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Jaru', 'Guajará-Mirim', 'Ouro Preto do Oeste']
      },
      {
        name: 'Roraima',
        code: 'RR',
        cities: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Pacaraima', 'Cantá', 'Mucajaí', 'Alto Alegre']
      },
      {
        name: 'Santa Catarina',
        code: 'SC',
        cities: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Jaraguá do Sul', 'Palhoça', 'Lages', 'Balneário Camboriú', 'Brusque', 'Tubarão', 'São Bento do Sul', 'Caçador']
      },
      {
        name: 'São Paulo',
        code: 'SP',
        cities: [
          'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'São José dos Campos',
          'Santo André', 'Ribeirão Preto', 'Osasco', 'Sorocaba', 'Mauá', 'São José do Rio Preto',
          'Mogi das Cruzes', 'Santos', 'Diadema', 'Jundiaí', 'Piracicaba', 'Carapicuíba',
          'Bauru', 'Itaquaquecetuba', 'São Vicente', 'Franca', 'Praia Grande', 'Guarujá',
          'Taubaté', 'Limeira', 'Suzano', 'Taboão da Serra', 'Sumaré', 'Barueri',
          'Embu das Artes', 'Indaiatuba', 'Cotia', 'São Carlos', 'Americana', 'Marília',
          'Araraquara', 'Jacareí', 'Presidente Prudente', 'Rio Claro', 'Araçatuba'
        ]
      },
      {
        name: 'Sergipe',
        code: 'SE',
        cities: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Simão Dias', 'Propriá']
      },
      {
        name: 'Tocantins',
        code: 'TO',
        cities: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Araguatins', 'Colinas do Tocantins', 'Guaraí']
      }
    ]
  },

  'Estados Unidos': {
    country: 'Estados Unidos',
    flag: '🇺🇸',
    defaultState: 'CA',
    states: [
      {
        name: 'California',
        code: 'CA',
        cities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Anaheim', 'Stockton', 'Riverside', 'Irvine', 'Bakersfield']
      },
      {
        name: 'New York',
        code: 'NY',
        cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica']
      },
      {
        name: 'Texas',
        code: 'TX',
        cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Laredo', 'Irving']
      },
      {
        name: 'Florida',
        code: 'FL',
        cities: ['Miami', 'Jacksonville', 'Tampa', 'Orlando', 'St. Petersburg', 'Coconut Creek', 'Fort Lauderdale', 'Hialeah', 'Tallahassee', 'Cape Coral', 'Pembroke Pines']
      },
      {
        name: 'Nevada',
        code: 'NV',
        cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Elko', 'Mesquite', 'Boulder City']
      },
      {
        name: 'Ohio',
        code: 'OH',
        cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain']
      },
      {
        name: 'Pennsylvania',
        code: 'PA',
        cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Reading', 'Erie', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'York']
      },
      {
        name: 'Illinois',
        code: 'IL',
        cities: ['Chicago', 'Aurora', 'Joliet', 'Naperville', 'Rockford', 'Elgin', 'Peoria', 'Springfield', 'Champaign', 'Waukegan']
      },
      {
        name: 'New Jersey',
        code: 'NJ',
        cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Lakewood', 'Edison', 'Woodbridge', 'Toms River', 'Hamilton', 'Trenton', 'Atlantic City']
      },
      {
        name: 'Georgia',
        code: 'GA',
        cities: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Warner Robins', 'Johns Creek']
      },
      {
        name: 'Hawaii',
        code: 'HI',
        cities: ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe', 'Mililani', 'Kahului', 'Ewa Beach']
      },
      {
        name: 'Arizona',
        code: 'AZ',
        cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise', 'Yuma']
      },
      {
        name: 'Colorado',
        code: 'CO',
        cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Boulder']
      },
      {
        name: 'Michigan',
        code: 'MI',
        cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Livonia', 'Troy']
      },
      {
        name: 'Oklahoma',
        code: 'OK',
        cities: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton', 'Moore', 'Midwest City', 'Enid', 'Stillwater']
      },
      {
        name: 'Oregon',
        code: 'OR',
        cities: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford', 'Springfield', 'Corvallis']
      },
      {
        name: 'Washington',
        code: 'WA',
        cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley', 'Federal Way']
      }
    ]
  },

  'Japão': {
    country: 'Japão',
    flag: '🇯🇵',
    defaultState: 'Tokyo',
    states: [
      {
        name: 'Tóquio',
        code: 'Tokyo',
        cities: ['Shinjuku', 'Shibuya', 'Roppongi', 'Chiyoda', 'Setagaya', 'Koto', 'Adachi', 'Hachioji', 'Machida', 'Ginza', 'Ikebukuro', 'Akihabara']
      },
      {
        name: 'Osaka',
        code: 'Osaka',
        cities: ['Osaka City', 'Sakai', 'Higashiosaka', 'Hirakata', 'Toyonaka', 'Suita', 'Takatsuki', 'Ibaraki', 'Yao', 'Namba']
      },
      {
        name: 'Kanagawa',
        code: 'Kanagawa',
        cities: ['Yokohama', 'Kawasaki', 'Sagamihara', 'Yokosuka', 'Fujisawa', 'Kamakura', 'Odawara', 'Chigasaki', 'Atsugi']
      },
      {
        name: 'Aichi',
        code: 'Aichi',
        cities: ['Nagoya', 'Toyohashi', 'Okazaki', 'Ichinomiya', 'Toyota', 'Kasugai', 'Anjo', 'Komaki', 'Kariya']
      },
      {
        name: 'Kyoto',
        code: 'Kyoto',
        cities: ['Kyoto City', 'Uji', 'Kameoka', 'Joyo', 'Nagaokakyo', 'Maizuru', 'Fukuchiyama', 'Miyazu']
      },
      {
        name: 'Saitama',
        code: 'Saitama',
        cities: ['Saitama City', 'Kawaguchi', 'Kawagoe', 'Tokorozawa', 'Koshigaya', 'Soka', 'Kasukabe', 'Ageo']
      },
      {
        name: 'Chiba',
        code: 'Chiba',
        cities: ['Chiba City', 'Funabashi', 'Matsudo', 'Ichikawa', 'Kashiwa', 'Ichihara', 'Yachiyo', 'Nagareyama']
      },
      {
        name: 'Hyogo',
        code: 'Hyogo',
        cities: ['Kobe', 'Himeji', 'Nishinomiya', 'Amagasaki', 'Akashi', 'Kakogawa', 'Takarazuka', 'Itami']
      },
      {
        name: 'Hokkaido',
        code: 'Hokkaido',
        cities: ['Sapporo', 'Asahikawa', 'Hakodate', 'Kushiro', 'Obihiro', 'Tomakomai', 'Otaru', 'Kitami']
      },
      {
        name: 'Fukuoka',
        code: 'Fukuoka',
        cities: ['Fukuoka City', 'Kitakyushu', 'Kurume', 'Omuta', 'Iizuka', 'Kasuga', 'Onojo', 'Munakata']
      },
      {
        name: 'Okinawa',
        code: 'Okinawa',
        cities: ['Naha', 'Okinawa City', 'Uruma', 'Urasoe', 'Ginowan', 'Nago', 'Itoman', 'Tomigusuku', 'Miyakojima']
      },
      {
        name: 'Shizuoka',
        code: 'Shizuoka',
        cities: ['Shizuoka City', 'Hamamatsu', 'Fuji', 'Numazu', 'Iwata', 'Yaizu', 'Fujieda', 'Mishima']
      },
      {
        name: 'Hiroshima',
        code: 'Hiroshima',
        cities: ['Hiroshima City', 'Fukuyama', 'Kure', 'Higashihiroshima', 'Onomichi', 'Hatsukaichi', 'Mihara']
      }
    ]
  },

  'Tailândia': {
    country: 'Tailândia',
    flag: '🇹🇭',
    defaultState: 'BKK',
    states: [
      {
        name: 'Bangkok',
        code: 'BKK',
        cities: ['Phra Nakhon', 'Thonburi', 'Chatuchak', 'Bang Kapi', 'Sukhumvit', 'Khlong Toei', 'Silom', 'Dusit', 'Huai Khwang', 'Din Daeng']
      },
      {
        name: 'Phuket',
        code: 'PKT',
        cities: ['Phuket Town', 'Patong', 'Kathu', 'Rawai', 'Chalong', 'Karon', 'Thalang', 'Kamala']
      },
      {
        name: 'Chiang Mai',
        code: 'CNX',
        cities: ['Mueang Chiang Mai', 'Hang Dong', 'San Sai', 'Mae Rim', 'Saraphi', 'San Kamphaeng', 'Chom Thong']
      },
      {
        name: 'Buriram',
        code: 'BRM',
        cities: ['Mueang Buriram', 'Nang Rong', 'Prakhon Chai', 'Satuk', 'Krasang', 'Lahan Sai', 'Lam Plai Mat']
      },
      {
        name: 'Nakhon Ratchasima',
        code: 'KRT',
        cities: ['Mueang Korat', 'Pak Chong', 'Phimai', 'Dan Khun Thot', 'Chok Chai', 'Non Sung', 'Sikhiu']
      },
      {
        name: 'Chonburi',
        code: 'CBI',
        cities: ['Pattaya', 'Mueang Chonburi', 'Si Racha', 'Bang Lamung', 'Sattahip', 'Phan Thong', 'Ban Bueng']
      },
      {
        name: 'Surat Thani',
        code: 'URT',
        cities: ['Koh Samui', 'Koh Phangan', 'Mueang Surat Thani', 'Kanchanadit', 'Don Sak', 'Tha Chana', 'Chaiya']
      },
      {
        name: 'Krabi',
        code: 'KBV',
        cities: ['Mueang Krabi', 'Ao Nang', 'Koh Lanta', 'Khlong Thom', 'Nuea Khlong', 'Ao Luek', 'Plai Phraya']
      },
      {
        name: 'Khon Kaen',
        code: 'KKC',
        cities: ['Mueang Khon Kaen', 'Chum Phae', 'Ban Phai', 'Kranuan', 'Phon', 'Nam Phong', 'Ubolratana']
      },
      {
        name: 'Ubon Ratchathani',
        code: 'UBP',
        cities: ['Mueang Ubon', 'Warin Chamrap', 'Det Udom', 'Phibun Mangsahan', 'Trakan Phuet Phon', 'Khemarat']
      },
      {
        name: 'Nonthaburi',
        code: 'NON',
        cities: ['Mueang Nonthaburi', 'Pak Kret', 'Bang Bua Thong', 'Bang Yai', 'Bang Kruai', 'Sai Noi']
      }
    ]
  },

  'Rússia': {
    country: 'Rússia',
    flag: '🇷🇺',
    defaultState: 'DAG',
    states: [
      {
        name: 'Daguestão',
        code: 'DAG',
        cities: ['Makhachkala', 'Khasavyurt', 'Kaspiysk', 'Derbent', 'Buynaksk', 'Kizlyar', 'Izberbash', 'Karabudakhkent', 'Kizilyurt']
      },
      {
        name: 'Moscou',
        code: 'MOW',
        cities: ['Moscou Central', 'Zelenograd', 'Troitsk', 'Shcherbinka', 'Lyublino', 'Tverskoy', 'Arbat', 'Tagansky', 'Khamovniki']
      },
      {
        name: 'Chechênia',
        code: 'CE',
        cities: ['Grozny', 'Gudermes', 'Argun', 'Shali', 'Urus-Martan', 'Kurchaloy', 'Achkhoy-Martan']
      },
      {
        name: 'São Petersburgo',
        code: 'SPB',
        cities: ['São Petersburgo Central', 'Kolpino', 'Pushkin', 'Kronstadt', 'Petergof', 'Sestroretsk', 'Vyborgsky', 'Primorsky']
      },
      {
        name: 'Ossétia do Norte',
        code: 'NOS',
        cities: ['Vladikavkaz', 'Mozdok', 'Beslan', 'Alagir', 'Ardon', 'Digora', 'Elkhotovo']
      },
      {
        name: 'Krasnodar',
        code: 'KDA',
        cities: ['Krasnodar City', 'Sochi', 'Novorossiysk', 'Armavir', 'Anapa', 'Gelendzhik', 'Yeysk', 'Kropotkin']
      },
      {
        name: 'Tartaristão',
        code: 'TAT',
        cities: ['Kazan', 'Naberezhnye Chelny', 'Nizhnekamsk', 'Almetyevsk', 'Zelenodolsk', 'Bugulma', 'Yelabuga']
      },
      {
        name: 'Ecaterimburgo / Sverdlovsk',
        code: 'SVE',
        cities: ['Ecaterimburgo', 'Nizhny Tagil', 'Kamensk-Uralsky', 'Pervouralsk', 'Serov', 'Novouralsk', 'Asbest']
      },
      {
        name: 'Novosibirsk',
        code: 'NVS',
        cities: ['Novosibirsk City', 'Berdsk', 'Iskitim', 'Kuybyshev', 'Barabinsk', 'Ob', 'Karasuk']
      },
      {
        name: 'Omsk',
        code: 'OMS',
        cities: ['Omsk City', 'Tara', 'Isilkul', 'Kalachinsk', 'Tavricheskoye', 'Nazyvayevsk']
      },
      {
        name: 'Kemerovo (Kuzbass)',
        code: 'KEM',
        cities: ['Kemerovo City', 'Novokuznetsk', 'Prokopyevsk', 'Leninsk-Kuznetsky', 'Mezhdurechensk', 'Anzhero-Sudzhensk']
      },
      {
        name: 'Khabarovsk',
        code: 'KHA',
        cities: ['Khabarovsk City', 'Komsomolsk-on-Amur', 'Amursk', 'Sovetskaya Gavan', 'Nikolayevsk-on-Amur']
      }
    ]
  }
};

// Utilitário auxiliar para obter estados de um país
export function getStatesByCountry(countryName) {
  const data = LOCATIONS_DATA[countryName] || LOCATIONS_DATA['Brasil'];
  return data.states;
}

// Utilitário auxiliar para obter cidades de um estado por país e código/nome do estado
export function getCitiesByState(countryName, stateCodeOrName) {
  const states = getStatesByCountry(countryName);
  const found = states.find(s => 
    s.code.toLowerCase() === (stateCodeOrName || '').toLowerCase() ||
    s.name.toLowerCase() === (stateCodeOrName || '').toLowerCase()
  );
  return found ? found.cities : (states[0]?.cities || []);
}
