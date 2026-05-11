document.addEventListener("DOMContentLoaded", () => {
    verificarPedidoExistente();
    botaoVerItem();
    
});

/*Função de exemplo*/

const produtos = [
    {
        nome: "Batata frita",
        preco: 20.00,
        categoria: "entradas",
        imagem: "batatafrita.png"
    },
    {
        nome: "Batata frita com bacon e cheddar",
        preco: 36.00,
        categoria: "entradas",
        imagem: "batatacomcheddarebacon.png"
    },
    {
        nome: "Nuggets",
        preco: 24.00,
        categoria: "entradas",
        imagem: "nuggets.png"
    },
    {
        nome: "Big Black",
        preco: 30.00,
        categoria: "burgers tradicionais",
        imagem: "tradicional BB.png"
    }
];

let carrinho = [];


let pedido_id = null;


/*Cria uma nova comanda no Bancos de dados. Back: "INSERT INTO Pedidos (mesa_id, status) VALUES (%s, 'aberto')",*/ 
async function novoPedido() {

    const params = new URLSearchParams(window.location.search);

    const mesaId = params.get("mesa");

    try {

        const response = await fetch("http://localhost:5000/pedido", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                mesa_id: mesaId
            })
        });

        const data = await response.json();

        pedido_id = data.pedido_id;

        console.log("Pedido criado:", pedido_id);

        entrarSistema();

    } catch (erro) {

        console.log("Erro ao criar pedido:", erro);

    }
}

/// Verifica se o pedido Existe no Bancos de dados
async function verificarPedidoExistente() {

    const btnContinuar = document.querySelector(".btnContinuar");

    const params = new URLSearchParams(window.location.search);

    const mesaId = params.get("mesa");

    const response = await fetch(
        `http://localhost:5000/pedido/mesa/${mesaId}`
    );

    const data = await response.json();

    if (data.id) {

        pedido_id = data.id;

        btnContinuar.disabled = false;
        btnContinuar.style.opacity = "1";
        btnContinuar.style.cursor = "pointer";

    } else {

        btnContinuar.disabled = true;
        btnContinuar.style.opacity = "0.5";
        btnContinuar.style.cursor = "not-allowed";
    }
}

async function continuarPedido() {

    const params = new URLSearchParams(window.location.search);
    const mesaId = params.get("mesa");

    const response = await fetch(
        `http://localhost:5000/pedido/mesa/${mesaId}`
    );

    /// Resposta do Back
    const data = await response.json();

    if (data.id) {

        pedido_id = data.id;

        entrarSistema();

    } else {

        alert("Nenhum pedido aberto");

    }

}


function entrarSistema() {
    const telaInicial = document.querySelector(".telaInicial");
    const app = document.querySelector(".app");

    telaInicial.classList.remove("visivel");
    telaInicial.classList.add("escondido");

    app.classList.remove("escondido");
    app.classList.add("visivel");
    renderizarProdutos("entradas");
}

async function cancelarPedido() {

    const confirmar = await Swal.fire({
        title: "Deseja cancelar pedido?",
        text: "Seu pedido será apagado!",
        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "Sim",
        cancelButtonText: "Não",

        iconColor: "#ffffff",
        confirmButtonColor: "#194e00",
        cancelButtonColor: "#8b0000",
        background: "#000000d0",
        color: "#fff"

        
    });

    if (confirmar.isConfirmed) {

        carrinho = [];

        atualizarCarrinho();

        const app = document.querySelector(".app");
        const telaInicial = document.querySelector(".telaInicial");

        app.classList.add("escondido");

        telaInicial.classList.remove("escondido");
        botaoVerItem()
    }
}

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
