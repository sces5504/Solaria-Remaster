import type { Vec } from "./primitives";
export type ClassId = "sword" | "bow" | "mage";
export type Element = "ice" | "fire" | "water" | "lightning";
export type Phase =
  | "ROOM_INTRO"
  | "COMBAT"
  | "UPGRADE_CHOICE"
  | "POST_CLEAR"
  | "RUN_END"
  | "DEAD";
export type Slot = "armor" | "ring" | "amulet";
export interface DamageContext {
  sourceAbilityId: number;
  ownerActorId: number;
  rootAttackId: number;
  damageKind: "basic" | "skill" | "additional" | "dot";
  elementMask: Element[];
  canCrit: boolean;
  lifestealEligible: boolean;
  basicEffectMask: boolean;
  basicHitProxy: boolean;
  basicCastProxy: boolean;
  procPolicy: "root" | "none" | "one";
  ancestry: number[];
  chainScale: number;
}
export interface Stats {
  maxHP: number;
  armor: number;
  basic: number;
  skill: number;
  global: number;
  elemental: number;
  attackRate: number;
  skillCD: number;
  speed: number;
  projectile: number;
  range: number;
  crit: number;
  critMult: number;
  xp: number;
  lifesteal: number;
  reduction: number;
}
export interface Actor extends Vec {
  id: number;
  kind: number;
  hp: number;
  maxHP: number;
  armor: number;
  radius: number;
  nextAttack: number;
  navTarget: { x: number; y: number } | null;
  navUntil: number;
  attackOrdinal: number;
  controlUntil: number;
  iceUntil: number;
  frost: number;
  wetUntil: number;
  burn: { until: number; damage: number; scale: number }[];
  burnTick: number;
  ccCount: number;
  ccLast: number;
  ccImmune: number;
  fireStacks: number;
  hits: number;
  focusRoots?: number[];
  resonanceNext: number;
  elite: boolean;
  summoned: boolean;
  element: Element | null;
  phase: 1 | 2;
  transition: number;
  moveAngle: number;
  rushUntil: number;
  rushHits: number[];
}
export interface Player extends Vec {
  hp: number;
  radius: number;
  shields: { amount: number; until: number }[];
  invulnerable: number;
  attackNext: number;
  skillReady: number;
  skillCast: number;
  dashReady: number;
  dashUntil: number;
  dashAngle: number;
  dashHits: number[];
  blockUntil: number;
  blockHit: boolean;
  counterAt: number;
  rapid: { at: number; remaining: number; interval: number };
  casts: number;
  capacitor: number;
  buffUntil: number;
  engineUntil: number;
  controlUntil: number;
  ccImmune: number;
  frost: number;
  iceUntil: number;
  wetUntil: number;
  burnUntil: number;
  burnTick: number;
}
export interface Obstacle {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "tree" | "rock" | "pillar" | "lake";
  durability: number;
  maxDurability: number;
  waves: number[];
}
export interface Projectile extends Vec {
  id: number;
  vx: number;
  vy: number;
  radius: number;
  distanceLeft: number;
  damage: number;
  context: DamageContext | null;
  enemy: boolean;
  owner: number;
  wave: number;
  hit: number[];
  pierce: number;
  bounce: number;
  explosion: number;
  explosionDamage: number;
  trail: number;
}
export interface Area extends Vec {
  id: number;
  ability: number;
  owner: number;
  enemy: boolean;
  radius: number;
  damage: number;
  starts: number;
  ends: number;
  interval: number;
  next: number;
  context: DamageContext | null;
  follow: boolean;
  pull: boolean;
  frost: number;
  angle: number;
  width: number;
  shape: "circle" | "cone" | "beam";
  hit: number[];
  wave: number;
  heavy: boolean;
  mine?: boolean;
  triggerAt?: number;
}
export interface Mode {
  id: number;
  actor: number;
  attackId: string;
  type:
    | "rush"
    | "fan"
    | "ring"
    | "spiral"
    | "mark"
    | "mine"
    | "laser"
    | "summon"
    | "slash";
  starts: number;
  ends: number;
  next: number;
  count: number;
  angle: number;
  target: Vec;
  phase: number;
}
export interface Item extends Vec {
  id: string;
  slot: Slot;
  rarity: string;
  affixes: { stat: string; value: number }[];
}
export interface Drop extends Vec {
  id: number;
  kind: "xp" | "heal";
  value: number;
}
export interface Visual extends Vec {
  id: number;
  kind: "hit" | "heal" | "cast" | "arc" | "burst" | "damage" | "phase" | "loot";
  value: number;
  color: number;
  until: number;
  angle: number;
  radius: number;
}
export interface Run {
  version: 1;
  runId: string;
  revision: number;
  seed: number;
  rng: number;
  cardRng: number;
  room: number;
  templates: number[];
  boss: number;
  classId: ClassId;
  phase: Phase;
  time: number;
  tick: number;
  nextId: number;
  level: number;
  xp: number;
  pendingLevels: number;
  cards: Record<number, number>;
  elements: Element[];
  fusion: "steam" | "storm" | "frostfire" | null;
  choices: number[];
  stats: Stats;
  player: Player;
  enemies: Actor[];
  obstacles: Obstacle[];
  projectiles: Projectile[];
  areas: Area[];
  modes: Mode[];
  items: Item[];
  drops: Drop[];
  bag: Item[];
  equipment: Partial<Record<Slot, Item>>;
  visuals: Visual[];
  cooldowns: Record<number, number>;
  settledOnce: boolean;
  dropCounter: number;
  killOrdinal: number;
  modifiers: number[];
  attackLog: string[];
  message: string;
}
export interface Command {
  tick: number;
  actorId: number;
  move: Vec;
  pointerWorld: Vec;
  attack: boolean;
  skill: boolean;
  dodge: boolean;
  interact: boolean;
}
