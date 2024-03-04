"use client";

import { useSession } from "next-auth/react";

export const ClientComponent = () => {
  const { data: session } = useSession();

  const shortAccessToken = session?.accessToken
    ? `${session.accessToken.substring(0, 10)}...`
    : null;
  const shortRefreshToken = session?.refreshToken
    ? `${session.refreshToken.substring(0, 10)}...`
    : null;

  return (
    <div>
      <h2
      className="text-2xl font-bold"
      >Client session</h2>
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
