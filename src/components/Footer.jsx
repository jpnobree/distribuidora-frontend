import { Link } from 'react-router-dom'
import config from '../config'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <img src="/logo.svg" alt={config.companyName} className="h-8 w-auto" />
          <p className="mt-3 text-sm text-muted">
            Este site é uma vitrine de produtos. Os pedidos são feitos por contato direto com nosso
            time comercial.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Contato</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>{config.contactPhone}</li>
            <li>{config.contactEmail}</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Catálogo</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>
              <Link to="/catalogo" className="hover:text-accent">
                Todos os produtos
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {config.companyName}. Todos os direitos reservados.
      </div>
    </footer>
  )
}
