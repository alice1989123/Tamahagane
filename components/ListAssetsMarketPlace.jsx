import { addressToBech32 , toHex, fromHex } from "../cardano/wallet.js";
import axios from "axios";
import {   INFURA } from "../constants/routes";
import { useState, useEffect } from "react";
import { GridItem, SimpleGrid } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import styles from "./LisAssets.module.scss";
import { selector } from "../constants/selector";
const server = process.env.NEXT_PUBLIC_SERVER_API


function selector_(x,filterOption)  { return (selector(fromHex(x.slice(56)).toString().replace(/\d+/g, ""))
== filterOption)}

function MaterialSelector (x) {return selector_(x,"rawMaterial") || selector_(x,"materialIngot") || selector_(x,"tool")  }

function WeaponsSelector (x) {return selector_(x,"commonWeapon") || selector_(x,"uncommonWeapon") || selector_(x,"rareWeapon") || selector_(x,"epicWeapon") || selector_(x,"legendaryWeapon") ||  selector_(x,"tool")}

function generalSelector(isInventory){ return isInventory ? WeaponsSelector : MaterialSelector}

export default function ListAssets({
  selectedAsset,
  setselectedAsset,
  filterOption,
  isInventory,
  isRecipeComplete,
}) {

  const [NFTs, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, [filterOption]);
  console.log(filterOption)
  

  async function loadNFTs() {
    await window.cardano.enable();

    const address = await addressToBech32();

    const getAssets = async function () {
      // This function trows an error 404 if the address has not had any tx...  FIX!!!
      try {
        const response = await axios.post(`${server}/api/assetss`, {
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
    if (!data) {
      setLoadingState("loaded");
    } else {

      
      console.log(data.map(x => fromHex(x.slice(56)).toString().replace(/\d+/g, "")))
      const data1 = (filterOption==[])? data.filter(x => generalSelector(isInventory)(x)) : data.filter((x) =>selector_(x,filterOption));
      console.log(data1)
      const data2 = await Promise.all(
        data1.map(
          async (x) =>
            await axios.post(`${server}/api/assetss/info`, {
              asset: x,
            })
        )
      );
      let filteredMetadata_ = data2.filter(
        (x) =>
          x.data.onchain_metadata &&
          x.data.onchain_metadata //&&
         // x.data.onchain_metadata.description &&
         // x.data.onchain_metadata.description.split("-")[0] == filterOption
      );
      let filteredMetadata = filteredMetadata_.map((x) => x.data);

      const assets = data2.map((x) => x.data.asset);
      
      setNFTs(filteredMetadata);

      setLoadingState("loaded");
    }
  }

  return (
    <SimpleGrid
      bg={useColorModeValue("gray.100", "gray.700")}
      columns={3}
      spacing={[1, 2, 4]}
      h="40rem"
      w="100%"
      overflowY="scroll"
      m={2}
      p={[1, 2, 4]}
      borderRadius="md"
     

    >
      {loadingState === "loaded" && !NFTs.length ? (
        <div>{/* No assets Owned */}</div>
      ) : (
        NFTs.map((nft, i) => (
          <GridItem
            className={styles.card
            }
            key={i}
            _hover={{
              background: "gray.500",
            } } h="-webkit-fit-content"
          >
            {
              <img
                className={styles.image}
                width="300"                
                src={
                  nft.onchain_metadata.image &&
                  `${INFURA}${nft.onchain_metadata.image.replace(
                    "ipfs://",
                    "ipfs/"
                  )}`
                }
                onClick={() => {
                  const metadata= JSON.stringify(nft.onchain_metadata)
                  console.log(metadata)
                  const asset = {                    
                    metadata: `${metadata}`,
                    quantity: `${nft.quantity}`,
                    unit: `${nft.asset}`,                    
                  };
                  

                  console.log(selectedAsset);

                  console.log(selectedAsset.includes(asset));

                  if(isInventory){  setselectedAsset([asset])}
                  else{

                  if (
                    selectedAsset
                      .map((x) => JSON.stringify(x))
                      .includes(JSON.stringify(asset))
                  ) {
                    setselectedAsset(
                      selectedAsset.filter(
                        (x) => !(JSON.stringify(x) === JSON.stringify(asset))
                      )
                    );
                  } else {
                    setselectedAsset([asset, ...selectedAsset]);
                  }
                }}}
              />
            }
            <div>
              <p> {/*`${JSON.stringify(nft.onchain_metadata.name)}`*/}</p>
            </div>
          </GridItem>
        ))
      )}
    </SimpleGrid>
  );
}
