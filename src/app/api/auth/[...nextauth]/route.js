import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { isJwtExpired } from "../../../../utils/Utils";

const backendBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}`;

const handleJWTExpired = async (token) => {
  console.log("Token expired, refreshing");
  const backendBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}`;
  const payload = JSON.stringify({
    refresh: token.refreshToken,
  });

  const response = await fetch(`${backendBaseUrl}/api/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  });

  if (response.ok) {
    console.log("Token refreshed");

    // extract the returned token from the DRF backend
    const responseData = await response.json();


    const {
      access: customAccessToken,
      access_expiration: customAccessExpiration,
    } = responseData;

    // Calculate 'iat' and 'exp' based on the current time and expiration time
    const now = Math.floor(Date.now() / 1000); // Current time in Unix time (seconds)
    const expTime = new Date(customAccessExpiration).getTime() / 1000; // Convert expiration time to Unix time

    token = {
      ...token,
      accessToken: customAccessToken,
      iat: now,
      exp: expTime,
    };
  } else {
    token = {
      ...token,
      accessToken: "",
    };
    console.log("Error in response", response.status);
  }
  return token;
};

export const authOptions = {
//   pages: {
//     signIn: "/auth/signin", // Custom sign-in page path
//   },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "user@username.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // make request to base_url/api/auth/login/ with email and password body
        // const url = `${backendBaseUrl}/api/token/`;
        // const response = await fetch(url, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(credentials),
        // });

        // if (!response.ok) {
        //   return null;
        // }

        // const responseData = await response.json();

        const responseData = {
            access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMDk2NzY4LCJpYXQiOjE3MDk1NjA3NjgsImp0aSI6ImJiYTM3NmM0MjRmYzRkYWJhMTlkNjI4MWQwNzc3ZTM3IiwidXNlcl9pZCI6MX0.-2jvR8bA5G5sqTa0Psd8Wbnhs-5MgNnYMIKh-oug_rk",
            refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTA5Njc2OCwiaWF0IjoxNzA5NTYwNzY4LCJqdGkiOiJkZDAxODQ3OWExYmE0ZTJiYjg3NDU0ODczMDFlYjcyOSIsInVzZXJfaWQiOjF9.RFhudwWpNY88NNu-KFFiIRTD6Tm6oCKS3zBI5sqeqEI",
        }

        console.log('responseData', responseData)

        const {
          access: customAccessToken,
          refresh: customRefreshToken,
        //   organisation: { name },
        } = responseData;

        if (customAccessToken) {
          const responseBody = {
            accessToken: customAccessToken,
            refreshToken: customRefreshToken,
            // name: name,
          };

          return responseBody;
        } else {
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, trigger, session, profile, user }) {
      // Update server session with new data

      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + user.expires_in * 1000, // Assuming you have `expires_in` value
        };
      }
    

      // if (trigger === "update") {
      //   console.log('updating server session...')
      //   return { ...token, ...session.organisation };
      // }

      if (
        typeof token.accessToken === "string" &&
        isJwtExpired(token.accessToken)
      ) {
        token = await handleJWTExpired(token);
      }

      return token;
    },
    async session({ session, token: jwtToken, user, trigger }) {
      const token = jwtToken;
      session.accessToken = token.accessToken;
      // session.refreshToken = token.refreshToken;
      // if (!session.user) {
      //   session.organisation = { name: "" };
      // }

      session.organisation = session.organisation || { name: "" };

      session.organisation.name = token.name || null;
      // session.user.last_name = token.last_name || null;
      // session.user.location = token.location;
      // session.user.username = token.username;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
