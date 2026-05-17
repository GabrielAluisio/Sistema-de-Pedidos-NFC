/*Tela de carregamento */
const API_URL = "https://sistema-de-pedidos-419z.onrender.com";


const loading = document.getElementById("loading");

function mostrarLoading() {
    loading.classList.remove("escondido");
}

function esconderLoading() {
    loading.classList.add("escondido");
}

console.log("SCRIPT CARREGADO");

document.addEventListener("DOMContentLoaded", async () => {

    mostrarLoading();

    try {
        await verificarPedidoExistente();
        await buscarProdutos();
        atualizarBotaoComanda();

    } catch (erro) {
        console.log("Erro ao carregar dados:", erro);

    } finally {
        esconderLoading();
    }
});

/// Variaveis 

let produtos = [];

// Itens que o usuario clicar 
let carrinho = [];

// Itens no Banco de dados
let itensEnviados = [];

let pedido_id = null;

const categorias = {
    "entradas": 1,
    "burgers tradicionais": 2,
    "burgers especiais": 3,
    "vegetariano": 4,
    "bebidas": 5,
    "pizzas": 6,
    "sobremesas": 7
};



async function buscarProdutos() {

    const response = await fetch(
        `${API_URL}/produtos`
    );

    produtos = await response.json();

    renderizarProdutos("entradas");

    console.log(produtos)
}




/// Função só para tirar a tela inicial
function entrarSistema() {
    const telaInicial = document.querySelector(".telaInicial");
    const app = document.querySelector(".app");

    telaInicial.classList.remove("visivel");
    telaInicial.classList.add("escondido");

    app.classList.remove("escondido");
    app.classList.add("visivel");
    renderizarProdutos("entradas");
}

/*Cria uma nova comanda no Bancos de dados. Back: "INSERT INTO Pedidos (mesa_id, status) VALUES (%s, 'aberto')",*/ 

async function novoPedido() {

    mostrarLoading();

    const params = new URLSearchParams(window.location.search);
    const mesaId = params.get("mesa");

    try {

        // 🔥 verifica se já existe pedido aberto
        const responseCheck = await fetch(
            `${API_URL}/pedido/mesa/${mesaId}`
        );

        const pedidoExistente = await responseCheck.json();

        // 🔴 SE EXISTE PEDIDO ABERTO
        if (pedidoExistente.id) {
            esconderLoading();

            const confirmar = await Swal.fire({
                title: "Já existe um pedido aberto",
                text: "Se continuar, o pedido atual será finalizado e substituído. Deseja continuar?",
                icon: "warning",

                showCancelButton: true,
                confirmButtonText: "Sim, continuar",
                cancelButtonText: "Cancelar",

                iconColor: "#ffffff",
                confirmButtonColor: "#8b0000",
                cancelButtonColor: "#194e00",
                background: "#000000d0",
                color: "#fff"
            });

            // ❌ cancelou → não faz nada
            if (!confirmar.isConfirmed) {
                esconderLoading();
                return ;
            }
            
        }

        mostrarLoading();

        // 🔥 cria novo pedido (ou substitui)
        const response = await fetch(
            `${API_URL}/pedido`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mesa_id: mesaId
                })
            }
        );

        const data = await response.json();

        pedido_id = data.pedido_id;

        entrarSistema();

    } catch (erro) {

        console.log("Erro ao criar pedido:", erro);
    }finally {
        esconderLoading();
    }
}


/// Verifica se o pedido Existe no Bancos de dados
async function verificarPedidoExistente() {

    const btnContinuar = document.querySelector(".btnContinuar");

    const params = new URLSearchParams(window.location.search);

    const mesaId = params.get("mesa");

    const response = await fetch(
        `${API_URL}/pedido/mesa/${mesaId}`
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

    const response = await fetch(
        `${API_URL}/pedido/${pedido_id}/itens`
    );

    const itens = await response.json();

    itensEnviados = itens.map(item => ({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco_unitario,
        imagem_url: item.imagem_url
    }));


    atualizarBotaoComanda();

    entrarSistema();

}





async function cancelarPedido() {

    const confirmar = await Swal.fire({
        title: "Cancelar pedido?",
        text: "Isso vai cancelar toda a comanda.",
        icon: "warning",

        showCancelButton: true,
        confirmButtonText: "Sim, cancelar",
        cancelButtonText: "Não",

        iconColor: "#ffffff",
        confirmButtonColor: "#8b0000",
        cancelButtonColor: "#194e00",
        background: "#000000d0",
        color: "#fff"
    });

    if (!confirmar.isConfirmed) return;

    // 🔥 loading dentro do Swal
    Swal.fire({
        title: "Cancelando pedido...",
        text: "Aguarde um momento",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {

        await fetch(
            `${API_URL}/pedido/${pedido_id}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: "cancelado"
                })
            }
        );

        // 🔥 limpa estado
        carrinho = [];
        itensEnviados = [];
        pedido_id = null;

        atualizarCarrinho();
        atualizarBotaoComanda();
        verificarPedidoExistente();

        // volta tela
        document.querySelector(".app").classList.add("escondido");
        document.querySelector(".telaInicial").classList.remove("escondido");

        await Swal.fire({
            title: "Pedido cancelado!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

    } catch (erro) {

        console.log("Erro ao cancelar pedido:", erro);

        Swal.fire({
            title: "Erro ao cancelar",
            icon: "error"
        });
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

// Menu sanduiche

function toggleHistorico() {
    document
        .getElementById("historicoPedidos")
        .classList.toggle("escondido");
}

function renderHistorico() {
    

    const container = document.getElementById("historicoPedidos");

    container.innerHTML = "";

    itensEnviados.forEach(item => {

        container.innerHTML += `
            <div class="itensConteinerCarrinho item-historico">

                <img src="imagens/${item.imagem_url}" alt="">

                <div class="meioNome">

                    <div class="linha1">
                        <h3>${item.nome}</h3>

                        <div class="quantidade">
                            <span class="qtd">${item.quantidade}</span>
                        </div>
                    </div>

                </div>

                <span class="preco">
                    R$ ${Number(item.preco).toFixed(2)}
                </span>

            </div>
        `;
    });
}

function excluir(index) {

    

    carrinho.splice(index, 1);
    
    const pedidoCompleto = document.querySelector(
        ".botaoEnviarCozinha"
    );

    if (carrinho.length === 0) {

        pedidoCompleto.disabled = true;
        pedidoCompleto.style.opacity = "0.5";
        pedidoCompleto.style.cursor = "not-allowed";

    } else {

        pedidoCompleto.disabled = false;
        pedidoCompleto.style.opacity = "1";
        pedidoCompleto.style.cursor = "pointer";
    }

    atualizarCarrinho();


    verCarrinho()


}

function aumentar(index) {

    carrinho[index].quantidade++;

    atualizarCarrinho();

    verCarrinho();
}

function diminuir(index) {

    if (carrinho[index].quantidade > 1) {

        carrinho[index].quantidade--;

    } else {

        carrinho.splice(index, 1);
    }

    const pedidoCompleto = document.querySelector(
        ".botaoEnviarCozinha"
    );

    if (carrinho.length === 0) {

        pedidoCompleto.disabled = true;
        pedidoCompleto.style.opacity = "0.5";
        pedidoCompleto.style.cursor = "not-allowed";

    } else {

        pedidoCompleto.disabled = false;
        pedidoCompleto.style.opacity = "1";
        pedidoCompleto.style.cursor = "pointer";
    }

    atualizarCarrinho();

    verCarrinho();
}


function verCarrinho(){

    const conteinerCarrinho = document.querySelector(".conteinerCarrinho")

    conteinerCarrinho.innerHTML = ""; 

    // 🟢 CARRINHO ATUAL
    carrinho.forEach((item, index) => {
        conteinerCarrinho.innerHTML += `
            <div class="itensConteinerCarrinho">
                <img src="imagens/${item.imagem_url}" alt="">

                <div class="meioNome">

                    <div class="linha1">
                        <h3>${item.nome}</h3>

                        <div class="quantidade">
                            <button class="diminuir" onclick="diminuir(${index})">-</button>
                            <span class="qtd">${item.quantidade}</span>
                            <button class="aumentar" onclick="aumentar(${index})">+</button>
                        </div>
                    </div>

                    <div class="linha2">
                        
                        <button class="excluir" onclick="excluir(${index})">
                            Excluir
                        </button>
                    </div>

                </div>

                <span class="preco">R$ ${Number(item.preco).toFixed(2)}</span>
            </div>
        `;
    });

    // 🔵 HISTÓRICO (itens já enviados)
    if (itensEnviados.length > 0) {

        conteinerCarrinho.innerHTML += `
            <div class="historico-container">

                <div 
                    class="historico-header" 
                    onclick="toggleHistorico()"
                >
                    ▼ Produtos já pedidos
                </div>

                <div 
                    id="historicoPedidos" 
                    class="historico-body escondido"
                >
                </div>

            </div>
        `;

        renderHistorico();

        
    }
    

    // 💰 TOTAL SOMENTE DO CARRINHO
    const footterPrecoTotal = document.querySelector(".precoTotal");

    let precoTotal = 0;

    carrinho.forEach(item => {
        precoTotal += Number(item.preco) * item.quantidade;
    });

    footterPrecoTotal.innerHTML = `R$ ${precoTotal.toFixed(2)}`;
}

function verPedido(){

    const pedidoCompleto = document.querySelector(
        ".botaoEnviarCozinha"
    );

    if (carrinho.length === 0) {

        pedidoCompleto.disabled = true;
        pedidoCompleto.style.opacity = "0.5";
        pedidoCompleto.style.cursor = "not-allowed";

    } else {

        pedidoCompleto.disabled = false;
        pedidoCompleto.style.opacity = "1";
        pedidoCompleto.style.cursor = "pointer";
    }

    verCarrinho();

    aparecerCarrinho();
}

function renderizarProdutos(categoria) {

    const container = document.querySelector(".produtos");

    container.innerHTML = "";

    const filtrados = produtos.filter(
        p => p.categoria_id === categorias[categoria]
    );

    filtrados.forEach((produto, index) => {

        container.innerHTML += `
            <div class="card" data-index="${index}">
                <img src="imagens/${produto.imagem_url}" alt="">

                <div class="info">
                    <h3>${produto.nome}</h3>

                    <span class="preco">R$ ${Number(produto.preco).toFixed(2)}</span>
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

    let precoTotal = 0;

    carrinho.forEach(item => {

        const preco = Number(item.preco || item.preco_unitario);

        precoTotal += preco * item.quantidade;

        container.innerHTML += `
            <div class="item-carrinho">
                <p>${item.quantidade}x ${item.nome}</p>
            </div>
        `;
    });

    precoResumo.innerHTML = `Total R$ ${precoTotal.toFixed(2)}`;

    container.style.border = carrinho.length === 0
        ? "none"
        : "2px solid rgba(0, 0, 0, 0.699)";
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


async function finalizarPedido() {

    Swal.fire({
        title: "Enviando pedido...",
        text: "Aguarde um momento",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {

        // 🔥 ENVIO MAIS RÁPIDO (paralelo)
        const requests = carrinho.map(item => {

            return fetch(
                `${API_URL}/pedido/${pedido_id}/item`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        produto_id: item.id,
                        quantidade: item.quantidade
                    })
                }
            );
        });

        await Promise.all(requests);

        // limpa carrinho
        carrinho = [];
        atualizarCarrinho();

        // fecha loading e mostra sucesso
        await Swal.fire({
            title: "Pedido enviado!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

        // mostra modal seu (se quiser manter)
        document.querySelector(".pedidoEnviado")
            .classList.remove("escondido");

    } catch (erro) {

        console.log("Erro ao finalizar pedido:", erro);

        Swal.fire({
            title: "Erro ao enviar pedido",
            icon: "error"
        });
    }
}

function fecharMensagem() {
    const modal = document.querySelector(".pedidoEnviado");

    modal.classList.add("escondido");

    setTimeout(() => {
        location.reload();
    }, 300); // tempo opcional
}




// Comanda 

const telaComanda = document.querySelector(".telaComanda");
const itensComanda = document.querySelector(".itensComanda");


function atualizarBotaoComanda() {

    const botaoComanda =
        document.querySelector(".botaocomanda");

    if (itensEnviados.length === 0) {

        botaoComanda.disabled = true;

        botaoComanda.style.opacity = "0.5";

        botaoComanda.style.cursor = "not-allowed";

    } else {

        botaoComanda.disabled = false;

        botaoComanda.style.opacity = "1";

        botaoComanda.style.cursor = "pointer";
    }
}

/* =========================
   ABRIR COMANDA
========================= */

async function abrirComanda() {

    Swal.fire({
        title: "Carregando comanda...",
        text: "Aguarde um momento",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {

        const response = await fetch(
            `${API_URL}/pedido/${pedido_id}`
        );

        const dados = await response.json();

        renderizarComanda(dados);

        telaComanda.classList.remove("escondido");

        Swal.close(); // 🔥 fecha loading

    } catch (erro) {

        console.log("Erro ao abrir comanda", erro);

        Swal.fire({
            title: "Erro ao carregar comanda",
            icon: "error"
        });
    }
}



/* =========================
   RENDERIZAR
========================= */

function renderizarComanda(dados) {

    itensComanda.innerHTML = "";

    let total = 0;

    const mesa = dados[0].mesa;

    document.querySelector(".numeroMesa")
        .innerHTML = String(mesa).padStart(2, "0");

    document.querySelector(".dataComanda")
        .innerHTML = formatarData(dados[0].data_hora);



    dados.forEach(item => {

        const subtotal =
            item.preco * item.quantidade;

        total += subtotal;

        itensComanda.innerHTML += `
            <div class="itemComanda">

                <div class="ladoEsquerdo">

                    <img 
                        src="imagens/${item.imagem_url}"
                    >

                    <div>
                        <h3>
                            ${item.quantidade}x ${item.nome}
                        </h3>

                        <p>
                            R$ ${subtotal.toFixed(2)}
                        </p>
                    </div>

                </div>

            </div>
        `;
    });



    document.querySelector(
        ".valorTotalComanda"
    ).innerHTML =
        `R$ ${total.toFixed(2)}`;
}



/* =========================
   FECHAR COMANDA
========================= */
document.querySelector(".fecharComanda")
.addEventListener("click", async (e) => {

    // 🔥 FORÇA tirar foco do botão
    e.currentTarget.blur();
    document.activeElement?.blur();

    const confirmar = await Swal.fire({
        title: "Fechar comanda?",
        text: "Tem certeza que deseja encerrar essa comanda?",
        icon: "warning",

        showCancelButton: true,
        confirmButtonText: "Sim, fechar",
        cancelButtonText: "Não",

        iconColor: "#ffffff",
        confirmButtonColor: "#1f8f3a",
        cancelButtonColor: "#8b0000",
        background: "#000000d0",
        color: "#fff"
    });

    if (!confirmar.isConfirmed) return;

    try {

        await fetch(
            `${API_URL}/pedido/${pedido_id}/fechar`,
            {
                method: "PUT"
            }
        );

        await Swal.fire({
            title: "Comanda fechada!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

        // 🔥 IMPORTANTE: só depois de tudo
        telaComanda.classList.add("escondido");

        location.reload();

    } catch (erro) {

        console.log("Erro ao fechar comanda", erro);
    }
});


/* =========================
   VOLTAR
========================= */

document.querySelector(".voltarComanda")
.addEventListener("click", () => {

    telaComanda.classList.add("escondido");

});



/* =========================
   FORMATAR DATA
========================= */

function formatarData(data) {
    return data;
}
