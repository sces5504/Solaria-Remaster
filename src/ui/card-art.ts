// Original line illustrations. Motifs describe abilities; family frames stay consistent.
const sword =
  '<path d="M28 68 64 23 71 18 72 28 37 72M25 59l20 17M27 73l-6 8"/>';
const shield =
  '<path d="m32 27 20-8 21 8-3 30-18 22-17-22Z"/><path d="M52 29v36M39 46h26"/>';
const star = '<path d="m52 19 7 24 24 9-24 8-7 25-8-25-25-8 25-9Z"/>';
const flame =
  '<path d="M52 19c6 17 27 24 24 43-2 24-46 25-48 1-2-14 9-22 15-32 0 15 8 17 9-12Z"/><path d="M52 49c14 13 16 24 0 29-14-4-13-16 0-29Z"/>';
const ice =
  '<path d="M52 20v64M24 36l56 32M24 68l56-32M44 27l8 8 8-8M44 77l8-8 8 8M28 46l12-3-3-12M76 58l-12 3 3 12M28 58l12 3-3 12M76 46l-12-3 3-12"/>';
const water =
  '<path d="M52 19c-6 17-27 33-26 46 2 28 49 28 52 0 1-12-20-29-26-46Z"/><path d="M35 65q3 11 16 12"/>';
const lightning = '<path d="m58 18-29 40h21l-5 27 30-41H55Z"/>';
const bow =
  '<path d="M40 22q45 30 0 60l7-30Z"/><path d="M24 52h58m-9-8 9 8-9 8"/>';
const eye =
  '<path d="M20 52q32-39 64 0-32 39-64 0Z"/><circle cx="52" cy="52" r="12"/>';
const ring =
  '<circle cx="52" cy="55" r="23"/><path d="m52 17 9 13-9 13-9-13Z"/>';
const book =
  '<path d="M52 31Q34 19 22 27v47q15-9 30 2 15-11 30-2V27q-16-8-30 4v45M30 38l14 4M30 50l14 4M61 42l12-4M61 54l12-4"/>';
const cloud =
  '<path d="M25 47c-17-21 16-39 24-20 13-20 40-1 29 13 23 16-6 27-16 21H29q-17-3-4-14Z"/>';
const spiral =
  '<path d="M83 52c0 44-64 41-63 0 0-33 49-32 49-2 0 21-32 20-32 1q1-12 15-9"/>';
const heart = '<path d="M52 79 23 51C4 23 43 13 52 37 66 11 98 29 81 52Z"/>';
const burst =
  '<path d="m52 17 6 22 23-9-14 19 21 9-23 4 9 21-19-14-11 20-3-23-23 5 16-18-17-12 24-1Z"/>';
const arrow = '<path d="M22 76 78 22M57 22h21v21M23 60l16 16M30 52l22 22"/>';
const gear =
  '<path d="m45 21 14 0 3 10 11 5 10-2 7 12-8 8-1 11 4 10-12 8-10-5-11 0-8 7-12-7 2-11-6-10-10-4 0-14 11-4 7-8Z"/><circle cx="52" cy="52" r="14"/>';
const moon = '<path d="M68 22C23 20 16 83 64 81c-28-17-28-41 4-59Z"/>';
const phoenix =
  '<path d="M52 73c-9-21-20-22-29-50 22 6 31 20 29 36 2-16 11-30 30-36-6 24-22 34-30 50ZM52 51V26l9 8M43 68l-10 16 19-8 18 8-9-16"/>';
const dragon =
  '<path d="m21 72 16-4-4-17 21-11-4-21 21 10 12 18-15 6-5-12-14 11 4 18-15 12ZM72 33h4M33 51l-15-8 12-10"/>';
const crystal = '<path d="m52 16 17 35-17 35-17-35Z M35 51h34M52 16v70"/>';
const unique: Record<number, string> = {
  1: heart,
  2: shield,
  3: sword,
  4: star,
  5: bow + '<path d="M16 30h20M11 40h19"/>',
  6: '<path d="m44 21 12 3-7 29 19 12 4 12-35 0-11-8 13-10Z M19 37h16M16 48h14"/>',
  7: arrow,
  8: book,
  9: gear,
  10: eye,
  11: '<path d="M35 20v27M52 16v33M69 20v27M28 47l10 33 12-26 12 26 15-33"/>',
  12: '<path d="M52 21 22 39v30l30 17 30-17V39Z"/>' + star,
  13: '<circle cx="52" cy="52" r="27"/><path d="M52 16v16M52 72v16M16 52h16M72 52h16"/>',
  14: flame + sword,
  15: ice,
  16: crystal + arrow,
  17: cloud + '<path d="m30 70 4 9 4-9-4-9Z m30 7 4 9 4-9-4-9Z"/>',
  18: ice + '<circle cx="52" cy="52" r="34"/>',
  19: flame,
  20: dragon,
  21: phoenix,
  22: flame + '<ellipse cx="52" cy="67" rx="35" ry="14"/>',
  23: burst + '<path d="M52 38v22"/>',
  24: water,
  25: '<circle cx="42" cy="59" r="23"/><circle cx="72" cy="32" r="12"/><path d="M28 54q0-12 12-13M67 28h4"/>',
  26: spiral,
  27: shield + '<path d="M32 51q10-11 20 0t20 0"/>',
  28: lightning,
  29: '<path d="M26 30h18l-10 13 36 18-10 13h18"/><circle cx="26" cy="30" r="7"/><circle cx="78" cy="74" r="7"/>',
  30: lightning + '<circle cx="52" cy="52" r="33"/>',
  31: '<circle cx="52" cy="52" r="29"/>' + lightning,
  32: water + '<path d="M32 16q-8 8 0 16M48 8q-8 8 0 16M64 16q-8 8 0 16"/>',
  33: burst + '<path d="M32 32q20-19 40 0M32 73q20 19 40 0"/>',
  34: gear + '<path d="M29 17q-7 8 0 13M75 15q-7 8 0 13"/>',
  35: water + lightning,
  36: spiral + lightning,
  37:
    '<path d="M35 27v51M45 27v51M59 27v51M69 27v51M30 27h44M30 78h44"/>' +
    lightning,
  38: '<circle cx="34" cy="52" r="16"/><circle cx="70" cy="52" r="16"/><path d="M34 32v40M24 52h20M70 34l-8 20h16l-8 16"/>',
  39:
    '<path d="M52 20v64M20 52h64"/>' +
    '<path d="m30 30 8 12-8 12-8-12Z M72 32c17 25 0 35-9 21Z"/>',
  40: '<path d="M20 52q16-32 32 0t32 0M20 52q16 32 32 0t32 0"/><circle cx="52" cy="52" r="8"/>',
  41: sword + '<path d="M18 40q28-32 65 9"/>',
  42: sword + '<path d="M24 24v17M16 32h17"/>',
  43: sword + '<path d="M52 72 82 45M62 81 90 55"/>',
  44: sword + '<path d="M19 42q18-29 53-24M12 47q0-27 30-36"/>',
  45: shield + star,
  46: shield + '<path d="m52 37-12 20h10l-4 13 18-23H52Z"/>',
  47: sword + '<path d="M12 40h23M8 51h21M13 62h9"/>',
  48: eye + '<path d="M52 12v18M52 74v18M12 52h18M74 52h18"/>',
  49: bow + '<path d="M18 35h16M18 69h16"/>',
  50: '<path d="M21 52h62M54 52l24-23M54 52l24 23M69 23h14v14M69 81h14V67M73 44l10 8-10 8"/>',
  51: arrow + '<path d="M34 17v25M46 60v27"/>',
  52: bow + '<path d="M29 16 48 30M65 71l15 17"/>',
  53: bow + '<path d="M12 27h21M8 39h18M14 74h18"/>',
  54: '<path d="m34 23 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z m35 29 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z M40 65l-10 16M64 38l12-17"/>',
  55: eye + '<path d="M25 25h15M64 79h15"/>',
  56: burst + '<circle cx="52" cy="52" r="13"/>',
  57: '<path d="m50 22 23 30-23 30-21-30ZM18 24l24 23M63 54l24-18M63 55l23 22"/>',
  58:
    '<ellipse cx="52" cy="52" rx="38" ry="14" transform="rotate(-25 52 52)"/>' +
    star,
  59: ring + '<ellipse cx="52" cy="52" rx="38" ry="13"/>',
  60: '<path d="M25 26v53h55M25 58q15-12 28 3 14 15 27-7M36 18v24M69 64v23"/>',
  61: '<path d="M28 28h48v48H28ZM40 18v16M64 18v16M40 70v16M64 70v16M37 52h30M52 37v30"/>',
  62: '<path d="M16 30h27M12 44h23M22 72h25M48 23l28 9-14 22 21 13-9 15-30-24 15-20-20-5Z"/>',
  63: '<path d="M22 77h60M32 66l20-38 20 38M52 18v12M20 30l13 13M84 30 71 43M35 77v10M69 77v10"/>',
  64: '<path d="m52 18 29 16v32L52 84 23 66V34ZM34 40l8 8M70 40l-8 8M38 65l28-28M61 31l12 12"/>',
  65: '<path d="M28 29h48M30 76h44M31 29q3 16 21 23-18 6-21 24M73 29Q70 46 52 52q18 7 21 24M52 38v12M45 68h14"/>',
  66: '<path d="M18 73l22-22 15 9 30-36M69 24h16v16M22 85V73M42 85V65M62 85V67M82 85V54"/>',
  67: '<path d="m27 27 25-10 25 10-5 41-20 19-20-19Z M41 38h22M52 27v33M39 60l13 14 13-14"/>',
  68: '<path d="m28 20 46 64M76 20 29 84M52 32v14M35 52h12M57 52h12M52 58v14M22 25l4 12M80 68l-4 12"/>',
  69: '<path d="M26 31a32 32 0 1 1-1 42M26 17v20H12M52 28v24l17 12M38 74l13-16 10 12"/>',
  70: '<path d="m27 75 43-49 7-5-1 12-40 49M19 63l21 16M38 22l-7 14M22 39l-7 16M62 68l-7 14"/>',
  71: '<path d="m34 19 5 17 17 5-17 5-5 17-5-17-17-5 17-5ZM70 42l5 17 17 5-17 5-5 17-5-17-17-5 17-5M48 24l31 1M76 19l5 6-5 6"/>',
  72: '<path d="M24 52a28 28 0 1 1 11 24M52 28v26l17 9M19 18v18h18M52 55v28M41 74l11 10 11-10"/>',
  73: '<path d="m22 32 15 14 15-25 15 25 15-14-7 40H29Z M31 62h42M38 81h28M52 39v15"/>',
  74: '<path d="M19 35q34-31 65 6M85 68Q53 100 20 60M24 24l-5 12 14 2M79 79l6-12-13-2M41 42l11-15 11 15-11 14ZM41 68l11-12 11 12-11 13Z"/>',
  75: '<path d="m24 29 45 20-39 9 37-14-38-8ZM22 64l48-5-37 24 30-21-29 9ZM47 16l37 43-18-8 10 28-8-20-10-19Z"/>',
  76: '<path d="m31 31 21-13 22 13-3 42-19 14-19-14ZM40 38h24M40 51h24M40 64h24M52 30v43M19 17v13M13 23h13M82 76v13M76 82h13"/>',
  77: '<path d="M20 31h18V18M84 31H66V18M20 73h18v13M84 73H66v13M52 32v40M32 52h40M42 42l20 20M62 42 42 62"/>',
  78: '<path d="m29 21 10 6 13-10 13 10 10-6-7 35-16 19-16-19ZM23 74l58-47M21 78l6 6M35 51h34M38 37l7 6M66 37l-7 6"/>',
  79: '<path d="M52 20 28 43q-16 29 8 39 25 10 40-11 10-17-24-51ZM33 48l7 15 7-15M58 48l7 15 7-15M42 75q10-10 20 0"/>',
  80: '<path d="M52 20v64M24 36l56 32M24 68l56-32M52 20l-6 13M79 67l-14-1M24 67l13-1M17 80l15-18M73 36l15-18"/>',
  81: '<path d="m52 15 27 18 4 37-31 19-30-19 4-37ZM52 15l-7 29 16 10-22 16 13 19M24 36l21 8M60 54l21 14M42 43l-7-12M60 60l12 15"/>',
  82: '<path d="M29 73h45M37 72 30 37h44l-7 35M32 42h40M52 19c-17 19-18 29 0 31 17-2 17-12 0-31ZM52 77v10M39 87h26"/>',
  83: '<path d="M20 33q10-13 25-5l15 27q-5 15-21 9l-12-26ZM58 41q18-17 25-3M71 29v28M22 82l61-59M16 82l7 7"/>',
  84: '<path d="M28 19h48M28 84h48M33 19q0 20 19 33-19 14-19 32M71 19q0 20-19 33 19 14 19 32M40 32h24M38 74h28M18 34v34M86 34v34"/>',
  85: '<path d="m24 30 43-11 20 24-5 32-40 12-24-27ZM24 30l27 24 36-11M51 54 42 87M51 54l-33 6M44 34h1M66 33h1M64 63h1M72 59h1M55 74h1"/>',
};
export function cardFamily(id: number) {
  return id >= 60
    ? "traveler"
    : id <= 14
      ? "traveler"
      : id <= 18
        ? "ice"
        : id <= 23
          ? "fire"
          : id <= 27
            ? "water"
            : id <= 31
              ? "lightning"
              : id <= 40
                ? "fusion"
                : id <= 47
                  ? "sword"
                  : id <= 53
                    ? "bow"
                    : "mage";
}
export function cardArt(id: number, locked = false) {
  const family = locked ? "unknown" : cardFamily(id);
  return `<svg class="card-art family-${family}" viewBox="0 0 104 104" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path class="art-frame" d="M18 10h68l8 8v68l-8 8H18l-8-8V18Z"/><path class="art-corners" d="M26 15h-8v8M78 15h8v8M18 78v8h8M86 78v8h-8"/>${locked ? moon + '<path d="M49 43q5-8 10-1 2 5-6 10v5M53 66h0"/>' : unique[id]}</svg>`;
}
