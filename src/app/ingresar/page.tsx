import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 24 }}>
      <div className="panel panel--neon" style={{ maxWidth: 360, width: "100%" }}>
        <div className="in" style={{ textAlign: "center" }}>
          <h1 className="name" style={{ fontSize: 28 }}>Entrar a Órbita</h1>
          <p className="tagline" style={{ margin: "8px 0 20px" }}>
            Iniciá sesión para crear o editar tu perfil.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn btn--solid" style={{ width: "100%" }}>
              Continuar con GitHub
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
