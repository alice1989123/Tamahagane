import ListAssets from "../components/ListAssets";
import { useColorModeValue } from "@chakra-ui/color-mode";
import {
  Text,
  Box,
  GridItem,
  SimpleGrid,
  Grid,
  Heading,
  Center,
} from "@chakra-ui/layout";
import { Select, Input } from "@chakra-ui/react";
import { useState } from "react";
import { INFURA } from "../constants/routes";
import { selector } from "../constants/selector";
console.log(selector("anvil"));

const weaponsClasses = [
  { label: "Tools", value: "tool" },
  { label: "Common weapon", value: "commonWeapon" },
  { label: "Uncommon weapon", value: "uncommonWeapon" },
  { label: "Rare weapon", value: "rareWeapon" },
  { label: "Epic weapon", value: "epicWeapon" },
  { label: "Legendary weapon", value: "legendaryWeapon" },
];

const optionsJSON = JSON.stringify(weaponsClasses); // We can factor this in one component with MaterialsDropDown, TO DO!

function SelectMaterialsDropDown({ optionsJSON, filter, setFilter }) {
  function eventHandler(e) {
    setFilter(e.target.value);
    console.log(filter);
  }

  const options = JSON.parse(optionsJSON);

  return (
    <Select
      onChange={(e) => eventHandler(e)}
      options={options}
      m={[2, 4]}
      w="80%"
      placeholder="Select categorie"
    >
      {Object.keys(options).map((i) => (
        <option key={i} value={`${options[i].value}`}>
          {options[i].label}
        </option>
      ))}
    </Select>
  );
}
export default function Inventory1() {
  const [filter, setFilter] = useState("tool");
  const [selectedAsset, setselectedAsset] = useState([]);
  const [selectedWeapon, setSelectedWeaopn] = useState([]);
  const background = useColorModeValue("white", "gray.750");
  const background1 = useColorModeValue("gray.100", "gray.700");

  return (
    <Box
      bg={background}
      display="flex"
      justifyContent="center"
      alignItems="center"
      m={[1, 2, 4]}
    >
      <Grid
        templateColumns={["1fr", "repeat(6, 1fr)"]}
        templateRows={["repeat(6, 1fr)", "1fr"]}
        gap={2}
        m={[1, 2, 4]}
        display="flex"
        width={"90%"}
      >
        <GridItem
          display="flex"
          flexDir="column"
          alignItems="center"
          rowStart={[1, 1]}
          rowEnd={[4, 1]}
          colStart={[1, 1]}
          colEnd={[1, 5]}
          bg={background}
          w="70%"
        >
          <Box
            display="flex"
            flexDir="column"
            alignItems="center"
            bg={background1}
            w="100%"
            borderRadius="md"
            p={[1, 2, 4]}
          >
            <Text fontSize="lg" marginTop={6}>
              Available Assets
            </Text>
            <SelectMaterialsDropDown
              optionsJSON={optionsJSON}
              filter={filter}
              setFilter={setFilter}
            />
          </Box>
          <ListAssets
            selectedAsset={selectedAsset}
            setselectedAsset={setselectedAsset}
            filterOption={filter}
            isInventory={true}
          ></ListAssets>
        </GridItem>
        <GridItem
          display="flex"
          flexDir="column"
          alignItems="center"
          rowStart={[4, 1]}
          rowEnd={[7, 1]}
          colStart={[1, 5]}
          colEnd={[1, 7]}
          bg={background}
          w="30%"
        >
          <Box
            display="flex"
            flexDir="column"
            alignItems="center"
            bg={background1}
            w="100%"
            borderRadius="md"
            p={[1, 2, 4]}
          >
            <Text fontSize="lg" marginTop={6}>
              Available Assets
            </Text>
            <Input m={[2, 4]} w="80%" placeholder="Search assets" size="md" />
          </Box>
          <Box
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            bg={background1}
            w="100%"
            borderRadius="md"
            p={[1, 2, 4]}
            m={2}
            h="40rem"
          >
            {/* <Center>
              {selectedAsset[0] &&
                `Selected Asset ${
                  JSON.parse(selectedAsset[0].metadata).image
                } `}
            </Center> */}

            {selectedAsset[0] && (
              <Box>
                <img
                  src={`${INFURA}${JSON.parse(
                    selectedAsset[0].metadata
                  ).image.replace("ipfs://", "ipfs/")}`}
                  width="400"
                ></img>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
