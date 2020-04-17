import { start } from 'turbolinks'

start()
addEventListener('turbolinks:load', () => {
  const meta = document.querySelector('meta[http-equiv=content-language]')
  const language = meta?.getAttribute('content')
  document.documentElement.setAttribute('lang', language || '')
})