// El contenido lo escribe la persona (HTML y CSS propios), así que NO se inserta en esta
// página: se muestra en un iframe con sandbox, servido por una ruta aparte con su propia CSP.
// Sin allow-scripts ni allow-same-origin: no puede ejecutar JavaScript ni tocar esta página.
export function About({ handle }: { handle: string }) {
  return (
    <div className="panel">
      <div className="in about">
        <h2>Sobre mí</h2>
        <iframe
          className="about-frame"
          title={`Sobre mí de ${handle}`}
          src={`/p/${encodeURIComponent(handle)}/content`}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
    </div>
  );
}
