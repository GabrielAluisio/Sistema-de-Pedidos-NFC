document.addEventListener("DOMContentLoaded", () => {
    renderizarProdutos("entradas");
    naoCarrinho();
});

/*Função de exemplo*/

const produtos = [
    {
        nome: "Batata frita com bacon e cheddar",
        preco: 25.00,
        categoria: "entradas",
        imagem: "batata.png"
    },
    {
        nome: "Nuggets crocantes",
        preco: 18.00,
        categoria: "entradas",
        imagem: "nuggets.png"
    },
    {
        nome: "Nuggets crocantes",
        preco: 18.00,
        categoria: "entradas",
        imagem: "nuggets.png"
    },
    {
        nome: "Nuggets crocantes",
        preco: 18.00,
        categoria: "entradas",
        imagem: "nuggets.png"
    },
    {
        nome: "Nuggets crocantes",
        preco: 18.00,
        categoria: "entradas",
        imagem: "nuggets.png"
    },
    {
        nome: "Nuggets crocantes",
        preco: 18.00,
        categoria: "entradas",
        imagem: "nuggets.png"
    },
    {
        nome: "Nuggets crocantes",
        preco: 18.00,
        categoria: "entradas",
        imagem: "nuggets.png"
    },
    {
        nome: "X-Bacon",
        preco: 30.00,
        categoria: "burgers tradicionais",
        imagem: "xbacon.png"
    }
];

let carrinho = [];

function naoCarrinho() {
    const carrinhoEl = document.querySelector(".carrinho");

    if (carrinho.length === 0) {
        carrinhoEl.classList.add("escondido");
        carrinhoEl.classList.remove("visivel");
    } else {
        carrinhoEl.classList.remove("escondido");
        carrinhoEl.classList.add("visivel");
    }
}

function renderizarProdutos(categoria) {
    const container = document.querySelector(".produtos");

    container.innerHTML = ""; // limpa

    const filtrados = produtos.filter(p => p.categoria === categoria);

    filtrados.forEach((produto, index) => {
        container.innerHTML += `
            <div class="card" data-index="${index}">
                <img src="imagens/${produto.imagem}" alt="">
                <div class="info">
                    <h3>${produto.nome}</h3>
                    <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                </div>
            </div>
        `;
    });

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const index = card.dataset.index;
            adicionarAoCarrinho(filtrados[index]);
        });
    });
}


function atualizarCarrinho() {
        const container = document.querySelector(".card-carrinho");
        const precoResumo = document.querySelector(".preço-resumo");

        container.innerHTML = "";

        let precoTotal = 0
        
        carrinho.forEach(item => {
            precoTotal += (item.preco * item.quantidade) 
        });

        precoResumo.innerHTML = `Total R$ ${precoTotal.toFixed(2)}`;

        carrinho.forEach(item => {
            container.innerHTML += `
                <div class="item-carrinho">
                    <p>${item.quantidade}x ${item.nome}</p>
                </div>
            `;
        });

        naoCarrinho();
    }

    function adicionarAoCarrinho(produto) {

        const itemExistente = carrinho.find(item => item.nome === produto.nome);

        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({
                ...produto,
                quantidade: 1
            });
        }

        atualizarCarrinho();
    }

document.querySelectorAll(".menu-lateral li").forEach(item => {
    item.addEventListener("click", () => {
        const categoria = item.dataset.categoria;
        const nome_comidas = document.querySelector("#nome_comidas");
        nome_comidas.innerHTML = categoria;
        renderizarProdutos(categoria);
    });
});