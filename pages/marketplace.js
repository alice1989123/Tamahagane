import { useState, useEffect } from "react";
import { Text, Box, Grid, GridItem, SimpleGrid } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import Image from "next/image";
import ListAssets from "../components/ListAssetsMarketPlace";
import { useColorModeValue } from "@chakra-ui/color-mode";
import SaleForm from "../components/SaleForm.jsx";
import weaponsURLs from "../constants/weaponsURLs.js";
import SelectMaterialsDropDown from "../components/MaterialsDropdown.jsx";
import styles from "./CraftMaterials.module.scss";
import { CancelSell, sell, addressBech32 } from "../cardano/wallet";
import { registerSell } from "../cardano/apiServerCalls";
import { BuyMessageModal } from "../components/BuyMessageModal.jsx";

export default function MarketPlace({ ...props }) {
  //const { address } = props;

  const [toSell, setToSell] = useState(null);
  const background = useColorModeValue("white", "gray.750");
  const background1 = useColorModeValue("gray.100", "gray.700");
  const [confirmation, setConfirmation] = useState(false);
  const [filter, setFilter] = useState(["rawMaterial"]);
  const [toBuy, setToBuy] = useState(null);
  const [address, setaddress] = useState(undefined);

  useEffect(async function getAddress() {
    const cardano = await window.cardano.enable();
    const address = await addressBech32();
    setaddress(address);
  }, []);

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
              Assets listed for selling
            </Text>
            <SelectMaterialsDropDown filter={filter} setFilter={setFilter} />
          </Box>

          <ListAssets
            selectedAsset={toSell}
            setselectedAsset={setToSell}
            filterOption={filter}
          ></ListAssets>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="center"
            bg={background1}
            borderRadius="md"
            p={[1, 2]}
          >
            {/* <SaleForm selectedAsset={toSell} /> */}

            <Button
              onClick={async () => {
                console.log(toSell);
                try {
                  const hash = await sell(toSell, 5000000);
                  setConfirmation(hash);
                } catch (e) {
                  window.alert("Your transaction has not been submited");
                }
                const sellregistration = await registerSell(
                  toSell.unit,
                  5000000,
                  address
                );
                console.log(sellregistration);
              }}
              display="flex"
              colorScheme="teal"
              size="lg"
              m={1}
            >
              Sell item
            </Button>
            {/*  <BuyMessageModal
              confirmation={confirmation}
              setConfirmation={setConfirmation}
              suplementaryinfo={`Your Item has been listed for sale`}
            /> */}
          </Box>
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
        ></GridItem>

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
              Assets available to Buy
            </Text>
            <SelectMaterialsDropDown />
          </Box>

          <ListAssets
            selectedAsset={toBuy}
            setselectedAsset={setToBuy}
            filterOption={filter}
            isMarket={true}
            filterdata={
              "e93ec6209631511713b832e5378f77b587762bc272893a7163ecc46e"
            }
          ></ListAssets>
          <Button
            onClick={async () => {
              const cancelSell = await CancelSell(toBuy);
            }}
            display="flex"
            colorScheme="teal"
            size="lg"
            m={1}
          >
            Cancell Sale
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
}
