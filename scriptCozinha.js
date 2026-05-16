/// Cozinha 

console.log("COZINHA ONLINE");

const conteudoCozinha = document.querySelector(".conteudoCozinha");

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

    if (pedidos.length === 0) {

        conteudoCozinha.innerHTML = `
            <div class="semPedidos">
                <h1>Nenhum pedido aberto</h1>
                <p>A cozinha está vazia no momento</p>
            </div>
        `;

        return;
    }

    /* Agrupar por pedido_id */
    const pedidosAgrupados = {};

    pedidos.forEach(item => {

        if (!pedidosAgrupados[item.pedido_id]) {

            pedidosAgrupados[item.pedido_id] = {
                mesa: item.mesa,
                horario: formatarHorario(item.data_hora),
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

        pedido.itens.forEach(item => {

            itensHTML += `
                <p>
                    ${item.quantidade}x ${item.produto}
                </p>
            `;
        });




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


                <div class="acoesCozinha">

                    <button 
                        class="botaoCardCozinha botaoCancelarCozinha"
                        onclick="cancelarPedido(${pedidoId})"
                    >
                        Cancelar
                    </button>

                    <button 
                        class="botaoCardCozinha botaoPronto"
                        onclick="pedidoPronto(${pedidoId})"
                    >
                        Pronto
                    </button>

                </div>

            </div>
        `;
    }
}




/* =========================
   PEDIDO PRONTO
========================= */
async function pedidoPronto(pedido_id) {

    try {

        await fetch(
            `http://localhost:5000/pedido/${pedido_id}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: "pronto"
                })
            }
        );

        buscarPedidos();

    } catch (erro) {

        console.log(
            "Erro ao atualizar pedido:",
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
   FORMATAR HORA
========================= */
function formatarHorario(data) {

    return data;
}