import { Button, Box, Text } from "@chakra-ui/react";
import Counter from "./countdown";
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

function BuyMessageModal({ confirmation, setConfirmation }) {
  return (
    <>
      <Modal
        closeOnOverlayClick={true}
        isOpen={confirmation}
        onClose={() => {
          setConfirmation(false);
        }}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader justifyContent={"center"}>
            {`Your transaction has been succesfully submited `}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody m={2}>
            <h2>
              Your transaction has been submited to the Cardano Block Chain with
              the following Transaction Hash
            </h2>
            <p>{confirmation}</p>
            <br></br> We will send your items to your address, this process
            usually takes less than 2 minutes.
            <p />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Buy Items
            </Button>
            <Button
              onClick={() => {
                setConfirmation(false);
              }}
              variant="ghost"
              colorScheme="blue"
            >
              Go Back
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default BuyMessageModal;
