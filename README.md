# 💪 Corpo+Fit

O **Corpo+Fit** é uma aplicação web voltada para **treinos, saúde e bem-estar**, permitindo que o usuário acompanhe sua evolução física, registre treinos e receba orientações básicas por meio de um assistente virtual.

## 🚀 Funcionalidades

- ✅ Cadastro e login de usuários
- 🏋️ Visualização de treinos por categoria (força, cardio, flexibilidade)
- 📊 Dashboard com:
  - Peso atual
  - Cálculo de IMC
  - Gráfico de evolução de peso
- 📝 Registro de treinos concluídos
- 🤖 Chatbot fitness com IA (Google Gemini)
- 💾 Armazenamento local usando `localStorage`

## 🧠 Assistente Virtual (IA)

O projeto utiliza a **API Gemini (Google Generative Language)** para fornecer respostas sobre:
- Treinos
- Motivação
- Hábitos saudáveis

⚠️ **Importante:**  
A chave da API **não está incluída no repositório** por motivos de segurança.  
Para utilizar o chatbot, é necessário configurar sua própria chave da API no código.

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Chart.js (gráficos)
- API Gemini (IA)
- Git & GitHub

## 📂 Estrutura do Projeto

```text
corpo-fit/
├── index.html            # Página inicial
├── login.html            # Tela de login
├── cadastro.html         # Tela de cadastro de usuários
├── dashboard.html        # Dashboard com gráficos e progresso
├── chatbot.html          # Página do assistente virtual
├── treinos.html          # Listagem de treinos
├── treino-A1-peito-triceps.html
├── treino-B1-costas-biceps.html
├── treino-C1-pernas-completo.html
├── treino-D1-ombros-bracos.html
├── nutricao.html         # Página de nutrição
├── css/
│   ├── style.css         # Estilos globais
│   ├── dashboard.css    # Estilos do dashboard
│   └── nutricao.css     # Estilos da página de nutrição
├── js/
│   └── app.js            # Lógica principal da aplicação
├── img/
│   └── (imagens dos exercícios e ilustrações)
└── README.md             # Documentação do projeto
