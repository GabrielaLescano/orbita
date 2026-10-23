import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getHandleByUserId } from "@/data/get-profile";
import { LandingHeader } from "@/components/landing/LandingHeader";
import "@/components/profile/profile.css";
import "./landing.css";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    const handle = await getHandleByUserId(session.user.id);
    redirect(handle ? `/u/${handle}` : "/perfil/editar");
  }

  return (
    <>
      <LandingHeader />
      <main>
        <section className="landing-hero">
          <h1>Tu propio espacio</h1>
          <p>
            Un perfil que es tuyo de verdad: elegís el estilo con tu propio HTML y CSS,
            sumás tu música y lo compartís con quien quieras.
          </p>
          <div className="landing-actions">
            <Link href="/registrarse" className="btn btn--solid">
              Crear tu perfil
            </Link>
            <Link href="/ingresar" className="btn">
              Ingresar
            </Link>
          </div>
        </section>

        <section className="landing-example panel">
          <div className="in">
            <div className="landing-example-text">
              <h2>¿Cómo se ve un perfil?</h2>
              <p>Mirá el de nova_kid, un perfil de ejemplo con el tema por defecto.</p>
            </div>
            <Link href="/u/nova_kid" className="btn">
              Ver perfil de ejemplo
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
