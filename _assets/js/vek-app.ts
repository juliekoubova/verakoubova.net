import { Application } from "stimulus";

declare global {
  interface Window {
    vekApp?: Application
  }
}

if (typeof window['vekApp'] !== 'object') {
  window.vekApp = Application.start()
}

export const vekApp = window.vekApp
