"use client";

import { Trans } from "react-i18next";

const MARKED = { hl: <mark className="mkt-hl" /> };
const PLAIN = { hl: <span /> };

/** A translated heading whose key words are wrapped in <hl> in en.json and bn.json. `plain` drops the highlight (index links, labels). */
export default function Hl({ k, values, plain }: { k: string; values?: Record<string, string>; plain?: boolean }) {
  return <Trans i18nKey={k} values={values} components={plain ? PLAIN : MARKED} />;
}
