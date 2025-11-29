import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 tuas chaves
const publicKey = 'pk_N9z2AoZbpfxsCgD4TFTsyI4zXp311tMQn4PYT3DzllywfOUN';
const secretKey = 'sk_VXfJt4aXnIxSj7Mqw_61jWcL7Xl3M_r2TzXnBvFsXn3t5_be';
const auth = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64');

// Endpoint principal
app.post("/create-sale", async (req, res) => {
  try {
    const { nome, email, telefone, cpf, valor, produto } = req.body;

    const options = {
      method: "POST",
      url: "https://api.blackcatpagamentos.com/v1/transactions",
      headers: {
        accept: "application/json",
        authorization: auth, // ✅ agora gerado dinamicamente
        "content-type": "application/json",
      },
      data: {
        amount: valor,
        currency: "BRL",
        paymentMethod: "pix",
        pix: { expiresInDays: 1 },
        items: [
          {
            title: produto || "Produto Genérico",
            unitPrice: valor,
            quantity: 1,
            tangible: false,
          },
        ],
        customer: {
          name: nome,
          email: email,
          phone: telefone,
          document: { type: "cpf", number: cpf },
        },
        postbackUrl:
          "https://api.pushcut.io/CqQ6Dyz5wOlYIGQNkH2Kf/notifications/Vendas",
      },
    };

    const response = await axios.request(options);

    console.log("✅ Venda criada com sucesso:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Erro ao criar venda:", error.response?.data || error.message);
    res.status(500).json({
      erro: "Falha ao criar transação",
      detalhes: error.response?.data || error.message,
    });
  }
});

const PORT = 3333;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
