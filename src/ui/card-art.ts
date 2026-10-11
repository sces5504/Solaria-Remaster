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
};
export function cardFamily(id: number) {
  return id <= 14
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
