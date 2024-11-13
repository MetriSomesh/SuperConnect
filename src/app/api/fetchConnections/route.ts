import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { accountId } = req.body;

    const response = await axios.get(
      `https://api.socialdata.tools/twitter/followers/list?user_id=${accountId}`,
      {
        headers: {
          Authorization: `Bearer 816|uDVquPB05o55uj8i7zpDuE1yX5fXyLMDuO6COGN218b55c2f`,
          Accept: "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Twitter followers:", error);
    return res
      .status(500)
      .json({ message: "Error fetching Twitter followers" });
  }
}
