import { signIn } from "@/auth";
import { LoginForm } from "./LoginForm";
import "@/components/profile/profile.css";
import "@/app/perfil/editar/editar.css";

export default function SignInPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 24 }}>
      <div className="panel panel--neon" style={{ maxWidth: 400, width: "100%" }}>
        <div className="in">
          <h1 className="name" style={{ fontSize: 28, textAlign: "center" }}>
            Entrar a Órbita
          </h1>
          <p className="tagline" style={{ margin: "8px 0 20px", textAlign: "center" }}>
            Iniciá sesión para crear o editar tu perfil.
          </p>

          <LoginForm />

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span className="tagline" style={{ fontSize: 12 }}>o</span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn" style={{ width: "100%" }}>
              Continuar con GitHub
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
