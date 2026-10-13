import type { Vec } from "./primitives";
import type { BiomeId } from "../data/biomes";
import type { BossAttack } from "../data/bosses";
export type ClassId = "sword" | "bow" | "mage";
export type Element = "ice" | "fire" | "water" | "lightning";
export type Phase =
  | "ROOM_INTRO"
  | "COMBAT"
  | "SETTLEMENT"
  | "UPGRADE_CHOICE"
  | "FUSION_CHOICE"
  | "EQUIPMENT_SLOT_CHOICE"
  | "POST_CLEAR"
  | "RUN_END"
  | "DEAD";
export type Slot = "armor" | "ring" | "amulet";
export interface DamageContext {
  sourceAbilityId: number;
  ownerActorId: number;
  rootAttackId: number;
  damageKind: "basic" | "skill" | "additional" | "dot" | "percent";
  skillBonus?: number;
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
  leap?: { from: Vec; to: Vec; starts: number; ends: number };
  monsterId?: number;
  bossId?: number;
  killedByRoot?: boolean;
  advancedResonanceNext?: number;
  solarisBar?: 1 | 2 | 3;
  sealPillar?: boolean;
  splitGroup?: number;
  summonRole?: "totem" | "blood";
  bossOwner?: number;
  rally?: boolean;
  eliteAbility?: "rush" | "barrage" | "shield" | "element";
  eliteReady?: number;
  enemyShield?: number;
  hp: number;
  maxHP: number;
  armor: number;
  radius: number;
  nextAttack: number;
  navTarget: { x: number; y: number } | null;
  navUntil: number;
  attackOrdinal: number;
  controlUntil: number;
  freezeUntil?: number;
  stunUntil?: number;
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
  resonanceElement?: "ice" | "fire";
  xpReward?: number;
  activateAt?: number;
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
  terrainSlow?: number;
  lastBasic?: number;
  originalBasics?: number;
  pendingEcho?: { at: number; pointer: Vec; skillBonus?: number };
  pendingEchoes?: {
    at: number;
    pointer: Vec;
    skillBonus?: number;
    capacitor: number;
  }[];
  echoRapid?: {
    at: number;
    remaining: number;
    interval: number;
    pointer: Vec;
    skillBonus?: number;
  };
  blockSkillBonus?: number;
  lastHurt?: number;
  enduranceUsed?: boolean;
  assaultUntil?: number;
  recoveryUntil?: number;
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
  rapid: {
    at: number;
    remaining: number;
    interval: number;
    skillBonus?: number;
  };
  aim?: number;
  casts: number;
  capacitor: number;
  buffUntil: number;
  engineUntil: number;
  controlUntil: number;
  freezeUntil?: number;
  stunUntil?: number;
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
  invulnerableUntil?: number;
  blocksDash?: boolean;
}
export interface Projectile extends Vec {
  coverSource?: import("./cover-rules").CoverSource;
  bossAttackId?: string;
  eventGlyph?: "gift" | "ghost" | "plasma" | "comet";
  id: number;
  homingTarget?: number;
  vx: number;
  vy: number;
  radius: number;
  distanceLeft: number;
  damage: number;
  context: DamageContext | null;
  enemy: boolean;
  enemyElement?: Element | null;
  enemyElements?: Element[];
  enemyTheme?: BiomeId | "sun";
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
  coverSource?: import("./cover-rules").CoverSource;
  eventAbility?: string;
  trackingUntil?: number;
  trackingOffset?: Vec;
  enemyElement?: Element | null;
  enemyElements?: Element[];
  enemyTheme?: BiomeId | "sun";
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
  beamMotion?: { angle: number; rotation: number; duration: number };
  effect?: "thunder" | "steam";
}
export interface Mode {
  id: number;
  actor: number;
  attackId: string;
  type:
    | "cross"
    | "rows"
    | "rush"
    | "fan"
    | "ring"
    | "spiral"
    | "mark"
    | "mine"
    | "laser"
    | "summon"
    | "slash"
    | "impact"
    | "block"
    | "charge"
    | "thunder";
  starts: number;
  ends: number;
  next: number;
  count: number;
  angle: number;
  target: Vec;
  phase: number;
  shots?: number;
  groups?: number;
  spread?: number;
  reach?: number;
  bossAttack?: BossAttack;
  origin?: Vec;
}
export interface Item extends Vec {
  ability?: import("../data/equipment").EquipmentAbility;
  name?: string;
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
  /** Presentation provenance; optional for older saves. */
  sourceAbilityId?: number;
  periodic?: boolean;
  eventAbility?: string;
  enemyTheme?: BiomeId | "sun";
  duration?: number;
  elements?: Element[];
  enemy?: boolean;
  id: number;
  kind:
    | "ghost"
    | "relic"
    | "resonance"
    | "hit"
    | "heal"
    | "cast"
    | "arc"
    | "burst"
    | "damage"
    | "phase"
    | "loot"
    | "slash"
    | "impact"
    | "block"
    | "charge"
    | "thunder"
    | "steam";
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
  biome?: BiomeId;
  journey?: import("../data/journey").JourneySegment[];
  solaris?: { sealed: boolean; wave: number; next: number };
  loop?: number;
  testing?: boolean;
  echoing?: boolean;
  activeSkillBonus?: number;
  echoSkillBonus?: number;
  event?: import("../systems/events").EventState;
  seenEvents?: import("../data/events").EventId[];
  eventCounter?: number;
  eventEntryKey?: string;
  gear?: import("../systems/equipment-abilities").GearState;
  companion?: import("../systems/companion").Pumpkin;
  echoCapacitor?: number;
  relicEntryKey?: string;
  focusedPhases?: string[];
  vampireRecent?: { time: number; amount: number }[];
  selectedEquipmentSlot?: Slot;
  specialResumePhase?: Phase;
  fusionChoices?: ("steam" | "storm" | "frostfire")[];
  templates: number[];
  boss: number;
  classId: ClassId;
  phase: Phase;
  time: number;
  tick: number;
  nextId: number;
  score?: number;
  kills?: number;
  level: number;
  xp: number;
  pendingLevels: number;
  cards: Record<number, number>;
  elements: Element[];
  fusion: "steam" | "storm" | "frostfire" | null;
  choices: number[];
  rerollUsed?: boolean;
  stats: Stats;
  player: Player;
  enemies: Actor[];
  reserves?: Actor[];
  reinforcementAt?: number;
  encounterCap?: number;
  route?: Vec[];
  settlementEnds?: number;
  roomEntryLevel?: number;
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
  momentum?: { stacks: number; until: number };
  modifiers: number[];
  hazards?: (Vec & {
    kind:
      | "sand"
      | "frost"
      | "vent"
      | "thorns"
      | "rift"
      | "blood"
      | "meteor"
      | "statue";
    radius: number;
    next: number;
  })[];
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
