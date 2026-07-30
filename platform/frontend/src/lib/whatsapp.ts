export function toWhatsAppHref(number?: string | null) {
  const digits = String(number || '').replace(/\D/g, '')
  if (!digits) return ''
  return `https://wa.me/${digits}`
}
