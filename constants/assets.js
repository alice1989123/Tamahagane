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
  { label: "Anvil", value: "anvil", class: "tool" },
  { label: "Hammer", value: "hammer", class: "tool" },
  { label: "Tongs", value: "tongs", class: "tool" },
  { label: "Splitter", value: "splitter", class: "tool" },
  { label: "Sword", value: "sword", class: "uncommonWeapon" },
  { label: "Axe", value: "axe", class: "uncommonWeapon" },
  { label: "Spear", value: "spear", class: "uncommonWeapon" },
  { label: "Dagger", value: "dagger", class: "uncommonWeapon" },
  { label: "Crusader Sword", value: "crusaderSword", class: "rareWeapon" },
  { label: "Medieval Sword", value: "medievalSword", class: "rareWeapon" },
  { label: "Persian Shamir Sword", value: "persianSword", class: "epicWeapon" },
  {
    label: "Persian Jambiya Dagger",
    value: "persianDagger",
    class: "epicWeapon",
  },
  { label: "Japanese Katana", value: "japaneseKatana", class: "epicWeapon" },
  {
    label: "Japanese Wakizashi",
    value: "japaneseWakizashi",
    class: "epicWeapon",
  },
  { label: "Crystal Jade Sword", value: "jadeSword", class: "legendaryWeapon" },
  { label: "Gemed Snake Sword", value: "snakeSword", class: "legendaryWeapon" },
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
