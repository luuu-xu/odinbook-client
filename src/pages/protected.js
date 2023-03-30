import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Protected() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return <div>User is logged in {session.user.name}</div>
  }

  return (
    <>
      <div>Not loged in</div>
      <button onClick={() => signIn()}>Sign in</button>
    </>

  );
}