import styles from "../../styles/Home.module.scss";
import { CustomHead } from "../../components/Head";
import { Box, Text, Image, Center, Heading, Grid } from "@chakra-ui/react";
import MiddleEllipsis from "react-middle-ellipsis";

//const codeStyle = { backgroundColor: "#cccccc" };

export default function Address({address, addressInfo}) {
  const balanceAda = addressInfo
    ? JSON.stringify(addressInfo.amount[0].quantity / 1000000)
    : 0;
  return (
    <Box className={styles.container} bg={"gray.200"}>
      <CustomHead title="Wallet details" />

      <Box
        display="flex"
        flexDir="column"
        maxW="600px"
        maxHeight="400px"
        boxShadow="xl"
        bg={"gray.100"}
        borderRadius="40px     40px      40px           40px"
      >
        <Box
          borderRadius="40px     40px      0           0"
          bgGradient="linear(to-b, blue.400, gray.100)"
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="space-around"
        >
          <Image
            borderRadius="full"
            boxSize="100px"
            src={
              "https://cdn.pixabay.com/photo/2021/08/16/23/09/wallet-6551548_960_720.png"
            }
            alt="Wallet"
            m={6}
          />
          <Heading fontWeight={"light"} m={4} alt="wallet-info">
            Wallet details
          </Heading>
        </Box>
        <Grid
          m={4}
          templateRows="repeat(2, 1fr)"
          templateColumns="repeat(2, 1fr)"
          gap={4}
          minH={"200px"}
        >
          <Center m={2}>
            <Text fontSize="xl" fontWeight="semibold">
              Address
            </Text>
          </Center>
          <Center fontSize="xl" maxW="400px" m={2} whiteSpace="nowrap">
            <MiddleEllipsis>
              <span>{address}</span>
            </MiddleEllipsis>
          </Center>
          <Center m={2}>
            <Text fontSize="xl" fontWeight="semibold">
              Balance
            </Text>
          </Center>
          <Center m={2}>
            <Text fontSize={"2xl"}> ₳ </Text>
            <Text fontSize={"3xl"} display={"inline"} color={"green.500"}>
              {`   ${balanceAda}  `}
            </Text>
          </Center>
        </Grid>
      </Box>
    </Box>
  );
}
