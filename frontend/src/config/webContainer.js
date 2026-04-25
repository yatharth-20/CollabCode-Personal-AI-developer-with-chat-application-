



const noopWebContainer = {
  async mount() {
    throw new Error(
      "WebContainer isn't available in this environment. The in-browser 'run' feature is disabled."
    );
  },
  async spawn() {
    throw new Error(
      "WebContainer isn't available in this environment. The in-browser 'run' feature is disabled."
    );
  },
  
  on(_event, _cb) {}
};

let bootPromise;

export async function getWebContainer() {
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    try {
      const mod = await import("@webcontainer/api");
      const WebContainer = mod.WebContainer;
      if (!WebContainer?.boot) return noopWebContainer;
      return await WebContainer.boot();
    } catch (_err) {
      return noopWebContainer;
    }
  })();

  return bootPromise;
}

