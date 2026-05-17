import mysql.connector
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(
    __name__,
    template_folder='../front',
    static_folder='../front'
)

CORS(app, origins="*")


# =========================
# CONEXÃO SEGURA (SEM POOL)
# =========================
def conectar_bd():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),  
        database=os.getenv("DB_NAME")
    )


# =========================
# FRONT
# =========================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/cozinha')
def cozinha_page():
    return render_template('cozinha.html')


# =========================
# PEDIDO
# =========================
@app.route('/pedido', methods=['POST'])
def criar_pedido():
    conn = conectar_bd()
    cursor = conn.cursor()

    try:
        data = request.json
        mesa_id = data.get('mesa_id')

        cursor.execute("""
            UPDATE Pedidos
            SET status = 'fechado'
            WHERE mesa_id = %s AND status = 'aberto'
        """, (mesa_id,))

        cursor.execute("""
            INSERT INTO Pedidos (mesa_id, status)
            VALUES (%s, 'aberto')
        """, (mesa_id,))

        conn.commit()

        return jsonify({"pedido_id": cursor.lastrowid})

    finally:
        cursor.close()
        conn.close()


# =========================
# PEDIDO ABERTO
# =========================
@app.route('/pedido/mesa/<int:mesa_id>')
def buscar_pedido_aberto(mesa_id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT * FROM Pedidos
            WHERE mesa_id = %s
            AND status IN ('aberto', 'pronto')
            ORDER BY id DESC
            LIMIT 1
        """, (mesa_id,))

        pedido = cursor.fetchone()

        return jsonify(pedido or {"message": "Nenhum pedido aberto"})

    finally:
        cursor.close()
        conn.close()


# =========================
# PRODUTOS
# =========================
@app.route('/produtos')
def listar_produtos():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM Produtos")
        return jsonify(cursor.fetchall())

    finally:
        cursor.close()
        conn.close()


# =========================
# ITENS PEDIDO
# =========================
@app.route('/pedido/<int:pedido_id>/item', methods=['POST'])
def adicionar_item(pedido_id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    try:
        data = request.json
        produto_id = data.get('produto_id')
        quantidade = data.get('quantidade', 1)

        cursor.execute("SELECT preco FROM Produtos WHERE id = %s", (produto_id,))
        produto = cursor.fetchone()

        if not produto:
            return jsonify({"error": "Produto não encontrado"}), 404

        preco = produto['preco']

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
                INSERT INTO Itens_pedido
                (pedido_id, produto_id, quantidade, preco_unitario)
                VALUES (%s, %s, %s, %s)
            """, (pedido_id, produto_id, quantidade, preco))

        conn.commit()

        return jsonify({"message": "Item adicionado"})

    finally:
        cursor.close()
        conn.close()


# =========================
# COZINHA
# =========================
@app.route('/api/cozinha')
def cozinha_api():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                p.id AS pedido_id,
                m.id AS mesa,
                pr.nome AS produto,
                pr.imagem_url,
                ip.id AS item_id,
                ip.quantidade,
                ip.status,
                DATE_FORMAT(p.data_hora, '%H:%i') AS horario
            FROM pedidos p
            JOIN mesas m ON p.mesa_id = m.id
            JOIN itens_pedido ip ON ip.pedido_id = p.id
            JOIN produtos pr ON pr.id = ip.produto_id
            WHERE ip.status = 'pendente'
            ORDER BY p.data_hora ASC
        """)

        return jsonify(cursor.fetchall())

    finally:
        cursor.close()
        conn.close()


# =========================
# ITEM PRONTO
# =========================
@app.route("/item/<int:item_id>/pronto", methods=["PUT"])
def item_pronto(item_id):
    conn = conectar_bd()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE itens_pedido
            SET status = 'pronto'
            WHERE id = %s
        """, (item_id,))

        conn.commit()
        return jsonify({"mensagem": "Item pronto"})

    finally:
        cursor.close()
        conn.close()


# =========================
# STATUS PEDIDO
# =========================
@app.route("/pedido/<int:pedido_id>/status", methods=["PUT"])
def atualizar_status(pedido_id):
    conn = conectar_bd()
    cursor = conn.cursor()

    try:
        data = request.get_json()
        status = data["status"]

        cursor.execute("""
            UPDATE pedidos
            SET status = %s
            WHERE id = %s
        """, (status, pedido_id))

        if status == "cancelado":
            cursor.execute("""
                UPDATE itens_pedido
                SET status = 'cancelado'
                WHERE pedido_id = %s
            """, (pedido_id,))

        conn.commit()

        return jsonify({"mensagem": "Status atualizado"})

    finally:
        cursor.close()
        conn.close()


# =========================
# RUN (Render usa gunicorn)
# =========================
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)