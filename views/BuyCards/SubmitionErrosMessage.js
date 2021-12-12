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

function SubmitionError({ error, setError }) {
  return (
    <>
      <Modal
        closeOnOverlayClick={true}
        isOpen={error}
        onClose={() => {
          setError(false);
        }}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader justifyContent={"center"}>
            {`Your transaction could not be submited `}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody m={2}>
            <h2>Your transaction has not been submited.</h2>
            Please verify that you have enought founds in your account. Or try
            again in some minutes.
            <br></br>
            <p />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Buy Items
            </Button>
            <Button
              onClick={() => {
                setError(false);
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

export default SubmitionError;
