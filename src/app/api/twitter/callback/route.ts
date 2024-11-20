// import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth";
// import { NEXT_AUTH } from "@/app/lib/auth";

// const prisma = new PrismaClient();

// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
//   const code = searchParams.get("code");
//   const combinedState = searchParams.get("state");

//   // const state = searchParams.get("state");
//   const session = await getServerSession(NEXT_AUTH);
//   if (!combinedState || !code) {
//     return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//   }

//   try {
//     const [originalState, codeVerifier] = Buffer.from(combinedState, "base64")
//       .toString("utf8")
//       .split(":");
//     console.log(originalState);
//     // Exchange the authorization code for an access token
//     const tokenResponse = await axios.post(
//       "https://api.twitter.com/2/oauth2/token",
//       new URLSearchParams({
//         code: code!,
//         grant_type: "authorization_code",
//         client_id: process.env.TWITTER_CLIENT_ID!,
//         redirect_uri: process.env.TWITTER_CALLBACK_URL!,
//         code_verifier: codeVerifier, // Use the code_verifier from cookies
//       }),
//       {
//         auth: {
//           username: process.env.TWITTER_CLIENT_ID!,
//           password: process.env.TWITTER_CLIENT_SECRET!,
//         },
//       }
//     );

//     const { access_token, refresh_token } = tokenResponse.data;

//     // Store access_token and refresh_token in your database
//     // You need to identify the user, e.g., by linking the account to an existing user
//     // Replace with actual user identification logic
//     // await prisma.user.update({
//     //   where: { id: "current_user_id" }, // Replace with actual user ID
//     //   data: {
//     //     twitterAccessToken: access_token,
//     //     twitterRefreshToken: refresh_token,
//     //   },
//     // });

//     // await prisma.$connect();

//     // const userUpdate = await prisma.user.update({
//     //   where: {
//     //     email: session?.user?.email || undefined,
//     //   },
//     //   data: {
//     //     accessToken: access_token,
//     //     refreshToken: refresh_token,
//     //   },
//     // });

//     // if (userUpdate) {
//     //   session.user.accessToken = access_token;
//     //   return NextResponse.json({
//     //     access_token: access_token,
//     //     refresh_token: refresh_token,
//     //     session: session,
//     //   });
//     // }
//     if (session?.user?.email) {
//       await prisma.$connect();
//       // await prisma.user.update({
//       //   where: { email: session.user.email },
//       //   data: {
//       //     accessToken: access_token.toString() || "",
//       //     refreshToken: refresh_token.toString() || "",
//       //   },
//       // });

//       const updateUser = await prisma.user.update({
//         where: { email: session.user.email },
//         data: {
//           accessToken: access_token.toString(),
//           refreshToken: refresh_token.toString(),
//         },
//       });
//       if (!updateUser) {
//         await prisma.$disconnect();
//         return NextResponse.redirect(
//           "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/unsucessful"
//         );
//       }

//       await prisma.$disconnect();
//       // session.user.accessToken = access_token;
//       // session.user.refreshToken = refresh_token;

//       return NextResponse.redirect(
//         "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/connectaccount"
//       );
//     } else {
//       return NextResponse.redirect(
//         "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/unsucessful"
//       );
//     }
//   } catch (error) {
//     console.error("Error in Twitter callback:", error);
//     return NextResponse.json(
//       { error: "Failed to authenticate with Twitter" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/lib/auth";

const prisma = new PrismaClient();

async function getTwitterWebTokens(accessToken: string) {
  try {
    // First request to get the guest token
    const guestResponse = await axios.post(
      "https://api.twitter.com/1.1/guest/activate.json",
      {},
      {
        headers: {
          Authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        },
      }
    );

    if (!guestResponse.data.guest_token) {
      throw new Error("Failed to obtain guest token");
    }

    // Modified login request with correct payload structure
    const loginResponse = await axios.post(
      "https://api.twitter.com/1.1/account/login.json",
      {
        flow_token: accessToken,
        subtask_inputs: [
          {
            subtask_id: "LoginJsInstrumentationSubtask",
            js_instrumentation: {
              response: "{}",
              link: "next_link",
            },
          },
        ],
      },
      {
        headers: {
          "x-guest-token": guestResponse.data.guest_token,
          Authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "Content-Type": "application/json",
        },
      }
    );

    // Add error handling for missing cookies
    const cookies = loginResponse.headers["set-cookie"];
    if (!cookies || cookies.length === 0) {
      throw new Error("No cookies received from Twitter login");
    }

    const authToken = cookies.find((cookie) => cookie.includes("auth_token"));
    const ct0 = cookies.find((cookie) => cookie.includes("ct0"));

    if (!authToken || !ct0) {
      throw new Error("Required cookies not found in response");
    }

    // Extract values with null checks
    const authTokenValue = authToken.split(";")[0].split("=")[1] || null;
    const ct0Value = ct0.split(";")[0].split("=")[1] || null;

    if (!authTokenValue || !ct0Value) {
      throw new Error("Failed to extract token values from cookies");
    }

    return {
      authToken: authTokenValue,
      ct0: ct0Value,
    };
  } catch (error) {
    console.error("Error getting web tokens:", error);
    // Add more detailed error information
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const combinedState = searchParams.get("state");
  const session = await getServerSession(NEXT_AUTH);

  if (!combinedState || !code) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const [originalState, codeVerifier] = Buffer.from(combinedState, "base64")
      .toString("utf8")
      .split(":");

    // Exchange code for tokens
    console.log(originalState);
    const tokenResponse = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams({
        code: code,
        grant_type: "authorization_code",
        client_id: process.env.TWITTER_CLIENT_ID!,
        redirect_uri: process.env.TWITTER_CALLBACK_URL!,
        code_verifier: codeVerifier,
      }),
      {
        auth: {
          username: process.env.TWITTER_CLIENT_ID!,
          password: process.env.TWITTER_CLIENT_SECRET!,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Add debug logging
    console.log("OAuth tokens received:", {
      access_token: !!access_token,
      refresh_token: !!refresh_token,
    });

    // Get web tokens with enhanced error handling
    let webTokens;
    try {
      webTokens = await getTwitterWebTokens(access_token);
      if (webTokens) {
        console.log("Web tokens received:", {
          hasAuthToken: Boolean(webTokens.authToken),
          hasCt0: Boolean(webTokens.ct0),
        });
      }
      if (webTokens) {
        console.log("Web tokens received:", {
          hasAuthToken: Boolean(webTokens.authToken),
          hasCt0: Boolean(webTokens.ct0),
        });
      }
    } catch (webTokenError) {
      console.error("Failed to get web tokens:", webTokenError);
      // Continue with the flow but log the error
    }

    if (session?.user?.email) {
      await prisma.$connect();

      const updateUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          accessToken: access_token.toString(),
          refreshToken: refresh_token.toString(),
          twitterAuthToken: webTokens?.authToken.toString(),
          twitterCsrfToken: webTokens?.authToken.toString(),
        },
      });

      await prisma.$disconnect();

      if (!updateUser) {
        return NextResponse.redirect(
          "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/unsucessful"
        );
      }

      return NextResponse.redirect(
        "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/connectaccount"
      );
    } else {
      return NextResponse.redirect(
        "   https://8ca8-2401-4900-1c9b-1516-24cf-ce7e-6fb6-ef51.ngrok-free.app/unsucessful"
      );
    }
  } catch (error) {
    console.error("Error in Twitter callback:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Twitter" },
      { status: 500 }
    );
  }
}
