declare module '@11ty/eleventy' {

  export type EleventyTransform = (content: string, outputPath: string) => string | Promise<string>

  export type EleventyPluginFunction = (eleventy: Eleventy, config?: object) => void
  export type EleventyPlugin = {
    configFunction: EleventyPluginFunction
    init?(eleventy: Eleventy): void
  }

  export interface Eleventy {
    addPlugin(plugin: EleventyPlugin | EleventyPluginFunction): void
    addTransform(name: string, transform: EleventyTransform): void
  }
}
