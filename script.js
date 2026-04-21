document.addEventListener("DOMContentLoaded", () => {
    renderizarProdutos("entradas");
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

function renderizarProdutos(categoria) {
    const container = document.querySelector(".produtos");

    container.innerHTML = ""; // limpa

    const filtrados = produtos.filter(p => p.categoria === categoria);

    filtrados.forEach(produto => {
        container.innerHTML += `
            <div class="card">
                <img src="imagens/${produto.imagem}" alt="">
                <div class="info">
                    <h3>${produto.nome}</h3>
                    <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                </div>
            </div>
        `;
    });
}


document.querySelectorAll(".menu-lateral li").forEach(item => {
    item.addEventListener("click", () => {
        const categoria = item.dataset.categoria;
        const nome_comidas = document.querySelector("#nome_comidas");
        nome_comidas.innerHTML = categoria;
        renderizarProdutos(categoria);
    });
});