import { assets } from "./assets.js";

export function selector(asset) {
  //asset.replace(/\d+/g, "");

  const filteredAssets = assets.filter((x) => x.value == asset);

  if (filteredAssets.length > 0) {
    return filteredAssets[0].class;
  }
}
