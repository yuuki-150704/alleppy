// アレルゲンアイコン（SVGをdata URIで埋め込み）
// 線画スタイルの手描き風アイコン

const svgToDataUri = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const icons: Record<string, string> = {
  そば: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M25 18 C25 18 30 60 28 65"/>
    <path d="M32 16 C32 16 35 58 34 65"/>
    <path d="M39 15 C39 15 40 57 40 65"/>
    <path d="M46 16 C46 16 45 58 46 65"/>
    <path d="M53 18 C53 18 50 60 52 65"/>
    <ellipse cx="39" cy="30" rx="18" ry="4"/>
  </svg>`),

  落花生: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 25 C20 28 16 38 22 45 C26 50 32 48 35 42"/>
    <path d="M35 42 C38 36 42 36 45 42"/>
    <path d="M45 42 C48 48 54 50 58 45 C64 38 60 28 52 25"/>
    <path d="M52 25 C48 22 42 20 40 22 C38 20 32 22 28 25"/>
    <path d="M35 30 C37 35 43 35 45 30"/>
    <path d="M25 35 C27 33 29 34 28 37"/>
    <path d="M52 35 C54 33 56 34 55 37"/>
  </svg>`),

  小麦: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 68 L40 25"/>
    <path d="M40 50 C34 46 30 42 32 38"/>
    <path d="M40 42 C34 38 31 33 34 30"/>
    <path d="M40 34 C35 31 33 26 36 23"/>
    <path d="M40 50 C46 46 50 42 48 38"/>
    <path d="M40 42 C46 38 49 33 46 30"/>
    <path d="M40 34 C45 31 47 26 44 23"/>
    <path d="M40 25 C38 20 40 15 40 12"/>
  </svg>`),

  卵: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 12 C28 12 18 30 18 48 C18 62 28 70 40 70 C52 70 62 62 62 48 C62 30 52 12 40 12Z"/>
  </svg>`),

  乳: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 25 L28 65 C28 68 32 70 40 70 C48 70 52 68 52 65 L52 25"/>
    <path d="M28 25 L30 18 L50 18 L52 25"/>
    <line x1="28" y1="25" x2="52" y2="25"/>
    <line x1="28" y1="42" x2="52" y2="42"/>
    <line x1="28" y1="52" x2="52" y2="52"/>
  </svg>`),

  えび: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M55 20 C60 15 62 12 58 10"/>
    <path d="M50 22 C54 16 58 14 55 11"/>
    <path d="M55 20 C48 22 35 28 28 38 C22 48 24 56 30 60"/>
    <path d="M48 26 C44 30 42 28 46 24"/>
    <path d="M42 32 C38 36 36 34 40 30"/>
    <path d="M36 40 C32 44 30 42 34 38"/>
    <path d="M30 60 C26 64 22 66 20 62"/>
    <path d="M30 60 C28 66 26 68 22 66"/>
  </svg>`),

  かに: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="40" cy="42" rx="20" ry="14"/>
    <circle cx="34" cy="34" r="2.5"/>
    <circle cx="46" cy="34" r="2.5"/>
    <path d="M20 40 L12 32 C10 28 8 30 10 34 L12 36"/>
    <path d="M12 32 C14 28 12 26 10 28"/>
    <path d="M60 40 L68 32 C70 28 72 30 70 34 L68 36"/>
    <path d="M68 32 C66 28 68 26 70 28"/>
    <path d="M22 46 L14 52"/>
    <path d="M22 50 L16 58"/>
    <path d="M58 46 L66 52"/>
    <path d="M58 50 L64 58"/>
  </svg>`),

  くるみ: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="40" cy="42" rx="22" ry="20"/>
    <path d="M40 22 C38 30 36 36 38 42 C40 48 42 54 40 62"/>
    <path d="M28 34 C32 32 34 36 30 40"/>
    <path d="M52 34 C48 32 46 36 50 40"/>
    <path d="M30 48 C34 46 36 50 32 52"/>
    <path d="M50 48 C46 46 44 50 48 52"/>
  </svg>`),
};

export function getAllergenIcon(nameJa: string): string | null {
  return icons[nameJa] || null;
}
