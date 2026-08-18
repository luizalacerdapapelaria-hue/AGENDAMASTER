export const MOTIVATIONAL_QUOTES = [
  "A persistência é o caminho do êxito.",
  "O sucesso nasce do querer, da determinação e da persistência em alcançar um objetivo.",
  "Não espere por circunstâncias ideais. Comece onde você está e com o que você tem.",
  "Acredite no seu potencial e todo o resto florescerá naturalmente.",
  "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
  "Pequenas disciplinas diárias constroem grandes conquistas extraordinárias.",
  "Tudo o que a mente humana pode conceber e acreditar, ela pode realizar.",
  "Você é mais forte do que imagina e mais capaz do que acredita.",
  "Cultive pensamentos positivos e sua rotina se encherá de boas oportunidades.",
  "Grandes jornadas começam com a coragem de dar o primeiro passo.",
  "A criatividade é a inteligência se divertindo e transformando ideias em arte.",
  "Cada novo dia é uma página em branco para recomeçar e fazer história.",
  "Foque no progresso diário, não na perfeição inalcançável.",
  "A gratidão transforma o que temos no suficiente para sermos felizes.",
  "Seja você mesmo a mudança e a inspiração que deseja ver no mundo.",
  "O seu potencial se multiplica quando você decide agir com amor e foco.",
  "Faça do seu propósito a sua maior motivação de cada manhã.",
  "Sonhos ganham vida quando você coloca dedicação, planejamento e ação.",
  "A disciplina é a ponte sólida entre as suas metas e as suas realizações.",
  "Valorize cada pequena vitória no caminho rumo aos seus grandes sonhos.",
  "Dedique-se de coração a tudo o que você se propuser a realizar hoje.",
  "A paciência e a constância superam qualquer desafio no ateliê e na vida.",
  "O segredo para avançar com confiança é simplesmente começar.",
  "Inspire todos ao seu redor com a sua energia, dedicação e alegria.",
  "Acredite no poder transformador da sua arte e da sua dedicação.",
  "A organização traz leveza para a mente e produtividade para os dias.",
  "Transforme suas ideias em projetos e seus projetos em realidade.",
  "Cultive a serenidade e a sabedoria em cada nova etapa da sua jornada.",
  "A constância vence o talento quando o talento não tem constância.",
  "Viva o presente com entusiasmo e construa o seu futuro com paixão.",
  "Você tem a capacidade única de criar coisas incríveis todos os dias.",
  "A melhor maneira de prever um futuro brilhante é construí-lo agora.",
  "Celebre a sua autenticidade e a linda história que construiu até aqui.",
  "O entusiasmo é a força motriz que transforma rascunhos em obras-primas.",
  "Cada desafio superado é um degrau a mais na sua evolução pessoal.",
  "Pratique a gentileza, o respeito e a empatia em todos os momentos.",
  "Deixe a sua criatividade brilhar em cada detalhe do que você faz.",
  "O conhecimento liberta e a prática constante aperfeiçoa o seu trabalho.",
  "Mantenha o foco nas coisas que realmente aquecem o seu coração.",
  "Respire fundo, confie no processo e continue avançando com alegria.",
  "Não limite os seus desafios, desafie os seus limites diariamente.",
  "A beleza da vida está nos detalhes feitos com amor e carinho.",
  "A coragem não é a ausência do medo, mas o triunfo sobre ele.",
  "Trabalhe com paixão e os resultados serão reflexo da sua excelência.",
  "Que o seu dia seja repleto de paz, boas ideias e realizações.",
  "A imaginação é o ponto de partida para todas as grandes criações.",
  "Com carinho e dedicação, qualquer ideia se transforma em encanto.",
  "Permita-se aprender algo novo todos os dias e expandir seus horizontes.",
  "A simplicidade e o capricho são as maiores formas de sofisticação.",
  "Dê o seu melhor hoje e colha frutos doces e duradouros no amanhã.",
  "O amor colocado no que fazemos é sentido por todos que recebem nosso trabalho.",
  "Nunca subestime o poder de uma mente focada e de um coração grato.",
  "Que a sua dedicação transforme tarefas simples em momentos especiais.",
  "Acredite na sua intuição e confie no ritmo do seu próprio crescimento.",
  "Vença a procrastinação dando um passo de cada vez com determinação.",
  "A felicidade é construída nos pequenos momentos de presença e gratidão.",
  "O capricho nos detalhes é o que torna o seu trabalho inesquecível.",
  "Cultive a arte de fazer o bem e espalhe luz por onde você passar.",
  "Seja persistente: as melhores colheitas exigem tempo, rega e cuidado.",
  "Você tem em suas mãos o poder de criar, inspirar e transformar."
];

export function getQuoteForDay(dayOfYear: number, month?: number): string {
  try {
    if (typeof window !== 'undefined') {
      const custom = window.localStorage.getItem('agendamaster_custom_quotes');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (month !== undefined && month >= 0 && month < 12) {
            return parsed[month % parsed.length];
          }
          return parsed[dayOfYear % parsed.length];
        }
      }
    }
  } catch (e) {
    console.error('Error loading custom quotes', e);
  }
  
  if (month !== undefined && month >= 0 && month < 12 && MOTIVATIONAL_QUOTES.length > 0) {
    return MOTIVATIONAL_QUOTES[month % MOTIVATIONAL_QUOTES.length];
  }
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}
