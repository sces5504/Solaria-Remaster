import { retireProjectile } from "./projectile-pool";
import type { Run, Projectile, Actor, Obstacle } from "../core/types";
import { angle, distance } from "../core/primitives";
import { circleContact, rectangleContact } from "./collision-time";
import { ContactQueue } from "./contact-queue";
import { SpatialGrid } from "./spatial-grid";
import { lineBlocked } from "./geometry";
import { sineVelocity } from "./monster-details";
import { pumpkin, hurtPumpkin } from "./companion";
import { hit, hurt, area, burst, damageCover, factor } from "./combat";
interface Flight {
  p: Projectile;
  time: number;
  done: boolean;
}
type Target =
  | { kind: "end" | "range" | "wall" }
  | { kind: "cover"; body: Obstacle }
  | { kind: "actor"; body: Actor }
  | { kind: "player" | "companion" };
interface Event {
  time: number;
  targetId: number;
  flight: Flight;
  target: Target;
}

// One fixed tick is a globally ordered contact timeline. Array storage order
// cannot decide which enemy bullet triggers the player's invulnerability first.
export function sweepProjectiles(r: Run, dt: number) {
  if (dt <= 0) return;
  const queue = new ContactQueue<Event>(
    (a, b) =>
      a.time - b.time ||
      a.flight.p.id - b.flight.p.id ||
      a.targetId - b.targetId,
  );
  const actors = new SpatialGrid<Actor>();
  actors.rebuild(r.enemies.filter((e) => e.hp > 0));
  const maxRadius = Math.max(0, ...r.enemies.map((e) => e.radius));
  let registered = 0;
  const finish = (f: Flight, stopped: boolean) => {
    f.done = true;
    const p = f.p;
    if (p.trail && r.tick % 15 === 0 && p.context)
      area(r, p, 25, 6 * factor(r, 21), 0, 3, 0.5, {
        ...p.context,
        damageKind: "skill",
        canCrit: true,
        procPolicy: "root",
      });
    if (stopped || p.distanceLeft <= 0) {
      p.distanceLeft = -1;
      if (p.enemy) {
        if (r.room === 5) damageCover(r, p, 8, p.wave);
      } else if (p.explosion && p.context)
        burst(r, p, p.explosion, p.explosionDamage, {
          ...p.context,
          damageKind: "additional",
          canCrit: false,
          basicHitProxy: false,
          procPolicy: "none",
        });
    }
  };
  const schedule = (f: Flight) => {
    const p = f.p,
      left = dt - f.time,
      speed = Math.hypot(p.vx, p.vy);
    if (left <= 1e-12) {
      finish(f, false);
      return;
    }
    const travelTime =
      speed > 0 ? Math.min(left, Math.max(0, p.distanceLeft) / speed) : left;
    const to = { x: p.x + p.vx * travelTime, y: p.y + p.vy * travelTime };
    let fraction = 1,
      target: Target = { kind: travelTime < left ? "range" : "end" },
      targetId = Number.MAX_SAFE_INTEGER;
    const candidate = (t: number | null, value: Target, id: number) => {
      if (t !== null && (t < fraction || (t === fraction && id < targetId))) {
        fraction = t;
        target = value;
        targetId = id;
      }
    };
    // Boundary and cover use exact slab intersection, lakes remain traversable.
    for (const o of r.obstacles)
      if (o.durability > 0 && o.kind !== "lake")
        candidate(rectangleContact(p, to, o), { kind: "cover", body: o }, o.id);
    for (const box of [
      { x: -100000, y: -100000, w: 100032, h: 200000 },
      { x: 992, y: -100000, w: 100000, h: 200000 },
      { x: -100000, y: -100000, w: 200000, h: 100064 },
      { x: -100000, y: 608, w: 200000, h: 100000 },
    ])
      candidate(rectangleContact(p, to, box), { kind: "wall" }, -2);
    if (p.enemy) {
      const c = pumpkin(r);
      if (c && c.hp > 0)
        candidate(
          circleContact(p, to, c, c.radius + p.radius),
          { kind: "companion" },
          -1,
        );
      candidate(
        circleContact(p, to, r.player, r.player.radius + p.radius),
        { kind: "player" },
        0,
      );
    } else if (p.context) {
      const mid = { x: (p.x + to.x) / 2, y: (p.y + to.y) / 2 };
      for (const e of actors.query(
        mid,
        distance(p, to) / 2 + maxRadius + p.radius,
      ))
        if (e.hp > 0 && !p.hit.includes(e.id))
          candidate(
            circleContact(p, to, e, e.radius + p.radius),
            { kind: "actor", body: e },
            e.id,
          );
    }
    queue.push({
      time: f.time + fraction * travelTime,
      targetId,
      flight: f,
      target,
    });
  };
  const register = (at: number) => {
    while (registered < r.projectiles.length) {
      const p = r.projectiles[registered++];
      if (p.distanceLeft <= 0) continue;
      if (p.homingTarget && !p.enemy) {
        const target =
          r.enemies.find((e) => e.id === p.homingTarget && e.hp > 0) ??
          r.enemies
            .filter((e) => e.hp > 0 && !e.sealPillar)
            .sort((a, b) => distance(p, a) - distance(p, b) || a.id - b.id)[0];
        if (target) {
          p.homingTarget = target.id;
          const a = angle(p, target),
            speed = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(a) * speed;
          p.vy = Math.sin(a) * speed;
        }
      }
      if (dt > at) sineVelocity(p, dt - at);
      schedule({ p, time: at, done: false });
    }
  };
  register(0);
  while (queue.size) {
    const event = queue.pop()!,
      f = event.flight,
      p = f.p;
    if (f.done) continue;
    const elapsed = event.time - f.time;
    p.x += p.vx * elapsed;
    p.y += p.vy * elapsed;
    p.distanceLeft -= Math.hypot(p.vx, p.vy) * elapsed;
    f.time = event.time;
    const target = event.target;
    if (target.kind === "end") finish(f, false);
    else if (target.kind === "range" || target.kind === "wall") finish(f, true);
    else if (target.kind === "cover") {
      if (target.body.durability > 0) finish(f, true);
      else schedule(f);
    } else if (target.kind === "player") {
      const owner = r.enemies.find((e) => e.id === p.owner);
      hurt(r, p.damage, p.enemyElements ?? p.enemyElement ?? owner?.element);
      finish(f, true);
    } else if (target.kind === "companion") {
      const c = pumpkin(r);
      if (c && c.hp > 0) {
        hurtPumpkin(
          r,
          p.damage,
          p.enemyElements ?? (p.enemyElement ? [p.enemyElement] : []),
        );
        finish(f, true);
      } else schedule(f);
    } else if (target.kind === "actor") {
      const e = target.body;
      if (e.hp <= 0) {
        schedule(f);
        continue;
      }
      hit(r, e, p.damage, p.context!);
      p.hit.push(e.id);
      p.pierce--;
      if (p.bounce > 0) {
        const other = r.enemies
          .filter(
            (e2) =>
              e2.hp > 0 && !p.hit.includes(e2.id) && !lineBlocked(r, e, e2),
          )
          .sort((a, b) => distance(e, a) - distance(e, b) || a.id - b.id)[0];
        if (other) {
          const a = angle(e, other),
            speed = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(a) * speed;
          p.vy = Math.sin(a) * speed;
          p.context = {
            ...p.context!,
            chainScale: p.context!.chainScale * 0.7,
          };
          p.bounce--;
          p.pierce++;
        }
      }
      if (p.pierce <= 0) finish(f, true);
      else schedule(f);
    }
    register(event.time);
  }
  const active: Projectile[] = [];
  for (const p of r.projectiles) {
    if (p.distanceLeft > 0) active.push(p);
    else retireProjectile(r, p);
  }
  r.projectiles = active;
}
