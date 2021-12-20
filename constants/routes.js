const baseApi = process.env.NEXT_PUBLIC_BASE_API;

export const LATEST_BLOCK = `${baseApi}/api/v0/blocks/latest`;
export const ADDRESSES = `${baseApi}/api/v0/addresses`;
export const LATEST_PARAMETERS = `${baseApi}/api/v0/epochs/latest/parameters`;
export const ASSETS = `${baseApi}/api/v0/assets/`;
export const INFURA = "https://ipfs.infura.io/";
