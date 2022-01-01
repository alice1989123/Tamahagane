import { addressBech32, toHex, fromHex } from "../cardano/wallet.js";
import axios from "axios";
import {   INFURA } from "../constants/routes";
import { useState, useEffect } from "react";
import { Badge, GridItem, SimpleGrid , Center} from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import styles from "./LisAssets.module.scss";
import { selector } from "../constants/selector";
import { getAssets , martketData} from "../cardano/apiServerCalls.js";
import { marketScriptAdresssBech32 } from "../cardano/marketPLaceAddress.js";
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
  isMarket, 
   
}) {

  const [NFTs, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const marketAddress =
  marketScriptAdresssBech32;
  useEffect(() => {
    loadNFTs();
  }, [filterOption]);
  async function loadNFTs( ) {

    if (window.cardano){

   await window.cardano.enable()
   const selfAddress = await addressBech32()
   const marketNFTs = await martketData(marketAddress);
   console.log(marketNFTs , isMarket )
   
    const data= (isMarket && marketNFTs ==undefined ) ? [] :   isMarket ?  marketNFTs.map(x => x.unit) : await getAssets(selfAddress)

    console.log(data)
    
    if (!data) {
      setLoadingState("loaded");
    } else {

      
      console.log(data.map(x => fromHex(x.slice(56)).toString().replace(/\d+/g, "")))
      const data1 = (filterOption==[])? data.filter(x => generalSelector(isInventory)(x)) : data.filter((x) =>selector_(x,filterOption));
      console.log(data1)
      const data2 = await Promise.all(
        data1.map(
          async (x) => {
          const info =   await axios.post(`${server}/api/assetss/info`, {
              asset: x,
            })
        
          return info
          
          }

        )
      );
      let filteredMetadata_ = data2.filter(
        (x) =>
          x.data.onchain_metadata && // We only display nft with metadata
          x.data.onchain_metadata //&&
         // x.data.onchain_metadata.description &&
         // x.data.onchain_metadata.description.split("-")[0] == filterOption
      );
      let filteredMetadata = filteredMetadata_.map((x) => x.data);

      console.log(filteredMetadata)


      if (isMarket) {filteredMetadata.forEach( 
        (x,i) => { 
          const address = marketNFTs.filter(y =>y.unit == x.asset)[0].address ;

          console.log( marketNFTs[0].unit , filteredMetadata[0].asset )

          const price = marketNFTs.filter(y =>y.unit == x.asset)[0].price

          console.log(marketNFTs )
          
           x[`price`] = price ; x[`address`]=address })

        }

      
      setNFTs(filteredMetadata);

      setLoadingState("loaded");
    }} else{setLoadingState("loaded")}
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
            className={selectedAsset?.unit == nft.asset ? styles.selectedCard : styles.card
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
                    price: nft.price,
                    address : nft.address                    
                  };
                  

                  console.log(selectedAsset);


                 setselectedAsset(asset)}}
              />
            }
            <Center>
               { isMarket ?  <Badge size='m' borderRadius='full' px='2' colorScheme='green'>
               ${nft.price/ 1000000}    ₳
          </Badge>:    null}
            </Center>
            <div>
              <p> {/*`${JSON.stringify(nft.onchain_metadata.name)}`*/}</p>
            </div>
          </GridItem>
        ))
      )}
    </SimpleGrid>
  );
}
