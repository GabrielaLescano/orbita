import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ProfileForm } from "./ProfileForm";
import "@/components/profile/profile.css";
import "./editar.css";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/ingresar");

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  const initial = existing
    ? {
        handle: existing.handle,
        tagline: existing.tagline,
        status: existing.status,
        aboutHtml: existing.aboutHtml,
        customCss: existing.customCss,
        theme: { accent1: existing.themeAccent1, accent2: existing.themeAccent2 },
      }
    : null;

  return (
    <main className="profile-main" style={{ maxWidth: 640 }}>
      <div className="panel panel--neon">
        <div className="in">
          <h1 className="name" style={{ fontSize: 28 }}>
            {existing ? "Editar tu perfil" : "Creá tu perfil"}
          </h1>
          <p className="tagline" style={{ marginBottom: 20 }}>
            El HTML y el CSS se sanitizan al guardar y se muestran dentro de un iframe aislado.
          </p>
          <ProfileForm initial={initial} />
        </div>
      </div>
    </main>
  );
}
