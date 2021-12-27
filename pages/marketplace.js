import { useState } from "react";
import { Text, Box, Grid, GridItem, SimpleGrid } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import Image from "next/image";
import ListAssets from "../components/ListAssetsMarketPlace";
import { useColorModeValue } from "@chakra-ui/color-mode";
import SaleForm from "../components/SaleForm.jsx";
import weaponsURLs from "../constants/weaponsURLs.js";
import SelectMaterialsDropDown from "../components/MaterialsDropdown.jsx";
import styles from "./CraftMaterials.module.scss";
import { CancelSell, sell } from "../cardano/wallet";

export default function MarketPlace() {
  const [selectedAsset, setselectedAsset] = useState([]);
  const background = useColorModeValue("white", "gray.750");
  const background1 = useColorModeValue("gray.100", "gray.700");
  const [confirmation, setConfirmation] = useState(false);
  const [filter, setFilter] = useState(["rawMaterial"]);

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
            <SaleForm selectedAsset={selectedAsset} />

            <Button
              onClick={async () => {
                //const confirmation = await sell(selectedAsset, 5000000);
                const confirmation = await CancelSell();
                setConfirmation(confirmation);
              }}
              display="flex"
              colorScheme="teal"
              size="lg"
              m={1}
            >
              Sell Items
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
                    className={styles.card}
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
              ></Box>
            </GridItem>
          </SimpleGrid>
        </GridItem>
      </Grid>
    </Box>
  );
}
