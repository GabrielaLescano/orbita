import type { CSSVars } from "@/types/css";

type Props = {
  avatarUrl: string | null;
  hue: number;
  initial: string;
  className?: string;
};

export function HexAvatar({ avatarUrl, hue, initial, className = "" }: Props) {
  const classes = `hex ${className}`.trim();
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- la URL es de Vercel Blob, un dominio externo
    return <img src={avatarUrl} alt="" className={classes} />;
  }
  return (
    <div className={classes} style={{ "--h": hue } as CSSVars}>
      {initial}
    </div>
  );
}
