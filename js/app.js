let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

const GEMINI_API_KEY = "CHAVE_API_AQUI"; 

const DADOS_TREINOS = [
  {
    nome: "Força Total",
    categoria: "forca", 
    descricao: "Treino focado em levantamento de peso e hipertrofia.",
    detalhes: [
      "Agachamento Livre (4x10)",
      "Supino Reto (4x8)",
      "Remada Curvada (4x10)",
      "Desenvolvimento Militar (3x12)",
    ],
    link: "treino-forca.html", 
  },
  {
    nome: "Cardio Intenso",
    categoria: "cardio",
    descricao:
      "Sessão de alta intensidade para queima de calorias e resistência.",
    detalhes: [
      "HIIT: 30s corrida, 30s descanso (10x)",
      "Burpees (3x15)",
      "Mountain Climbers (3x30s)",
    ],
    link: "treino-cardio.html",
  },
  {
    nome: "Yoga Flex",
    categoria: "flexibilidade",
    descricao:
      "Melhore sua flexibilidade, equilíbrio e controle da respiração.",
    detalhes: [
      "Saudação ao Sol (5 repetições)",
      "Postura da Árvore (1 min cada lado)",
      "Alongamento de Perna Ajoelhado",
    ],
    link: "treino-yoga.html",
  },
  {
    nome: "Treino em Casa (Sem Equipamento)",
    categoria: "forca",
    descricao: "Treino corporal que você pode fazer em qualquer lugar.",
    detalhes: [
      "Flexões (3x Máximo)",
      "Afundo (3x12 cada perna)",
      "Prancha (3x 60s)",
    ],
    link: "treino-casa.html",
  },
];

function renderizarTreinos() {
  
  const forcaContainer = document.getElementById("forca");
  const cardioContainer = document.getElementById("cardio");
  const flexibilidadeContainer = document.getElementById("flexibilidade");

  if (!forcaContainer && !cardioContainer && !flexibilidadeContainer) {
    return;
  }

  if (forcaContainer) forcaContainer.innerHTML = "";
  if (cardioContainer) cardioContainer.innerHTML = "";
  if (flexibilidadeContainer) flexibilidadeContainer.innerHTML = "";

  DADOS_TREINOS.forEach((treino) => {

    const cardHtml = `
      <div class="treino-card">
        <h3>${treino.nome}</h3>
        <p>${treino.descricao}</p>
        <a href="${treino.link}" class="btn btn-secondary">Ver Detalhes</a>
      </div>
    `;

    if (treino.categoria === "forca" && forcaContainer) {
      forcaContainer.innerHTML += cardHtml;
    } else if (treino.categoria === "cardio" && cardioContainer) {
      cardioContainer.innerHTML += cardHtml;
    } else if (treino.categoria === "flexibilidade" && flexibilidadeContainer) {
      flexibilidadeContainer.innerHTML += cardHtml;
    }
  });
}

async function responderComGemini(pergunta, objetivoUsuario) {

  if (GEMINI_API_KEY === "SUA_CHAVE_DE_API_DO_GEMINI_AQUI" || !GEMINI_API_KEY) {
    return "🤖 Por favor, configure sua chave de API do Gemini para ativar a inteligência artificial.";
  } 
  const systemInstruction = `Você é um assistente fitness e de bem-estar. O objetivo principal do usuário é '${objetivoUsuario}'. Responda de forma concisa e motivacional. Se a pergunta for sobre treino, dieta, água ou motivação, use o contexto do objetivo do usuário. Caso contrário, diga gentilmente que só pode ajudar com esses tópicos. Sua resposta deve ser direta e em português. Use **negrito** para destacar informações importantes.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, 
      body: JSON.stringify({
        contents: [
          
          {
            role: "user", 
            parts: [{ text: systemInstruction }],
          },
          {
            role: "user",
            parts: [{ text: pergunta }], 
          },
        ], 
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      
      const errorData = await response.json();
      console.error("Erro na API Gemini:", errorData);
      throw new Error(
        `Erro na API: ${response.status}. Detalhe: ${
          errorData.error?.message || "Verifique sua chave ou limites de uso."
        }`
      );
    }

    const data = await response.json();
    const respostaGemini = data.candidates?.[0]?.content?.parts?.[0]?.text; 

    return (
      respostaGemini.replace(systemInstruction, "").trim() ||
      "Desculpe, a IA não conseguiu gerar uma resposta. Tente novamente."
    );
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    return "❌ Desculpe, houve um erro de comunicação com o assistente. Tente mais tarde.";
  }
}


let meuGrafico = null;

function desenharGrafico() {
  const ctx = document.getElementById("pesoChart");

  if (!ctx) {
    return; 
  } 

  let labelsGrafico = ["Cadastro"];
  let dadosGrafico = [parseFloat(usuarioLogado.peso)]; 

  if (usuarioLogado.historicoPeso && usuarioLogado.historicoPeso.length > 0) {
    
    labelsGrafico = usuarioLogado.historicoPeso.map(
      (registro) => registro.data
    );
    dadosGrafico = usuarioLogado.historicoPeso.map((registro) => registro.peso);
  } else {
    
  }

  const dados = {
    labels: labelsGrafico,
    datasets: [
      {
        label: "Progresso de Peso (kg)",
        data: dadosGrafico, 
        borderColor: "#27ae60",
        backgroundColor: "rgba(39, 174, 96, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }; 

  if (meuGrafico) {
    meuGrafico.destroy();
  } 

  meuGrafico = new Chart(ctx, {
    
    type: "line",
    data: dados,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Peso (kg)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
      },
    },
  });
}

function preencherDashboard(user) {
  
  const userToUse = user || JSON.parse(localStorage.getItem("usuarioLogado"));

  if (userToUse) {
    const userNomeSpan = document.getElementById("userNome");
    const userObjetivoSpan = document.getElementById("userObjetivo");
    const userPesoSpan = document.getElementById("userPeso");
    const userImcSpan = document.getElementById("userImc");

    if (userNomeSpan) {
      userNomeSpan.textContent = userToUse.nome.split(" ")[0]; 
    }

    if (userObjetivoSpan) {
      userObjetivoSpan.textContent =
        userToUse.objetivo === "perda"
          ? "Perda de Peso"
          : userToUse.objetivo === "ganho"
          ? "Ganho de Massa"
          : "Manutenção";
    } 

    if (userToUse.peso && userPesoSpan) {
      
      userPesoSpan.textContent = parseFloat(userToUse.peso).toFixed(1);
    } 

    if (userToUse.peso && userToUse.altura && userImcSpan) {
      const pesoNum = parseFloat(userToUse.peso); 
      const alturaM = parseFloat(userToUse.altura) / 100;

      if (alturaM > 0) {
        
        const imc = pesoNum / (alturaM * alturaM);
        userImcSpan.textContent = imc.toFixed(1); 
      } else {
        userImcSpan.textContent = "-"; 
      }
    }
  }
}


function registrarTreinoConcluido(treinoNome) {
  if (!usuarioLogado) {
    
    mostrarModalAlerta(
      "Você precisa estar logado para registrar um treino!",
      "Acesso Negado",
      "erro"
    );
    window.location.href = "login.html";
    return false;
  } 

  if (!usuarioLogado.treinosConcluidos) {
    usuarioLogado.treinosConcluidos = [];
  }

  const novoRegistro = {
    nome: treinoNome,
    data: new Date().toLocaleDateString("pt-BR"), 
    timestamp: Date.now(),
  };

  usuarioLogado.treinosConcluidos.push(novoRegistro); 

  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado)); 

  const index = usuarios.findIndex((u) => u.email === usuarioLogado.email);
  if (index !== -1) {
    usuarios[index] = usuarioLogado;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  } 

  mostrarModalSucessoTreino(treinoNome);
}


document.addEventListener("DOMContentLoaded", () => {

  const linksProtegidos = document.querySelectorAll(".protected-link");

  if (usuarioLogado) {
    
    document.body.classList.add("user-logged-in"); 

    const chatbotWidget = document.getElementById("chatbot");
    if (chatbotWidget) {
      chatbotWidget.style.display = "flex";
    } 

    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html"; 
      });
    } 

    const heroButton = document.querySelector(".hero .btn");
    const finalCallToAction = document.querySelector(".chamada-final");

    if (heroButton) {
      heroButton.textContent = "Ver meus Treinos";
      heroButton.href = "treinos.html";
      heroButton.classList.add("protected-link");
    }

    if (finalCallToAction) {
      finalCallToAction.style.display = "none";
    }
  } else {

    document.body.classList.add("user-logged-out"); 

    const chatbotWidget = document.getElementById("chatbot");
    if (chatbotWidget) {
      chatbotWidget.style.display = "none";
    } 

    linksProtegidos.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault(); 
        mostrarModalAlerta(
          "Você precisa estar logado para acessar esta área. Por favor, faça o login ou crie sua conta.",
          "Acesso Restrito",
          "alerta"
        ); 
      });
    });
  } 
  const mainElement = document.querySelector("main.fade-in"); 
  if (mainElement) {
    
    mainElement.classList.remove("fade-in"); 
    setTimeout(() => {
     
      mainElement.classList.add("fade-in"); 
    }, 10);
  } 

  const cadastroForm = document.getElementById("cadastroForm"); 
  if (cadastroForm) {
    
    cadastroForm.addEventListener("submit", (e) => {
      
      e.preventDefault(); 
      const nome = document.getElementById("nome").value; 
      const email = document.getElementById("email").value; 
      const senha = document.getElementById("senha").value; 
      const objetivo = document.getElementById("objetivo").value; 

      const altura = document.getElementById("altura").value; 
      const peso = document.getElementById("peso").value; 
      if (usuarios.find((u) => u.email === email)) {
        
        mostrarModalAlerta(
          "E-mail já cadastrado! Por favor, faça login.",
          "Erro de Cadastro",
          "erro"
        );
        return; 
      } 

      const novoUsuario = { nome, email, senha, objetivo, altura, peso };

      usuarios.push(novoUsuario); 
      localStorage.setItem("usuarios", JSON.stringify(usuarios)); 
      localStorage.setItem("usuarioLogado", JSON.stringify(novoUsuario)); 

      mostrarModalAlerta(
        "Cadastro realizado com sucesso! Redirecionando para o inicio.",
        "Sucesso!",
        "sucesso"
      ); 
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    });
  }

  const loginForm = document.getElementById("loginForm"); 
  if (loginForm) {
    
    loginForm.addEventListener("submit", (e) => {
      
      e.preventDefault(); 
      const email = document.getElementById("loginEmail").value; 
      const senha = document.getElementById("loginSenha").value; 

      const usuario = usuarios.find(
        (u) => u.email === email && u.senha === senha
      ); 

      if (usuario) {
        
        localStorage.setItem("usuarioLogado", JSON.stringify(usuario)); 
        mostrarModalAlerta(
          "Login bem-sucedido! Redirecionando para o inicio.",
          "Bem-Vindo(a)!",
          "sucesso"
        ); 
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        
        mostrarModalAlerta(
          "E-mail ou senha inválidos.",
          "Erro de Login",
          "erro"
        );
      }
    });
  } 

  const registroPesoForm = document.getElementById("registroPesoForm");

  if (registroPesoForm) {
    registroPesoForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const novoPesoInput = document.getElementById("novoPeso");
      const novoPeso = parseFloat(novoPesoInput.value);

      if (novoPeso > 0 && usuarioLogado) {
        
        if (!usuarioLogado.historicoPeso) {
          
          usuarioLogado.historicoPeso = [
            {
              data: new Date().toLocaleDateString("pt-BR"), 
              peso: parseFloat(usuarioLogado.peso),
            },
          ];
        } 

        usuarioLogado.historicoPeso.push({
          data: new Date().toLocaleDateString("pt-BR"),
          peso: novoPeso,
        }); 

        usuarioLogado.peso = novoPeso; 
        preencherDashboard(usuarioLogado); 

        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado)); 

        const index = usuarios.findIndex(
          (u) => u.email === usuarioLogado.email
        );
        if (index !== -1) {
          usuarios[index] = usuarioLogado;
          localStorage.setItem("usuarios", JSON.stringify(usuarios));
        } 

        mostrarModalAlerta(
          "Peso registrado com sucesso!",
          "Registro Concluído",
          "sucesso"
        );
        novoPesoInput.value = ""; 

        desenharGrafico(); 
      } else if (!novoPeso) {
        
        mostrarModalAlerta(
          "Por favor, insira um valor de peso válido.",
          "Valor Inválido",
          "alerta"
        );
      }
    });
  } 
  const chatInputPage = document.getElementById("chatInput");
  const sendBtnPage = document.getElementById("sendBtn");
  const chatBodyPage = document.getElementById("chatMessages"); 

  if (chatBodyPage) {
    
    let objetivoUsuario = usuarioLogado ? usuarioLogado.objetivo : "geral";

    const chatKey = `chatHistorico_${usuarioLogado.email}`;
    let historico = JSON.parse(localStorage.getItem(chatKey)) || []; 

    if (historico.length === 0 || historico[0].remetente !== "Bot") {
      historico.unshift({
        remetente: "Bot",
        texto:
          "Olá! Sou seu coach virtual Corpo+Fit. Pergunte sobre treino, dieta ou motivação.",
      });
      localStorage.setItem(chatKey, JSON.stringify(historico));
    }

    function renderizarChat() {
      
      chatBodyPage.innerHTML = ""; 
      historico.forEach((msg) => {
        chatBodyPage.innerHTML += `<p class="message ${
          msg.remetente === "Você" ? "user-message" : "model-message"
        }"><strong>${msg.remetente}:</strong> ${msg.texto}</p>`;
      });
      chatBodyPage.scrollTop = chatBodyPage.scrollHeight; 
    } 

    async function enviarMensagem() {
    
      const pergunta = chatInputPage.value.trim(); 
      if (pergunta === "") return; 

      historico.push({ remetente: "Você", texto: pergunta }); 
      renderizarChat(); 

      chatInputPage.value = ""; 

      historico.push({ remetente: "Bot", texto: "🤖 Pensando..." });
      renderizarChat(); 

      const resposta = await responderComGemini(pergunta, objetivoUsuario); 

      historico.pop();
      historico.push({ remetente: "Bot", texto: resposta }); 

      localStorage.setItem(chatKey, JSON.stringify(historico)); 

      renderizarChat(); 
    }

    if (sendBtnPage) {
      
      sendBtnPage.addEventListener("click", (e) => {
        e.preventDefault();
        enviarMensagem(); 
      });
    } 

    const chatForm = document.getElementById("chatForm");
    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        enviarMensagem();
      });
    }

    renderizarChat(); 
  } 

  const chatbotWidget = document.getElementById("chatbot"); 
  const toggleChatBtn = document.getElementById("toggleChatBtn"); 
  const widgetBody = document.querySelector("#chatbot .chat-body"); 
  const widgetFooter = document.querySelector("#chatbot .chat-footer"); 

  if (chatbotWidget && toggleChatBtn) {
    
    toggleChatBtn.addEventListener("click", () => {
      
      chatbotWidget.classList.toggle("minimized"); 
      if (widgetBody) widgetBody.classList.toggle("chat-hidden"); 
      if (widgetFooter) widgetFooter.classList.toggle("chat-hidden"); 
      toggleChatBtn.textContent = chatbotWidget.classList.contains("minimized")
        ? "💬"
        : "❌"; 
    }); 
    if (chatbotWidget && !document.getElementById("chatMessages")) {
      
      let objetivoUsuario = usuarioLogado ? usuarioLogado.objetivo : "geral"; 
      const chatKey = usuarioLogado
        ? `chatHistorico_${usuarioLogado.email}`
        : `chatHistorico_visitante`; 
      let historico = JSON.parse(localStorage.getItem(chatKey)) || []; 

      const widgetChatBody = document.querySelector("#chatbot .chat-body"); 
      const widgetChatInput = document.getElementById("widgetChatInput"); 
      const widgetSendBtn = document.getElementById("widgetSendBtn"); 
      if (historico.length === 0 || historico[0].remetente !== "Bot") {
        historico.unshift({
          remetente: "Bot",
          texto:
            "Olá! Sou seu coach virtual Corpo+Fit. Pergunte sobre treino, dieta ou motivação.",
        });
        localStorage.setItem(chatKey, JSON.stringify(historico));
      }

      function renderizarWidgetChat() {
        
        if (!widgetChatBody) return; 

        widgetChatBody.innerHTML = "";
        historico.forEach((msg) => {
          
          widgetChatBody.innerHTML += `<p><strong>${msg.remetente}:</strong> ${msg.texto}</p>`; //
        });
        widgetChatBody.scrollTop = widgetChatBody.scrollHeight; 
      } 

      async function enviarMensagemWidget() {
        
        const pergunta = widgetChatInput.value.trim(); 
        if (pergunta === "") return; 

        historico.push({ remetente: "Você", texto: pergunta }); 

        historico.push({ remetente: "Bot", texto: "🤖 Pensando..." });

        localStorage.setItem(chatKey, JSON.stringify(historico)); 
        renderizarWidgetChat();
        widgetChatInput.value = ""; 

        const resposta = await responderComGemini(pergunta, objetivoUsuario); 

        historico.pop();
        historico.push({ remetente: "Bot", texto: resposta }); 

        localStorage.setItem(chatKey, JSON.stringify(historico)); 

        renderizarWidgetChat(); 
      }

      if (widgetSendBtn) {
        
        widgetSendBtn.addEventListener("click", enviarMensagemWidget); 
      }
      if (widgetChatInput) {
        
        widgetChatInput.addEventListener("keypress", (e) => {
          
          if (e.key === "Enter") enviarMensagemWidget(); 
        });
      }
      renderizarWidgetChat(); 
    }
  } 

  const categoriasMenu = document.querySelector(".categorias-menu"); 
  if (categoriasMenu) {
    
    renderizarTreinos();

    categoriasMenu.addEventListener("click", (e) => {
      
      const targetBtn = e.target.closest(".btn-categoria"); 
      if (targetBtn) {
        
        document
          .querySelectorAll(".btn-categoria")
          .forEach((btn) => btn.classList.remove("active"));

        targetBtn.classList.add("active"); 

        const targetId = targetBtn.dataset.target; 

        document
          .querySelectorAll(".grupo")
          .forEach((grupo) => grupo.classList.add("hidden")); 

        const targetSection = document.getElementById(targetId); 
        if (targetSection) {
          
          targetSection.classList.remove("hidden"); 
        }
      }
    });
  } 

  const dashboardElement = document.querySelector(".dashboard-wrapper"); 
  if (dashboardElement) {
    
    preencherDashboard();
    desenharGrafico();
  } 

  const concluirTreinoBtn = document.getElementById("concluirTreinoBtn");
  if (concluirTreinoBtn) {
    concluirTreinoBtn.addEventListener("click", () => {
      
      const treinoNome = concluirTreinoBtn.dataset.treinoNome;
      if (treinoNome) {
        registrarTreinoConcluido(treinoNome); 
      }
    });
  } 

  const tabelaTreinosBody = document.getElementById("tabelaTreinosBody");
  if (tabelaTreinosBody && usuarioLogado && usuarioLogado.treinosConcluidos) {
    
    tabelaTreinosBody.innerHTML = ""; 

    const treinosRecentes = usuarioLogado.treinosConcluidos
      .slice()
      .reverse()
      .slice(0, 5); 

    treinosRecentes.forEach((treino) => {
      const row = tabelaTreinosBody.insertRow();
      row.insertCell(0).textContent = treino.nome;
      row.insertCell(1).textContent = treino.data;
    });

    if (treinosRecentes.length === 0) {
      const row = tabelaTreinosBody.insertRow();
      row.insertCell(0).textContent = "Nenhum treino registrado ainda.";
      row.cells[0].colSpan = 2; 
    }
  }
});


window.addEventListener("load", () => {
  
  setTimeout(() => {
    
    const ctx = document.getElementById("pesoChart"); 
    if (ctx && !ctx.chart) {
      
      desenharGrafico(); 
    }
  }, 500); 
});

function mostrarModalAlerta(mensagem, titulo = "Atenção", tipo = "alerta") {
  
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active"; 

  const modal = document.createElement("div");
  modal.className = "modal-box small-modal"; 

  let icon = "⚠️";
  if (tipo === "erro") icon = "❌";
  if (tipo === "sucesso") icon = "✅";

  modal.innerHTML = `
        <h3>${icon} ${titulo}</h3>
        <p>${mensagem}</p>
        <div class="modal-actions">
            <button id="modalOkBtn" class="btn btn-primary">OK</button>
        </div>
    `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay); 

  document.getElementById("modalOkBtn").addEventListener("click", () => {
    overlay.remove();
  });
}

function mostrarModalSucessoTreino(treinoNome) {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active"; 

  const modal = document.createElement("div");
  modal.className = "modal-box small-modal"; 
  modal.innerHTML = `
        <h3>✅ Sucesso!</h3>
        <p>Treino **"${treinoNome}"** registrado com sucesso!</p>
        <div class="modal-actions">
            <button id="okRedirecionar" class="btn btn-primary">OK</button>
        </div>
    `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay); 

  document.getElementById("okRedirecionar").addEventListener("click", () => {
    overlay.remove(); 
    window.location.href = "dashboard.html";
  });
}

function limparHistorico() {
  if (!usuarioLogado) return; 

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active"; 

  const modal = document.createElement("div"); 
  modal.className = "modal-box small-modal";
  modal.innerHTML = `
        <h3>⚠️ Confirmação</h3>
        <p>Tem certeza que deseja remover todo o histórico de treinos?</p>
        <div class="modal-actions">
            <button id="cancelarLimpar" class="btn btn-secondary">Cancelar</button>
            <button id="confirmarLimpar" class="btn btn-primary">Sim, Remover</button>
        </div>
    `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay); 

  document.getElementById("confirmarLimpar").addEventListener("click", () => {
    
    usuarioLogado.treinosConcluidos = [];
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    const idx = usuarios.findIndex((u) => u.email === usuarioLogado.email);
    if (idx !== -1) {
      usuarios[idx] = usuarioLogado;
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    const corpo = document.getElementById("tabelaTreinosBody");
    if (corpo) {
      corpo.innerHTML = `<tr><td colspan="2">Nenhum treino registrado ainda.</td></tr>`;
    }

    overlay.remove(); 
    mostrarModalAlerta(
      "Histórico de treinos removido com sucesso!",
      "Removido",
      "sucesso"
    );
  }); 

  document.getElementById("cancelarLimpar").addEventListener("click", () => {
    overlay.remove();
  });
}

const limparBtn = document.getElementById("limparHistoricoBtn");
if (limparBtn) limparBtn.addEventListener("click", limparHistorico);
