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

const SelectMaterialsDropDown = function () {
  const materials = [
    { label: "Iron Ingot Bloom", value: "ironIngot" },
    { label: "WOOTZ-Steel Inglot", value: "wootzInglot" },
    { label: "TAMAHAGANE-Steel Ingot", value: "tamahaganeInglot" },
    { label: "Anvil", value: "anvil" },
    { label: "Hammer", value: "hammer" },
    { label: "Tongs", value: "tongs" },
    { label: "Splitter", value: "splitter" },
    { label: "Sword", value: "sword" },
    { label: "Axe", value: "axe" },
    { label: "Spear", value: "spear" },
    { label: "Dagger", value: "dagger" },
    { label: "Crusader Sword", value: "crusaderSword" },
    { label: "Medieval Sword", value: "medievalSword" },
    { label: "Persian Shamir Sword", value: "persianSword" },
    { label: "Persian Jambiya Dagger", value: "persianDagger" },
    { label: "Japanese Katana", value: "japaneseKatana" },
    { label: "Japanese Wakizashi", value: "japaneseWakizashi" },
    { label: "Crystal Jade Sword", value: "jadeSword" },
    { label: "Gemed Snake Sword", value: "snakeSword" },
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
export default function Inventory1() {
  const [selectedAsset, setselectedAsset] = useState(null);
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
            <SelectMaterialsDropDown />
          </Box>
          <ListAssets
            setselectedAsset={setselectedAsset}
            filterOption={"weapon"}
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
            <Center> {selectedAsset && "Selected Asset"} </Center>
            <img src={selectedAsset} width="100%"></img>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
