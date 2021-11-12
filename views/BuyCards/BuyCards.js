import Image from "next/image";
import { Grid, Box, Button } from "@chakra-ui/react";
import styles from "../../styles/BuyCards.module.scss";
import BuyModal from "./BuyModal";
import React, { useState } from "react";
const BuyCards = function (props) {
  const buyOptions = [1, 2, 3, 5];
  const toWords = ["zero", "one ", "two", "tree", "five", "five"];
  const [viewModal, setviewModal] = useState(false);
  const [buyOption, setbuyOption] = useState(0);

  const latestBlock = props.latestBlock;

  return (
    <>
      <>
        <Grid
          templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
          grid-auto-rows="340px"
          gap="2rem"
        >
          {buyOptions.map((i) => {
            return (
              <>
                <Box className={styles.card} key={`pack${i}box`}>
                  <Image
                    src={`/pack${i}.png`}
                    width="350"
                    height="500"
                    key={`pack${i}.png`}
                    alt={`pack${i}`}
                  ></Image>
                  <Button
                    key={`pack${i}button`}
                    onClick={() => {
                      setbuyOption(i);
                      setviewModal(true);
                    }}
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                  >
                    {`Buy ${toWords[i]}  package`}
                  </Button>
                </Box>
              </>
            );
          })}

          <BuyModal
            viewModal={viewModal}
            setviewModal={setviewModal}
            buyOption={buyOption}
          />
        </Grid>
      </>
    </>
  );
};

export default BuyCards;
