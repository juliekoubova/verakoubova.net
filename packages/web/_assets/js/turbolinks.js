import '@hotwired/turbo'
addEventListener('turbo:load', () => {
  const meta = document.querySelector('meta[http-equiv=content-language]')
  const language = meta?.getAttribute('content')
  document.documentElement.setAttribute('lang', language || '')
})