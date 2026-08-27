// A lógica do jogo será implementada nos próximos passos.
const canvas = document.getElementById('jogo');
const contexto = canvas.getContext('2d');
const elementoPontuacao = document.getElementById('pontuacao');

const tamanhoCelula = 20;
const colunas = canvas.width / tamanhoCelula;
const linhas = canvas.height / tamanhoCelula;

const cobra = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

let direcao = 'direita';
let proximaDirecao = direcao;
let comida;
let pontuacao = 0;
let jogoEncerrado = false;
let intervalo;

const movimentos = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
};

const direcoesOpostas = {
  cima: 'baixo',
  baixo: 'cima',
  esquerda: 'direita',
  direita: 'esquerda',
};

function sortearComida() {
  const celulasLivres = [];

  for (let y = 0; y < linhas; y += 1) {
    for (let x = 0; x < colunas; x += 1) {
      const ocupada = cobra.some((segmento) => segmento.x === x && segmento.y === y);
      if (!ocupada) {
        celulasLivres.push({ x, y });
      }
    }
  }

  comida = celulasLivres[Math.floor(Math.random() * celulasLivres.length)];
}

function desenhar() {
  contexto.fillStyle = '#111827';
  contexto.fillRect(0, 0, canvas.width, canvas.height);

  if (comida) {
    contexto.fillStyle = '#ef4444';
    contexto.fillRect(
      comida.x * tamanhoCelula,
      comida.y * tamanhoCelula,
      tamanhoCelula,
      tamanhoCelula,
    );
  }

  contexto.fillStyle = '#22c55e';
  cobra.forEach((segmento) => {
    contexto.fillRect(
      segmento.x * tamanhoCelula,
      segmento.y * tamanhoCelula,
      tamanhoCelula,
      tamanhoCelula,
    );
  });
}

function encerrarJogo() {
  jogoEncerrado = true;
  clearInterval(intervalo);
  desenhar();

  contexto.fillStyle = 'rgba(0, 0, 0, 0.65)';
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  contexto.fillStyle = '#ffffff';
  contexto.font = 'bold 32px sans-serif';
  contexto.textAlign = 'center';
  contexto.textBaseline = 'middle';
  contexto.fillText('Fim de jogo', canvas.width / 2, canvas.height / 2);
}

function atualizarJogo() {
  if (jogoEncerrado) {
    return;
  }

  direcao = proximaDirecao;
  const movimento = movimentos[direcao];
  const cabeca = cobra[0];
  const novaCabeca = {
    x: cabeca.x + movimento.x,
    y: cabeca.y + movimento.y,
  };

  const bateuNaParede =
    novaCabeca.x < 0 ||
    novaCabeca.x >= colunas ||
    novaCabeca.y < 0 ||
    novaCabeca.y >= linhas;
  const bateuNoCorpo = cobra.some(
    (segmento) => segmento.x === novaCabeca.x && segmento.y === novaCabeca.y,
  );

  if (bateuNaParede || bateuNoCorpo) {
    encerrarJogo();
    return;
  }

  cobra.unshift(novaCabeca);

  if (novaCabeca.x === comida.x && novaCabeca.y === comida.y) {
    pontuacao += 1;
    elementoPontuacao.textContent = pontuacao;
    sortearComida();
  } else {
    cobra.pop();
  }

  desenhar();
}

document.addEventListener('keydown', (evento) => {
  const direcoesPorTecla = {
    ArrowUp: 'cima',
    ArrowDown: 'baixo',
    ArrowLeft: 'esquerda',
    ArrowRight: 'direita',
  };
  const novaDirecao = direcoesPorTecla[evento.key];

  if (!novaDirecao) {
    return;
  }

  evento.preventDefault();
  if (novaDirecao !== direcoesOpostas[direcao]) {
    proximaDirecao = novaDirecao;
  }
});

elementoPontuacao.textContent = pontuacao;
sortearComida();
desenhar();
intervalo = setInterval(atualizarJogo, 120);
