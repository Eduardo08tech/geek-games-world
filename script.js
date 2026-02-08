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

let cardContainer;
let campoBusca;
let conteudoPrincipal;
let filtrosGeneroContainer;
let filtrosPlataformaContainer;
let dados = [];
let botaoBusca;
const modal = document.getElementById('modal-jogo');
const modalCorpo = document.getElementById('modal-corpo');
const modalFechar = document.querySelector('.modal-fechar');
let secaoFavoritos;
let cardContainerFavoritos;
let debounceTimeout;
let primeiraBuscaRealizada = false;

// Lista de jogos favoritos (nomes dos jogos)
const jogosFavoritos = ["Peak", "Among Us", "Minecraft", "Grand Theft Auto V",  "Fortnite"];

// Carrega os dados e inicializa a aplicação
async function inicializar() {
    try {
        // Inicializa os elementos do DOM
        cardContainer = document.querySelector(".card-container");
        campoBusca = document.querySelector("#campo-busca");
        conteudoPrincipal = document.querySelector(".conteudo-principal");
        filtrosGeneroContainer = document.querySelector("#filtros-genero");
        filtrosPlataformaContainer = document.querySelector("#filtros-plataforma");
        botaoBusca = document.querySelector("#botao-busca");
        secaoFavoritos = document.getElementById('secao-favoritos');
        cardContainerFavoritos = document.querySelector('.card-container-favoritos');
        
        let resposta = await fetch("data.json");
        dados = await resposta.json();
        criarFiltros();
        
        // Torna o conteúdo principal visível para mostrar os favoritos
        conteudoPrincipal.classList.add('visivel');
        conteudoPrincipal.classList.add('busca-inicial');
        
        // Exibe os jogos favoritos na página inicial
        exibirFavoritos();
        
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

        // Event listeners para fechar o modal
        if (modal && modalFechar) {
            modalFechar.addEventListener('click', () => modal.classList.remove('visivel'));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) { // Fecha se clicar no overlay
                    modal.classList.remove('visivel');
                }
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
    // 2. Remove a classe de busca inicial para mostrar os filtros
    conteudoPrincipal.classList.remove('busca-inicial');
    // 3. Esconde a seção de favoritos
    secaoFavoritos.classList.add('oculto');
    // 4. Aplica os filtros (que renderizarão os cards)
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

function exibirFavoritos() {
    const jogosFavoritosFiltrados = dados.filter(jogo => jogosFavoritos.includes(jogo.nome));
    renderizarCardsFavoritos(jogosFavoritosFiltrados);
}

function renderizarCardsFavoritos(jogos) {
    // Limpa o container antes de renderizar novos cards
    cardContainerFavoritos.innerHTML = "";

    for (let jogo of jogos) {
        let div = document.createElement("div");
        div.classList.add("card-favorito");
        // Adiciona um dataset para facilmente recuperar os dados do jogo depois
        div.dataset.nomeJogo = jogo.nome;

        div.innerHTML = `
            <img src="${jogo.capa}" alt="Capa do jogo ${jogo.nome}">
            <div class="overlay-favorito">
                <h3>${jogo.nome}</h3>
            </div>
        `;

        div.addEventListener('click', () => mostrarDetalhesJogo(jogo.nome));
        cardContainerFavoritos.appendChild(div);
    }
}

function criarFiltros() {
    const todosGeneros = new Set();
    const todasPlataformas = new Set();

    dados.forEach(jogo => {
        jogo.genero.forEach(g => todosGeneros.add(g));
        jogo.plataforma.forEach(p => todasPlataformas.add(p));
    });

    // Adiciona título para Gêneros
    const tituloGenero = document.createElement('h4');
    tituloGenero.textContent = 'Gênero';
    const containerGeneros = document.createElement('div');
    filtrosGeneroContainer.appendChild(tituloGenero);
    filtrosGeneroContainer.appendChild(containerGeneros);

    // Cria checkboxes para Gêneros
    [...todosGeneros].sort().forEach(genero => {
        const div = document.createElement('div');
        div.className = 'filtro-item';
        div.innerHTML = `<input type="checkbox" id="${genero}" value="${genero}"><label for="${genero}">${genero}</label>`;
        containerGeneros.appendChild(div);
    });

    // Adiciona título para Plataformas
    const tituloPlataforma = document.createElement('h4');
    tituloPlataforma.textContent = 'Plataforma';
    const containerPlataformas = document.createElement('div');
    filtrosPlataformaContainer.appendChild(tituloPlataforma);
    filtrosPlataformaContainer.appendChild(containerPlataformas);

    // Cria checkboxes para Plataformas
    [...todasPlataformas].sort().forEach(plataforma => {
        const div = document.createElement('div');
        div.className = 'filtro-item';
        div.innerHTML = `<input type="checkbox" id="${plataforma}" value="${plataforma}"><label for="${plataforma}">${plataforma}</label>`;
        containerPlataformas.appendChild(div);
    });

    // Adicionar funcionalidade de accordion aos filtros
    const titulos = document.querySelectorAll('.filtro-grupo h4');
    titulos.forEach(titulo => {
        // Colapse por padrão
        titulo.parentElement.classList.add('colapsado');
        titulo.classList.add('colapsado');
        
        titulo.addEventListener('click', () => {
            titulo.classList.toggle('colapsado');
            titulo.parentElement.classList.toggle('colapsado');
        });
    });
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

    if (dados.length === 0) {
        cardContainer.innerHTML = `<p style="color: var(--secondary-color); font-size: 1.2rem;">Poxa, nenhum jogo encontrado. Vamos tente uma nova busca!</p>`;
        return;
    }

    for (let dado of dados) {
        let article = document.createElement("article");
        article.classList.add("card");
        // Adiciona um dataset para facilmente recuperar os dados do jogo depois
        article.dataset.nomeJogo = dado.nome;

        article.innerHTML = `
            <h2>${dado.nome} (${dado.ano})</h2>
            <p><strong>Gêneros:</strong> ${dado.genero.join(", ")}</p>
            <p><strong>Plataformas:</strong> ${dado.plataforma.join(", ")}</p>
        `;

        article.addEventListener('click', () => mostrarDetalhesJogo(dado.nome));
        cardContainer.appendChild(article);
    }
}

function mostrarDetalhesJogo(nomeJogo) {
    const jogo = dados.find(j => j.nome === nomeJogo);
    if (!jogo) return;

    modalCorpo.innerHTML = `
        <div class="modal-capa">
            <img src="${jogo.capa}" alt="Capa do jogo ${jogo.nome}">
        </div>
        <div class="modal-info">
            <h2>${jogo.nome} (${jogo.ano})</h2>
            <p class="descricao">${jogo.descricao}</p>
            <p><strong>Gêneros:</strong> ${jogo.genero.join(", ")}</p>
            <p><strong>Plataformas:</strong> ${jogo.plataforma.join(", ")}</p>
            <a href="${jogo.link}" target="_blank">Visitar Página Oficial</a>
        </div>
    `;
    modal.classList.add('visivel');
}

inicializar(); // Inicia a aplicação