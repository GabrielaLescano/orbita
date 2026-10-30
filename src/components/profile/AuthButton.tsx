import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getHandleByUserId } from "@/data/get-profile";
import { getNotifications } from "@/data/notifications";
import { NotificationsMenu } from "./NotificationsMenu";

export async function AuthButton() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Link href="/ingresar" className="btn">
        Ingresar
      </Link>
    );
  }

  const [handle, notifications] = await Promise.all([
    getHandleByUserId(session.user.id),
    getNotifications(session.user.id),
  ]);

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Link href={handle ? `/u/${handle}` : "/perfil/editar"} className="btn">
        {handle ? "Mi perfil" : "Crear mi perfil"}
      </Link>
      <NotificationsMenu initial={notifications} />
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
