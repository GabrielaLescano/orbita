import { auth, signIn, signOut } from "@/auth";

export async function AuthButton() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button type="submit" className="btn">Ingresar</button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button type="submit" className="btn" title={session.user.email ?? undefined}>
        Salir ({session.user.name ?? "cuenta"})
      </button>
    </form>
  );
}
