import mysql.connector

#biblioteca API
from flask import Flask, request, jsonify


#puxar dados do BD no .env
from dotenv import load_dotenv
import os

#Biblioteca para o navegador na bloquear 
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)



load_dotenv()

#Criar função para conectar com o bd
def conectar_bd():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )


#Função para criar a comanda
@app.route('/pedido', methods=['POST'])
def criar_pedido():

    data = request.json
    mesa_id = data.get('mesa_id')

    conn = conectar_bd()
    cursor = conn.cursor()

    # 🔥 1. Fecha qualquer pedido aberto da mesa
    cursor.execute("""
        UPDATE Pedidos
        SET status = 'fechado'
        WHERE mesa_id = %s
        AND status = 'aberto'
    """, (mesa_id,))

    # 🔥 2. Cria novo pedido
    cursor.execute("""
        INSERT INTO Pedidos (mesa_id, status)
        VALUES (%s, 'aberto')
    """, (mesa_id,))

    conn.commit()

    pedido_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "pedido_id": pedido_id
    })

# Função para verificar se já existe a comanda 
@app.route('/pedido/mesa/<int:mesa_id>', methods=['GET'])
def buscar_pedido_aberto(mesa_id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM Pedidos
        WHERE mesa_id = %s
        AND status = 'aberto'
        ORDER BY id DESC
        LIMIT 1
    """, (mesa_id,))

    pedido = cursor.fetchone()

    cursor.close()
    conn.close()

    if pedido:
        return jsonify(pedido)
    else:
        return jsonify({"message": "Nenhum pedido aberto"})
    
@app.route('/produtos', methods=['GET'])
def listar_produtos():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM Produtos
    """)

    produtos = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(produtos)
    

#Essa função adiciona o pedido no BD. *Carrinho*
@app.route('/pedido/<int:pedido_id>/item', methods=['POST'])
def adicionar_item(pedido_id):
    data = request.json
    produto_id = data.get('produto_id')
    quantidade = data.get('quantidade', 1)

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # pega preço do produto
    cursor.execute("SELECT preco FROM Produtos WHERE id = %s", (produto_id,))
    produto = cursor.fetchone()

    if not produto:
        return jsonify({"error": "Produto não encontrado"}), 404

    preco = produto['preco']

    # verifica se já existe
    cursor.execute("""
        SELECT * FROM Itens_pedido
        WHERE pedido_id = %s AND produto_id = %s
    """, (pedido_id, produto_id))

    item = cursor.fetchone()

    if item:
        cursor.execute("""
            UPDATE Itens_pedido
            SET quantidade = quantidade + %s
            WHERE id = %s
        """, (quantidade, item['id']))
    else:
        cursor.execute("""
            INSERT INTO Itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
            VALUES (%s, %s, %s, %s)
        """, (pedido_id, produto_id, quantidade, preco))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Item adicionado"})

@app.route('/pedido/<int:pedido_id>/itens', methods=['GET'])
def listar_itens(pedido_id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            p.nome,
            p.imagem_url,
            ip.quantidade,
            ip.preco_unitario
        FROM Itens_pedido ip
        JOIN Produtos p ON ip.produto_id = p.id
        WHERE ip.pedido_id = %s
    """, (pedido_id,))

    itens = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(itens), print(itens)

@app.route("/cozinha")
def cozinha():
    conn = conectar_bd()

    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            p.id AS pedido_id,
            m.id AS mesa,
            pr.nome AS produto,
            ip.quantidade,
            p.data_hora,
            p.status

        FROM pedidos p

        JOIN mesas m
            ON p.mesa_id = m.id

        JOIN itens_pedido ip
            ON ip.pedido_id = p.id

        JOIN produtos pr
            ON pr.id = ip.produto_id

        WHERE p.status = 'aberto'

        ORDER BY p.data_hora ASC
    """)

    pedidos = cursor.fetchall()

    return jsonify(pedidos)

@app.route("/pedido/<int:pedido_id>/status", methods=["PUT"])
def atualizar_status(pedido_id):

    data = request.get_json()

    status = data["status"]

    cursor = conn.cursor()

    cursor.execute("""
        UPDATE pedidos
        SET status = %s
        WHERE id = %s
    """, (status, pedido_id))

    conn.commit()

    return jsonify({
        "mensagem": "Status atualizado"
    })

if __name__ == '__main__':
    app.run(debug=False)


