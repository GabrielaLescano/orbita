import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { getHandleByUserId } from "@/data/get-profile";

export async function AuthButton() {
  const session = await auth();

  if (!session?.user?.id) {
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

  const handle = await getHandleByUserId(session.user.id);

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Link href={handle ? `/u/${handle}` : "/perfil/editar"} className="btn">
        {handle ? "Mi perfil" : "Crear mi perfil"}
      </Link>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit" className="btn" title={session.user.email ?? undefined}>
          Salir
        </button>
      </form>
    </div>
  );
}
