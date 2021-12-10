import { Button, Box, Text } from "@chakra-ui/react";
import Counter from "./countdown";
import { useState } from "react";
import { sendLovelacestoAddres } from "../../cardano/wallet";
import { buyCards } from "../../cardano/apiServerCalls.js";

const TamahaganeAddres =
  "addr_test1qzwmldsyxrh495suc4jcypj9jrjwl42cu66sk5uw74gr6yqcj7t29mqnxhesmlumchk7wtdghejcfkd9kss024cttzjsf4685z";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";

function BuyModal({ buyOption, viewModal, setviewModal }) {
  const [reserved, setreserverd] = useState(false);
  const buyPrice = buyOption * 2;
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={viewModal}
        onClose={() => {
          setreserverd(false);
          setviewModal(false);
        }}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader justifyContent={"center"}>
            {`You are about to buy  ${buyOption} - package  `}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody m={2}>
            <p>
              This asset you are about to buy consist of {buyOption} package of
              Cards each card packages contain 7 random items an the price of
              this asset is ${buyPrice}
            </p>
          </ModalBody>
          {reserved && (
            <>
              <ModalBody m={2}>
                <Box m={2}>
                  <Text my={2}>
                    In Order to complete the transaction send ${buyPrice} before
                    the Counter ends to the following Adress
                  </Text>
                  <Text my={2} fontSize="md">
                    addr1q96kuchljenmrpeqndh7rdthqc2frnm0jw5pu8u3ws0zuwkvhpj2uecg0a5mhkdtwnm30qw38tjq42uxu80rpjn7yytscl5wex
                  </Text>

                  <Text my={2}>
                    Once we confirm the transaction the asssets will be visible
                    on your inventary.
                  </Text>
                </Box>
              </ModalBody>
              <>
                <Counter />
              </>
            </>
          )}
          {!reserved && (
            <ModalFooter>
              <Button
                onClick={() => {
                  setviewModal(false);
                  buyCards(buyOption);
                  /* sendLovelacestoAddres(
                    BigInt(buyPrice * 1000000),
                    TamahaganeAddres
                  ); */
                }}
                colorScheme="green"
                mr={3}
              >
                Buy Items
              </Button>
              <Button
                onClick={() => {
                  setviewModal(false);
                }}
                variant="ghost"
              >
                Go Back
              </Button>
            </ModalFooter>
          )}
          {reserved && (
            <ModalFooter m={2}>
              <Button
                onClick={() => {
                  setreserverd(false);
                  setviewModal(false);
                  console.log("you buyed the BuyCardsPage");
                }}
                colorScheme="blue"
                mr={3}
              >
                Got it!
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default BuyModal;
