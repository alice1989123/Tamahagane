import { Button, Box, Text } from "@chakra-ui/react";
import BuyMessageModal from "./BuyMessageModal";
import SubmitionError from "./SubmitionErrosMessage";
import { useState } from "react";
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
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState(false);
  const buyPrice = buyOption * 2;
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={viewModal}
        onClose={() => {
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
              Each card package contains 7 randomly selected raw-materials, each
              random material is an NFT in the Cardano-BlockChain. You can use
              the raw-materials for forge weapons. The price of this asset is
              {buyPrice} ₳.
            </p>
            The transaction will be charged with an extra 2₳, wich you will get
            back with your cards. The process usually takes less than a minute
            <p />
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={async () => {
                setviewModal(false);
                const buy = await buyCards(buyOption);
                console.log(buy);

                if (buy) {
                  if (buy[1] === "SUBMITION-ERROR") {
                    setError(true);
                  }
                  if (buy[1] === "TX-HASH") {
                    setConfirmation(buy[0]);
                  }
                }
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
        </ModalContent>
      </Modal>
      <BuyMessageModal
        confirmation={confirmation}
        setConfirmation={setConfirmation}
      ></BuyMessageModal>
      <SubmitionError error={error} setError={setError}></SubmitionError>{" "}
    </>
  );
}

export default BuyModal;
