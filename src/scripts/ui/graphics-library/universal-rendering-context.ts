/** @internal */
export type UniversalRenderingContext =
  | (WebGL2RenderingContext & { isWebGL2: true })
  | (WebGLRenderingContext & { isWebGL2: false });

/** @internal */
export const getUniversalRenderingContext = (
  canvas: HTMLCanvasElement,
  ignoreWebGL2 = false
): UniversalRenderingContext => {
  const contextAttributes: WebGLContextAttributes = {
    alpha: true,
    preserveDrawingBuffer: true,
    premultipliedAlpha: false,
  };

  const context:
    | WebGL2RenderingContext
    | WebGLRenderingContext
    | null = ignoreWebGL2
    ? null
    : canvas.getContext("webgl2", contextAttributes);

  let result = context as UniversalRenderingContext;

  if (context) {
    if (!Object.prototype.hasOwnProperty.call(context, "isWebGL2")) {
      result.isWebGL2 = true;
    }
  } else {
    result = (canvas.getContext("webgl", contextAttributes) ||
      canvas.getContext(
        "experimental-webgl",
        contextAttributes
      )) as UniversalRenderingContext;

    if (!result) {
      throw new Error("Neither WebGL nor WebGL2 is supported");
    }

    result.isWebGL2 = false;
  }

  let isDestroyed = false;

  const handleContextLost = (e: Event) => {
    e.preventDefault();
    isDestroyed = true;
    canvas.removeEventListener("webglcontextlost", handleContextLost, false);
  };
  canvas.addEventListener("webglcontextlost", handleContextLost, false);

  const contextLostHandler = {
    get: function (target: UniversalRenderingContext, prop: string) {
      const value = (target as any)[prop];

      if (typeof value === "function") {
        if (isDestroyed || target.isContextLost()) {
          isDestroyed = true;
          throw new Error("Context lost");
        }

        return value.bind(target);
      }

      return value;
    },
  };

  return new Proxy(result, contextLostHandler);
};
