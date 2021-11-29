import { Select } from "@chakra-ui/react";

const SelectMaterialsDropDown = function () {
  const materials = [
    { label: "Tools", value: "tools" },
    { label: "Weapons", value: "weapons" },
    { label: "Ingots", value: "ingots" },
    { label: "Raw Materials", value: "rawMaterials" },
  ];
  return (
    <Select m={[2, 4]} w="80%" placeholder="Select categorie">
      {Object.keys(materials).map((i) => (
        <option key={i} value={"materials[i].value"}>
          {materials[i].label}
        </option>
      ))}
    </Select>
  );
};

export default SelectMaterialsDropDown;
