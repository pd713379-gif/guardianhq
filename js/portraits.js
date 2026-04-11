// ============================================================
// GuardianHQ — js/portraits.js  v5
// Fallback kleur-gradienten per klasse x subclass
// De echte art komt van char.subclass.screenshot (Bungie CDN)
// die via CSS background-image wordt geladen (CORB-safe)
// ============================================================
window.GHQ_PORTRAITS = (function () {

  var ACCENTS = {
    prismatic: '#c8a2e8',
    arc:       '#79c8f0',
    solar:     '#f0a830',
    void:      '#b574de',
    stasis:    '#4ec3e0',
    strand:    '#31c48d',
  };

  // Kleur overlay per subclass (over de screenshot heen)
  var OVERLAYS = {
    prismatic: 'rgba(80,20,140,0.25)',
    arc:       'rgba(10,60,130,0.22)',
    solar:     'rgba(140,55,5,0.22)',
    void:      'rgba(60,10,120,0.28)',
    stasis:    'rgba(10,70,110,0.22)',
    strand:    'rgba(5,90,55,0.22)',
  };

  // Fallback gradient als screenshot niet laadt
  var FALLBACKS = {
    prismatic: 'radial-gradient(ellipse 80% 60% at 50% 80%, #6b2fa0 0%, #1a0838 50%, #060412 100%)',
    arc:       'radial-gradient(ellipse 80% 60% at 50% 80%, #1a5080 0%, #071020 50%, #020810 100%)',
    solar:     'radial-gradient(ellipse 80% 60% at 50% 80%, #c04010 0%, #200500 50%, #080200 100%)',
    void:      'radial-gradient(ellipse 80% 60% at 50% 80%, #5010a0 0%, #0e0420 50%, #040210 100%)',
    stasis:    'radial-gradient(ellipse 80% 60% at 50% 80%, #1a6080 0%, #041020 50%, #010810 100%)',
    strand:    'radial-gradient(ellipse 80% 60% at 50% 80%, #0a5030 0%, #031008 50%, #010806 100%)',
  };

  function mk(element) {
    return {
      accent:   ACCENTS[element]  || '#c8a2e8',
      overlay:  OVERLAYS[element] || 'rgba(80,20,140,0.25)',
      fallback: FALLBACKS[element] || FALLBACKS.prismatic,
      svg: '',
      // bg wordt dynamisch gezet in renderBuildPanel
      bg: FALLBACKS[element] || FALLBACKS.prismatic,
    };
  }

  return {
    'Hunter_prismatic':  mk('prismatic'), 'Hunter_arc':   mk('arc'),
    'Hunter_solar':      mk('solar'),     'Hunter_void':  mk('void'),
    'Hunter_stasis':     mk('stasis'),    'Hunter_strand': mk('strand'),
    'Warlock_prismatic': mk('prismatic'), 'Warlock_arc':  mk('arc'),
    'Warlock_solar':     mk('solar'),     'Warlock_void': mk('void'),
    'Warlock_stasis':    mk('stasis'),    'Warlock_strand': mk('strand'),
    'Titan_prismatic':   mk('prismatic'), 'Titan_arc':    mk('arc'),
    'Titan_solar':       mk('solar'),     'Titan_void':   mk('void'),
    'Titan_stasis':      mk('stasis'),    'Titan_strand': mk('strand'),
  };
})();
