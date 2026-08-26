import { Link } from 'react-router-dom'
import config from '../config'

export default function Hero() {
  return (
    <section className="border-b border-border bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
          Catálogo digital
        </span>
        <h1 className="max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          {config.tagline}
        </h1>
        <p className="max-w-md text-sm text-white/70">
          Navegue pelas categorias, confira preços e condições, e solicite um
          orçamento direto com nosso time comercial — sem necessidade de cadastro.
        </p>
        <Link to="/catalogo" className="btn-primary mt-2 w-fit">
          Ver catálogo completo
        </Link>
      </div>
    </section>
  )
}
