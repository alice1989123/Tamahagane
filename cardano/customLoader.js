class CustomLoader {
  async load() {
    if (this._wasm) {
      return;
    }
    /**
     * @private
     */
    this._wasm = await import(
      "./custom_modules/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib_bg"
    );
  }

  get Cardano() {
    return this._wasm;
  }
}

export default new CustomLoader();
