import { Button, Box, Text } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import styles from "./Modals.module.scss";

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
        size={"3xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            style={{
              fontSize: "1.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CheckIcon w={6} h={6} m={2} color="green.500" />
            {`Your transaction has been succesfully submited `}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody m={2}>
            <h2 className={styles.modal}>
              Your transaction has been submited to the Cardano Block Chain with
              the following Transaction Hash
            </h2>
            <p className={styles.hash}>{confirmation}</p>

            <p className={styles.modal}>
              Your new weapon will be visible in the inventory, this process
              usually takes less than 2 minutes.
            </p>
          </ModalBody>

          <ModalFooter>
            <Button
              size="lg"
              onClick={() => {
                setConfirmation(false);
              }}
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
