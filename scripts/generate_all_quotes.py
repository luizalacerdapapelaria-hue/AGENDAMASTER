import re
import os

os.makedirs('core/constants/quotesData', exist_ok=True)

def deduplicate_and_validate(quotes, target=366):
    seen = set()
    result = []
    for q in quotes:
        clean = q.strip()
        if not clean:
            continue
        norm = re.sub(r'[^\w\s]', '', clean.lower())
        if norm not in seen:
            seen.add(norm)
            result.append(clean)
    assert len(result) >= target, f"Expected at least {target}, got {len(result)}"
    return result

def save_ts(path, var_name, quotes):
    unique = deduplicate_and_validate(quotes, 366)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f"// Catálogo de Frases para 366 Dias do Ano ({len(unique)} frases)\n")
        f.write(f"export const {var_name}: string[] = [\n")
        for q in unique:
            escaped = q.replace('\\', '\\\\').replace('"', '\\"')
            f.write(f'  "{escaped}",\n')
        f.write("];\n")
    print(f"Generated {path} with {len(unique)} quotes.")
    return unique

# 1. FORÇA FEMININA (366+)
feminine_base = [
    "Mulheres fortes não seguem caminhos prontos, constroem suas próprias pontes.",
    "Sua força é do tamanho dos seus sonhos e da sua perseverança diária.",
    "Não deixe que ninguém limite o que você, mulher extraordinária, é capaz de criar.",
    "Seja a protagonista da sua história e celebre cada degrau da sua independência.",
    "Sua intuição, sua sensibilidade e seu trabalho têm um poder transformador único.",
    "Mulher independente: mente focada, mãos criativas e coração cheio de propósitos.",
    "Lugar de mulher é onde ela sonhar, empreender e fizer florescer o seu talento.",
    "A coragem de uma mulher é capaz de redesenhar qualquer destino.",
    "Você é forte, você é capaz e o seu trabalho merece todo o reconhecimento do mundo.",
    "Floresça onde estiver e inspire outras mulheres a conquistarem seus próprios espaços.",
    "A sua voz importa, o seu talento tem valor e a sua jornada inspira.",
    "A maior revolução de uma mulher é acreditar com firmeza no seu próprio potencial.",
    "Seja dona das suas decisões, dos seus sonhos e do seu precioso tempo.",
    "A doçura no olhar não esconde a força inabalável de uma mulher determinada.",
    "Acredite: você já superou desafios gigantescos e continua de pé, vitoriosa.",
    "Uma mulher segura de si não compete, ela apoia e eleva quem está ao seu redor.",
    "O mundo se transforma quando uma mulher decide colocar sua criatividade em ação.",
    "Celebre sua sensibilidade como fortaleza, nunca como fraqueza.",
    "Você é autora das suas escolhas e construtora do seu próprio amanhã.",
    "Brilhe sem pedir licença: seu espaço no mundo é legítimo e merecido.",
    "Seja gentil com seus processos e firme com as suas grandes aspirações.",
    "A autoconfiança é o melhor acessório que uma mulher determinada pode vestir.",
    "Não diminua seus sonhos para caber em lugares pequenos demais para você.",
    "O poder feminino floresce na união, no acolhimento e na coragem diária.",
    "Você tem a sabedoria ancestral de criar a vida e transformar a realidade.",
    "Respeite a sua história e honre cada batalha que te trouxe até aqui.",
    "Seja a mulher que você sonhava em se tornar quando era pequena.",
    "A determinação feminina move montanhas silenciosamente todos os dias.",
    "Seu valor não depende da opinião de ninguém: ele é intrínseco e inegociável.",
    "Empreender, sonhar e conquistar: o futuro pertence a mulheres corajosas.",
    "Vista-se de coragem e vá ao encontro das oportunidades que você merece.",
    "Cada passo firme que você dá abre portas para as que virão depois de você.",
    "Você é a poesia viva da perseverança, da arte e da transformação."
]

fem_openers = [
    "Uma mulher corajosa", "A mulher determinada", "A força da mulher", "A mulher sábia",
    "A sua determinação", "O protagonismo feminino", "A mulher independente", "A alma feminina",
    "Sua liderança natural", "A sensibilidade feminina", "Uma mulher que sonha", "A coragem feminina",
    "A mulher que acredita em si", "A postura de quem vence", "A beleza da força feminina"
]
fem_middles = [
    "transforma desafios em degraus para", "ilumina o mundo ao", "conquista novos horizontes quando decide",
    "redefine padrões e abre caminhos ao", "inspira gerações inteiras através de sua capacidade de",
    "derruba barreiras silenciosamente com a firmeza de", "constrói um legado inabalável ao",
    "supera qualquer tempestade porque carrega a certeza de", "mostra a sua grandeza através do poder de",
    "honra a sua própria voz e sua essência ao", "alcança o extraordinário quando escolhe",
    "floresce em qualquer terreno graças ao dom de", "comanda a própria história com orgulho e"
]
fem_ends = [
    "construir o seu próprio destino com dignidade.", "fazer da perseverança o seu maior estandarte.",
    "agir com firmeza e liderar pelo exemplo.", "defender seus valores sem temer os julgamentos.",
    "acolher a si mesma e voar cada vez mais alto.", "transformar trabalho e talento em pura arte.",
    "acreditar no poder infinito da sua própria mente.", "ocupar os lugares mais altos com naturalidade e graça.",
    "deixar uma marca inesquecível de afeto e coragem.", "ser livre, autônoma e senhora dos seus dias.",
    "sonhar grande e trabalhar com constância apaixonada.", "sustentar as suas escolhas com serenidade e postura.",
    "fazer da sua história uma fonte inesgotável de inspiração.", "respeitar a sua verdade e viver sem concessões desnecessárias.",
    "celebrar sua autonomia em cada pequena conquista do dia."
]

fem_quotes = list(feminine_base)
for o in fem_openers:
    for m in fem_middles:
        for e in fem_ends:
            fem_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(fem_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(fem_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(fem_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/feminineStrength.ts', 'QUOTES_FEMININE_STRENGTH', fem_quotes[:370])

# 2. FÉ E ESPIRITUALIDADE (366+)
faith_base = [
    "A fé não torna as coisas mais fáceis, torna tudo possível.",
    "Entregue o seu dia nas mãos de Deus e descanse o coração no cuidado d’Ele.",
    "Tudo posso naquele que me fortalece. (Filipenses 4:13)",
    "O Senhor é o meu pastor, nada me faltará. (Salmo 23:1)",
    "Que a paz de Deus, que excede todo o entendimento, guarde o seu coração hoje.",
    "A fé no amanhã acalma as tempestades e ansiedades de hoje.",
    "Deus nunca falha quando confiamos o nosso trabalho e orações a Ele.",
    "Onde há fé, há esperança; onde há oração, há milagre e renovação.",
    "Mil cairão ao teu lado, e dez mil à tua direita, mas tua fé te sustentará.",
    "Comece cada manhã agradecendo e deixe Deus guiar cada detalhe dos seus passos.",
    "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.",
    "O meu socorro vem do Senhor, que fez o céu e a terra. (Salmo 121:2)",
    "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
    "A oração é a chave que abre as portas do céu e acalma a alma aflita.",
    "Deus tem planos de paz e esperança para a sua vida e para o seu futuro.",
    "O amor de Deus dura para sempre e renova as forças a cada nova alvorada.",
    "Ainda que a caminhada seja árdua, o Senhor é o escudo da sua vida.",
    "Silencie o coração e escute a voz suave de Deus te dizendo: vai dar tudo certo.",
    "A gratidão a Deus transforma os dias comuns em bênçãos extraordinárias.",
    "Deus trabalha em silêncio nos bastidores da sua história.",
    "Quando você coloca Deus à frente, nenhum obstáculo é insuperável.",
    "A fé é a certeza das coisas que se esperam e a prova do que não se vê.",
    "Que o Espírito Santo encha o seu ateliê e a sua casa de paz e harmonia.",
    "Não temas, porque Deus é contigo; Ele te fortalece e te ajuda a vencer.",
    "O coração em paz com Deus floresce mesmo em tempos de estiagem.",
    "Deixe a luz de Deus brilhar através de cada pequeno ato de amor hoje.",
    "Em tudo dai graças, pois cada dia é um dom generoso da graça divina.",
    "O Senhor renovará as suas forças como as da águia para voar alto.",
    "A esperança que vem de Deus nunca decepciona nem desampara.",
    "Coloque amor em cada detalhe como quem trabalha para o próprio Senhor."
]

faith_openers = [
    "Com Deus no coração,", "A oração sincera da manhã", "A graça de Deus", "Quem caminha com fé",
    "A mão protetora do Senhor", "A fé inabalável", "A promessa divina", "O amor do Pai",
    "A bênção de um novo dia", "Descansar na presença de Deus", "A confiança no Senhor",
    "Que a luz do Espírito Santo", "A paz que vem dos céus", "Cada amanhecer guiado por Deus"
]
faith_middles = [
    "renova as nossas forças e", "abre caminhos onde não havia saída e", "sustenta os nossos passos e",
    "acalma o coração ansioso e", "transforma as nossas pequenas súplicas em", "ensina a esperar o tempo certo e",
    "traz serenidade para a alma e", "derrama sabedoria sobre as nossas escolhas e", "afasta todo o medo e",
    "enche a nossa rotina de milagres discretos e", "nos dá coragem para perseverar e", "ilumina as nossas decisões e"
]
faith_ends = [
    "faz florescer a esperança mesmo nas provações.", "revela a beleza do Seu propósito infinito.",
    "nos enche de gratidão a cada respiração.", "guarda os nossos planos e a nossa família.",
    "mostra que Ele cuida de tudo com amor sem igual.", "faz transbordar paz e doçura em nosso viver.",
    "nos lembra de que nunca estamos sozinhas.", "nos capacita a vencer qualquer batalha do dia.",
    "converte lágrimas em testemunhos de vitória.", "renova a fé para acolher as promessas eternas.",
    "derrama bênçãos fartas sobre o nosso lar e trabalho.", "ensina que o Seu tempo é sempre o mais perfeito."
]

faith_quotes = list(faith_base)
for o in faith_openers:
    for m in faith_middles:
        for e in faith_ends:
            faith_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(faith_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(faith_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(faith_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/faith.ts', 'QUOTES_FAITH', faith_quotes[:370])

# 3. MOTIVAÇÃO E DISCIPLINA (366+)
motivational_base = [
    "A persistência é o caminho mais seguro para o êxito extraordinário.",
    "O sucesso nasce do querer firme, da determinação e da constância.",
    "Não espere pelas circunstâncias perfeitas. Comece onde está e com o que tem.",
    "Pequenas disciplinas diárias geram conquistas gigantescas com o tempo.",
    "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
    "Foque no progresso diário, nunca na perfeição inalcançável.",
    "O segredo para avançar com confiança é dar o primeiro passo hoje.",
    "A disciplina é a ponte sólida entre as suas metas e a sua realização.",
    "A constância supera o talento quando o talento não mantém a constância.",
    "Transforme metas em hábitos diários e veja seus sonhos se tornarem rotina.",
    "Grandes realizações são a soma de pequenos esforços repetidos dia a dia.",
    "Tudo o que a mente humana pode conceber e acreditar, ela pode realizar.",
    "A coragem não é a ausência de medo, mas a decisão de que algo é mais importante.",
    "Valorize cada pequena vitória no caminho rumo aos seus grandes objetivos.",
    "O entusiasmo diário é o combustível que transforma rascunhos em conquistas.",
    "Vença a procrastinação dando um passo de cada vez com determinação.",
    "A sua determinação de hoje é a matéria-prima do seu sucesso de amanhã.",
    "Não limite os seus desafios, desafie os seus limites todos os dias.",
    "Dê o seu melhor nas condições que você tem, até ter condições melhores ainda.",
    "Seja mais forte que as suas desculpas e mais perseverante que os seus receios.",
    "O que você faz hoje com disciplina é o que te tornará imparável amanhã.",
    "Obstáculos são apenas convites para você descobrir o tamanho da sua força.",
    "Foque na direção, não apenas na velocidade: o essencial é continuar em frente.",
    "Quem tem um porquê forte enfrenta qualquer como com serenidade.",
    "Comemore as etapas concluídas e mantenha o olhar brilhando para o futuro.",
    "A excelência não é um ato isolado, é um hábito construído com dedicação.",
    "Acredite no seu potencial e todo o resto florescerá com o seu trabalho.",
    "Sonhos ganham vida quando você coloca planejamento, dedicação e ação.",
    "Trabalhe com paixão e os resultados serão reflexo da sua dedicação.",
    "Você tem em suas mãos o poder de criar, inspirar e transformar a sua realidade."
]

mot_openers = [
    "A constância inabalável", "A disciplina consciente", "O foco diário em suas metas", "A persistência silenciosa",
    "A determinação de continuar", "Cada pequeno esforço de hoje", "A coragem de começar agora", "O compromisso com o seu progresso",
    "A disciplina aplicada com amor", "A força da sua dedicação", "A mente focada na vitória", "O trabalho feito com capricho",
    "A atitude positiva perante os desafios", "O hábito de não desistir"
]
mot_middles = [
    "é o verdadeiro segredo para", "supera qualquer desculpa e te impulsiona a", "constrói a base sólida necessária para",
    "abre portas inimagináveis e te leva a", "elimina a procrastinação permitindo que você", "multiplica os seus resultados e",
    "transforma o que parecia difícil em", "te aproxima a passos largos de", "garante a evolução constante que vai",
    "alimenta a autoconfiança indispensável para", "mostra ao mundo a sua capacidade de", "faz com que cada obstáculo sirva para"
]
mot_ends = [
    "conquistar resultados extraordinários com o tempo.", "bater metas ambiciosas sem perder o entusiasmo.",
    "construir um futuro de orgulho e realizações.", "alcançar o sucesso que você tanto planejou.",
    "superar limites e voar cada vez mais alto.", "fazer da rotina a sua maior aliada no crescimento.",
    "manter a firmeza mesmo nos dias mais desafiadores.", "transformar ideias em conquistas concretas e brilhantes.",
    "alcançar a maestria em tudo o que se propõe a fazer.", "colher frutos doces de uma dedicação sincera.",
    "mostrar que a perseverança sempre vence qualquer barreira.", "comemorar vitórias merecidas e continuar crescendo."
]

mot_quotes = list(motivational_base)
for o in mot_openers:
    for m in mot_middles:
        for e in mot_ends:
            mot_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(mot_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(mot_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(mot_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/motivational.ts', 'QUOTES_MOTIVATIONAL', mot_quotes[:370])

# 4. AMOR-PRÓPRIO E AUTOESTIMA (366+)
self_love_base = [
    "Você não precisa da aprovação do mundo para honrar a preciosidade que você é.",
    "Abrace a sua autenticidade: o seu brilho não precisa pedir licença para existir.",
    "Seja a sua maior admiradora e celebre com orgulho cada capítulo da sua história.",
    "O amor-próprio não é vaidade: é o alicerce de todas as suas relações saudáveis.",
    "Você é suficiente exatamente como é, e tem tudo o que precisa para prosperar.",
    "A sua presença no mundo é única, insubstituível e cheia de propósito.",
    "Não se compare com ninguém: a sua jornada é a sua obra de arte mais sagrada.",
    "Aprenda a se elogiar pelas pequenas vitórias invisíveis do cotidiano.",
    "A opinião dos outros sobre você não define quem você é de verdade.",
    "Olhe para si mesma com os olhos de quem vê um milagre acontecendo.",
    "Coloque-se em primeiro lugar na sua lista de prioridades sem culpa.",
    "Você merece o mesmo amor, paciência e afeto que distribui aos outros.",
    "A sua voz tem valor, a sua sensibilidade é riqueza e a sua beleza é singular.",
    "Aceite os seus processos com ternura: você está em constante evolução.",
    "Quem conhece o próprio valor nunca aceita migalhas de atenção ou respeito.",
    "A maior liberdade de uma mulher é se sentir em paz consigo mesma no espelho.",
    "Honre o seu passado, apaixone-se pelo seu presente e sonhe alto com o seu futuro.",
    "O seu valor nunca diminui pela incapacidade de alguém em reconhecê-lo.",
    "Cultive o amor que você tem por você mesma como quem cuida de um jardim raro.",
    "Você é a mulher da sua própria vida: faça da sua companhia o seu melhor lar.",
    "Brilhar não diminui a luz de ninguém; ilumine com toda a sua intensidade.",
    "Abrace suas imperfeições com leveza: elas contam a história da sua coragem.",
    "O seu coração é um templo sagrado: só permita entrar o que te trouxer paz.",
    "Amar a si mesma é uma revolução diária que floresce de dentro para fora.",
    "Celebre sua força, perdoe seus deslizes e continue caminhando com orgulho."
]

sl_openers = [
    "Amar a si mesma com verdade", "O respeito à sua própria essência", "A sua autoconfiança genuína", "Abrace quem você é,",
    "Reconhecer o seu próprio valor", "A certeza do seu merecimento", "Ser leal a si mesma", "A paz de gostar de quem você se tornou",
    "A sua singularidade radiante", "Cuidar do seu diálogo interno", "Celebrar sua autenticidade", "O amor que você cultiva por si"
]
sl_middles = [
    "é o primeiro passo para", "desperta uma força inabalável que te faz", "te liberta da necessidade de aprovação e",
    "protege o seu coração contra desrespeitos e", "ilumina o seu olhar para que você possa", "te ensina a impor limites saudáveis e",
    "cura antigas inseguranças permitindo que você", "enche os seus dias de dignidade e", "transforma a sua autoestima em",
    "faz florescer a sua beleza natural ao", "te lembra com doçura de que você pode"
]
sl_ends = [
    "viver com plenitude, leveza e confiança.", "ocupar o seu lugar no mundo com cabeça erguida.",
    "se apaixonar cada dia mais pela sua história.", "acolher suas vulnerabilidades como parte do seu charme.",
    "dizer sim para os seus sonhos e não para o que te diminui.", "ser a sua melhor amiga e refúgio nos momentos difíceis.",
    "brilhar intensamente sem medo de ofuscar ninguém.", "caminhar com a certeza de que você é suficiente e especial.",
    "celebrar a dádiva de ser uma mulher livre e autêntica.", "viver em harmonia profunda com a sua verdade interior."
]

sl_quotes = list(self_love_base)
for o in sl_openers:
    for m in sl_middles:
        for e in sl_ends:
            sl_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(sl_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(sl_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(sl_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/selfLove.ts', 'QUOTES_SELF_LOVE', sl_quotes[:370])

# 5. AUTOCUIDADO E SAÚDE MENTAL (366+)
self_care_base = [
    "Cuide de você com o mesmo carinho que dedica a tudo o que você cria.",
    "Respeite o seu próprio ritmo: florescer no seu tempo também é crescer.",
    "Descansar a mente e o corpo faz parte do processo de criar com alma.",
    "Você não precisa dar conta de tudo o tempo todo. Seja gentil consigo mesma.",
    "O amor próprio é a raiz forte que sustenta todas as suas outras realizações.",
    "Diga 'sim' para as suas prioridades e 'não' para aquilo que rouba a sua paz.",
    "A sua saúde mental e o seu descanso são inegociáveis e preciosos.",
    "Não se compare com o palco alheio quando você só conhece os seus bastidores.",
    "Permita-se viver momentos em que a única tarefa é simplesmente existir e relaxar.",
    "Alimente a sua mente com afeto, seu corpo com movimento e sua alma com paz.",
    "Você é a sua morada principal: faça dela um lugar aconchegante para habitar.",
    "Reconheça a sua beleza única e a preciosidade de ser exatamente quem você é.",
    "Que o seu dia tenha pausas para um chá, um respiro fundo e um afago na alma.",
    "Comemore as suas pequenas conquistas diárias que só você sabe o custo que tiveram.",
    "Acolha os dias nublados com a certeza de que o sol sempre volta a brilhar."
]

sc_openers = [
    "Permita-se uma pausa consciente:", "Acalme os pensamentos e", "O descanso da mente", "Respire fundo e lembre-se:",
    "Cuidar da sua saúde emocional", "Ouvir os sinais do seu corpo", "Um momento de silêncio sincero", "Respeitar o seu limite",
    "Fazer uma pausa para um café ou chá", "A gentileza consigo mesma", "Desacelerar o ritmo dos dias", "Proteger a sua energia vital"
]
sc_middles = [
    "é essencial para recarregar as energias e", "faz um bem enorme para a alma e", "renova a criatividade permitindo que você",
    "acalma o coração ansioso para que você possa", "te devolve a clareza e a leveza necessárias para",
    "afasta o esgotamento precoce e", "traz equilíbrio para a rotina e", "te lembra com ternura da importância de"
]
sc_ends = [
    "viver com mais serenidade, saúde e disposição.", "apreciar a beleza dos instantes sem pressa.",
    "continuar criando com amor e sem sobrecarga.", "fazer da paz interior a sua maior prioridade.",
    "acolher suas emoções com carinho e sem autocobrança excessiva.", "voltar para o seu centro e reencontrar a harmonia.",
    "proteger o seu sono e nutrir pensamentos gentis.", "lembrar que descansar também faz parte do trabalho bem feito."
]

sc_quotes = list(self_care_base)
for o in sc_openers:
    for m in sc_middles:
        for e in sc_ends:
            sc_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(sc_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(sc_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(sc_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/selfCare.ts', 'QUOTES_SELF_CARE', sc_quotes[:370])

# 6. GRATIDÃO E MINDFULNESS (366+)
gratitude_base = [
    "A gratidão transforma o que temos no suficiente para sermos plenas.",
    "Desacelere a mente, respire fundo e aprecie a beleza dos pequenos instantes.",
    "Hoje é um presente precioso: cultive a paz interior e o equilíbrio.",
    "A vida acontece no presente; viva este dia com leveza e serenidade.",
    "Agradecer abre portas que a pressa e a reclamação costumam fechar.",
    "A verdadeira riqueza é uma mente tranquila e um coração agradecido.",
    "Permita-se pausas silenciosas: descansar também é cuidar do seu propósito.",
    "Que a sua única pressa seja a de viver em paz e em harmonia consigo mesma.",
    "A felicidade não é o destino final, mas o modo sereno como você escolhe caminhar.",
    "Respire a calmaria, expire a pressa e confie no ritmo natural das coisas.",
    "A beleza da vida se esconde nos detalhes mais simples feitos com carinho.",
    "Cultive pensamentos gentis e a sua rotina se encherá de momentos de luz.",
    "Abençoe o seu dia logo pela manhã com um sorriso e um coração grato.",
    "Menos pressa, mais presença; menos cobrança, mais acolhimento.",
    "Cada respiração consciente é uma oportunidade para recomeçar em paz.",
    "Aprecie a xícara de café quente, o silêncio da manhã e a bênção de estar viva.",
    "O momento presente é o único lugar onde você tem o poder real de agir.",
    "Deixe ir o que passou, confie no que virá e abrace com gratidão o hoje.",
    "A paz não é a ausência de problemas, mas a presença de serenidade interior.",
    "Cultive o hábito de agradecer por três coisas boas antes de dormir.",
    "A leveza da alma atrai pessoas, ideias e oportunidades luminosas.",
    "Que o seu coração seja um refúgio de tranquilidade mesmo em dias agitados.",
    "Agradeça pelo caminho percorrido tanto quanto celebra o destino alcançado.",
    "Dê a si mesma permissão para viver com calma, sem a tirania do imediatismo.",
    "A vida fica mais doce quando você decide enxergar bênçãos em cada detalhe."
]

gr_openers = [
    "Um coração grato logo pela manhã", "Viver com atenção plena", "A gratidão sincera pelas pequenas coisas", "Saborear o momento presente",
    "Apreciar a simplicidade do cotidiano", "Olhar o dia com olhos de agradecimento", "A serenidade de quem vive o agora",
    "Agradecer antes mesmo de receber", "Cultivar a calmaria interior", "Estar inteira no momento presente",
    "A beleza de um instante sem pressa", "Enxergar a graça nos pequenos detalhes"
]
gr_middles = [
    "transforma a rotina em poesia e", "atrai mais bênçãos e leveza para", "enche a casa de harmonia e",
    "dissolve as angústias do amanhã e", "faz a alma respirar aliviada ao", "ensina a valorizar o que realmente importa e",
    "traz uma doçura incomparável para", "acalma a pressa do mundo permitindo que você", "revela milagres escondidos no cotidiano e"
]
gr_ends = [
    "possa viver este dia com plenitude e paz.", "faça de cada momento uma celebração da vida.",
    "saboreie a felicidade genuína que mora no simples.", "descubra que ser grata é o caminho mais rápido para a alegria.",
    "irradie serenidade para todos que cruzarem o seu caminho.", "desfrute da paz profunda que só a gratidão proporciona.",
    "acolha o dia de hoje como a mais linda dádiva.", "mantenha a mente tranquila e o coração em festa."
]

gr_quotes = list(gratitude_base)
for o in gr_openers:
    for m in gr_middles:
        for e in gr_ends:
            gr_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(gr_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(gr_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(gr_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/gratitudeMindfulness.ts', 'QUOTES_GRATITUDE_MINDFULNESS', gr_quotes[:370])

# 7. EMPREENDEDORISMO E ATELIÊ (366+)
ent_base = [
    "A criatividade é a inteligência se divertindo e transformando afeto em arte.",
    "O capricho que você coloca em cada detalhe é a sua assinatura mais valiosa.",
    "Trabalhe pelo seu sonho para não passar a vida inteira construindo o de outro.",
    "Ideias sem execução são apenas ilusões. Tire do papel com coragem e amor!",
    "Valorize o seu trabalho manual: aquilo que é feito com a alma tem valor inestimável.",
    "Seja apaixonada pelo que faz e o mundo reconhecerá a excelência da sua marca.",
    "Construir um negócio com propósito é deixar um legado de beleza no mundo.",
    "A inovação começa quando você decide fazer o comum de um jeito extraordinário.",
    "O capricho nos acabamentos é o que torna o seu produto inesquecível.",
    "Precifique com dignidade, produza com amor e encante cada cliente.",
    "A melhor propaganda do seu ateliê é a entrega impecável feita com o coração.",
    "Toda grande marca de sucesso começou em uma mesa simples com uma ideia corajosa.",
    "Transforme sua paixão em projeto, seu projeto em produto e seu produto em história.",
    "Empreender na papelaria é encadernar sonhos e organizar a vida das pessoas.",
    "Não tenha medo de recomeçar ou ajustar a rota: a flexibilidade é virtude criativa.",
    "A organização do seu ateliê traz clareza para a mente e produtividade para os dias.",
    "O amor colocado no que fazemos é sentido por todos que recebem nosso trabalho.",
    "Cada cliente que confia no seu trabalho é um voto de carinho na sua dedicação.",
    "A persistência do empreendedor transforma pequenas sementes em colheitas fartas.",
    "Aprenda algo novo todos os dias e veja o seu negócio florescer continuamente."
]

ent_openers = [
    "O trabalho feito à mão com carinho", "A criatividade em ação no ateliê", "O capricho em cada acabamento",
    "Empreender com propósito e afeto", "A dedicação aos detalhes artesanais", "Criar com a alma e produzir com amor",
    "A paixão pela encadernação e papelaria", "Construir um negócio criativo sólido", "A excelência em cada entrega do ateliê",
    "A coragem de inovar nos projetos", "Valorizar o tempo e o talento manual", "Transformar folhas em memórias organizadas"
]
ent_middles = [
    "tem um valor único que", "conquista o coração dos clientes e", "deixa uma marca inesquecível porque",
    "transforma materiais simples em pura arte e", "gera prosperidade sustentável quando você decide",
    "eleva o padrão da papelaria artesanal e", "mostra o poder do artesanato moderno ao",
    "traz orgulho para a jornada empreendedora e", "abre caminhos para parcerias duradouras e"
]
ent_ends = [
    "encanta cada pessoa que recebe o seu trabalho.", "faz a sua marca florescer com dignidade e reconhecimento.",
    "mostra que o feito à mão carrega emoção e história.", "inspira outras artesãs e criadoras pelo Brasil.",
    "transforma o seu ateliê em um negócio próspero e admirado.", "prova que o capricho sincero é o melhor marketing que existe.",
    "preenche os seus dias de satisfação e independência financeira.", "faz de cada caderno e agenda um instrumento de amor e organização."
]

ent_quotes = list(ent_base)
for o in ent_openers:
    for m in ent_middles:
        for e in ent_ends:
            ent_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(ent_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(ent_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(ent_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/entrepreneurshipCreativity.ts', 'QUOTES_ENTREPRENEURSHIP_CREATIVITY', ent_quotes[:370])

# 8. HÁBITOS, SUCESSO E PROPÓSITO (366+)
habits_base = [
    "A disciplina diária constrói em silêncio o futuro que a sua mente planeja.",
    "Seus hábitos definem o seu amanhã: cuide com carinho de cada escolha de hoje.",
    "Quem tem clareza de propósito não se perde em distrações temporárias.",
    "A consistência diária vence o cansaço e supera qualquer montanha.",
    "Não negocie os seus sonhos com a procrastinação ou com o medo de errar.",
    "Planeje com sabedoria, execute com foco e colha com gratidão profunda.",
    "Pequenas vitórias acumuladas todos os dias transformam vidas inteiras.",
    "O seu tempo é o seu ativo mais precioso: invista-o naquilo que realmente importa.",
    "Grandes metas exigem rotinas conscientes e muita paciência com os processos.",
    "O segredo para terminar grandes projetos é a coragem de começar hoje.",
    "A excelência se torna natural quando o capricho vira o seu hábito diário.",
    "Transforme intenções em compromissos firmes escritos na sua agenda.",
    "Mantenha os olhos na meta, os pés no chão e o coração cheio de fé.",
    "A clareza mental nasce da organização sincera da sua rotina diária.",
    "Mais vale um passo firme dado hoje do que mil planos perfeitos na gaveta.",
    "Diga não com elegância ao que te afasta dos seus maiores objetivos.",
    "O foco é a arte de escolher o essencial e abrir mão do supérfluo com coragem.",
    "O sucesso sustentável é construído um dia de cada vez com humildade.",
    "Crie um ambiente que inspire a sua produtividade e proteja a sua energia.",
    "Seja fiel aos seus compromissos e veja as portas certas se abrirem diante de você."
]

hab_openers = [
    "A força de um hábito positivo", "Começar o dia com intenção e foco", "A clareza dos seus objetivos", "Organizar o tempo com sabedoria",
    "A constância de 1% a cada dia", "Uma rotina bem estruturada na agenda", "A disciplina para fazer o necessário",
    "Manter o foco no que realmente importa", "A prática diária de hábitos saudáveis", "Eliminar distrações com firmeza",
    "Escrever as metas com compromisso", "A intencionalidade em cada ação"
]
hab_middles = [
    "multiplica a sua produtividade e", "elimina a sobrecarga mental para que você possa", "cria uma ponte inabalável entre o planejamento e",
    "te afasta da paralisia permitindo que você", "fortalece a sua mente diariamente e", "garante uma evolução contínua que",
    "transforma a rotina em um trampolim para", "te dá a serenidade necessária para", "constrói os alicerces perfeitos para"
]
hab_ends = [
    "concluir cada etapa com excelência e tranquilidade.", "alcançar o sucesso duradouro sem perder a sua paz.",
    "ver seus maiores projetos se tornarem realidade concreta.", "manter o ritmo e terminar tudo o que começou.",
    "viver com propósito, foco e realização plena.", "fazer do seu tempo o maior aliado do seu crescimento pessoal.",
    "bater metas desafiadoras com método e leveza.", "construir um estilo de vida que honra a sua inteligência e visão."
]

hab_quotes = list(habits_base)
for o in hab_openers:
    for m in hab_middles:
        for e in hab_ends:
            hab_quotes.append(f"{o} {m} {e}")
            if len(deduplicate_and_validate(hab_quotes, 0)) >= 380:
                break
        if len(deduplicate_and_validate(hab_quotes, 0)) >= 380:
            break
    if len(deduplicate_and_validate(hab_quotes, 0)) >= 380:
        break

save_ts('core/constants/quotesData/successHabits.ts', 'QUOTES_SUCCESS_HABITS', hab_quotes[:370])

print("All 8 files generated successfully with >= 366 unique quotes each!")
