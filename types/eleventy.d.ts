declare module '@11ty/eleventy' {
  import { Options as BrowserSyncOptions } from 'browser-sync'

  export type EleventyTransform = (content: string, outputPath: string | false) => string | Promise<string>

  export type EleventyPluginFunction<Config> = (eleventy: Eleventy, config?: Config) => void
  export type EleventyPlugin<Config = {}> =
    | {
      configFunction: EleventyPluginFunction<Config>
      init?(eleventy: Eleventy): void
    }
    | EleventyPluginFunction<Config>

  export interface Eleventy {
    setBrowserSyncConfig(options: BrowserSyncOptions): void
    addFilter(key: string, fn: () => any): void
    addPassthroughCopy(glob: string): void
    addDataExtension(ext: string, loader: (text: any) => any): void
    addPlugin<Config>(plugin: EleventyPlugin<Config>, config?: Config): void
    addTransform(name: string, transform: EleventyTransform): void
  }

  export type EleventyConfigFunction = (eleventy: Eleventy) => undefined | void | Partial<{
    dataTemplateEngine: string,
    markdownTemplateEngine: string,
    htmlTemplateEngine: string,
    templateFormats: string[],
  }>
}