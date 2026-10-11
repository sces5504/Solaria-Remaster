import { originalBasicAbilities } from "./advanced-abilities";
import { actionRestriction } from "./ability-policies";
import type { Run, Command, Element } from "../core/types";
import { angle, distance, clamp } from "../core/primitives";
import {
  context,
  level,
  factor,
  shoot,
  cone,
  area,
  burst,
  shield,
  visual,
} from "./combat";
import { classes } from "../data/world";
import { legal, lineBlocked } from "./geometry";
export function targetPoint(r: Run, c: Command, range = 450) {
  const d = distance(r.player, c.pointerWorld),
    mul = Math.min(1, (range * r.stats.range) / (d || 1));
  return {
    x: clamp(r.player.x + (c.pointerWorld.x - r.player.x) * mul, 40, 984),
    y: clamp(r.player.y + (c.pointerWorld.y - r.player.y) * mul, 72, 600),
  };
}
export function basic(r: Run, c: Command, rapid = false) {
  const p = r.player;
  if (!rapid && actionRestriction(r, "basic")) return false;
  visual(
    r,
    "cast",
    p,
    0,
    r.classId === "mage" ? 0xcdb4ff : 0xe6f4b7,
    10,
    angle(p, c.pointerWorld),
  );
  if (!rapid) p.lastBasic = r.time;
  if (!r.echoing) {
    p.casts++;
    p.capacitor = Math.min(5, p.capacitor + 1);
  }
  const a = angle(p, c.pointerWorld),
    cls = classes[r.classId];
  const id = r.classId === "sword" ? 41 : r.classId === "bow" ? 50 : 54;
  const category = rapid ? "skill" : "basic";
  let bonus = 0;
  for (const cid of r.classId === "sword"
    ? [41, 43]
    : r.classId === "bow"
      ? [50, 51, 52]
      : [54, 56, 57])
    if (level(r, cid))
      bonus +=
        factor(
          r,
          cid,
          [41, 42, 48, 49, 54, 55].includes(cid)
            ? 0.15
            : cid === 52
              ? 0.25
              : 0.2,
        ) - 1;
  if (p.buffUntil > r.time && level(r, 53)) bonus += factor(r, 53, 0.25) - 1;
  const damage = cls.damage * (1 + bonus);
  const ctx = context(r, id, category, [...r.elements], true);
  const side = (source: number, scale: number) => ({
    ...context(r, source, category, [...r.elements], true, scale),
    rootAttackId: ctx.rootAttackId,
  });
  if (r.classId === "sword") {
    cone(
      r,
      p,
      a,
      90,
      level(r, 41)
        ? ((120 + Math.min(4, level(r, 41) - 1) * 5) * Math.PI) / 180
        : Math.PI / 2,
      damage,
      ctx,
    );
    if (level(r, 43)) {
      const n = level(r, 43) >= 5 ? 1 : level(r, 43) >= 3 ? 2 : 3;
      if (p.casts % n === 0)
        shoot(
          r,
          p,
          a,
          30 * factor(r, 43),
          600,
          600,
          context(r, 43, "additional", [], false, 1, false, "none"),
        );
    }
  } else {
    const bow = r.classId === "bow",
      pierce =
        bow && level(r, 51)
          ? [3, 3, 4, 4, 5][Math.min(4, level(r, 51) - 1)]
          : 1,
      bounce =
        !bow && level(r, 57)
          ? [2, 2, 3, 3, 4][Math.min(4, level(r, 57) - 1)]
          : 0;
    shoot(
      r,
      p,
      a,
      damage,
      bow ? 700 : 600,
      bow ? 700 : 600,
      ctx,
      pierce,
      false,
      0,
      0,
      0,
      0,
      bounce,
    );
    if (bow && level(r, 50)) {
      const l = level(r, 50),
        n = l >= 5 ? 4 : l >= 3 ? 3 : 2,
        scale = l >= 5 ? 0.15 : l >= 3 ? 0.175 : 0.2;
      for (let i = 0; i < n; i++) {
        const offset = (i - (n - 1) / 2) * 0.16 + (i < n / 2 ? -0.1 : 0.1);
        shoot(r, p, a + offset, damage, 700, 700, side(50, scale), pierce);
      }
    }
    if (!bow && level(r, 54))
      shoot(
        r,
        p,
        a + 0.13,
        damage,
        600,
        600,
        side(54, 0.4 + Math.min(4, level(r, 54) - 1) * 0.05),
        1,
        false,
        0,
        0,
        0,
        0,
        bounce,
      );
  }
  if (!rapid) originalBasicAbilities(r, angle(p, c.pointerWorld));
  if (r.echoing) return true;
  if (level(r, 16) && p.casts % 3 === 0)
    shoot(
      r,
      p,
      a,
      30 * factor(r, 16),
      650,
      650,
      context(r, 16, "additional", ["ice"], false, 1, false, "none"),
      99,
    );
  const ready = (id: number, interval: number) => {
    if (!level(r, id) || r.time < (r.cooldowns[id] || 0)) return false;
    r.cooldowns[id] = r.time + interval;
    return true;
  };
  if (ready(20, 4))
    area(
      r,
      p,
      160,
      8 * factor(r, 20),
      0,
      2,
      0.25,
      context(r, 20, "skill", ["fire"]),
      { follow: true, shape: "cone", angle: a, width: (80 * Math.PI) / 180 },
    );
  if (ready(25, 1.2))
    shoot(
      r,
      p,
      a,
      18 * factor(r, 25),
      450,
      550,
      context(r, 25, "skill", ["water"]),
    );
  if (ready(32, 1))
    shoot(
      r,
      p,
      a,
      28 * factor(r, 32),
      650,
      650,
      context(r, 32, "skill", ["water", "fire"]),
      1,
      false,
      0,
      0,
      70,
      36 * factor(r, 32),
    );
  if (ready(35, 1))
    shoot(
      r,
      p,
      a,
      28 * factor(r, 35),
      550,
      650,
      context(r, 35, "skill", ["water", "lightning"]),
      1,
      false,
      0,
      0,
      90,
      35 * factor(r, 35),
    );
  if (ready(38, 1.2)) {
    shoot(
      r,
      p,
      a - 0.12,
      25 * factor(r, 38),
      550,
      650,
      context(r, 38, "skill", ["ice"]),
    );
    shoot(
      r,
      p,
      a + 0.12,
      25 * factor(r, 38),
      550,
      650,
      context(r, 38, "skill", ["fire"]),
    );
  }
}
export function castSkill(r: Run, c: Command, echo = false) {
  const p = r.player;
  if (!echo && actionRestriction(r, "skill")) return false;
  if (!echo && (r.time < p.skillReady || r.time < p.controlUntil)) return false;
  if (!echo && level(r, 67))
    shield(r, r.stats.maxHP * (0.1 + 0.02 * (factor(r, 67, 1) - 1)), 2);
  if (!echo) {
    r.echoCapacitor = 0;
    if (level(r, 82)) p.hp = Math.max(1, p.hp * 0.92);
    p.skillCast = r.time;
    p.skillReady = r.time + r.stats.skillCD;
    if (level(r, 71))
      p.pendingEcho = { at: r.time + 0.8, pointer: { ...c.pointerWorld } };
  }
  visual(r, "cast", p, 0, 0xddd0ff, 50);
  const at = targetPoint(r, c),
    a = angle(p, c.pointerWorld);
  if (!echo && r.classId === "sword") {
    p.blockUntil = r.time + 0.6;
    p.blockHit = false;
  }
  if (!echo && r.classId === "bow") {
    const l = level(r, 52),
      n = l ? [8, 8, 9, 9, 10][Math.min(4, l - 1)] : 5;
    p.rapid = { at: r.time, remaining: n, interval: 1 / (n - 1) };
  }
  if (echo && r.classId === "bow") {
    const l = level(r, 52),
      n = l ? [8, 8, 9, 9, 10][Math.min(4, l - 1)] : 5;
    p.echoRapid = {
      at: r.time,
      remaining: n,
      interval: 1 / (n - 1),
      pointer: { ...c.pointerWorld },
    };
  }
  if (r.classId === "mage") {
    area(r, at, 96, 96, 0.3, 0.01, 1, context(r, 158));
    if (level(r, 58))
      area(
        r,
        at,
        96,
        96 * (0.5 + Math.min(4, level(r, 58) - 1) * 0.05) * factor(r, 58, 0.25),
        0.9,
        0.01,
        1,
        context(r, 58, "additional", [], false, 1, false, "none"),
      );
    if (level(r, 59))
      area(
        r,
        p,
        90 + Math.min(4, level(r, 59) - 1) * 5,
        20 * factor(r, 59, 0.25),
        1,
        2.01,
        1,
        context(r, 59),
        { follow: true },
      );
  }
  const ring = (
    id: number,
    radius: number,
    damage: number,
    els: Element[],
    follow = false,
    pull = false,
    frost = 15,
  ) => {
    if (level(r, id))
      area(
        r,
        follow ? p : at,
        radius,
        damage * factor(r, id),
        0,
        4,
        0.5,
        context(r, id, "skill", els),
        { follow, pull, frost },
      );
  };
  ring(17, 85, 12, ["ice"]);
  ring(18, 100, 10, ["ice"], true, false, 30);
  ring(22, 110, 14, ["fire"], true);
  ring(26, 94, 10, ["water"], false, true);
  ring(30, 110, 12, ["lightning"], true);
  ring(36, 130, 18, ["water", "lightning"], false, true);
  if (level(r, 21))
    shoot(
      r,
      p,
      a,
      40 * factor(r, 21),
      450,
      650,
      context(r, 21, "skill", ["fire"]),
      1,
      false,
      0,
      0,
      100,
      60 * factor(r, 21),
      0,
      1,
    );
  if (level(r, 31))
    shoot(
      r,
      p,
      a,
      35 * factor(r, 31),
      500,
      650,
      context(r, 31, "skill", ["lightning"]),
      1,
      false,
      0,
      0,
      130,
      65 * factor(r, 31),
    );
  if (level(r, 33))
    for (let i = 0; i < 3; i++)
      area(
        r,
        p,
        [60, 110, 160][i],
        24 * factor(r, 33),
        i * 0.2,
        0.01,
        1,
        context(r, 33, "skill", ["water", "fire"], true),
        { effect: "steam" },
      );
  if (!echo && level(r, 34)) {
    p.engineUntil = r.time + 3;
    shield(r, r.stats.maxHP * (0.2 + Math.min(4, level(r, 34) - 1) * 0.02), 3);
  }
  if (level(r, 37) && (p.capacitor || (echo && r.echoCapacitor))) {
    burst(
      r,
      p,
      130,
      (echo ? (r.echoCapacitor ?? 0) : p.capacitor) * 12 * factor(r, 37),
      context(
        r,
        37,
        "additional",
        ["water", "lightning"],
        false,
        1,
        false,
        "none",
      ),
    );
    if (!echo) {
      r.echoCapacitor = p.capacitor;
      p.capacitor = 0;
    }
  }
  if (level(r, 39)) {
    burst(
      r,
      at,
      110,
      50 * factor(r, 39),
      context(r, 39, "skill", ["ice", "fire"]),
    );
    ring(39, 110, 16, ["ice", "fire"], false, false, 30);
  }
  return true;
}
export function dodge(r: Run, c: Command) {
  const p = r.player;
  if (actionRestriction(r, "dodge")) return false;
  if (r.time < p.dashReady || r.time < p.controlUntil) return false;
  const moving = Math.hypot(c.move.x, c.move.y) > 0;
  const a = moving ? Math.atan2(c.move.y, c.move.x) : angle(p, c.pointerWorld);
  p.dashReady = r.time + (level(r, 84) ? 6 : 3);
  if (level(r, 72))
    p.skillReady = Math.max(
      p.skillCast + classes[r.classId].cd * 0.2,
      p.skillReady - 0.5,
    );
  p.assaultUntil = r.time + 2;
  const end = { x: p.x + Math.cos(a) * 144, y: p.y + Math.sin(a) * 144 };
  if (!legal(r, end, p.radius) || lineBlocked(r, p, end, false)) return true;
  p.dashHits = [];
  p.dashAngle = a;
  p.dashUntil = r.time + 0.18;
  return true;
}
export function updateSkills(r: Run, c: Command) {
  const p = r.player;
  if (p.pendingEcho && r.time >= p.pendingEcho.at) {
    const pointer = p.pendingEcho.pointer;
    p.pendingEcho = undefined;
    if (!actionRestriction(r, "skill")) {
      r.echoing = true;
      try {
        castSkill(r, { ...c, pointerWorld: pointer }, true);
      } finally {
        r.echoing = false;
      }
    }
  }
  if (p.counterAt && r.time >= p.counterAt) {
    p.counterAt = 0;
    const l = level(r, 44),
      width = l ? 220 + Math.min(4, l - 1) * 10 : 160;
    const ctx = context(r, 144, "skill", [...r.elements], true);
    const bonus =
      (l ? 0.2 + factor(r, 44, 0.2) - 1 : 0) +
      (level(r, 45) ? factor(r, 45, 0.25) - 1 : 0) +
      (level(r, 46) ? factor(r, 46, 0.25) - 1 : 0);
    if (
      cone(
        r,
        p,
        angle(p, c.pointerWorld),
        130,
        (width * Math.PI) / 180,
        120 * (1 + bonus),
        ctx,
      ) &&
      level(r, 46)
    )
      shield(
        r,
        r.stats.maxHP * (0.15 + Math.min(4, level(r, 46) - 1) * 0.02),
        3,
      );
  }
  if (p.rapid.remaining && r.time + 1e-8 >= p.rapid.at) {
    basic(r, c, true);
    p.rapid.remaining--;
    p.rapid.at += p.rapid.interval;
    if (!p.rapid.remaining && level(r, 53)) p.buffUntil = r.time + 3;
  }
  if (p.echoRapid && p.echoRapid.remaining && r.time + 1e-8 >= p.echoRapid.at) {
    r.echoing = true;
    try {
      basic(r, { ...c, pointerWorld: p.echoRapid.pointer }, true);
    } finally {
      r.echoing = false;
    }
    p.echoRapid.remaining--;
    p.echoRapid.at += p.echoRapid.interval;
    if (!p.echoRapid.remaining) p.echoRapid = undefined;
  }
  if (level(r, 40)) {
    const targets = r.enemies
      .filter(
        (e) =>
          e.hp > 0 &&
          e.burn.some((b) => b.until > r.time) &&
          (e.iceUntil > r.time || (e.freezeUntil ?? 0) > r.time),
      )
      .sort((a, b) => distance(p, a) - distance(p, b) || a.id - b.id)
      .slice(0, 12);
    for (const e of targets)
      if (r.time >= e.resonanceNext) {
        e.resonanceNext =
          r.time + Math.max(0.2, classes[r.classId].rate / r.stats.attackRate);
        const el: Element = e.resonanceElement === "ice" ? "fire" : "ice";
        e.resonanceElement = el;
        const strongest = e.burn.reduce((a, b) =>
          a.damage * a.scale > b.damage * b.scale ? a : b,
        );
        shoot(
          r,
          p,
          angle(p, e),
          24 * factor(r, 40),
          600,
          450,
          context(r, 40, "skill", [el], false, strongest.scale, true, "one"),
        );
      }
  }
}
