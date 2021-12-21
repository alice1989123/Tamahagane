import { Button, Box, Text } from "@chakra-ui/react";
import BuyMessageModal from "./BuyMessageModal";
import SubmitionError from "./SubmitionErrosMessage";
import { useState } from "react";
import { buyCards } from "../../cardano/apiServerCalls.js";
import styles from "../../styles/Modals.module.scss";

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
          <ModalHeader
            style={{
              fontSize: "1.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Detailed description of the asset
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody className={styles.modal} m={2}>
            <h2 className={styles.modal}>
              You are about to buy {buyOption} package. The price of this asset
              is {buyPrice + 2} ₳.
            </h2>
            <p className={styles.modal}>
              Each card package contains 7 randomly selected raw materials which
              are used to forge new weapons. Each material is an NFT in the
              Cardano Block-Chain.
            </p>
            <br></br>
            {/* <p className={styles.advice}>
              The transaction will be charged with an extra of 2₳, which you
              will get back with your cards. The process usually takes less than
              a minute.
            </p> */}
          </ModalBody>
          <ModalFooter>
            <Button
              size="lg"
              onClick={async () => {
                setviewModal(false);
                if (window.cardano.enable()) {
                  try {
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
                  } catch (e) {
                    console.log(e);
                    setError(true);
                  }
                }
              }}
              colorScheme="green"
              mr={3}
            >
              Buy Items
            </Button>
            <Button
              size="lg"
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
