// import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";
// import OAuth from "oauth-1.0a";
// import crypto from "crypto";

// interface OAuthHeader {
//   Authorization: string;
//   [key: string]: string;
// }

// // It's better to use environment variables instead of hardcoding credentials
// const TWITTER_API_KEY = "6GUF62tntsp3C3hac2wzL9v94";
// const TWITTER_API_SECRET = "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
// const TWITTER_ACCESS_TOKEN =
//   "1839608237332525056-fNYJFQPKvDbgAujlitCauhtclcxoSV";
// const TWITTER_ACCESS_SECRET = "12QiymxJXVXgxIFZIhAydqOcMJb8o7kjEUNOC5vLgdnys";

// // Initialize OAuth
// const oauth = new OAuth({
//   consumer: {
//     key: TWITTER_API_KEY,
//     secret: TWITTER_API_SECRET,
//   },
//   signature_method: "HMAC-SHA1",
//   hash_function(base_string, key) {
//     return crypto.createHmac("sha1", key).update(base_string).digest("base64");
//   },
// });

// // Token credentials
// const token = {
//   key: TWITTER_ACCESS_TOKEN,
//   secret: TWITTER_ACCESS_SECRET,
// };

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { user_id } = body;

//     // Validate user_id
//     if (!user_id) {
//       return NextResponse.json(
//         { error: "Missing user_id in request body" },
//         { status: 400 }
//       );
//     }

//     // Configure Twitter API request with proper URL including parameters
//     const baseUrl = "https://api.twitter.com/1.1/users/show.json";
//     const fullUrl = `${baseUrl}?user_id=${user_id}`;

//     const requestData = {
//       url: fullUrl,
//       method: "GET",
//     };

//     // Generate OAuth headers
//     const headers = oauth.toHeader(
//       oauth.authorize(requestData, token)
//     ) as OAuthHeader;

//     // Add required Twitter API headers
//     const requestHeaders = {
//       ...headers,
//       "Content-Type": "application/json",
//     };

//     // Make the API request
//     const response = await axios({
//       method: "GET",
//       url: fullUrl,
//       headers: requestHeaders,
//       validateStatus: (status) => status < 500,
//     });

//     // Debug logging
//     console.log("Request URL:", fullUrl);
//     console.log("Request Headers:", requestHeaders);
//     console.log("Response Status:", response.status);
//     console.log("Response Data:", response.data);

//     // Handle Twitter API errors
//     if (response.status !== 200) {
//       return NextResponse.json(
//         { error: "Twitter API error", details: response.data },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json(response.data);
//   } catch (error) {
//     console.error("Error fetching Twitter user details:", error);

//     if (axios.isAxiosError(error)) {
//       console.log("Axios Error Config:", error.config);
//       console.log("Axios Error Response:", error.response?.data);

//       return NextResponse.json(
//         {
//           error: "Twitter API error",
//           message: error.response?.data || error.message,
//         },
//         { status: error.response?.status || 500 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

interface OAuthHeader {
  Authorization: string;
  [key: string]: string;
}

// Twitter API credentials (should be stored in environment variables for security)
const TWITTER_API_KEY = "6GUF62tntsp3C3hac2wzL9v94";
const TWITTER_API_SECRET = "1vxZQ9tWNmGDdzkC2grcvbBWBv3w3LMN02N5hfmbCI2Fpl4LyS";
const TWITTER_ACCESS_TOKEN =
  "1839608237332525056-fNYJFQPKvDbgAujlitCauhtclcxoSV";
const TWITTER_ACCESS_SECRET = "12QiymxJXVXgxIFZIhAydqOcMJb8o7kjEUNOC5vLgdnys";

// Initialize OAuth
const oauth = new OAuth({
  consumer: {
    key: TWITTER_API_KEY,
    secret: TWITTER_API_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

// Token credentials
const token = {
  key: TWITTER_ACCESS_TOKEN,
  secret: TWITTER_ACCESS_SECRET,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, count = 3, cursor = "-1" } = body;

    // Validate user_id
    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id in request body" },
        { status: 400 }
      );
    }

    // Construct the full API URL with parameters
    const baseUrl = "https://x.com/i/api/1.1/friends/following/list.json";
    const queryParams = new URLSearchParams({
      include_profile_interstitial_type: "1",
      include_blocking: "1",
      include_blocked_by: "1",
      include_followed_by: "1",
      include_want_retweets: "1",
      include_mute_edge: "1",
      include_can_dm: "1",
      include_can_media_tag: "1",
      include_ext_is_blue_verified: "1",
      include_ext_verified_type: "1",
      include_ext_profile_image_shape: "1",
      skip_status: "1",
      cursor,
      user_id,
      count: count.toString(),
      with_total_count: "true",
    });

    const fullUrl = `${baseUrl}?${queryParams.toString()}`;

    const requestData = {
      url: fullUrl,
      method: "GET",
    };

    // Generate OAuth headers
    const headers = oauth.toHeader(
      oauth.authorize(requestData, token)
    ) as OAuthHeader;

    // Add browser-like headers
    const requestHeaders = {
      ...headers,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      Referer: "https://x.com/",
      Origin: "https://x.com",
      "Accept-Language": "en-US,en;q=0.9",
    };

    // Make the API request
    const response = await axios({
      method: "GET",
      url: fullUrl,
      headers: requestHeaders,
      validateStatus: (status) => status < 500,
    });

    // Debug logging
    console.log("Request URL:", fullUrl);
    console.log("Request Headers:", requestHeaders);
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);

    // Handle Twitter API errors
    // if (response.status !== 200) {
    //   return NextResponse.json(
    //     { error: "Twitter API error", details: response.data },
    //     { status: response.status }
    //   );
    // }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching Twitter followers:", error);

    if (axios.isAxiosError(error)) {
      console.log("Axios Error Config:", error.config);
      console.log("Axios Error Response:", error.response?.data);

      return NextResponse.json(
        {
          error: "Twitter API error",
          message: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
