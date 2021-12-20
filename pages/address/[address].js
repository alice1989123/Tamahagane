import Address from "../../views/Address/Address";
const axios = require("axios");
import { ADDRESSES } from "../../constants/routes";

export default function AddressPage(props) {
  return <Address {...props} />;
}
/* const testingaddress =
  "addr1q9arflmxaxv6dhg9m2q79u82q4er3enel27gzcz0u4wcq4xs2v9ux5h9yxxgyr0tql23p6nj3tr3lgp5t695cvuztzusnqm9pg"; // address used for testing */
// we can add server side rendering here to seperate from views
export async function getServerSideProps(req) {
  const { address } = req.query;
  async function getAddressInfo() {
    try {
      // Adds Blockfrost project_id to req header
      const config = {
        headers: {
          project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
        },
      };
      const response = await axios.get(`${ADDRESSES}/${address}`, config);
      /* const response = await axios.get(
        `${ADDRESSES}/${testingaddress}`,
        config
      ); */
      //console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error.response);
      return null;
    }
  }
  const addressInfo = await getAddressInfo();
  return {
    props: {
      addressInfo: addressInfo,
      address: address,
    },
  };
}
