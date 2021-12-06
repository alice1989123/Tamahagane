import axios from "axios";
import { addressToBech32 } from "./wallet";

export default async function burningTokens() {
  const address = await addressToBech32();

  const response = await axios.post("http://localhost:3001/", {
    address: address,
  });
  console.log(response);
}
