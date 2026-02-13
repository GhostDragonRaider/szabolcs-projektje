declare namespace NodeJS {
  interface ProcessEnv {
    VITE_API_URL?: string
  }
}

declare const process: { env: NodeJS.ProcessEnv }

declare module "*.png" {
  const value: string
  export default value
}

declare module "*.jpg" {
  const value: string
  export default value
}

declare module "*.svg" {
  const value: string
  export default value
}
