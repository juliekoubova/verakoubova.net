declare module '@11ty/eleventy' {

  export type EleventyTransform = (content: string, outputPath: string) => string | Promise<string>

  export type EleventyPluginFunction<Config> = (eleventy: Eleventy, config?: Config) => void
  export type EleventyPlugin<Config = {}> =
  | {
    configFunction: EleventyPluginFunction<Config>
    init?(eleventy: Eleventy): void
  }
  | EleventyPluginFunction<Config>

  export interface Eleventy {
    addPlugin<Config>(plugin: EleventyPlugin<Config>): void
    addTransform(name: string, transform: EleventyTransform): void
  }
}
