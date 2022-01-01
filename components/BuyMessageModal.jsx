import { Button, Box, Text } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import styles from "./Modals.module.scss";



import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";

export default function BuyMessageModal({ confirmation, setConfirmation,  suplementaryinfo }) {
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
              {suplementaryinfo}
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

