import { addressToBech32 } from "../cardano/wallet.js";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Text,
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
import { metadataBuilder } from "../cardano/wallet.js";
import weaponsURLs from "../constants/weaponsURLs.js";
import SelectMaterialsDropDown from "../components/MaterialsDropdown.jsx";
import { forgeWeapon } from "../cardano/apiServerCalls.js";
import styles from "./CraftMaterials.module.scss";
import BuyMessageModal from "./craftingPage/BuyMessageModal";
import { materials, weapons } from "../constants/assets.js";
import { fromHex } from "../cardano/wallet.js";

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

/* const isRecipeComplete_ = function (selectedRecipe, selectedAsset) {
  return selectedAsset.length === 3 && selectedRecipe;
}; */

const isRecipeComplete_ = function (selectedRecipe, selectedAsset) {
  function materialCounter(selectedAsset, material) {
    if (selectedAsset) {
      const filteredAssets = selectedAsset.filter(
        (x) =>
          fromHex(x.unit.slice(56)).toString().replace(/\d+/g, "") ==
          material.value
      );
      return filteredAssets.length;
    } else {
      return 0;
    }
  }
  if (selectedRecipe && selectedRecipe.value) {
    const selectedRecipeData = weapons.filter(
      (x) => x.value == selectedRecipe.value
    )[0].recipe;
    // const selectedAssetsData = []
    console.log(selectedRecipeData);
    let selectedAssetData = [];
    materials.forEach((material) => {
      const count = materialCounter(selectedAsset, material);
      selectedAssetData.push(count);
    });
    return (
      JSON.stringify(selectedRecipeData) == JSON.stringify(selectedAssetData)
    );
  }
};
export default function CraftMaterials() {
  const [NFTs, setNFTs] = useState([]);
  const [selectedRecipe, setselectedRecipe] = useState(null);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [selectedAsset, setselectedAsset] = useState([]);
  const background = useColorModeValue("white", "gray.750");
  const background1 = useColorModeValue("gray.100", "gray.700");
  const [isRecipeComplete, setIsRecipeComplete] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [filter, setFilter] = useState(["rawMaterial"]);

  /*   useEffect(() => {
    loadNFTs();
  }, []); */
  useEffect(() => {
    setIsRecipeComplete(isRecipeComplete_(selectedRecipe, selectedAsset)),
      [selectedRecipe, selectedAsset];
  });

  /*   async function loadNFTs() {
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
  } */

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
            <SelectMaterialsDropDown filter={filter} setFilter={setFilter} />
          </Box>
          <ListAssets
            selectedAsset={selectedAsset}
            setselectedAsset={setselectedAsset}
            filterOption={filter}
            isRecipeComplete={isRecipeComplete}
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
              isDisabled={!isRecipeComplete}
              onClick={async () => {
                console.log(selectedAsset);
                console.log(selectedRecipe);
                console.log(isRecipeComplete_(selectedRecipe, selectedAsset));
                const confirmation = await forgeWeapon(
                  selectedAsset,
                  selectedRecipe
                );
                setConfirmation(confirmation);
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
                {weaponsURLs.map((nft, i) => (
                  <GridItem
                    className={
                      JSON.stringify(selectedRecipe) === JSON.stringify(nft)
                        ? styles.selectedCard
                        : styles.card
                    }
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
      <BuyMessageModal
        confirmation={confirmation}
        setConfirmation={setConfirmation}
      ></BuyMessageModal>
    </Box>
  );
}
