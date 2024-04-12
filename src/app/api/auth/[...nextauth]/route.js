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
  // pages: {
  //   signIn: "/auth/signin", // Custom sign-in page path
  // },
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

        // FAKED REQUEST TO BACKEND
        const responseData = {
          access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMTAyODA5LCJpYXQiOjE3MDk1NjY4MDksImp0aSI6IjRiODQ3OWI4ODIxZDQ0MDJiODU2MTFkMmY4MTg3MDMxIiwidXNlcl9pZCI6MX0.9rT83wOijxtD_R-tlvcUn9Xx3z6a8eQu1blp6OLyR1I",
          refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTEwMjgwOSwiaWF0IjoxNzA5NTY2ODA5LCJqdGkiOiIxZDgyYTEyYzA1NmE0YmNlYmU3MWFlNmFhMjliY2VhNCIsInVzZXJfaWQiOjF9.2PYY20ufXy5-ZJ75KdHFTDU9ICz6oaaVCpwcctEB4Yo"
        }

        const {
          access: customAccessToken,
          refresh: customRefreshToken,
        } = responseData;

        if (customAccessToken) {
          const responseBody = {
            accessToken: customAccessToken,
            refreshToken: customRefreshToken,
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
      console.log("JWT callback triggered");
      console.log("Token", token);
      console.log("Account", account);
      console.log("Trigger", trigger);
      console.log("Session", session);
      console.log("Profile", profile);
      console.log("User", user);
      console.log('\n\n-------\n\n')

      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + user.expires_in * 1000, // Assuming you have `expires_in` value
        };
      }

      // if (account && user) {
      //   return {
      //     ...token,
      //     accessToken: user.accessToken,
      //     refreshToken: token.refreshToken,
      //     accessTokenExpires: Date.now() + user.expires_in * 1000, // Assuming you have `expires_in` value
      //   };
      // }


      // if (trigger === "update") {
      //   console.log('updating server session...')
      //   return { ...token, ...session.organisation };
      // }

      // if (
      //   typeof token.accessToken === "string" &&
      //   isJwtExpired(token.accessToken)
      // ) {
      //   token = await handleJWTExpired(token);
      // }

      return token;
    },
    async session({ session, token: jwtToken, user, trigger }) {
      console.log("Session callback triggered");
      console.log("Session", session);
      console.log("Token", jwtToken);
      console.log("User", user);
      console.log("Trigger", trigger);
      console.log('\n\n-------\n\n')


      const token = jwtToken;
      session.accessToken = token.accessToken;
      // session.refreshToken = token.refreshToken;
      // if (!session.user) {
      //   session.organisation = { name: "" };
      // }

      // session.organisation = session.organisation || { name: "" };

      // session.organisation.name = token.name || null;
      // session.user.last_name = token.last_name || null;
      // session.user.location = token.location;
      // session.user.username = token.username;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };