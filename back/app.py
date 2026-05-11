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

    cursor.execute(
        "INSERT INTO Pedidos (mesa_id, status) VALUES (%s, 'aberto')",
        (mesa_id,)
    )

    conn.commit()

    pedido_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"pedido_id": pedido_id})


# Função para verificar se já existe a comanda 
@app.route('/pedido/mesa/<int:mesa_id>', methods=['GET'])
def buscar_pedido_aberto(mesa_id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM Pedidos
        WHERE mesa_id = %s AND status = 'aberto'
        LIMIT 1
    """, (mesa_id,))

    pedido = cursor.fetchone()

    cursor.close()
    conn.close()

    if pedido:
        return jsonify(pedido)
    else:
        return jsonify({"message": "Nenhum pedido aberto"})
    

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
            ip.id,
            p.nome,
            ip.quantidade,
            ip.preco_unitario
        FROM Itens_pedido ip
        JOIN Produtos p ON ip.produto_id = p.id
        WHERE ip.pedido_id = %s
    """, (pedido_id,))

    itens = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(itens)

if __name__ == '__main__':
    app.run(debug=True)

