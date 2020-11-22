/** @internal */
const setIndexAlias = (name: string, index: number, type: any) => {
  if (!Object.prototype.hasOwnProperty.call(type.prototype, name)) {
    Object.defineProperty(type.prototype, name, {
      get() {
        return this[index];
      },
      set(value) {
        this[index] = value;
      },
    });
  }
};

/** @internal */
export const applyArrayPlugins = () => {
  setIndexAlias('x', 0, Array);
  setIndexAlias('y', 1, Array);
  setIndexAlias('z', 2, Array);
  setIndexAlias('x', 0, Float32Array);
  setIndexAlias('y', 1, Float32Array);
  setIndexAlias('z', 2, Float32Array);
};
