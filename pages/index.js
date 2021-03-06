import Home from "../views/Home/Home";
const axios = require("axios");
import { LATEST_BLOCK } from "../constants/routes";

export default function HomePage(props) {
  return <Home {...props} />;
}

// we can add server side rendering here to seperate from views
export async function getServerSideProps() {
  async function getLatestBlock() {
    try {
      const config = {
        headers: {
          project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID,
        },
      };
      const response = await axios.get(LATEST_BLOCK, config);
      return response.data.slot;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  const latestBlock = await getLatestBlock();
  return {
    props: {
      latestBlock,
    },
  };
}
