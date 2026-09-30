type Props = {
  paragraphs: string[];
  interests: string[];
};

export function About({ paragraphs, interests }: Props) {
  return (
    <div className="panel">
      <div className="in about">
        <h2>Sobre mí</h2>
        {paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
        <ul className="tags">
          {interests.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <p className="note">Esta sección acepta HTML y CSS propio: fondos, fuentes, GIFs y más.</p>
      </div>
    </div>
  );
}
