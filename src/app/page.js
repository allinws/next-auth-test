import Image from "next/image";

import { authOptions } from "./api/auth/[...nextauth]/route";

import { getServerSession } from "next-auth";

import { ClientComponent } from "./ClientComponent";


export default async function Home() {

  const session = await getServerSession(authOptions);

  console.log('session___', session)

  // shorten auth token to 10 characters
  const shortAccessToken = session?.accessToken ? `${session.accessToken.substring(0, 10)}...` : null;
  const shortRefreshToken = session?.refreshToken ? `${session.refreshToken.substring(0, 10)}...` : null;

 

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <ClientComponent />
        <h2
        className="text-2xl font-bold"
        >Server session</h2>
        <p>Server session accesstoken: <span className="font-bold">{shortAccessToken}</span></p>
        <p>Server session refreshtoken: <span className="font-bold" >{shortRefreshToken ? shortRefreshToken : "Not found"}</span></p>
        < br />
      </div>
    </main>
  );
}
