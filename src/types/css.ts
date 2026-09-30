import type { CSSProperties } from "react";

/** style={{ "--h": 190 } as CSSVars }: permite variables CSS en el atributo style. */
export type CSSVars = CSSProperties & { [key: `--${string}`]: string | number };
