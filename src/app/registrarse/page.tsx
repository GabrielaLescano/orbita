import { RegisterForm } from "./RegisterForm";
import "@/components/profile/profile.css";
import "@/app/perfil/editar/editar.css";

export default function RegisterPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 24 }}>
      <div className="panel panel--neon" style={{ maxWidth: 400, width: "100%" }}>
        <div className="in">
          <h1 className="name" style={{ fontSize: 28, textAlign: "center" }}>
            Creá tu perfil
          </h1>
          <p className="tagline" style={{ margin: "8px 0 20px", textAlign: "center" }}>
            Un solo paso: tu cuenta y tu perfil se crean juntos.
          </p>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
