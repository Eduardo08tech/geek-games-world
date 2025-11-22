document.addEventListener('DOMContentLoaded', () => {
    const frasesMotivacionais = [
        "A vida é como um jogo, mas com gráficos incríveis.",
        "Não pause seu jogo, pause seus medos.",
        "Em um mundo de missões secundárias, não se esqueça da sua principal.",
        "Cada novo nível é um novo desafio. Continue jogando!",
        "Você é o herói da sua própria história. Faça valer a pena.",
        "A persistência leva ao 'level up' na vida real.",
        "Não tenha medo de falhar. É apenas um 'game over' temporário.",
        "Desbloqueie seu potencial máximo. O próximo achievement espera por você.",
        "A vida é o maior dos jogos co-op. Jogue bem com os outros.",
        "Seu único limite é o 'loading' da sua imaginação.",
        "A vida é como um videogame: o importante é nunca desistir, mas sim aprender com cada derrota para evoluir de fase",
        "Mais importante do que zerar o jogo é aproveitar cada missão e cada aventura.",
        "A cada derrota, um aprendizado. A cada vitória, um impulso para a próxima fase."
    ];

    const elementoFrase = document.getElementById('frase');
    const indiceAleatorio = Math.floor(Math.random() * frasesMotivacionais.length);
    elementoFrase.textContent = `"${frasesMotivacionais[indiceAleatorio]}"`;
});

let cardContainer = document.querySelector(".card-container");
let campoBusca = document.querySelector("#campo-busca");
let conteudoPrincipal = document.querySelector(".conteudo-principal");
let filtrosGeneroContainer = document.querySelector("#filtros-genero");
let filtrosPlataformaContainer = document.querySelector("#filtros-plataforma");
let dados = [];
let botaoBusca = document.querySelector("#botao-busca");
let debounceTimeout;
let primeiraBuscaRealizada = false;

// Carrega os dados e inicializa a aplicação
async function inicializar() {
    try {
        let resposta = await fetch("data.json");
        dados = await resposta.json();
        criarFiltros();
        
        // Adiciona animação de pulso ao botão de busca
        botaoBusca.style.animation = 'pulse 2s infinite';

        // Adiciona os event listeners após os dados serem carregados
        botaoBusca.addEventListener("click", realizarBusca);
        campoBusca.addEventListener("input", handleBuscaInput);
        campoBusca.addEventListener("keydown", handleBuscaKeyDown);
        filtrosGeneroContainer.addEventListener("change", aplicarFiltros);
        filtrosPlataformaContainer.addEventListener("change", aplicarFiltros);

        // Funcionalidade do accordion de filtros para mobile
        const filtrosToggle = document.querySelector('.filtros-toggle');
        const filtrosContainer = document.querySelector('.filtros-container');

        if (filtrosToggle && filtrosContainer) {
            filtrosToggle.addEventListener('click', () => {
                filtrosContainer.classList.toggle('ativo');
            });
        }
    } catch (error) {
        console.error("Erro ao carregar os dados dos jogos:", error);
        cardContainer.innerHTML = "<p>Não foi possível carregar os jogos. Tente novamente mais tarde.</p>";
    }
}

function realizarBusca() {
    if (!primeiraBuscaRealizada) {
        document.body.classList.add('busca-realizada');
        botaoBusca.style.animation = 'none'; // Remove a animação após o clique
        primeiraBuscaRealizada = true;
    }

    // 1. Torna o conteúdo principal visível
    conteudoPrincipal.classList.add('visivel');
    // 2. Aplica os filtros (que renderizarão os cards)
    aplicarFiltros();
}

function handleBuscaInput() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        realizarBusca();
    }, 500); // Espera 500ms após o usuário parar de digitar
}

function handleBuscaKeyDown(event) {
    if (event.key === 'Enter') {
        realizarBusca();
    }
}
function criarFiltros() {
    const todosGeneros = new Set();
    const todasPlataformas = new Set();

    dados.forEach(jogo => {
        jogo.genero.forEach(g => todosGeneros.add(g));
        jogo.plataforma.forEach(p => todasPlataformas.add(p));
    });

    // Cria o contêiner para o conteúdo dos filtros (para o accordion mobile)
    const filtrosConteudo = document.createElement('div');
    filtrosConteudo.className = 'filtros-conteudo';

    // Cria checkboxes para Gêneros
    [...todosGeneros].sort().forEach(genero => {
        const div = document.createElement('div');
        div.className = 'filtro-item';
        div.innerHTML = `<input type="checkbox" id="${genero}" value="${genero}"><label for="${genero}">${genero}</label>`;
        filtrosConteudo.appendChild(div); // Adiciona ao novo contêiner
    });

    // Cria checkboxes para Plataformas
    [...todasPlataformas].sort().forEach(plataforma => {
        const div = document.createElement('div');
        div.className = 'filtro-item';
        div.innerHTML = `<input type="checkbox" id="${plataforma}" value="${plataforma}"><label for="${plataforma}">${plataforma}</label>`;
        filtrosConteudo.appendChild(div); // Adiciona ao novo contêiner
    });

    document.querySelector('.filtros-container').appendChild(filtrosConteudo);
}

function aplicarFiltros() {
    let termoBusca = campoBusca.value.toLowerCase();

    const generosSelecionados = [...filtrosGeneroContainer.querySelectorAll('input:checked')].map(input => input.value);
    const plataformasSelecionadas = [...filtrosPlataformaContainer.querySelectorAll('input:checked')].map(input => input.value);

    const resultados = dados.filter(jogo => {
        // Filtro de busca por texto
        const correspondeBusca = termoBusca === '' ||
            jogo.nome.toLowerCase().includes(termoBusca) ||
            jogo.descricao.toLowerCase().includes(termoBusca);

        // Filtro por gênero
        const correspondeGenero = generosSelecionados.length === 0 ||
            generosSelecionados.some(genero => jogo.genero.includes(genero));

        // Filtro por plataforma
        const correspondePlataforma = plataformasSelecionadas.length === 0 ||
            plataformasSelecionadas.some(plataforma => jogo.plataforma.includes(plataforma));

        return correspondeBusca && correspondeGenero && correspondePlataforma;
    });
    
    renderizarCards(resultados);
}

function renderizarCards(dados) {
    // Limpa o container antes de renderizar novos cards
    cardContainer.innerHTML = "";

    for (let dado of dados) {
        let article = document.createElement("article");
        article.classList.add("card");
        article.innerHTML = `
            <h2>${dado.nome} (${dado.ano})</h2>
            <p>${dado.descricao}</p>
            <p><strong>Gêneros:</strong> ${dado.genero.join(", ")}</p>
            <p><strong>Plataformas:</strong> ${dado.plataforma.join(", ")}</p>
            <a href="${dado.link}" target="_blank">Saiba mais</a>
        `
        cardContainer.appendChild(article);
    }
}

inicializar(); // Inicia a aplicação