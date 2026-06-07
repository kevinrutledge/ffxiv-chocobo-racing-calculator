# FFXIV Chocobo Racing: Game-Mechanics Reference

Verified reference for the race-chocobo mechanics that underlie the probability
analysis in [chocobo-racing-probability.tex](chocobo-racing-probability.tex).
Focus areas are **feeding and leveling**, with supporting detail on abilities,
breeding, attributes, and races. Sources at the bottom.

The six load-bearing facts for the model are the cap, the rank-1 start, the number of
rank-ups, the per-rank random growth, the maxed-stat exclusion rule, and the feed
count and grades. These were **re-confirmed verbatim against the FFXIV Console Games
Wiki on 2026-06-06**, and the analysis treats them as exact.

All stat values are expressed as **% of each stat's cap** unless noted. The cap
cancels out of every growth calculation, and at the cap-500 final chocobo $1\%=5$
points exactly, so there is no rounding.

---

## 1. Ranks, leveling, and EXP

### Ranks

- A chocobo's "level" is its **Rank**, **1 → 50**.
- Rank/EXP is earned **only by racing**. The chocobo auto-runs, and the jockey only
  triggers abilities/items.
- **Retirement.** Eligible at **rank 40+**. Retiring → becomes breeding stock.
  Dismissing before rank 40 forfeits breeding eligibility. Max rank is **50**.
- As **pedigree increases, the EXP required per rank-up also increases**, and each
  successive bird takes longer to raise. (Exact per-rank EXP tables are not
  publicly documented.)

### EXP per finishing placement

EXP scales off the 1st-place reward, with `BaseReward = FirstPlaceReward × factor`.

| Place | Factor | % |
|-------|--------|------|
| 1st | 15/15 | 100% |
| 2nd | 12/15 | 80% |
| 3rd | 11/15 | 73.3% |
| 4th | 10/15 | 66.7% |
| 5th | 9/15 | 60% |
| 6th | 8/15 | 53.3% |
| 7th | 7/15 | 46.7% |
| **8th (last)** | **2/15** | **13.3%** |

- **8th-place penalty** was added in Patch 2.55 to stop intentional last-place
  farming, ~70% less than 7th. **Always avoid dead last.**
- **Roulette/random bonus.** One racer who finished **2nd–7th** is randomly
  given a **13/15 (86.7%)** factor instead of their normal placement value.

### EXP bonuses

- **Multiplayer presence bonus** (flat, added to base), given as a fraction of the
  first-place reward. It scales ~linearly, with the biggest jump going from solo to
  2 players.

  | Players | Bonus |
  |---------|-------|
  | 2 | 11/150 (7.33%) |
  | 3 | 12/150 (8%) |
  | 4 | 13/150 (8.67%) |
  | 5 | 14/150 (9.33%) |
  | 6 | 15/150 (10%) |
  | 7 | 16/150 (10.67%) |
  | 8 | 17/150 (11.33%) |

- The **Dressage** passive multiplies the total **after** base and multiplayer, as
  `Final = floor((Base + Multiplayer) × (1 + DressageBonus))`, with
  Dressage I/II/III = **+10% / +20% / +30%**. Recommended while grinding 1–20.
- **Higher race class/tier → far greater EXP** (and slightly more MGP). Exact
  per-class multipliers are not tabulated publicly.

### Stat growth at each rank-up

- On every rank increase, **5 stat increments** are applied. Each picks a
  **uniformly random non-maxed stat** and adds **+1% of its cap**.
- **With replacement.** A single stat can be hit multiple times in one
  rank-up (e.g. Speed ×1, Endurance ×1, Stamina ×3).
- **Maxed stats are excluded** from the roll, so growth is never wasted.
- A chocobo starts at **rank 1 with every stat at 11% of cap**.
- **Rounding.** The game stores the **real un-rounded value** and adds gains to
  it, rounding only for display. So at non-500 caps a "+1%" can show as +3 or
  +4 (e.g. cap 380). **At cap 500 there is no rounding**, with 1% = 5 pts exactly,
  11% = 55, and feeds = 5/10/15, so integer-point math is exact for a maxed bird.

---

## 2. The five attributes

| Stat | What it does | Priority |
|------|--------------|----------|
| **Maximum Speed** | Raw velocity (maxed ≈ 50% faster than starter). Raising it without Stamina/Endurance hurts stamina efficiency. | High |
| **Stamina** | Size of the stamina pool (~1,000 starter → ~2,000 maxed, linear). | High |
| **Endurance** | Raises the **Lathered threshold**, the top speed reachable before the stamina-drain penalty, and shrinks the sprint-drain gap. | Medium |
| **Cunning** | Traversal speed + stamina efficiency on **rough terrain** (water/uphill). Matters on Costa del Sol & Tranquil Paths, less on Sagolii. | Medium (course-dependent) |
| **Acceleration** | How fast you reach max speed from a standstill. Helps starts (without Head Start) and Graviball/hazard recovery. **"Least important stat on just about any build."** | **Dump stat** |

→ Treating **Acceleration as the dump stat is the standard, validated choice.**

---

## 3. Feeding / training

- Done at the **Race Chocobo Trainer**. Five feed types, one per stat.
  - **Speed Blend** → Max Speed (crafted from Sylkis Buds)
  - **Acceleration Blend** → Acceleration (Pahsana Fruits)
  - **Endurance Blend** → Endurance (Tantalplants)
  - **Stamina Blend** → Stamina (Mimett Gourds)
  - **Balance Blend** → Cunning (Curiel Roots)
- **Three grades**, each raising the stat by a **% of its cap (not current
  value)**.
  - Grade 1 gives **+1%** for 1,500 gil (or Lv.30 Culinarian craft)
  - Grade 2 gives **+2%** for 610 MGP (Special) (or Lv.50 Culinarian)
  - Grade 3 gives **+3%** for 1,345 MGP (Special, MGP only)
- **Training Capacity.** A chocobo **starts with 1 slot at rank 1 and gains 1 more
  at each rank-up**, so the slots available at a given rank equal that rank (1 at
  rank 1, 2 at rank 2, and so on), reaching the **50-slot maximum only at rank 50**.
  Every feed uses **1 slot regardless of grade**.
- **Feeds stockpile.** Unused slots carry forward, so at any rank you hold that
  rank's slots minus the ones already spent. You may feed in batches or save
  everything for the end.
- Feeding **raises stats but not rating**, and training **does NOT carry to
  offspring** (short-term investment only, so don't feed low-pedigree birds).

---

## 4. Abilities

- Each chocobo holds **two ability slots**, one **hereditary** (from a parent)
  and one **learned**.
- **Learning.**
  - **Rank 10** learns a **random** ability if the learned slot is empty (can't
    duplicate the hereditary one).
  - **Training Manuals** (Tack & Feed Trader) teach a specific ability, and you
    must unlearn the current one first. Some are unlocked by completing **Challenge
    races**.
  - **Hereditary.** Each parent has a **50%** chance to pass its hereditary
    ability. On retirement you pick which of the bird's two abilities becomes
    hereditary.
- **Lethe Water** (10 MGP) forgets the learned ability, and a new random one is
  learned on the next rank-up.

### Passive abilities

| Ability | Effect (tiers) |
|---------|----------------|
| **Dressage I/II/III** | +10/20/30% race EXP |
| Increased Stamina I/II/III | −9/12/15% stamina drain while accelerating |
| Heavy Resistance I–V | resist Heavy 60/70/80/90/100% |
| Level Head I–V | resist Frenzied 60/70/80/90/100% |
| Speedy Recovery I/II/III | +50/65/80% to all stamina recovery |
| Choco Reraise I/II/III | restore 60/130/200 stamina once at 0 |
| Enfeeblement Clause I/II/III | −20/35/50% enfeeblement duration |
| Breather I/II/III | +0.8/1/1.2% stamina/sec while decelerating |
| Head Start (I only) | begin at max speed, no manual available |

### Active abilities (once per race)

| Ability | Effect (tiers) |
|---------|----------------|
| Super Sprint I/II/III | sprint at max speed, no terrain/weather penalty, until stamina spent |
| Choco Dash I/II/III | speed boost w/o stamina loss for 1/2/3 s |
| Choco Cure I/II/III | restore 6/9/12% total stamina |
| Choco Ease I/II/III | cure Heavy, restore 80/130/180 stamina |
| Choco Calm I/II/III | cure Frenzied, restore 100/150/200 stamina |
| Choco Esuna I/II/III | remove enfeeblements 75/90/100% (not Silence) |
| Choco Reflect I/II/III | reflect non-AoE enfeeblement 10/15/20 s |
| Choco Steal I/II/III | steal item from leader 50/70/90% |
| Choco Silence I/II/III | block nearby ability use 35/40/45 s |
| Choco Shock I/II/III | block nearby item use 25/30/35 s |
| Choco Drain I/II/III | drain nearby stamina 15/25/35 per sec |
| Feather Field I/II/III | immune to nearby field effects 10/20/30 s |
| Mimic I/II/III | repeat leader's ability/item for 7/11/15 s |
| Paradigm Shift I/II/III | swap your item for a random different one |

---

## 5. Breeding & pedigree

- The **stat cap formula** is `Cap = 40 × (Pedigree Level + Star Rating) − 20`, per
  stat. Pedigree adds 40/level to all stats, and each star adds 40 to that stat.
  - Starter, Pedigree 1, 2-star → cap 100 everywhere.
  - Max, Pedigree 9, full 4-star → cap **500** (the "maxed" chocobo).
- **Baby pedigree = lower-pedigree parent + 1** (deterministic, e.g. P3×P9→P4,
  P6×P6→P7). To climb pedigree you buy breeding stock at ≥ your level.
- **Star inheritance** uses each parent's **"Parentage"** ratings (not "Own"). Each
  of the 4 grandparent-slot ratings has equal (25%) chance to pass.
  Crossing same-pedigree birds locks in stars over generations.
- **Each retired chocobo can breed up to 10 times.**
- Hereditary **ability** and **color** each pass with **50%** chance.
- **Max rating = 300.** The rating formula
  `Rating = floor( (sum of stat caps / 500) × (10 + current rank) )` depends
  on caps and rank only, NOT on trained values. (Some guides loosely call it the
  "average of the five stats.")

---

## 6. Races, courses, statuses

- **Three courses.** Sagolii Road (Thanalan), Costa del Sol (La Noscea),
  Tranquil Paths (Black Shroud).
- **Terrain panels.** Blue = speed burst, green = +~6% stamina, purple = Heavy
  5 s (slows), and red = −~15% stamina.
- **Statuses.** **Lathered** (above the endurance threshold → extra stamina
  drain), **Heavy** (slowed), **Frenzied** (forced sprint + heavy stamina
  drain, e.g. from Bacchus's Water).
- **Race classes** gate by rating in bands, namely Maiden (1–20), then R-40, R-60,
  R-80, … up to **R-300 (241–300)**. **Challenge races** require rating > 41
  plus a per-race rating requirement, and some unlock ability manuals.
- A combined **17/20 stars at P9, rank 50** is the minimum to reach rating 285.

---

## 7. The perfect-chocobo probability (summary, full math in the paper)

For a final (Pedigree-9, cap-500) bird the lifetime point budget is fixed at
**275** (rank-1 base, 5×55) + **1,225** (49 rank-ups × 25) + **750** (50 Grade-3
feeds × 15) = **2,250 of 2,500**, always **250 short**, so at least one stat must
be dumped (conventionally Acceleration). How often four (or three) can be maxed is
analyzed exactly in the paper. Verified results follow.

**Fixed-end** (feed at rank 50, any feed grades, with feed-last provably optimal).

| Goal | Probability |
|------|-------------|
| Idealized "community 6.17%" bound | **6.166840%** (exact) |
| Four maxed, Acceleration dumped | **2.301513%** (exact) |
| Four maxed, flexible dump (drop worst) | **11.324144%** (exact) |
| Three maxed | **100%** (certain) |

**Adaptive** (feed during the climb), strict **Grade-3-only** exact lineup
$500/500/500/500/250$.

| Strategy | Probability |
|----------|-------------|
| Feed-last | **0.10239%** (exact) |
| Best fixed deadline (rank 47) | **0.885%** (Monte-Carlo) |
| Online optimum (Acceleration-aware threshold) | **[1.063%, 1.170%]** |
| Offline ceiling (foreknowledge of rolls) | **4.476%**, exactly in **[0.10239%, 6.16684%]** |

**Practical play.** Don't feed early, since feed-last is optimal for the any-grade
goals. For the strict lineup, watch Acceleration. Abandon if its value passes
**250** (perfect then impossible), otherwise lock a target the moment its gap to
500 is a multiple of **15** and the rank has reached the threshold $T(a)$
(rises with Acceleration's count $a$).

Full derivations, proofs, the threshold table, and the exact/Monte-Carlo split are
in [chocobo-racing-probability.tex](chocobo-racing-probability.tex).

## Open / not publicly quantified

- Exact **EXP per rank** and total EXP rank 1→50 (and how it scales with
  pedigree), not tabulated in sources.
- Exact **per-class EXP multipliers**.

## Sources

- [FFXIV Wiki (Console Games Wiki): Chocobo Racing](https://ffxiv.consolegameswiki.com/wiki/Chocobo_Racing)
- [Icy Veins: Chocobo Racing and Breeding Guide](https://www.icy-veins.com/ffxiv/chocobo-racing-and-breeding-guide)
- [The Lodestone: Chocobo Racing](https://na.finalfantasyxiv.com/lodestone/playguide/contentsguide/goldsaucer/chocoboracing/)
- [TheGamer: How To Train And Race Chocobos](https://www.thegamer.com/final-fantasy-14-xiv-chocobo-racing-training-breeding-guide/)
- FFXIV Chocobo Racing (WordPress) guides.
  [Training](https://ffxivchocoboracing.wordpress.com/2015/05/26/intermediate-training/),
  [Ability Types](https://ffxivchocoboracing.wordpress.com/2015/05/28/intermediate-ability-types/),
  [Rating & EXP](https://ffxivchocoboracing.wordpress.com/2015/05/25/intermediate-rating-and-experience-points/),
  [Breeding: Pedigree & Stars](https://ffxivchocoboracing.wordpress.com/2015/05/25/intermediate-breeding-pedigree-and-star-ratings/),
  [The Five Attributes](https://ffxivchocoboracing.wordpress.com/2015/05/27/intermediate-the-five-chocobo-attributes/),
  [Rank-Ups: Attribute Gains](https://ffxivchocoboracing.wordpress.com/2015/06/01/intermediate-rank-ups-attribute-gains/),
  [Advanced: Raising That Final Chocobo](https://ffxivchocoboracing.wordpress.com/2015/06/02/advanced-raising-that-final-chocobo/)
- [Steam: The Ultimate Chocobo Guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2870219083)
