import { useEffect, useRef, useState } from 'react'

type Ponto = { x: number; y: number }
type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita'

const TAMANHO_CANVAS = 400
const TAMANHO_CELULA = 20
const COLUNAS = TAMANHO_CANVAS / TAMANHO_CELULA
const LINHAS = TAMANHO_CANVAS / TAMANHO_CELULA

const movimentos: Record<Direcao, Ponto> = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
}

const direcoesOpostas: Record<Direcao, Direcao> = {
  cima: 'baixo',
  baixo: 'cima',
  esquerda: 'direita',
  direita: 'esquerda',
}

const direcoesPorTecla: Partial<Record<string, Direcao>> = {
  ArrowUp: 'cima',
  ArrowDown: 'baixo',
  ArrowLeft: 'esquerda',
  ArrowRight: 'direita',
}

function sortearComida(cobra: Ponto[]): Ponto | undefined {
  const celulasLivres: Ponto[] = []

  for (let y = 0; y < LINHAS; y += 1) {
    for (let x = 0; x < COLUNAS; x += 1) {
      if (!cobra.some((segmento) => segmento.x === x && segmento.y === y)) {
        celulasLivres.push({ x, y })
      }
    }
  }

  return celulasLivres[Math.floor(Math.random() * celulasLivres.length)]
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cobraRef = useRef<Ponto[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const comidaRef = useRef<Ponto | undefined>(undefined)
  const direcaoRef = useRef<Direcao>('direita')
  const proximaDirecaoRef = useRef<Direcao>('direita')
  const [direcao, setDirecao] = useState<Direcao>('direita')
  const [pontuacao, setPontuacao] = useState(0)
  const [jogoEncerrado, setJogoEncerrado] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const contexto = canvas.getContext('2d')
    if (!contexto) return

    const desenhar = (fimDeJogo = false) => {
      contexto.fillStyle = '#111827'
      contexto.fillRect(0, 0, canvas.width, canvas.height)

      const comida = comidaRef.current
      if (comida) {
        contexto.fillStyle = '#ef4444'
        contexto.fillRect(
          comida.x * TAMANHO_CELULA,
          comida.y * TAMANHO_CELULA,
          TAMANHO_CELULA,
          TAMANHO_CELULA,
        )
      }

      contexto.fillStyle = '#22c55e'
      cobraRef.current.forEach((segmento) => {
        contexto.fillRect(
          segmento.x * TAMANHO_CELULA,
          segmento.y * TAMANHO_CELULA,
          TAMANHO_CELULA,
          TAMANHO_CELULA,
        )
      })

      if (fimDeJogo) {
        contexto.fillStyle = 'rgba(0, 0, 0, 0.65)'
        contexto.fillRect(0, 0, canvas.width, canvas.height)
        contexto.fillStyle = '#ffffff'
        contexto.font = 'bold 32px sans-serif'
        contexto.textAlign = 'center'
        contexto.textBaseline = 'middle'
        contexto.fillText('Fim de jogo', canvas.width / 2, canvas.height / 2)
      }
    }

    comidaRef.current = sortearComida(cobraRef.current)
    desenhar()

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      const novaDirecao = direcoesPorTecla[evento.key]
      if (!novaDirecao) return

      evento.preventDefault()
      if (novaDirecao !== direcoesOpostas[direcaoRef.current]) {
        proximaDirecaoRef.current = novaDirecao
      }
    }

    document.addEventListener('keydown', aoPressionarTecla)

    const intervalo = window.setInterval(() => {
      const cobra = cobraRef.current
      direcaoRef.current = proximaDirecaoRef.current
      setDirecao(direcaoRef.current)

      const movimento = movimentos[direcaoRef.current]
      const cabeca = cobra[0]
      const novaCabeca = {
        x: cabeca.x + movimento.x,
        y: cabeca.y + movimento.y,
      }

      const bateuNaParede =
        novaCabeca.x < 0 ||
        novaCabeca.x >= COLUNAS ||
        novaCabeca.y < 0 ||
        novaCabeca.y >= LINHAS
      const bateuNoCorpo = cobra.some(
        (segmento) => segmento.x === novaCabeca.x && segmento.y === novaCabeca.y,
      )

      if (bateuNaParede || bateuNoCorpo) {
        window.clearInterval(intervalo)
        setJogoEncerrado(true)
        desenhar(true)
        return
      }

      cobra.unshift(novaCabeca)
      const comida = comidaRef.current
      if (comida && novaCabeca.x === comida.x && novaCabeca.y === comida.y) {
        setPontuacao((valor) => valor + 1)
        comidaRef.current = sortearComida(cobra)
      } else {
        cobra.pop()
      }

      desenhar()
    }, 120)

    return () => {
      window.clearInterval(intervalo)
      document.removeEventListener('keydown', aoPressionarTecla)
    }
  }, [])

  return (
    <main className="jogo" data-direcao={direcao}>
      <div>Pontuação: {pontuacao}</div>
      <canvas
        ref={canvasRef}
        width={TAMANHO_CANVAS}
        height={TAMANHO_CANVAS}
        aria-label={jogoEncerrado ? 'Fim de jogo' : 'Jogo da cobrinha'}
      />
    </main>
  )
}
