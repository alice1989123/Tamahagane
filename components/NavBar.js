import {
  Box,
  Flex,
  Avatar,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  Center,
  MenuDivider,
  MenuItem,
  useColorModeValue,
  Stack,
  useColorMode,
  HStack,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import Image from "next/image";

const NavLink = ({ children }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={children.replace(/ /g, "-").toLowerCase()}
  >
    {children}
  </Link>
);

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const Links = [
    "Buy Game Cards",
    "Marketplace",
    "Inventory",
    "Craft Materials",
  ];

  return (
    <>
      <Box
        bg={useColorModeValue("gray.100", "gray.900")}
        px={4}
        marginBottom={4}
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Box>
            <Image
              src={useColorModeValue("/logolight.png", "/logodark.png")}
              alt="Picture of the author"
              width={60}
              height={30}
            />
          </Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>

          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>

              {/* <Menu id={"menu12312"}> // there seems to be perfomance issues with chakra UI menu as well as how chakra manages uids it needs to be fixed 
                <MenuButton
                  id={"menuButton1231"}
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size={"sm"}
                    src={"https://avatars.dicebear.com/api/male/username.svg"}
                  />
                </MenuButton>
                <MenuList id="menulist-12345" alignItems={"center"}>
                  <br />
                  <Center>
                    <Avatar
                      size={"2xl"}
                      src={"https://avatars.dicebear.com/api/male/username.svg"}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>Username</p>
                  </Center>
                  <br />
                  <MenuDivider id="menudiver-1234" />
                   <MenuItem id="menuitem-12341">Your Servers</MenuItem>  // there are some issues with how chakra manages the ids to be fixed
                  <MenuItem id="menudived-12342"> Account Settings</MenuItem>
                  <MenuItem id="menudived-12343">Logout</MenuItem>
                </MenuList>
              </Menu> */}
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
