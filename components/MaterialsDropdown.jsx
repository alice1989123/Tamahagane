import { Select } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";






const SelectMaterialsDropDown = function ({filter , setFilter } ) {

   const options = [
    { label: "Tools", value: "tool" },
    /* { label: "Weapons", value: "weapons" } */,
    { label: "Ingots", value: "materialIngot" },
    { label: "Raw Materials", value: "rawMaterial" },
  ];

  function eventHandler( e) { setFilter(e.target.value ) ; console.log(filter)}
  
  return (
    <Select onChange={e => eventHandler(e)}   options={options} m={[2, 4]} w="80%" placeholder="Select categorie">
      {Object.keys(options).map((i) => (
        <option key={i} value={`${options[i].value}`}>
          {options[i].label}
        </option>
      ))}
    </Select>
  );
};

export default SelectMaterialsDropDown;
