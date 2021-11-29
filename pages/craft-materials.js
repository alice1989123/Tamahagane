import { addressToBech32 } from "../cardano/wallet.js";
import axios from "axios";
import { ADDRESSES, ASSETS } from "../constants/API/v0/routes";
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

const infuragateway = "https://ipfs.infura.io/";

const getMetadata = async function (asset) {
  try {
    // Adds Blockfrost project_id to req header
    const config = {
      headers: {
        project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
      },
    };
    const response = await axios.get(`${ASSETS}/${asset}`, config);

    return response.data;
  } catch (error) {
    console.log(error.response);
    return null;
  }
};
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
        // Adds Blockfrost project_id to req header
        const config = {
          headers: {
            project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
          },
        };
        const response = await axios.get(`${ADDRESSES}/${address}`, config);
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
      data1.map(async (x) => await getMetadata(x))
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
              onClick={
                () => {
                  console.log(selectedRecipe);
                  console.log(
                    `metadata${assetBuilder(selectedRecipe).metadata}`
                  );
                  MintWeapon(assetBuilder(selectedRecipe));
                }
                /* async function () {
                  try {
                    await window.cardano.submitTx(
                      "84a60081825820591aaa2dbab9566b216efbabaa4b26675a8fafc4a38fb292ef2146e149dfd85001018182583900756e62ff9667b187209b6fe1b577061491cf6f93a81e1f91741e2e3accb864ae67087f69bbd9ab74f71781d13ae40aab86e1de30ca7e2117821a4d14e9eba3581c1f5e1c681b3b76c6f3744a68c283213afcb11d45ce932395305c4ffaa7504162656c436f6d654a6f696e41414441015042656175436f6d654a6f696e4141444101504a616479436f6d654a6f696e4141444101504e756e61436f6d654a6f696e41414441015052656964436f6d654a6f696e41414441015052796f6e436f6d654a6f696e4141444101505a6f6579436f6d654a6f696e4141444103581c65b2b0dd9028c871ac1997399979cfc12a7f05738e1ec8d8a16ea52fa15341616461476f6c64656e5469636b65744e657703581cafae51e0836484a4196a3ef11018ab78990008df6459e70f7db6cfb4a1446a6f736801021a0002db39031a0298e57a075820bdaa99eb158414dea0a91d6c727e2268574b23efe6e08ab3b841abe8059a030c09a1581cafae51e0836484a4196a3ef11018ab78990008df6459e70f7db6cfb4a1446a6f736801a20082825820a12f72f947dc0545338b49cdeff9ca429bc61617aaa5b79cb9dc400d36ad6a0c5840d2f382f3d0f63c48af66eed5d392e27b743dd77cc8521ad97d4a31516d41a2d6de0fcd20d4a569756a977767a00c08cc04cd8998ab60ef07d906cdb259a7030e82582041235682727f4c1e9378775a838dcbb0e10fa1a1eabeeae028f5e08b5d90df4e5840a530b2fae68f83d101ff5f578e0173b39d539e008b043eb3789300ad124901d7dbc28a549b47f5a6445992d87c548f87ad5ff8d722ef8b0db1961b643870240601818201838200581c756e62ff9667b187209b6fe1b577061491cf6f93a81e1f91741e2e3a8200581ce47e43e7b4e74aa6aaef43731805a969a943fedb1542ae4d3c796f5182051a0298e57af5d90103a0"
                    );
                  } catch (e) {
                    console.log(e.message);
                  }
                } */
              }
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
