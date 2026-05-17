/// Cozinha

console.log("COZINHA ONLINE");

const conteudoCozinha = document.querySelector(
    ".conteudoCozinha"
);

buscarPedidos();

/* Atualiza automático */
setInterval(() => {
    buscarPedidos();
}, 5000);




/* =========================
   BUSCAR PEDIDOS
========================= */
async function buscarPedidos() {

    try {

        const response = await fetch(
            "http://localhost:5000/cozinha"
        );

        const pedidos = await response.json();

        console.log(pedidos);

        renderizarPedidos(pedidos);

    } catch (erro) {

        console.log(
            "Erro ao buscar pedidos:",
            erro
        );
    }
}




/* =========================
   RENDERIZAR
========================= */
function renderizarPedidos(pedidos) {

    conteudoCozinha.innerHTML = "";



    /* Sem pedidos */
    if (pedidos.length === 0) {

        conteudoCozinha.innerHTML = `
            <div class="semPedidos">
                <h1>Nenhum pedido aberto</h1>
                <p>A cozinha está vazia no momento</p>
            </div>
        `;

        return;
    }



    /* Agrupar por pedido */
    const pedidosAgrupados = {};

    pedidos.forEach(item => {

        if (!pedidosAgrupados[item.pedido_id]) {

            pedidosAgrupados[item.pedido_id] = {
                mesa: item.mesa,
                horario: formatarHorario(item.horario),
                itens: []
            };
        }

        pedidosAgrupados[item.pedido_id]
            .itens
            .push(item);
    });




    /* Criar cards */
    for (const pedidoId in pedidosAgrupados) {

        const pedido = pedidosAgrupados[pedidoId];

        let itensHTML = "";



        /* Itens */
        pedido.itens.forEach(item => {

            itensHTML += `
                <div class="itemCozinha">

                    <p>
                        ${item.quantidade}x ${item.produto}
                    </p>

                    <div class="acoesItemCozinha">

                        <button 
                            class="botaoCardCozinha botaoCancelarItem botaoCancelarCozinha"
                            onclick="cancelarItem(${item.item_id})"
                        >
                            Cancelar
                        </button>

                        <button 
                            class="botaoCardCozinha botaoPronto"
                            onclick="itemPronto(${item.item_id})"
                        >
                            Pronto
                        </button>

                    </div>

                </div>
            `;
        });




        /* Card */
        conteudoCozinha.innerHTML += `
            <div class="cardCozinha">

                <header>

                    <div>
                        <p>Mesa</p>
                        <p>${pedido.horario}</p>
                    </div>

                    <h1>
                        ${String(pedido.mesa).padStart(2, "0")}
                    </h1>

                </header>


                <article>
                    ${itensHTML}
                </article>



            </div>
        `;
    }
}





/* =========================
   ITEM PRONTO
========================= */
async function itemPronto(item_id) {

    try {

        await fetch(
            `http://localhost:5000/item/${item_id}/pronto`,
            {
                method: "PUT"
            }
        );

        buscarPedidos();

    } catch (erro) {

        console.log(
            "Erro ao atualizar item:",
            erro
        );
    }
}




/* =========================
   CANCELAR PEDIDO
========================= */
async function cancelarPedido(pedido_id) {

    try {

        await fetch(
            `http://localhost:5000/pedido/${pedido_id}/status`,
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

        buscarPedidos();

    } catch (erro) {

        console.log(
            "Erro ao cancelar pedido:",
            erro
        );
    }
}

/* =========================
   CANCELAR ITEM
========================= */
async function cancelarItem(item_id) {

    try {

        await fetch(
            `http://localhost:5000/item/${item_id}/cancelar`,
            {
                method: "PUT"
            }
        );

        buscarPedidos();

    } catch (erro) {

        console.log(
            "Erro ao cancelar item:",
            erro
        );
    }
}


/* =========================
   FORMATAR HORA
========================= */
function formatarHorario(data) {

    return data;
}