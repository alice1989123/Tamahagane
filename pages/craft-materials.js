import { addressToBech32 } from "../cardano/wallet.js";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Text,
  Heading,
  Box,
  Grid,
  GridItem,
  SimpleGrid,
  Center,
} from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import Image from "next/image";
import ListAssets from "../components/ListAssets";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { MintWeapon, metadataBuilder } from "../cardano/wallet.js";
import weapons from "../constants/weaponsRecipes.js";
import SelectMaterialsDropDown from "../components/MaterialsDropdown.js";
import { burningTokens, forgeWeapon } from "../cardano/apiServerCalls.js";

const infuragateway = "https://ipfs.infura.io/";

const assetBuilder = function (selectedRecipe) {
  const metadata_ = metadataBuilder(
    "weapon-raw",
    `ipfs://${selectedRecipe.img}`,
    selectedRecipe.value,
    "image/png"
  );
  console.log(metadata_);
  const metadata = {
    name: metadata_.name,
    quantity: "1",
    metadata: metadata_,
  };
  console.log(JSON.stringify(metadata));
  return metadata;
};

export default function CraftMaterials() {
  const [NFTs, setNFTs] = useState([]);
  const [selectedRecipe, setselectedRecipe] = useState(null);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [selectedAsset, setselectedAsset] = useState(null);
  const background = useColorModeValue("white", "gray.750");
  const background1 = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const address = await addressToBech32();

    const getAssets = async function () {
      try {
        const response = await axios.post("http://localhost:3001/api/assetss", {
          address: address,
        });

        const assets = response.data.amount.map((x) => x.unit);

        return assets;
      } catch (error) {
        console.log(error.response);
        return null;
      }
    };

    const data = await getAssets();
    const data1 = data.filter((x) => x != "lovelace");
    const data2 = await Promise.all(
      data1.map(
        async (x) =>
          await axios.post("http://localhost:3001/api/assetss/info", {
            asset: x,
          })
      )
    );
    const assets = data2.map((x) => x.asset);

    setNFTs(data2);
    setLoadingState("loaded");
  }

  return (
    <Box
      bg={background}
      display="flex"
      justifyContent="center"
      alignItems="center"
      m={[1, 2, 4]}
    >
      <Grid
        width={["100%"]}
        templateRows={["repeat(12, 1fr)", "1fr"]}
        templateColumns={["1fr", "repeat(12, 1fr)"]}
        gap={[1, 2]}
        h={["95%"]}
        w={["95%"]}
        bg={background}
        m={[1, 2, 4]}
      >
        <GridItem
          display="flex"
          flexDir="column"
          alignItems="center"
          rowStart={[1, 1]}
          rowEnd={[6, 1]}
          colStart={[1, 1]}
          colEnd={[1, 6]}
          bg={background}
        >
          <Box
            display="flex"
            flexDir="column"
            alignItems="center"
            bg={background1}
            w="100%"
            borderRadius="md"
            p={(1, 2, 4)}
          >
            <Text fontSize="lg" marginTop={6}>
              Available Materials
            </Text>
            <SelectMaterialsDropDown />
          </Box>
          <ListAssets
            selectedAsset={selectedAsset}
            setselectedAsset={setselectedAsset}
            filterOption={"material"}
          ></ListAssets>
        </GridItem>
        <GridItem
          rowStart={[6, 1]}
          rowEnd={[8, 1]}
          colStart={[1, 6]}
          colEnd={[1, 8]}
          bg={background}
          display="flex"
          flexDir="column"
          justifyContent="center"
        >
          <Box
            display="flex"
            flexDir="column"
            justifyContent="center"
            bg={background1}
            borderRadius="md"
            p={[1, 2]}
          >
            <Image
              alt="anvil"
              src={"/anvil.png"}
              width="100%"
              height="100%"
              layout="responsive"
              objectFit="contain"
            ></Image>

            <Button
              onClick={() => {
                forgeWeapon(selectedAsset);
              }}
              display="flex"
              colorScheme="teal"
              size="lg"
              m={1}
            >
              Forge
            </Button>
          </Box>
        </GridItem>

        <GridItem
          rowStart={[8, 1]}
          rowEnd={[13, 1]}
          colStart={[1, 8]}
          colEnd={[1, 13]}
          bg={background}
          display="flex"
          flexDir="column"
          alignItems="center"
        >
          <Box
            display="flex"
            flexDir="column"
            alignItems="center"
            bg={background1}
            w="100%"
            borderRadius="md"
            p={(1, 2, 4)}
          >
            <Text as="h6" fontSize={"lg"} marginTop={6}>
              Crafting Recipes
            </Text>
            <SelectMaterialsDropDown />
          </Box>

          <SimpleGrid w="100%" m={2} templateColumns="repeat(2,1fr)" gap={2}>
            <GridItem
              overflowY="scroll"
              w="100%"
              bg={background1}
              borderRadius="md"
              h="40rem"
              p={[1, 2, 4]}
            >
              <SimpleGrid columns={1} spacing={10}>
                {weapons.map((nft, i) => (
                  <GridItem
                    w="100%"
                    key={i}
                    _hover={{
                      background: "gray.500",
                      w: "100%",
                    }}
                  >
                    {
                      <img
                        width="500rem"
                        onClick={() => setselectedRecipe(nft)}
                        src={`https://ipfs.infura.io/ipfs/${nft.img}`}
                      />
                    }
                    <div>
                      <p>
                        {/*`${JSON.stringify(nft.onchain_metadata.name )} `*/}
                      </p>
                    </div>
                  </GridItem>
                ))}
              </SimpleGrid>
            </GridItem>
            <GridItem
              display="flex"
              flexDir="column"
              colSpan={1}
              justifyContent="center"
              bg={background1}
            >
              <Box
                display="flex"
                flexDir="column"
                colSpan={1}
                justifyContent="center"
                alignContent="center"
                bg={background1}
                height="8rem"
                borderRadius="md"
              >
                <Center> {selectedRecipe && "Selected Asset"} </Center>
                <img
                  src={
                    selectedRecipe
                      ? `https://ipfs.infura.io/ipfs/${selectedRecipe.img}`
                      : null
                  }
                  width="100%"
                ></img>
              </Box>
            </GridItem>
          </SimpleGrid>
        </GridItem>
      </Grid>
    </Box>
  );
}
