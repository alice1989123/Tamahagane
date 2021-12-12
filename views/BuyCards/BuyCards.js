import Image from "next/image";

import { Grid, Box, Button, Flex, useColorModeValue } from "@chakra-ui/react";
import styles from "../../styles/BuyCards.module.scss";
import BuyModal from "./BuyModal";
import React, { useState } from "react";

const BuyCards = function (props) {
  const buyOptions = [1, 2, 3, 5];
  const toWords = ["zero", "one ", "two", "tree", "five", "five"];
  const [viewModal, setviewModal] = useState(false);
  const [buyOption, setbuyOption] = useState(0);

  const ImageWrapper = ({ children }) => {
    return (
      <Flex
        m={4}
        bg={useColorModeValue("gray.100", "gray.700")}
        className={styles.card}
      >
        {children}
      </Flex>
    );
  };

  return (
    <Flex flexDirection="column" justifyItems="center" marginTop={20}>
      <Grid
        templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        grid-auto-rows="340px"
        gap="2rem"
        key={"gallery"}
      >
        {buyOptions.map((i) => {
          return (
            <ImageWrapper key={`pack${i}box`}>
              {
                <>
                  <Image
                    src={`/pack${i}.png`}
                    width="350"
                    height="500"
                    key={`pack${i}.png`}
                    alt={`pack${i}`}
                  ></Image>
                  <Button
                    m={2}
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
                </>
              }
            </ImageWrapper>
          );
        })}

        {
          <BuyModal
            viewModal={viewModal}
            setviewModal={setviewModal}
            buyOption={buyOption}
            key={"buyModal"}
          />
        }
      </Grid>
    </Flex>
  );
};

export default BuyCards;
