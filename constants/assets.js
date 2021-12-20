export const materials = [
  { label: "Charcoal", value: "charcoal", class: "rawMaterial" },
  { label: "Iron ore", value: "ironore", class: "rawMaterial" },
  {
    label: "Iron sands",
    value: "ironsands",
    class: "rawMaterial",
  },
  { label: "Oakwood", value: "oakwood", class: "rawMaterial" },
  { label: "Leather", value: "leather", class: "rawMaterial" },
  { label: "Gemstone", value: "gemstone", class: "rawMaterial" },
  {
    label: "Silver coin",
    value: "silvercoin",
    class: "rawMaterial",
  },
  { label: "Gold coin", value: "goldcoin", class: "rawMaterial" },
  {
    label: "WOOTZ steal",
    value: "wootzsteal",
    class: "materialIngot",
  },
  {
    label: "TAMAHAGANE Steel",
    value: "tamahaganesteal",
    class: "materialIngot",
  },
  {
    label: "BLOOM Iron",
    value: "bloomiron",
    class: "materialIngot",
  },
];

export const weapons = [
  {
    label: "Anvil",
    value: "anvil",
    class: "tool",
    recipe: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 6],
  },
  {
    label: "Hammer",
    value: "hammer",
    class: "tool",
    recipe: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  },
  {
    label: "Tongs",
    value: "tongs",
    class: "tool",
    recipe: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  },
  {
    label: "Splitter",
    value: "splitter",
    class: "tool",
    recipe: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  },
  {
    label: "Sword",
    value: "sword",
    class: "uncommonWeapon",
    recipe: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3],
  },
  {
    label: "Axe",
    value: "axe",
    class: "uncommonWeapon",
    recipe: [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3],
  },
  {
    label: "Spear",
    value: "spear",
    class: "uncommonWeapon",
    recipe: [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
  },
  {
    label: "Dagger",
    value: "dagger",
    class: "uncommonWeapon",
    recipe: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2],
  },
  {
    label: "Crusader Sword",
    value: "crusaderSword",
    class: "rareWeapon",
    recipe: [2, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3],
  },
  {
    label: "Medieval Sword",
    value: "medievalSword",
    class: "rareWeapon",
    recipe: [2, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3],
  },
  {
    label: "Persian Shamir Sword",
    value: "persianSword",
    class: "epicWeapon",
    recipe: [2, 0, 0, 0, 0, 0, 1, 1, 3, 0, 0],
  },
  {
    label: "Persian Jambiya Dagger",
    value: "persianDagger",
    class: "epicWeapon",
    recipe: [2, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0],
  },
  {
    label: "Japanese Katana",
    value: "japaneseKatana",
    class: "epicWeapon",
    recipe: [0, 0, 0, 1, 1, 0, 1, 1, 0, 3, 0],
  },
  {
    label: "Japanese Wakizashi",
    value: "japaneseWakizashi",
    class: "epicWeapon",
    recipe: [0, 0, 0, 1, 1, 0, 1, 0, 0, 3, 0],
  },
  {
    label: "Crystal Jade Sword",
    value: "jadeSword",
    class: "legendaryWeapon",
    recipe: [0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1],
  },
  {
    label: "Gemed Snake Sword",
    value: "snakeSword",
    class: "legendaryWeapon",
    recipe: [0, 0, 0, 0, 2, 1, 1, 3, 0, 0, 3],
  },
];

export const assets = materials.concat(weapons);

export const materialsClasses = [
  { label: "Tools", value: "tools" },
  { label: "Weapons", value: "weapons" },
  { label: "Ingots", value: "ingot" },
  { label: "Raw Material", value: "rawMaterial" },
];

export const weaponsClasses = [
  { label: "Raw options", value: "commonWeapon" },
  { label: "Raw options", value: "uncommonWeapon" },
  { label: "Raw options", value: "rareWeapon" },
  { label: "Raw options", value: "epicWeapon" },
  { label: "Raw options", value: "legendaryWeapon" },
];
