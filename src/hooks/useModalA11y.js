import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Acessibilidade basica de modal: ao abrir, move o foco para dentro do
// dialog e prende Tab/Shift+Tab dentro dele; Escape fecha; ao fechar,
// devolve o foco para o elemento que estava focado antes (ex: o card que
// abriu o modal). Usado por ProductModal e AddProductModal.
//
// `onClose` costuma ser uma arrow function recriada a cada render do
// componente pai - por isso fica numa ref em vez de entrar nas
// dependencias do efeito. Depender de `onClose` diretamente faria o
// efeito (e o "roubo" de foco para o primeiro campo) disparar de novo a
// cada re-render do modal aberto, não só ao abrir.
export function useModalA11y(onClose, isOpen = true) {
  const containerRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement
    const container = containerRef.current

    const getFocusable = () => Array.from(container?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
    getFocusable()[0]?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [isOpen])

  return containerRef
}
