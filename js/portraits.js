// ============================================================
// GuardianHQ — js/portraits.js  v3
// 18 cinematic achtergronden: Hunter/Warlock/Titan x 6 subclasses
// Geen SVG poppetjes — pure CSS gradient scenes met sfeer
// ============================================================
window.GHQ_PORTRAITS = (function () {

  function mk(bg, accent) {
    return { bg: bg, accent: accent, svg: '' };
  }

  var ARC   = '#79c8f0', SOLAR = '#f0a830', VOID  = '#b574de';
  var STASIS = '#4ec3e0', STRAND = '#31c48d', PRISM = '#c8a2e8';

  // Hunter: energie van onder + class-kleur accent
  var H_PRISM = mk([
    'radial-gradient(ellipse 65% 45% at 50% 105%, #c8a2e8 0%, #6b2fa080 35%, transparent 65%)',
    'radial-gradient(ellipse 35% 28% at 28% 75%, #79c8f050 0%, transparent 50%)',
    'radial-gradient(ellipse 35% 28% at 72% 75%, #f0a83050 0%, transparent 50%)',
    'radial-gradient(ellipse 80% 55% at 50% 90%, #3a1565 0%, #1a0838 50%, transparent 80%)',
    'linear-gradient(180deg, #060412 0%, #0d0820 40%, #180a32 70%, #0c0718 100%)',
  ].join(','), PRISM);

  var H_ARC = mk([
    'radial-gradient(ellipse 40% 70% at 50% 0%, #79c8f0 0%, #1a5580 40%, transparent 70%)',
    'radial-gradient(ellipse 18% 80% at 18% 50%, #79c8f048 0%, transparent 60%)',
    'radial-gradient(ellipse 18% 80% at 82% 45%, #79c8f030 0%, transparent 60%)',
    'radial-gradient(ellipse 50% 30% at 50% 105%, #0a2840 0%, transparent 60%)',
    'linear-gradient(180deg, #020810 0%, #04101e 30%, #071a2e 70%, #030c18 100%)',
  ].join(','), ARC);

  var H_SOLAR = mk([
    'radial-gradient(ellipse 75% 50% at 50% 112%, #f0a830 0%, #c04010 25%, #801008 50%, transparent 68%)',
    'radial-gradient(ellipse 28% 38% at 28% 88%, #e06020 0%, transparent 55%)',
    'radial-gradient(ellipse 28% 38% at 72% 88%, #d04818 0%, transparent 55%)',
    'radial-gradient(ellipse 45% 30% at 50% 45%, #60150508 0%, transparent 60%)',
    'linear-gradient(180deg, #060200 0%, #130500 30%, #220800 70%, #100400 100%)',
  ].join(','), SOLAR);

  var H_VOID = mk([
    'radial-gradient(ellipse 55% 42% at 50% 105%, #9030d0 0%, #4a10a060 40%, transparent 68%)',
    'radial-gradient(ellipse 28% 30% at 22% 62%, #7020c040 0%, transparent 58%)',
    'radial-gradient(ellipse 22% 28% at 78% 42%, #6018b030 0%, transparent 55%)',
    'radial-gradient(ellipse 55% 50% at 50% 68%, #18063808 0%, transparent 65%)',
    'linear-gradient(180deg, #04020a 0%, #09041a 30%, #0f0622 70%, #070314 100%)',
  ].join(','), VOID);

  var H_STASIS = mk([
    'radial-gradient(ellipse 62% 43% at 50% 108%, #4ec3e0 0%, #1a6888 30%, transparent 66%)',
    'radial-gradient(ellipse 22% 55% at 14% 50%, #4ec3e040 0%, transparent 58%)',
    'radial-gradient(ellipse 22% 55% at 86% 50%, #4ec3e030 0%, transparent 58%)',
    'radial-gradient(ellipse 38% 28% at 50% 18%, #182e4010 0%, transparent 58%)',
    'linear-gradient(180deg, #010810 0%, #030e18 30%, #05162a 70%, #030c18 100%)',
  ].join(','), STASIS);

  var H_STRAND = mk([
    'radial-gradient(ellipse 58% 42% at 50% 108%, #31c48d 0%, #0a5030 30%, transparent 65%)',
    'radial-gradient(ellipse 20% 65% at 10% 50%, #31c48d35 0%, transparent 58%)',
    'radial-gradient(ellipse 20% 65% at 90% 42%, #31c48d22 0%, transparent 58%)',
    'radial-gradient(ellipse 38% 28% at 65% 22%, #10301808 0%, transparent 55%)',
    'linear-gradient(180deg, #010a06 0%, #031008 30%, #051c10 70%, #030d08 100%)',
  ].join(','), STRAND);

  // Warlock: energie vanuit het midden, breed uitwaaierend
  var W_PRISM = mk([
    'radial-gradient(ellipse 75% 60% at 50% 52%, #c8a2e888 0%, #7030c030 45%, transparent 68%)',
    'radial-gradient(ellipse 38% 28% at 18% 38%, #79c8f050 0%, transparent 52%)',
    'radial-gradient(ellipse 38% 28% at 82% 38%, #f0a83050 0%, transparent 52%)',
    'radial-gradient(ellipse 50% 42% at 50% 105%, #8030c055 0%, transparent 62%)',
    'linear-gradient(180deg, #050312 0%, #0c0620 30%, #150830 65%, #0a0518 100%)',
  ].join(','), PRISM);

  var W_ARC = mk([
    'radial-gradient(ellipse 55% 65% at 50% 48%, #79c8f065 0%, #1a408060 50%, transparent 70%)',
    'radial-gradient(ellipse 18% 82% at 14% 50%, #79c8f040 0%, transparent 62%)',
    'radial-gradient(ellipse 18% 82% at 86% 50%, #79c8f030 0%, transparent 62%)',
    'radial-gradient(ellipse 50% 28% at 50% 105%, #1a405565 0%, transparent 62%)',
    'linear-gradient(180deg, #010508 0%, #030c18 30%, #050e20 65%, #030a15 100%)',
  ].join(','), ARC);

  var W_SOLAR = mk([
    'radial-gradient(ellipse 55% 62% at 50% 48%, #f0a83075 0%, #c0401025 50%, transparent 72%)',
    'radial-gradient(ellipse 28% 55% at 18% 55%, #e0602030 0%, transparent 58%)',
    'radial-gradient(ellipse 28% 55% at 82% 55%, #d0481830 0%, transparent 58%)',
    'radial-gradient(ellipse 50% 28% at 50% 105%, #80301060 0%, transparent 62%)',
    'linear-gradient(180deg, #080300 0%, #140600 30%, #200900 65%, #100500 100%)',
  ].join(','), SOLAR);

  var W_VOID = mk([
    'radial-gradient(ellipse 58% 62% at 50% 48%, #b574de65 0%, #6010a030 52%, transparent 70%)',
    'radial-gradient(ellipse 22% 62% at 18% 50%, #8020c042 0%, transparent 58%)',
    'radial-gradient(ellipse 22% 62% at 82% 50%, #9030d040 0%, transparent 58%)',
    'radial-gradient(ellipse 50% 35% at 50% 105%, #5010a042 0%, transparent 62%)',
    'linear-gradient(180deg, #050210 0%, #0a0420 30%, #120628 65%, #080318 100%)',
  ].join(','), VOID);

  var W_STASIS = mk([
    'radial-gradient(ellipse 55% 60% at 50% 48%, #4ec3e058 0%, #1a608030 52%, transparent 70%)',
    'radial-gradient(ellipse 18% 72% at 14% 50%, #4ec3e038 0%, transparent 62%)',
    'radial-gradient(ellipse 18% 72% at 86% 50%, #4ec3e028 0%, transparent 62%)',
    'radial-gradient(ellipse 50% 28% at 50% 105%, #1a506865 0%, transparent 62%)',
    'linear-gradient(180deg, #010608 0%, #030e15 30%, #061520 65%, #030c14 100%)',
  ].join(','), STASIS);

  var W_STRAND = mk([
    'radial-gradient(ellipse 55% 60% at 50% 48%, #31c48d58 0%, #0a503028 52%, transparent 70%)',
    'radial-gradient(ellipse 18% 72% at 14% 50%, #31c48d32 0%, transparent 62%)',
    'radial-gradient(ellipse 18% 72% at 86% 50%, #31c48d22 0%, transparent 62%)',
    'radial-gradient(ellipse 50% 28% at 50% 105%, #0a503865 0%, transparent 62%)',
    'linear-gradient(180deg, #010806 0%, #030f0a 30%, #051a10 65%, #030c09 100%)',
  ].join(','), STRAND);

  // Titan: energie explosie van links (vuist kant), asymmetrisch
  var T_PRISM = mk([
    'radial-gradient(ellipse 65% 55% at 18% 58%, #c8a2e878 0%, #6b2fa040 45%, transparent 65%)',
    'radial-gradient(ellipse 32% 28% at 78% 28%, #79c8f042 0%, transparent 52%)',
    'radial-gradient(ellipse 32% 28% at 80% 68%, #f0a83038 0%, transparent 52%)',
    'radial-gradient(ellipse 55% 42% at 50% 105%, #6b2fa052 0%, transparent 65%)',
    'linear-gradient(180deg, #050312 0%, #0c0620 30%, #140830 65%, #0a0518 100%)',
  ].join(','), PRISM);

  var T_ARC = mk([
    'radial-gradient(ellipse 60% 62% at 14% 58%, #79c8f072 0%, #1a508060 45%, transparent 65%)',
    'radial-gradient(ellipse 28% 38% at 58% 18%, #79c8f042 0%, transparent 55%)',
    'radial-gradient(ellipse 38% 32% at 82% 58%, #1a405040 0%, transparent 55%)',
    'radial-gradient(ellipse 52% 28% at 50% 105%, #0a305262 0%, transparent 62%)',
    'linear-gradient(180deg, #010508 0%, #030c18 30%, #050e22 65%, #030a14 100%)',
  ].join(','), ARC);

  var T_SOLAR = mk([
    'radial-gradient(ellipse 62% 60% at 14% 60%, #f0a83078 0%, #c0401030 42%, transparent 65%)',
    'radial-gradient(ellipse 28% 38% at 62% 18%, #e0602022 0%, transparent 55%)',
    'radial-gradient(ellipse 38% 38% at 82% 60%, #80200810 0%, transparent 55%)',
    'radial-gradient(ellipse 52% 28% at 50% 105%, #90301060 0%, transparent 62%)',
    'linear-gradient(180deg, #080300 0%, #160600 30%, #220900 65%, #120500 100%)',
  ].join(','), SOLAR);

  var T_VOID = mk([
    'radial-gradient(ellipse 60% 60% at 14% 58%, #b574de72 0%, #5012a040 45%, transparent 65%)',
    'radial-gradient(ellipse 28% 38% at 62% 18%, #8020c030 0%, transparent 55%)',
    'radial-gradient(ellipse 35% 38% at 82% 60%, #6010a030 0%, transparent 55%)',
    'radial-gradient(ellipse 52% 35% at 50% 105%, #5010a042 0%, transparent 62%)',
    'linear-gradient(180deg, #050212 0%, #0a0422 30%, #12062a 65%, #080318 100%)',
  ].join(','), VOID);

  var T_STASIS = mk([
    'radial-gradient(ellipse 60% 60% at 14% 58%, #4ec3e068 0%, #1a688840 45%, transparent 65%)',
    'radial-gradient(ellipse 28% 38% at 62% 18%, #4ec3e030 0%, transparent 55%)',
    'radial-gradient(ellipse 35% 38% at 82% 60%, #1a608030 0%, transparent 55%)',
    'radial-gradient(ellipse 52% 35% at 50% 105%, #1a507062 0%, transparent 62%)',
    'linear-gradient(180deg, #010608 0%, #030e15 30%, #061522 65%, #030c14 100%)',
  ].join(','), STASIS);

  var T_STRAND = mk([
    'radial-gradient(ellipse 60% 60% at 14% 58%, #31c48d68 0%, #0a503238 45%, transparent 65%)',
    'radial-gradient(ellipse 28% 38% at 62% 18%, #31c48d28 0%, transparent 55%)',
    'radial-gradient(ellipse 35% 38% at 82% 60%, #0a503228 0%, transparent 55%)',
    'radial-gradient(ellipse 52% 35% at 50% 105%, #0a503862 0%, transparent 62%)',
    'linear-gradient(180deg, #010806 0%, #030f0a 30%, #051a10 65%, #030c08 100%)',
  ].join(','), STRAND);

  return {
    'Hunter_prismatic':  H_PRISM,  'Hunter_arc':   H_ARC,
    'Hunter_solar':      H_SOLAR,  'Hunter_void':  H_VOID,
    'Hunter_stasis':     H_STASIS, 'Hunter_strand': H_STRAND,
    'Warlock_prismatic': W_PRISM,  'Warlock_arc':  W_ARC,
    'Warlock_solar':     W_SOLAR,  'Warlock_void': W_VOID,
    'Warlock_stasis':    W_STASIS, 'Warlock_strand': W_STRAND,
    'Titan_prismatic':   T_PRISM,  'Titan_arc':    T_ARC,
    'Titan_solar':       T_SOLAR,  'Titan_void':   T_VOID,
    'Titan_stasis':      T_STASIS, 'Titan_strand': T_STRAND,
  };
})();
