import config from '../config'

// Erro normalizado de chamada a API: sempre tem `.status` (0 = falha de rede,
// sem nem chegar a resposta) e `.data` com o corpo de erro do backend, quando
// existir (ver GlobalExceptionHandler no backend).
export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Ponto unico de fetch: monta a URL com a base configurada, cabecalhos de
// autenticacao/JSON e normaliza tanto falha de rede quanto resposta de erro.
// Cada chamador decide a mensagem exibida a partir de `error.status` -
// isso aqui so evita repetir a mecanica de fetch em cada Context.
async function request(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${config.apiBaseUrl}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('network error', { status: 0 })
  }

  if (!response.ok) {
    let data = null
    try {
      data = await response.json()
    } catch {
      data = null
    }
    throw new ApiError(data?.error || `HTTP ${response.status}`, { status: response.status, data })
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body, ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
}
