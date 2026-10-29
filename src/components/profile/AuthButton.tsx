import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getHandleByUserId } from "@/data/get-profile";
import { countPendingRequests } from "@/data/friends";
import { countNewActivity } from "@/data/notifications";

export async function AuthButton() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Link href="/ingresar" className="btn">
        Ingresar
      </Link>
    );
  }

  const [handle, pendingCount, activityCount] = await Promise.all([
    getHandleByUserId(session.user.id),
    countPendingRequests(session.user.id),
    countNewActivity(session.user.id),
  ]);
  const notificationCount = pendingCount + activityCount;

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Link href={handle ? `/u/${handle}` : "/perfil/editar"} className="btn">
        {handle ? "Mi perfil" : "Crear mi perfil"}
        {notificationCount > 0 && <span className="count">{notificationCount}</span>}
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
