declare global {
  interface Window {
    modulesPath: string;
    $: any,
    currentOutput: any,
    exec: any,
  }
}

export {};