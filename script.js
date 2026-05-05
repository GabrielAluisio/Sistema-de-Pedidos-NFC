document.addEventListener("DOMContentLoaded", () => {
    renderizarProdutos("entradas");
    botaoVerItem()
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
        nome: "X-Bacon",
        preco: 30.00,
        categoria: "burgers tradicionais",
        imagem: "xbacon.png"
    }
];

let carrinho = [];

function botaoVerItem() {
    const botaoVer = document.querySelector(".botaoVer");

    if (carrinho.length === 0) {
        botaoVer.classList.add("naoTem");
    } else {
        botaoVer.classList.remove("naoTem");
    }
}

function aparecerCarrinho(){
    const modal  = document.querySelector(".verPedido");

    if (modal.classList.contains("escondido")){
        modal.classList.remove("escondido");
        modal.classList.add("visivel");

    }else{
        modal.classList.remove("visivel");
        modal.classList.add("escondido");
    }
}

function verPedido(){
    aparecerCarrinho()

    const conteinerCarrinho = document.querySelector(".conteinerCarrinho")



    conteinerCarrinho.innerHTML = ""; 



    carrinho.forEach(item => {
        conteinerCarrinho.innerHTML += `
            <div class="itensConteinerCarrinho">
                <img src="imagens/${item.imagem}" alt="">

                <div class="meioNome">
    
                    <div class="linha1">
                        <h3>${item.nome}</h3>

                        <div class="quantidade">
                            <button class="diminuir" onclick="diminuir()">-</button>
                            <span class="qtd">${item.quantidade}</span>
                            <button class="aumentar" onclick="aumentar()">+</button>
                        </div>
                    </div>

                    <div class="linha2">
                        <button class="detalhe">Detalhes</button>
                        <button class="excluir">Excluir</button>
                    </div>

                </div>


                <span class="preco">R$ ${item.preco.toFixed(2)}</span>
            </div>
        `;
    });

    const footterPrecoTotal = document.querySelector(".precoTotal");
    
    footterPrecoTotal.innerHTML = '';

    let precoTotal = 0
        
    carrinho.forEach(item => {
        precoTotal += (item.preco * item.quantidade) 
    });


    footterPrecoTotal.innerHTML = `R$ ${precoTotal.toFixed(2)}`;
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

    
    if (carrinho.length === 0) {
        container.style.border = 'none';
    } else {
        container.style.border = '2px solid rgba(0, 0, 0, 0.699)';
    }

        
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
    botaoVerItem()
}

document.querySelectorAll(".menu-lateral li").forEach(item => {
    item.addEventListener("click", () => {
        const categoria = item.dataset.categoria;
        const nome_comidas = document.querySelector("#nome_comidas");
        nome_comidas.innerHTML = categoria;
        renderizarProdutos(categoria);
    });
});

function finalizarPedido() {
    const modal = document.querySelector(".pedidoEnviado");

    modal.classList.remove("escondido");
}

function fecharMensagem() {
    const modal = document.querySelector(".pedidoEnviado");

    modal.classList.add("escondido");
    location.reload();

    setTimeout(() => {
        location.reload();
    }, 300); // tempo opcional
}
