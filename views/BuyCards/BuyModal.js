import { Button } from "@chakra-ui/react";

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
  return (
    <>
      <Modal isOpen={viewModal} onClose={() => setviewModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {`You are about to buy  ${buyOption} - package`}{" "}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            The price of this bundle is ${buyOption * 2} Ada{" "}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Buy
            </Button>
            <Button onClick={() => setviewModal(false)} variant="ghost">
              Go Back
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default BuyModal;
