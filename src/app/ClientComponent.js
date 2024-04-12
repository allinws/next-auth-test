"use client";

import { useSession } from "next-auth/react";

import { signIn, signOut } from "next-auth/react";

export const ClientComponent = () => {
  const { data: session } = useSession();

  const handleSignin = async () => {
    await signIn();
  };

  const handleSignout = async () => {
    await signOut();
  };

  const shortAccessToken = session?.accessToken
    ? `${session.accessToken.substring(0, 10)}...`
    : null;
  const shortRefreshToken = session?.refreshToken
    ? `${session.refreshToken.substring(0, 10)}...`
    : null;

  return (
    <div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-10 cursor-pointer"
        onClick={() => handleSignin()}
      >
        Sign in
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full mb-10 cursor-pointer"
        onClick={() => handleSignout()}
      >
        Sign out
      </button>

      <h2 className="text-2xl font-bold">Client session</h2>
      <p>
        Client session accesstoken:{" "}
        <span className="font-bold">{shortAccessToken}</span>
      </p>
      <p>
        Server session refreshtoken:{" "}
        <span className="font-bold">
          {shortRefreshToken ? shortRefreshToken : "Not found"}
        </span>
      </p>
    </div>
  );
};
