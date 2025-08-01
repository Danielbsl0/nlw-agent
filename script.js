const apiKeyinput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('qInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

//Criando uma função para converter o texto markdown do Gemini para texto padrão
const markdownToHTML = (text) =>{
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
}

const askAi = async (question, game, apiKey)=> {
  const model = "gemini-2.5-flash";
  const gemniURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const pergunta = `  
    ## Especialidade
    Você é um especialista assitente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para responder de maneira coesa.
    - Nunca responda itens que você não tenha certeza que existe no patch atual.
    - Responda apenas no idioma informado pelo usuário, se não souber qual idioma é, responda em português

    ## Resposta
    - Economize na resposta, seja direto.
    - Responda em no máximo 500 caracteres.
    - Responda em markdowns.
    - Não precisa de saudações ou despedidas, apenas responda o que o usuário está pedindo.

    ## Exemplo de Resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:** \n\n coloque os itens aqui.\n\n **Runas:**\n\n coloque as runas aqui \n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `;
  }

  const contents = [{
    role: "user",
    parts:[{
      text: pergunta
    }]
  }]

  const tools = [
    {
      google_search: {}
    }
  ]

  const response = await fetch(gemniURL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json();
  console.log(data);
  return data.candidates[0].content.parts[0].text;
}

form.addEventListener('submit', async (event) =>{
  event.preventDefault();
  const apiKey = apiKeyinput.value;
  const game = gameSelect.value; 
  const question = questionInput.value;

  if(apiKey == '' || game == '' || question == ''){
    alert('ERRO! Por favor, preencha todos os campos');
    return
  }

  askButton.disabled = true;
  askButton.innerText = 'Perguntando...';
  askButton.classList.add('loading');

  try{
    const text = await askAi(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML = markdownToHTML(text);
     aiResponse.style.display = 'block';
  }catch(error){
    console.log('Erro', error);
  }finally{
    askButton.disabled = false;
    askButton.innerText = 'Perguntar';
    askButton.classList.remove('loading');
  }
})