import { addressToBech32 } from "../cardano/wallet.js";
import axios from "axios";
import { ADDRESSES, ASSETS } from "../constants/API/v0/routes";
import { useState, useEffect } from "react";
import { GridItem, SimpleGrid } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";

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

export default function ListAssets({ setselectedAsset }) {
  const [NFTs, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    await window.cardano.enable();

    const address = await addressToBech32();

    const getAssets = async function () {
      // This function trows an error 404 if the address has not had any tx...  FIX!!!
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
    if (!data) {
      setLoadingState("loaded");
    } else {
      const data1 = data.filter((x) => x != "lovelace");
      const data2 = await Promise.all(
        data1.map(async (x) => await getMetadata(x))
      );
      const assets = data2.map((x) => x.asset);
      setNFTs(data2);

      setLoadingState("loaded");
    }
  }

  return (
    <SimpleGrid
      bg={useColorModeValue("gray.100", "gray.700")}
      columns={2}
      spacing={[1, 2, 4]}
      h="40rem"
      w="100%"
      overflowY="scroll"
      m={2}
      p={[1, 2, 4]}
      borderRadius="md"
    >
      {loadingState === "loaded" && !NFTs.length ? (
        <div>No assets Owned</div>
      ) : (
        NFTs.map((nft, i) => (
          <GridItem
            key={i}
            _hover={{
              background: "gray.500",
            }}
          >
            {
              <img
                src={
                  nft.onchain_metadata.image &&
                  `${infuragateway}${nft.onchain_metadata.image.replace(
                    "ipfs://",
                    "ipfs/"
                  )}`
                }
                onClick={() =>
                  setselectedAsset(
                    `${infuragateway}${nft.onchain_metadata.image.replace(
                      "ipfs://",
                      "ipfs/"
                    )}`
                  )
                }
              />
            }
            <div>
              <p>Name - {`${JSON.stringify(nft.onchain_metadata.name)}`}</p>
            </div>
          </GridItem>
        ))
      )}
    </SimpleGrid>
  );
}
