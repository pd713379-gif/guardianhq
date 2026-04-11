
// ============================================================
// GuardianHQ — js/portraits.js
// 18 unieke karakter portretten: Hunter/Warlock/Titan × 6 subclasses
// ============================================================
window.GHQ_PORTRAITS = {

  // ═══════════════════════════════ HUNTER ═══════════════════════════════

  'Hunter_prismatic': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #6b3fa0 0%, #2d1a5e 40%, #0a0612 100%)',
    accent: '#c8a2e8',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Hp_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#c8a2e8" stop-opacity="0.55"/><stop offset="100%" stop-color="#c8a2e8" stop-opacity="0"/></radialGradient>
        <filter id="Hp_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="90" ry="11" fill="url(#Hp_bg)" filter="url(#Hp_f)"/>
      <path d="M95 130 Q50 200 30 380 Q56 368 80 340 Q90 260 110 180 Z" fill="#4a2878" opacity="0.7"/>
      <path d="M165 130 Q210 195 228 372 Q202 360 178 332 Q168 255 150 183 Z" fill="#4a2878" opacity="0.55"/>
      <path d="M80 68 Q85 30 130 22 Q175 30 180 68 Q165 44 130 40 Q95 44 80 68 Z" fill="#2d1a5e"/>
      <path d="M95 115 Q80 145 78 220 L182 220 Q180 145 165 115 Z" fill="#3a1e6e"/>
      <path d="M100 138 Q130 148 160 138" stroke="#c8a2e8" stroke-width="1.5" fill="none" opacity="0.8"/>
      <circle cx="130" cy="168" r="10" fill="#c8a2e8" opacity="0.25" filter="url(#Hp_f)"/>
      <circle cx="130" cy="168" r="6" fill="#e8d4ff" opacity="0.9"/>
      <circle cx="130" cy="168" r="3" fill="white"/>
      <path d="M95 118 Q68 115 60 138 Q65 155 82 152 Q88 140 95 132 Z" fill="#3d1f6e"/>
      <path d="M165 118 Q192 115 200 138 Q195 155 178 152 Q172 140 165 132 Z" fill="#3d1f6e"/>
      <path d="M78 155 Q58 185 52 250 Q68 258 82 248 Q88 210 92 178 Z" fill="#5a3090"/>
      <path d="M182 155 Q202 185 210 242 Q195 252 180 244 Q176 208 168 178 Z" fill="#5a3090"/>
      <circle cx="212" cy="248" r="13" fill="#c8a2e8" opacity="0.3" filter="url(#Hp_f)"/>
      <circle cx="212" cy="248" r="7" fill="#e0c0ff" opacity="0.8"/>
      <rect x="85" y="218" width="90" height="12" rx="4" fill="#2d1a5e"/>
      <rect x="124" y="217" width="12" height="14" rx="3" fill="#c8a2e8" opacity="0.9"/>
      <path d="M100 230 Q93 312 90 390 Q106 398 118 392 Q122 316 125 234 Z" fill="#4a2878"/>
      <path d="M160 230 Q167 312 170 390 Q154 398 142 392 Q138 316 135 234 Z" fill="#4a2878"/>
      <ellipse cx="103" cy="310" rx="12" ry="8" fill="#3d1f6e" stroke="#c8a2e8" stroke-width="1" opacity="0.9"/>
      <ellipse cx="157" cy="310" rx="12" ry="8" fill="#3d1f6e" stroke="#c8a2e8" stroke-width="1" opacity="0.9"/>
      <path d="M88 388 Q82 420 78 440 L120 442 Q120 415 120 392 Z" fill="#2d1a5e"/>
      <path d="M172 388 Q178 420 182 440 L140 442 Q140 415 140 392 Z" fill="#2d1a5e"/>
      <path d="M88 68 Q88 50 130 44 Q172 50 172 68 Q165 60 148 57 Q130 54 112 57 Q95 60 88 68 Z" fill="#4a2878"/>
      <ellipse cx="130" cy="82" rx="28" ry="24" fill="#1a0d30" opacity="0.96"/>
      <ellipse cx="119" cy="80" rx="5" ry="4" fill="#c8a2e8" opacity="0.9"/>
      <ellipse cx="141" cy="80" rx="5" ry="4" fill="#79c8f0" opacity="0.9"/>
      <circle cx="74" cy="200" r="2.5" fill="#c8a2e8" opacity="0.7"/>
      <circle cx="196" cy="172" r="2" fill="#79c8f0" opacity="0.6"/>
      <circle cx="64" cy="290" r="1.5" fill="#f0a830" opacity="0.5"/>
    </svg>`
  },

  'Hunter_arc': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #1a4a7a 0%, #0d2540 40%, #050d1a 100%)',
    accent: '#79c8f0',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Ha_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#79c8f0" stop-opacity="0.6"/><stop offset="100%" stop-color="#79c8f0" stop-opacity="0"/></radialGradient>
        <filter id="Ha_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="90" ry="11" fill="url(#Ha_bg)" filter="url(#Ha_f)"/>
      <path d="M200 85 L216 462" stroke="#79c8f0" stroke-width="4" opacity="0.7" stroke-linecap="round"/>
      <path d="M200 85 L216 462" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <ellipse cx="208" cy="92" rx="11" ry="8" fill="#79c8f0" opacity="0.9" filter="url(#Ha_f)"/>
      <path d="M95 128 Q42 210 28 400 Q60 385 86 354 Q92 265 108 180 Z" fill="#0d3060" opacity="0.9"/>
      <path d="M165 128 Q218 205 232 392 Q200 378 174 350 Q168 260 152 182 Z" fill="#0d2540" opacity="0.8"/>
      <path d="M96 115 Q80 148 79 222 L181 222 Q180 148 164 115 Z" fill="#0e2e55"/>
      <path d="M105 145 L130 155 L155 145" stroke="#79c8f0" stroke-width="2" fill="none" opacity="0.9"/>
      <path d="M122 145 L118 165 L126 162 L120 185" stroke="#b8e8ff" stroke-width="1.5" fill="none" opacity="0.8"/>
      <path d="M96 120 Q68 118 60 142 L80 155 Q87 138 96 130 Z" fill="#0a2040"/>
      <path d="M164 120 Q192 118 200 142 L180 155 Q173 138 164 130 Z" fill="#0a2040"/>
      <path d="M79 158 Q56 192 48 260 L70 268 Q82 218 90 180 Z" fill="#112840"/>
      <path d="M181 158 Q204 192 212 255 L192 265 Q178 220 170 182 Z" fill="#112840"/>
      <circle cx="50" cy="268" r="15" fill="#79c8f0" opacity="0.25" filter="url(#Ha_f)"/>
      <circle cx="50" cy="268" r="9" fill="#b8e8ff" opacity="0.7"/>
      <rect x="84" y="220" width="92" height="12" rx="4" fill="#071525"/>
      <path d="M100 232 Q93 315 90 392 Q106 400 119 394 Q124 318 126 236 Z" fill="#0d2540"/>
      <path d="M160 232 Q167 315 170 392 Q154 400 141 394 Q136 318 134 236 Z" fill="#0d2540"/>
      <ellipse cx="103" cy="312" rx="13" ry="9" fill="#0a2040" stroke="#79c8f0" stroke-width="1.5" opacity="0.9"/>
      <ellipse cx="157" cy="312" rx="13" ry="9" fill="#0a2040" stroke="#79c8f0" stroke-width="1.5" opacity="0.9"/>
      <path d="M88 390 Q82 422 78 442 L120 444 Q120 416 120 394 Z" fill="#071525"/>
      <path d="M172 390 Q178 422 182 442 L140 444 Q140 416 140 394 Z" fill="#071525"/>
      <path d="M88 70 Q90 44 130 38 Q170 44 172 70 Q165 58 130 54 Q95 58 88 70 Z" fill="#0d2e54"/>
      <ellipse cx="130" cy="84" rx="28" ry="24" fill="#071520" opacity="0.95"/>
      <ellipse cx="118" cy="80" rx="6" ry="4" fill="#79c8f0"/>
      <ellipse cx="142" cy="80" rx="6" ry="4" fill="#79c8f0"/>
    </svg>`
  },

  'Hunter_solar': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #7a2800 0%, #3d1200 40%, #130500 100%)',
    accent: '#f0a830',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Hs_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#f0a830" stop-opacity="0.6"/><stop offset="100%" stop-color="#f0a830" stop-opacity="0"/></radialGradient>
        <filter id="Hs_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="92" ry="12" fill="url(#Hs_bg)" filter="url(#Hs_f)"/>
      <path d="M95 128 Q45 215 32 395 Q62 382 86 352 Q93 268 108 180 Z" fill="#3d1200" opacity="0.9"/>
      <path d="M165 128 Q215 208 228 388 Q198 376 174 348 Q167 262 152 183 Z" fill="#2d0e00" opacity="0.85"/>
      <path d="M96 115 Q80 148 79 222 L181 222 Q180 148 164 115 Z" fill="#3d1800"/>
      <path d="M105 128 L130 136 L155 128 L158 175 Q130 185 102 175 Z" fill="#2d1000" stroke="#f0a830" stroke-width="1" opacity="0.9"/>
      <circle cx="130" cy="158" r="12" fill="#f0a830" opacity="0.2" filter="url(#Hs_f)"/>
      <circle cx="130" cy="158" r="7" fill="#f5c060" opacity="0.9"/>
      <circle cx="130" cy="158" r="3.5" fill="white"/>
      <path d="M96 120 Q68 118 58 144 L78 156 Q86 138 96 130 Z" fill="#2d0e00"/>
      <path d="M164 120 Q192 118 202 144 L182 156 Q174 138 164 130 Z" fill="#2d0e00"/>
      <path d="M79 158 Q55 194 46 262 L68 270 Q80 220 90 182 Z" fill="#3d1400"/>
      <path d="M181 158 Q205 194 214 258 L194 268 Q180 222 170 184 Z" fill="#3d1400"/>
      <path d="M200 258 L222 230 L226 234 L205 264 Z" fill="#c8c8c8" opacity="0.9"/>
      <path d="M222 230 L226 222 L228 232 Z" fill="#f0a830"/>
      <rect x="84" y="220" width="92" height="12" rx="4" fill="#1a0800"/>
      <circle cx="130" cy="226" r="5" fill="#f0a830" opacity="0.8"/>
      <path d="M100 232 Q93 315 90 392 Q106 400 119 394 Q124 318 126 236 Z" fill="#2d1000"/>
      <path d="M160 232 Q167 315 170 392 Q154 400 141 394 Q136 318 134 236 Z" fill="#2d1000"/>
      <ellipse cx="103" cy="312" rx="13" ry="9" fill="#200a00" stroke="#f0a830" stroke-width="1.5"/>
      <ellipse cx="157" cy="312" rx="13" ry="9" fill="#200a00" stroke="#f0a830" stroke-width="1.5"/>
      <path d="M88 390 Q82 422 78 442 L120 444 Q120 416 120 394 Z" fill="#1a0800"/>
      <path d="M172 390 Q178 422 182 442 L140 444 Q140 416 140 394 Z" fill="#1a0800"/>
      <path d="M90 440 Q85 425 92 415 Q88 430 96 438 Z" fill="#f0a830" opacity="0.7"/>
      <path d="M170 440 Q175 425 168 415 Q172 430 164 438 Z" fill="#f0a830" opacity="0.7"/>
      <path d="M88 70 Q90 44 130 38 Q170 44 172 70 Q165 58 130 54 Q95 58 88 70 Z" fill="#3d1400"/>
      <ellipse cx="130" cy="84" rx="28" ry="24" fill="#120500" opacity="0.95"/>
      <ellipse cx="118" cy="80" rx="6" ry="4" fill="#f0a830"/>
      <ellipse cx="142" cy="80" rx="6" ry="4" fill="#f0a830"/>
    </svg>`
  },

  'Hunter_void': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #3d0078 0%, #1a0038 40%, #080010 100%)',
    accent: '#b574de',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Hv_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#b574de" stop-opacity="0.6"/><stop offset="100%" stop-color="#b574de" stop-opacity="0"/></radialGradient>
        <filter id="Hv_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="90" ry="11" fill="url(#Hv_bg)" filter="url(#Hv_f)"/>
      <path d="M95 128 Q40 220 25 410 Q58 395 84 362 Q93 272 108 182 Z" fill="#1a0038" opacity="0.95"/>
      <path d="M165 128 Q220 214 235 404 Q202 390 176 358 Q167 266 152 184 Z" fill="#160030" opacity="0.9"/>
      <path d="M96 115 Q80 148 79 222 L181 222 Q180 148 164 115 Z" fill="#1a0035"/>
      <circle cx="130" cy="162" r="15" fill="#b574de" opacity="0.15" filter="url(#Hv_f)"/>
      <circle cx="130" cy="162" r="9" fill="#8040c0" opacity="0.6"/>
      <circle cx="130" cy="162" r="5" fill="#d090ff"/>
      <circle cx="130" cy="162" r="2" fill="white"/>
      <path d="M108 140 Q130 148 152 140" stroke="#b574de" stroke-width="1.5" fill="none" opacity="0.7"/>
      <path d="M96 120 Q66 120 58 146 L78 158 Q86 140 96 132 Z" fill="#120025"/>
      <path d="M164 120 Q194 120 202 146 L182 158 Q174 140 164 132 Z" fill="#120025"/>
      <path d="M79 160 Q54 198 46 268 L68 276 Q80 224 90 184 Z" fill="#1a0038"/>
      <path d="M181 160 Q206 198 214 262 L194 272 Q180 226 170 186 Z" fill="#1a0038"/>
      <path d="M202 180 Q230 240 202 310" stroke="#b574de" stroke-width="3" fill="none" opacity="0.8"/>
      <line x1="202" y1="180" x2="202" y2="310" stroke="#b574de" stroke-width="1" opacity="0.4" stroke-dasharray="4,4"/>
      <rect x="84" y="220" width="92" height="12" rx="4" fill="#0e001e"/>
      <path d="M100 232 Q93 315 90 392 Q106 400 119 394 Q124 318 126 236 Z" fill="#180030"/>
      <path d="M160 232 Q167 315 170 392 Q154 400 141 394 Q136 318 134 236 Z" fill="#180030"/>
      <ellipse cx="103" cy="312" rx="13" ry="9" fill="#0e001e" stroke="#b574de" stroke-width="1.5"/>
      <ellipse cx="157" cy="312" rx="13" ry="9" fill="#0e001e" stroke="#b574de" stroke-width="1.5"/>
      <path d="M88 390 Q82 422 78 442 L120 444 Q120 416 120 394 Z" fill="#0e001e"/>
      <path d="M172 390 Q178 422 182 442 L140 444 Q140 416 140 394 Z" fill="#0e001e"/>
      <path d="M88 70 Q90 44 130 38 Q170 44 172 70 Q165 58 130 54 Q95 58 88 70 Z" fill="#1a0038"/>
      <ellipse cx="130" cy="84" rx="28" ry="24" fill="#080010" opacity="0.98"/>
      <ellipse cx="118" cy="80" rx="6" ry="4" fill="#b574de"/>
      <ellipse cx="142" cy="80" rx="6" ry="4" fill="#b574de"/>
      <circle cx="108" cy="162" r="3" fill="#b574de" opacity="0.8"/>
      <circle cx="152" cy="162" r="3" fill="#b574de" opacity="0.8"/>
      <circle cx="130" cy="144" r="2.5" fill="#b574de" opacity="0.6"/>
    </svg>`
  },

  'Hunter_stasis': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #004060 0%, #001828 40%, #000810 100%)',
    accent: '#4ec3e0',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Hst_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#4ec3e0" stop-opacity="0.55"/><stop offset="100%" stop-color="#4ec3e0" stop-opacity="0"/></radialGradient>
        <filter id="Hst_f"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="90" ry="11" fill="url(#Hst_bg)" filter="url(#Hst_f)"/>
      <polygon points="48,200 52,185 56,200 52,215" fill="#4ec3e0" opacity="0.7"/>
      <polygon points="210,240 215,224 220,240 215,256" fill="#4ec3e0" opacity="0.6"/>
      <polygon points="35,320 40,305 45,320 40,335" fill="#4ec3e0" opacity="0.5"/>
      <path d="M95 128 Q42 218 28 408 Q58 392 84 360 Q92 268 108 180 Z" fill="#001828" opacity="0.95"/>
      <path d="M165 128 Q218 212 232 402 Q200 388 175 356 Q168 264 152 182 Z" fill="#00121e" opacity="0.9"/>
      <path d="M96 115 Q80 148 79 222 L181 222 Q180 148 164 115 Z" fill="#001e35"/>
      <polygon points="130,148 142,164 130,178 118,164" fill="#4ec3e0" opacity="0.25"/>
      <polygon points="130,152 140,166 130,175 120,166" fill="#4ec3e0" opacity="0.5"/>
      <polygon points="130,156 138,165 130,172 122,165" fill="#a0e8f8" opacity="0.9"/>
      <path d="M96 120 Q66 120 58 146 L78 158 Q86 140 96 132 Z" fill="#001525"/>
      <path d="M64 126 L60 112 L68 116 Z" fill="#4ec3e0" opacity="0.8"/>
      <path d="M164 120 Q194 120 202 146 L182 158 Q174 140 164 132 Z" fill="#001525"/>
      <path d="M196 126 L200 112 L192 116 Z" fill="#4ec3e0" opacity="0.8"/>
      <path d="M79 160 Q54 198 46 268 L68 276 Q80 224 90 184 Z" fill="#001e35"/>
      <path d="M181 160 Q206 198 214 262 L194 272 Q180 226 170 186 Z" fill="#001e35"/>
      <polygon points="50,274 58,258 66,274 58,290" fill="#4ec3e0" opacity="0.9"/>
      <rect x="84" y="220" width="92" height="12" rx="4" fill="#00101c"/>
      <path d="M100 232 Q93 315 90 392 Q106 400 119 394 Q124 318 126 236 Z" fill="#001828"/>
      <path d="M160 232 Q167 315 170 392 Q154 400 141 394 Q136 318 134 236 Z" fill="#001828"/>
      <ellipse cx="103" cy="312" rx="13" ry="9" fill="#001018" stroke="#4ec3e0" stroke-width="1.5"/>
      <ellipse cx="157" cy="312" rx="13" ry="9" fill="#001018" stroke="#4ec3e0" stroke-width="1.5"/>
      <path d="M88 390 Q82 422 78 442 L120 444 Q120 416 120 394 Z" fill="#00101c"/>
      <path d="M172 390 Q178 422 182 442 L140 444 Q140 416 140 394 Z" fill="#00101c"/>
      <path d="M88 70 Q90 44 130 38 Q170 44 172 70 Q165 58 130 54 Q95 58 88 70 Z" fill="#001e35"/>
      <ellipse cx="130" cy="84" rx="28" ry="24" fill="#000810" opacity="0.95"/>
      <ellipse cx="118" cy="80" rx="6" ry="4" fill="#4ec3e0"/>
      <ellipse cx="142" cy="80" rx="6" ry="4" fill="#4ec3e0"/>
    </svg>`
  },

  'Hunter_strand': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #003d28 0%, #001a10 40%, #000a05 100%)',
    accent: '#31c48d',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Hstr_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#31c48d" stop-opacity="0.55"/><stop offset="100%" stop-color="#31c48d" stop-opacity="0"/></radialGradient>
        <filter id="Hstr_f"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="90" ry="11" fill="url(#Hstr_bg)" filter="url(#Hstr_f)"/>
      <path d="M20 100 Q80 200 40 350" stroke="#31c48d" stroke-width="1.5" fill="none" opacity="0.3"/>
      <path d="M240 80 Q180 200 220 360" stroke="#31c48d" stroke-width="1" fill="none" opacity="0.2"/>
      <path d="M95 128 Q42 218 28 408 Q58 392 84 360 Q92 268 108 180 Z" fill="#001a10" opacity="0.95"/>
      <path d="M165 128 Q218 212 232 402 Q200 388 175 356 Q168 264 152 182 Z" fill="#00140c" opacity="0.9"/>
      <path d="M96 115 Q80 148 79 222 L181 222 Q180 148 164 115 Z" fill="#001e12"/>
      <path d="M108 140 Q130 152 152 140" stroke="#31c48d" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M112 156 Q130 164 148 156" stroke="#31c48d" stroke-width="1.5" fill="none" opacity="0.6"/>
      <circle cx="130" cy="165" r="7" fill="#31c48d" opacity="0.8"/>
      <circle cx="130" cy="165" r="3.5" fill="#90f0c8" opacity="0.9"/>
      <path d="M96 120 Q66 120 58 146 L78 158 Q86 140 96 132 Z" fill="#001408"/>
      <path d="M164 120 Q194 120 202 146 L182 158 Q174 140 164 132 Z" fill="#001408"/>
      <path d="M79 160 Q54 198 46 268 L68 276 Q80 224 90 184 Z" fill="#001e12"/>
      <path d="M181 160 Q206 198 214 262 L194 272 Q180 226 170 186 Z" fill="#001e12"/>
      <path d="M210 260 Q250 220 260 158" stroke="#31c48d" stroke-width="2.5" fill="none" opacity="0.8"/>
      <circle cx="260" cy="156" r="5" fill="#31c48d"/>
      <rect x="84" y="220" width="92" height="12" rx="4" fill="#001008"/>
      <path d="M100 232 Q93 315 90 392 Q106 400 119 394 Q124 318 126 236 Z" fill="#001a10"/>
      <path d="M160 232 Q167 315 170 392 Q154 400 141 394 Q136 318 134 236 Z" fill="#001a10"/>
      <ellipse cx="103" cy="312" rx="13" ry="9" fill="#000e08" stroke="#31c48d" stroke-width="1.5"/>
      <ellipse cx="157" cy="312" rx="13" ry="9" fill="#000e08" stroke="#31c48d" stroke-width="1.5"/>
      <path d="M88 390 Q82 422 78 442 L120 444 Q120 416 120 394 Z" fill="#001008"/>
      <path d="M172 390 Q178 422 182 442 L140 444 Q140 416 140 394 Z" fill="#001008"/>
      <path d="M88 70 Q90 44 130 38 Q170 44 172 70 Q165 58 130 54 Q95 58 88 70 Z" fill="#001e12"/>
      <ellipse cx="130" cy="84" rx="28" ry="24" fill="#000a05" opacity="0.95"/>
      <ellipse cx="118" cy="80" rx="6" ry="4" fill="#31c48d"/>
      <ellipse cx="142" cy="80" rx="6" ry="4" fill="#31c48d"/>
    </svg>`
  },

  // ═══════════════════════════════ WARLOCK ══════════════════════════════

  'Warlock_prismatic': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #5a2888 0%, #26124a 40%, #080410 100%)',
    accent: '#c8a2e8',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Wp_bg" cx="50%" cy="70%" r="70%"><stop offset="0%" stop-color="#c8a2e8" stop-opacity="0.5"/><stop offset="100%" stop-color="#c8a2e8" stop-opacity="0"/></radialGradient>
        <filter id="Wp_f"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="100" ry="14" fill="url(#Wp_bg)" filter="url(#Wp_f)"/>
      <path d="M75 100 Q20 200 12 462 L80 450 Q85 320 100 200 Z" fill="#26124a" opacity="0.9"/>
      <path d="M185 100 Q240 200 248 462 L180 450 Q175 320 160 200 Z" fill="#26124a" opacity="0.9"/>
      <path d="M80 130 Q28 180 12 290 Q40 300 65 285 Q70 220 85 165 Z" fill="#2e1558"/>
      <path d="M180 130 Q232 180 248 290 Q220 300 195 285 Q190 220 175 165 Z" fill="#2e1558"/>
      <circle cx="14" cy="292" r="10" fill="#c8a2e8" opacity="0.3" filter="url(#Wp_f)"/>
      <circle cx="14" cy="292" r="6" fill="#e0c0ff" opacity="0.8"/>
      <path d="M88 110 Q70 150 68 230 L192 230 Q190 150 172 110 Z" fill="#2e1558"/>
      <path d="M105 138 L130 148 L155 138 L158 185 Q130 195 102 185 Z" fill="#200e40" stroke="#c8a2e8" stroke-width="1" opacity="0.9"/>
      <circle cx="130" cy="165" r="14" fill="#c8a2e8" opacity="0.15" filter="url(#Wp_f)"/>
      <circle cx="130" cy="165" r="8" fill="#8040c0"/>
      <circle cx="130" cy="165" r="4" fill="#d090ff"/>
      <circle cx="130" cy="165" r="2" fill="white"/>
      <path d="M72 228 Q130 238 188 228 L190 248 Q130 260 70 248 Z" fill="#1a0a30" opacity="0.9"/>
      <path d="M70 248 Q48 340 40 462 L118 456 Q124 350 128 252 Z" fill="#26124a" opacity="0.9"/>
      <path d="M190 248 Q212 340 220 462 L142 456 Q136 350 132 252 Z" fill="#26124a" opacity="0.9"/>
      <path d="M92 78 Q88 40 130 32 Q172 40 168 78 Q155 54 130 50 Q105 54 92 78 Z" fill="#2e1558"/>
      <ellipse cx="130" cy="92" rx="30" ry="28" fill="#1a0a30"/>
      <ellipse cx="130" cy="86" rx="26" ry="20" fill="#100620" opacity="0.8"/>
      <ellipse cx="118" cy="86" rx="7" ry="5" fill="#c8a2e8"/>
      <ellipse cx="142" cy="86" rx="7" ry="5" fill="#79c8f0"/>
      <rect x="184" y="175" width="28" height="36" rx="3" fill="#1a0a30" stroke="#c8a2e8" stroke-width="1.5" opacity="0.8" transform="rotate(-12 198 193)"/>
      <line x1="188" y1="185" x2="208" y2="182" stroke="#c8a2e8" stroke-width="0.8" opacity="0.5" transform="rotate(-12 198 193)"/>
    </svg>`
  },

  'Warlock_arc': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #0a2a5a 0%, #041220 40%, #010508 100%)',
    accent: '#79c8f0',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Wa_bg" cx="50%" cy="70%" r="70%"><stop offset="0%" stop-color="#79c8f0" stop-opacity="0.55"/><stop offset="100%" stop-color="#79c8f0" stop-opacity="0"/></radialGradient>
        <filter id="Wa_f"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="100" ry="14" fill="url(#Wa_bg)" filter="url(#Wa_f)"/>
      <path d="M60 50 L50 80 L65 70 L55 105" stroke="#79c8f0" stroke-width="2" fill="none" opacity="0.5"/>
      <path d="M200 60 L210 90 L196 80 L206 115" stroke="#b8e8ff" stroke-width="1.5" fill="none" opacity="0.4"/>
      <path d="M75 100 Q18 205 10 462 L80 450 Q85 322 100 200 Z" fill="#041220" opacity="0.95"/>
      <path d="M185 100 Q242 205 250 462 L180 450 Q175 322 160 200 Z" fill="#041220" opacity="0.95"/>
      <path d="M80 130 Q26 182 10 295 Q38 305 64 290 Q70 222 85 167 Z" fill="#071e38"/>
      <path d="M180 130 Q234 182 250 295 Q222 305 196 290 Q190 222 175 167 Z" fill="#071e38"/>
      <path d="M18 275 L25 258 L20 252 L28 234" stroke="#79c8f0" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="10" cy="296" r="16" fill="#79c8f0" opacity="0.2" filter="url(#Wa_f)"/>
      <circle cx="10" cy="296" r="10" fill="#b8e8ff" opacity="0.8"/>
      <path d="M88 110 Q70 150 68 230 L192 230 Q190 150 172 110 Z" fill="#0a2240"/>
      <path d="M105 138 L130 148 L155 138" stroke="#79c8f0" stroke-width="2.5" fill="none" opacity="0.9"/>
      <path d="M110 158 L130 166 L150 158" stroke="#79c8f0" stroke-width="1.5" fill="none" opacity="0.7"/>
      <circle cx="130" cy="170" r="12" fill="#79c8f0" opacity="0.2" filter="url(#Wa_f)"/>
      <circle cx="130" cy="170" r="7" fill="#b8e8ff" opacity="0.8"/>
      <path d="M72 228 Q130 238 188 228 L190 248 Q130 260 70 248 Z" fill="#030e1c"/>
      <path d="M70 248 Q46 342 38 462 L118 456 Q124 352 128 252 Z" fill="#041220" opacity="0.95"/>
      <path d="M190 248 Q214 342 222 462 L142 456 Q136 352 132 252 Z" fill="#041220" opacity="0.95"/>
      <path d="M92 78 Q88 40 130 32 Q172 40 168 78 Q155 54 130 50 Q105 54 92 78 Z" fill="#0a2240"/>
      <ellipse cx="130" cy="92" rx="30" ry="28" fill="#030e1c"/>
      <ellipse cx="130" cy="86" rx="26" ry="20" fill="#020810" opacity="0.8"/>
      <ellipse cx="118" cy="86" rx="7" ry="5" fill="#79c8f0"/>
      <ellipse cx="142" cy="86" rx="7" ry="5" fill="#79c8f0"/>
      <ellipse cx="118" cy="86" rx="10" ry="7" fill="#79c8f0" opacity="0.3" filter="url(#Wa_f)"/>
      <ellipse cx="142" cy="86" rx="10" ry="7" fill="#79c8f0" opacity="0.3" filter="url(#Wa_f)"/>
    </svg>`
  },

  'Warlock_solar': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #6a2000 0%, #2d0e00 40%, #0a0300 100%)',
    accent: '#f0a830',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Ws_bg" cx="50%" cy="70%" r="70%"><stop offset="0%" stop-color="#f0a830" stop-opacity="0.55"/><stop offset="100%" stop-color="#f0a830" stop-opacity="0"/></radialGradient>
        <filter id="Ws_f"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="100" ry="14" fill="url(#Ws_bg)" filter="url(#Ws_f)"/>
      <path d="M75 100 Q20 205 12 462 L80 450 Q85 322 100 200 Z" fill="#2d0e00" opacity="0.95"/>
      <path d="M185 100 Q240 205 248 462 L180 450 Q175 322 160 200 Z" fill="#2d0e00" opacity="0.95"/>
      <path d="M80 130 Q26 182 10 295 Q38 305 64 290 Q70 222 85 167 Z" fill="#3d1400"/>
      <path d="M180 130 Q234 182 250 295 Q222 305 196 290 Q190 222 175 167 Z" fill="#3d1400"/>
      <circle cx="12" cy="296" r="18" fill="#f0a830" opacity="0.2" filter="url(#Ws_f)"/>
      <circle cx="12" cy="296" r="11" fill="#f5c060" opacity="0.85"/>
      <circle cx="12" cy="296" r="5" fill="white"/>
      <path d="M88 110 Q70 150 68 230 L192 230 Q190 150 172 110 Z" fill="#3d1800"/>
      <path d="M105 138 L130 148 L155 138" stroke="#f0a830" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="130" cy="168" r="14" fill="#f0a830" opacity="0.2" filter="url(#Ws_f)"/>
      <circle cx="130" cy="168" r="8" fill="#f5c060" opacity="0.8"/>
      <circle cx="130" cy="168" r="4" fill="white"/>
      <path d="M72 228 Q130 238 188 228 L190 248 Q130 260 70 248 Z" fill="#1a0800"/>
      <path d="M70 248 Q46 342 38 462 L118 456 Q124 352 128 252 Z" fill="#2d0e00" opacity="0.95"/>
      <path d="M190 248 Q214 342 222 462 L142 456 Q136 352 132 252 Z" fill="#2d0e00" opacity="0.95"/>
      <path d="M92 78 Q88 40 130 32 Q172 40 168 78 Q155 54 130 50 Q105 54 92 78 Z" fill="#3d1400"/>
      <ellipse cx="130" cy="92" rx="30" ry="28" fill="#1a0800"/>
      <ellipse cx="130" cy="86" rx="26" ry="20" fill="#100400" opacity="0.8"/>
      <ellipse cx="118" cy="86" rx="7" ry="5" fill="#f0a830"/>
      <ellipse cx="142" cy="86" rx="7" ry="5" fill="#f0a830"/>
    </svg>`
  },

  'Warlock_void': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #2d0060 0%, #14002a 40%, #060010 100%)',
    accent: '#b574de',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Wv_bg" cx="50%" cy="70%" r="70%"><stop offset="0%" stop-color="#b574de" stop-opacity="0.55"/><stop offset="100%" stop-color="#b574de" stop-opacity="0"/></radialGradient>
        <filter id="Wv_f"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="100" ry="14" fill="url(#Wv_bg)" filter="url(#Wv_f)"/>
      <circle cx="40" cy="180" r="8" fill="#b574de" opacity="0.4" filter="url(#Wv_f)"/>
      <circle cx="220" cy="200" r="6" fill="#b574de" opacity="0.3" filter="url(#Wv_f)"/>
      <path d="M75 100 Q18 205 10 462 L80 450 Q85 322 100 200 Z" fill="#14002a" opacity="0.95"/>
      <path d="M185 100 Q242 205 250 462 L180 450 Q175 322 160 200 Z" fill="#14002a" opacity="0.95"/>
      <path d="M80 130 Q26 182 10 295 Q38 305 64 290 Q70 222 85 167 Z" fill="#1e0040"/>
      <path d="M180 130 Q234 182 250 295 Q222 305 196 290 Q190 222 175 167 Z" fill="#1e0040"/>
      <circle cx="12" cy="296" r="18" fill="#b574de" opacity="0.25" filter="url(#Wv_f)"/>
      <circle cx="12" cy="296" r="10" fill="#d090ff" opacity="0.7"/>
      <path d="M88 110 Q70 150 68 230 L192 230 Q190 150 172 110 Z" fill="#1a0038"/>
      <path d="M105 138 L130 148 L155 138" stroke="#b574de" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="130" cy="168" r="14" fill="#b574de" opacity="0.2" filter="url(#Wv_f)"/>
      <circle cx="130" cy="168" r="8" fill="#8040c0"/>
      <circle cx="130" cy="168" r="4" fill="#d090ff"/>
      <circle cx="130" cy="168" r="2" fill="white"/>
      <circle cx="112" cy="168" r="3" fill="#b574de" opacity="0.9"/>
      <circle cx="148" cy="168" r="3" fill="#b574de" opacity="0.9"/>
      <path d="M72 228 Q130 238 188 228 L190 248 Q130 260 70 248 Z" fill="#0c001a"/>
      <path d="M70 248 Q46 342 38 462 L118 456 Q124 352 128 252 Z" fill="#14002a" opacity="0.95"/>
      <path d="M190 248 Q214 342 222 462 L142 456 Q136 352 132 252 Z" fill="#14002a" opacity="0.95"/>
      <path d="M92 78 Q88 40 130 32 Q172 40 168 78 Q155 54 130 50 Q105 54 92 78 Z" fill="#1e0040"/>
      <ellipse cx="130" cy="92" rx="30" ry="28" fill="#0c0020"/>
      <ellipse cx="130" cy="86" rx="26" ry="20" fill="#060010" opacity="0.8"/>
      <ellipse cx="118" cy="86" rx="7" ry="5" fill="#b574de"/>
      <ellipse cx="142" cy="86" rx="7" ry="5" fill="#b574de"/>
    </svg>`
  },

  'Warlock_stasis': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #003050 0%, #001520 40%, #000810 100%)',
    accent: '#4ec3e0',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Wst_bg" cx="50%" cy="70%" r="70%"><stop offset="0%" stop-color="#4ec3e0" stop-opacity="0.55"/><stop offset="100%" stop-color="#4ec3e0" stop-opacity="0"/></radialGradient>
        <filter id="Wst_f"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="100" ry="14" fill="url(#Wst_bg)" filter="url(#Wst_f)"/>
      <polygon points="40,160 45,145 50,160 45,175" fill="#4ec3e0" opacity="0.7"/>
      <polygon points="215,190 220,174 225,190 220,206" fill="#4ec3e0" opacity="0.6"/>
      <path d="M75 100 Q18 205 10 462 L80 450 Q85 322 100 200 Z" fill="#001520" opacity="0.95"/>
      <path d="M185 100 Q242 205 250 462 L180 450 Q175 322 160 200 Z" fill="#001520" opacity="0.95"/>
      <path d="M80 130 Q26 182 10 295 Q38 305 64 290 Q70 222 85 167 Z" fill="#001e30"/>
      <path d="M180 130 Q234 182 250 295 Q222 305 196 290 Q190 222 175 167 Z" fill="#001e30"/>
      <polygon points="12,280 20,262 28,280 20,298" fill="#4ec3e0" opacity="0.9"/>
      <path d="M88 110 Q70 150 68 230 L192 230 Q190 150 172 110 Z" fill="#001e35"/>
      <path d="M105 138 L130 148 L155 138" stroke="#4ec3e0" stroke-width="2" fill="none" opacity="0.9"/>
      <polygon points="130,150 142,165 130,178 118,165" fill="#4ec3e0" opacity="0.3"/>
      <polygon points="130,155 140,167 130,176 120,167" fill="#a0e8f8" opacity="0.8"/>
      <path d="M72 228 Q130 238 188 228 L190 248 Q130 260 70 248 Z" fill="#000e18"/>
      <path d="M70 248 Q46 342 38 462 L118 456 Q124 352 128 252 Z" fill="#001520" opacity="0.95"/>
      <path d="M190 248 Q214 342 222 462 L142 456 Q136 352 132 252 Z" fill="#001520" opacity="0.95"/>
      <path d="M92 78 Q88 40 130 32 Q172 40 168 78 Q155 54 130 50 Q105 54 92 78 Z" fill="#001e35"/>
      <ellipse cx="130" cy="92" rx="30" ry="28" fill="#000e18"/>
      <ellipse cx="130" cy="86" rx="26" ry="20" fill="#000810" opacity="0.8"/>
      <ellipse cx="118" cy="86" rx="7" ry="5" fill="#4ec3e0"/>
      <ellipse cx="142" cy="86" rx="7" ry="5" fill="#4ec3e0"/>
    </svg>`
  },

  'Warlock_strand': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #003520 0%, #001408 40%, #000500 100%)',
    accent: '#31c48d',
    svg: `<svg viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Wstr_bg" cx="50%" cy="70%" r="70%"><stop offset="0%" stop-color="#31c48d" stop-opacity="0.55"/><stop offset="100%" stop-color="#31c48d" stop-opacity="0"/></radialGradient>
        <filter id="Wstr_f"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="130" cy="468" rx="100" ry="14" fill="url(#Wstr_bg)" filter="url(#Wstr_f)"/>
      <path d="M0 150 Q80 220 60 350" stroke="#31c48d" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M260 120 Q180 210 200 360" stroke="#31c48d" stroke-width="1.5" fill="none" opacity="0.25"/>
      <path d="M75 100 Q18 205 10 462 L80 450 Q85 322 100 200 Z" fill="#001408" opacity="0.95"/>
      <path d="M185 100 Q242 205 250 462 L180 450 Q175 322 160 200 Z" fill="#001408" opacity="0.95"/>
      <path d="M80 130 Q26 182 10 295 Q38 305 64 290 Q70 222 85 167 Z" fill="#001e10"/>
      <path d="M180 130 Q234 182 250 295 Q222 305 196 290 Q190 222 175 167 Z" fill="#001e10"/>
      <path d="M12 296 Q-10 260 5 220" stroke="#31c48d" stroke-width="3" fill="none" opacity="0.8"/>
      <path d="M88 110 Q70 150 68 230 L192 230 Q190 150 172 110 Z" fill="#001e12"/>
      <path d="M105 138 L130 148 L155 138" stroke="#31c48d" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="130" cy="168" r="12" fill="#31c48d" opacity="0.2" filter="url(#Wstr_f)"/>
      <circle cx="130" cy="168" r="7" fill="#31c48d" opacity="0.8"/>
      <circle cx="130" cy="168" r="3" fill="#90f0c8"/>
      <path d="M72 228 Q130 238 188 228 L190 248 Q130 260 70 248 Z" fill="#000c08"/>
      <path d="M70 248 Q46 342 38 462 L118 456 Q124 352 128 252 Z" fill="#001408" opacity="0.95"/>
      <path d="M190 248 Q214 342 222 462 L142 456 Q136 352 132 252 Z" fill="#001408" opacity="0.95"/>
      <path d="M92 78 Q88 40 130 32 Q172 40 168 78 Q155 54 130 50 Q105 54 92 78 Z" fill="#001e12"/>
      <ellipse cx="130" cy="92" rx="30" ry="28" fill="#000c08"/>
      <ellipse cx="130" cy="86" rx="26" ry="20" fill="#000500" opacity="0.8"/>
      <ellipse cx="118" cy="86" rx="7" ry="5" fill="#31c48d"/>
      <ellipse cx="142" cy="86" rx="7" ry="5" fill="#31c48d"/>
    </svg>`
  },

  // ═══════════════════════════════ TITAN ════════════════════════════════

  'Titan_prismatic': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #4a2a7a 0%, #1e1030 40%, #080510 100%)',
    accent: '#c8a2e8',
    svg: `<svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Tp_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#c8a2e8" stop-opacity="0.55"/><stop offset="100%" stop-color="#c8a2e8" stop-opacity="0"/></radialGradient>
        <filter id="Tp_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="426" rx="95" ry="12" fill="url(#Tp_bg)" filter="url(#Tp_f)"/>
      <path d="M90 22 L90 72 L170 72 L170 22 Q130 8 90 22 Z" fill="#2e1a58"/>
      <rect x="94" y="40" width="72" height="18" rx="2" fill="#0a0414" opacity="0.9"/>
      <rect x="96" y="42" width="34" height="14" rx="0" fill="#c8a2e8" opacity="0.3"/>
      <rect x="130" y="42" width="34" height="14" rx="0" fill="#79c8f0" opacity="0.2"/>
      <path d="M90 22 L84 28 L84 65 L90 72" fill="#200e40" opacity="0.7"/>
      <path d="M170 22 L176 28 L176 65 L170 72" fill="#200e40" opacity="0.7"/>
      <path d="M90 78 L48 72 L36 108 L48 122 L90 112 Z" fill="#2e1a58"/>
      <path d="M170 78 L212 72 L224 108 L212 122 L170 112 Z" fill="#2e1a58"/>
      <path d="M48 72 L42 58 L54 65 Z" fill="#c8a2e8" opacity="0.8"/>
      <path d="M212 72 L218 58 L206 65 Z" fill="#c8a2e8" opacity="0.8"/>
      <path d="M48 122 L34 180 L34 250 L58 250 L62 185 L90 115 Z" fill="#26144a"/>
      <path d="M212 122 L226 180 L226 250 L202 250 L198 185 L170 115 Z" fill="#26144a"/>
      <rect x="30" y="248" width="32" height="28" rx="6" fill="#1a0e30"/>
      <rect x="198" y="248" width="32" height="28" rx="6" fill="#1a0e30"/>
      <circle cx="46" cy="262" r="16" fill="#c8a2e8" opacity="0.2" filter="url(#Tp_f)"/>
      <circle cx="214" cy="262" r="16" fill="#79c8f0" opacity="0.2" filter="url(#Tp_f)"/>
      <path d="M90 78 L90 212 L170 212 L170 78 Z" fill="#26144a"/>
      <path d="M100 100 L130 108 L160 100" stroke="#c8a2e8" stroke-width="2" fill="none" opacity="0.8"/>
      <circle cx="130" cy="150" r="16" fill="#c8a2e8" opacity="0.15" filter="url(#Tp_f)"/>
      <circle cx="130" cy="150" r="10" fill="#6030a0"/>
      <circle cx="130" cy="150" r="5" fill="#c8a2e8"/>
      <circle cx="130" cy="150" r="2.5" fill="white"/>
      <rect x="88" y="210" width="84" height="20" rx="4" fill="#1a0e30"/>
      <path d="M90 230 L88 340 L118 340 L118 230 Z" fill="#26144a"/>
      <rect x="86" y="296" width="34" height="18" rx="4" fill="#1a0e30" stroke="#c8a2e8" stroke-width="1" opacity="0.9"/>
      <path d="M142 230 L142 340 L172 340 L170 230 Z" fill="#26144a"/>
      <rect x="140" y="296" width="34" height="18" rx="4" fill="#1a0e30" stroke="#c8a2e8" stroke-width="1" opacity="0.9"/>
      <path d="M85 338 L80 380 L120 382 L120 340 Z" fill="#1a0e30"/>
      <path d="M140 338 L140 380 L180 382 L175 338 Z" fill="#1a0e30"/>
    </svg>`
  },

  'Titan_arc': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #082040 0%, #030c18 40%, #010408 100%)',
    accent: '#79c8f0',
    svg: `<svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Ta_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#79c8f0" stop-opacity="0.65"/><stop offset="100%" stop-color="#79c8f0" stop-opacity="0"/></radialGradient>
        <filter id="Ta_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="426" rx="95" ry="12" fill="url(#Ta_bg)" filter="url(#Ta_f)"/>
      <path d="M30 60 L22 95 L36 82 L28 118" stroke="#79c8f0" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M230 50 L238 85 L224 72 L232 108" stroke="#79c8f0" stroke-width="1.5" fill="none" opacity="0.35"/>
      <path d="M90 22 L90 72 L170 72 L170 22 Q130 8 90 22 Z" fill="#071828"/>
      <rect x="94" y="40" width="72" height="18" rx="2" fill="#030c14" opacity="0.9"/>
      <rect x="96" y="42" width="68" height="14" rx="2" fill="#79c8f0" opacity="0.4"/>
      <path d="M90 22 L84 28 L84 65 L90 72" fill="#040e1c" opacity="0.7"/>
      <path d="M170 22 L176 28 L176 65 L170 72" fill="#040e1c" opacity="0.7"/>
      <path d="M90 78 L46 72 L34 108 L46 122 L90 112 Z" fill="#0a2040"/>
      <path d="M170 78 L214 72 L226 108 L214 122 L170 112 Z" fill="#0a2040"/>
      <path d="M50 80 L44 65 L52 72 Z" fill="#79c8f0" opacity="0.9"/>
      <path d="M210 80 L216 65 L208 72 Z" fill="#79c8f0" opacity="0.9"/>
      <path d="M46 122 L32 180 L32 250 L56 250 L60 185 L90 115 Z" fill="#0a1e38"/>
      <path d="M214 122 L228 180 L228 250 L204 250 L200 185 L170 115 Z" fill="#0a1e38"/>
      <rect x="28" y="248" width="32" height="28" rx="6" fill="#071525"/>
      <rect x="200" y="248" width="32" height="28" rx="6" fill="#071525"/>
      <circle cx="44" cy="262" r="18" fill="#79c8f0" opacity="0.25" filter="url(#Ta_f)"/>
      <circle cx="216" cy="262" r="18" fill="#79c8f0" opacity="0.25" filter="url(#Ta_f)"/>
      <circle cx="44" cy="262" r="10" fill="#b8e8ff" opacity="0.8"/>
      <circle cx="216" cy="262" r="10" fill="#b8e8ff" opacity="0.8"/>
      <path d="M44 262 Q130 240 216 262" stroke="#79c8f0" stroke-width="2" fill="none" opacity="0.5" stroke-dasharray="6,4"/>
      <path d="M90 78 L90 212 L170 212 L170 78 Z" fill="#0a1e38"/>
      <path d="M100 100 L130 108 L160 100" stroke="#79c8f0" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="130" cy="152" r="14" fill="#79c8f0" opacity="0.2" filter="url(#Ta_f)"/>
      <circle cx="130" cy="152" r="8" fill="#b8e8ff" opacity="0.8"/>
      <path d="M115 130 L112 148 L120 142 L116 165" stroke="#79c8f0" stroke-width="1.5" fill="none" opacity="0.8"/>
      <rect x="88" y="210" width="84" height="20" rx="4" fill="#071525"/>
      <path d="M90 230 L88 340 L118 340 L118 230 Z" fill="#0a1e38"/>
      <rect x="86" y="296" width="34" height="18" rx="4" fill="#071525" stroke="#79c8f0" stroke-width="1" opacity="0.9"/>
      <path d="M142 230 L142 340 L172 340 L170 230 Z" fill="#0a1e38"/>
      <rect x="140" y="296" width="34" height="18" rx="4" fill="#071525" stroke="#79c8f0" stroke-width="1" opacity="0.9"/>
      <path d="M85 338 L80 380 L120 382 L120 340 Z" fill="#071525"/>
      <path d="M140 338 L140 380 L180 382 L175 338 Z" fill="#071525"/>
    </svg>`
  },

  'Titan_solar': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #5a1800 0%, #280a00 40%, #0a0300 100%)',
    accent: '#f0a830',
    svg: `<svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Ts_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#f0a830" stop-opacity="0.65"/><stop offset="100%" stop-color="#f0a830" stop-opacity="0"/></radialGradient>
        <filter id="Ts_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="426" rx="95" ry="12" fill="url(#Ts_bg)" filter="url(#Ts_f)"/>
      <path d="M90 22 L90 72 L170 72 L170 22 Q130 8 90 22 Z" fill="#3d1400"/>
      <rect x="94" y="40" width="72" height="18" rx="2" fill="#150600" opacity="0.9"/>
      <rect x="96" y="42" width="68" height="14" rx="2" fill="#f0a830" opacity="0.4"/>
      <path d="M90 22 L84 28 L84 65 L90 72" fill="#2d0e00" opacity="0.7"/>
      <path d="M170 22 L176 28 L176 65 L170 72" fill="#2d0e00" opacity="0.7"/>
      <path d="M90 78 L46 72 L34 108 L46 122 L90 112 Z" fill="#3d1400"/>
      <path d="M48 75 Q44 60 50 48 Q48 62 56 70 Z" fill="#f0a830" opacity="0.8"/>
      <path d="M170 78 L214 72 L226 108 L214 122 L170 112 Z" fill="#3d1400"/>
      <path d="M212 75 Q216 60 210 48 Q212 62 204 70 Z" fill="#f0a830" opacity="0.8"/>
      <path d="M46 122 L32 180 L32 250 L56 250 L60 185 L90 115 Z" fill="#2d1000"/>
      <path d="M214 122 L228 180 L228 250 L204 250 L200 185 L170 115 Z" fill="#2d1000"/>
      <rect x="28" y="248" width="32" height="28" rx="6" fill="#1a0800"/>
      <rect x="200" y="248" width="32" height="28" rx="6" fill="#1a0800"/>
      <circle cx="44" cy="250" r="12" fill="#f0a830" opacity="0.4" filter="url(#Ts_f)"/>
      <circle cx="216" cy="250" r="12" fill="#f0a830" opacity="0.4" filter="url(#Ts_f)"/>
      <path d="M90 78 L90 212 L170 212 L170 78 Z" fill="#2d1000"/>
      <path d="M100 100 L130 108 L160 100" stroke="#f0a830" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="130" cy="152" r="14" fill="#f0a830" opacity="0.2" filter="url(#Ts_f)"/>
      <circle cx="130" cy="152" r="8" fill="#f5c060" opacity="0.8"/>
      <circle cx="130" cy="152" r="4" fill="white"/>
      <rect x="88" y="210" width="84" height="20" rx="4" fill="#1a0800"/>
      <path d="M90 230 L88 340 L118 340 L118 230 Z" fill="#2d1000"/>
      <rect x="86" y="296" width="34" height="18" rx="4" fill="#1a0800" stroke="#f0a830" stroke-width="1" opacity="0.9"/>
      <path d="M142 230 L142 340 L172 340 L170 230 Z" fill="#2d1000"/>
      <rect x="140" y="296" width="34" height="18" rx="4" fill="#1a0800" stroke="#f0a830" stroke-width="1" opacity="0.9"/>
      <path d="M85 338 L80 380 L120 382 L120 340 Z" fill="#1a0800"/>
      <path d="M140 338 L140 380 L180 382 L175 338 Z" fill="#1a0800"/>
      <path d="M92 380 Q88 365 94 352" stroke="#f0a830" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M168 380 Q172 365 166 352" stroke="#f0a830" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>`
  },

  'Titan_void': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #220050 0%, #100028 40%, #050010 100%)',
    accent: '#b574de',
    svg: `<svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Tv_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#b574de" stop-opacity="0.55"/><stop offset="100%" stop-color="#b574de" stop-opacity="0"/></radialGradient>
        <filter id="Tv_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="426" rx="95" ry="12" fill="url(#Tv_bg)" filter="url(#Tv_f)"/>
      <circle cx="35" cy="180" r="10" fill="#b574de" opacity="0.2" filter="url(#Tv_f)"/>
      <circle cx="225" cy="150" r="7" fill="#b574de" opacity="0.15" filter="url(#Tv_f)"/>
      <path d="M90 22 L90 72 L170 72 L170 22 Q130 8 90 22 Z" fill="#160030"/>
      <rect x="94" y="40" width="72" height="18" rx="2" fill="#0a0018" opacity="0.9"/>
      <rect x="96" y="42" width="68" height="14" rx="2" fill="#b574de" opacity="0.35"/>
      <path d="M90 22 L84 28 L84 65 L90 72" fill="#0e0020" opacity="0.7"/>
      <path d="M170 22 L176 28 L176 65 L170 72" fill="#0e0020" opacity="0.7"/>
      <path d="M90 78 L46 72 L34 108 L46 122 L90 112 Z" fill="#160030"/>
      <path d="M170 78 L214 72 L226 108 L214 122 L170 112 Z" fill="#160030"/>
      <path d="M46 122 L32 180 L32 250 L56 250 L60 185 L90 115 Z" fill="#100025"/>
      <path d="M214 122 L228 180 L228 250 L204 250 L200 185 L170 115 Z" fill="#100025"/>
      <circle cx="38" cy="220" r="14" fill="#b574de" opacity="0.15" filter="url(#Tv_f)"/>
      <circle cx="222" cy="220" r="14" fill="#b574de" opacity="0.15" filter="url(#Tv_f)"/>
      <rect x="28" y="248" width="32" height="28" rx="6" fill="#0a0018"/>
      <rect x="200" y="248" width="32" height="28" rx="6" fill="#0a0018"/>
      <path d="M90 78 L90 212 L170 212 L170 78 Z" fill="#100025"/>
      <path d="M100 100 L130 108 L160 100" stroke="#b574de" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="130" cy="152" r="14" fill="#b574de" opacity="0.2" filter="url(#Tv_f)"/>
      <circle cx="130" cy="152" r="8" fill="#8040c0"/>
      <circle cx="130" cy="152" r="4" fill="#d090ff"/>
      <circle cx="130" cy="152" r="2" fill="white"/>
      <circle cx="112" cy="152" r="3.5" fill="#b574de" opacity="0.9"/>
      <circle cx="148" cy="152" r="3.5" fill="#b574de" opacity="0.9"/>
      <circle cx="130" cy="135" r="3" fill="#b574de" opacity="0.7"/>
      <circle cx="130" cy="169" r="3" fill="#b574de" opacity="0.7"/>
      <rect x="88" y="210" width="84" height="20" rx="4" fill="#0a0018"/>
      <path d="M90 230 L88 340 L118 340 L118 230 Z" fill="#100025"/>
      <rect x="86" y="296" width="34" height="18" rx="4" fill="#0a0018" stroke="#b574de" stroke-width="1" opacity="0.9"/>
      <path d="M142 230 L142 340 L172 340 L170 230 Z" fill="#100025"/>
      <rect x="140" y="296" width="34" height="18" rx="4" fill="#0a0018" stroke="#b574de" stroke-width="1" opacity="0.9"/>
      <path d="M85 338 L80 380 L120 382 L120 340 Z" fill="#0a0018"/>
      <path d="M140 338 L140 380 L180 382 L175 338 Z" fill="#0a0018"/>
    </svg>`
  },

  'Titan_stasis': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #003545 0%, #001520 40%, #000810 100%)',
    accent: '#4ec3e0',
    svg: `<svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Tst_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#4ec3e0" stop-opacity="0.55"/><stop offset="100%" stop-color="#4ec3e0" stop-opacity="0"/></radialGradient>
        <filter id="Tst_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="426" rx="95" ry="12" fill="url(#Tst_bg)" filter="url(#Tst_f)"/>
      <polygon points="25,120 30,102 35,120 30,138" fill="#4ec3e0" opacity="0.6"/>
      <polygon points="235,140 240,122 245,140 240,158" fill="#4ec3e0" opacity="0.5"/>
      <path d="M90 22 L90 72 L170 72 L170 22 Q130 8 90 22 Z" fill="#001e30"/>
      <rect x="94" y="40" width="72" height="18" rx="2" fill="#000e18" opacity="0.9"/>
      <rect x="96" y="42" width="68" height="14" rx="2" fill="#4ec3e0" opacity="0.35"/>
      <polygon points="115,22 120,8 125,22" fill="#4ec3e0" opacity="0.8"/>
      <polygon points="135,22 140,10 145,22" fill="#4ec3e0" opacity="0.7"/>
      <path d="M90 22 L84 28 L84 65 L90 72" fill="#001528" opacity="0.7"/>
      <path d="M170 22 L176 28 L176 65 L170 72" fill="#001528" opacity="0.7"/>
      <path d="M90 78 L46 72 L34 108 L46 122 L90 112 Z" fill="#001e30"/>
      <path d="M46 80 L40 62 L52 72 Z" fill="#4ec3e0" opacity="0.9"/>
      <path d="M54 74 L50 58 L60 68 Z" fill="#4ec3e0" opacity="0.7"/>
      <path d="M170 78 L214 72 L226 108 L214 122 L170 112 Z" fill="#001e30"/>
      <path d="M214 80 L220 62 L208 72 Z" fill="#4ec3e0" opacity="0.9"/>
      <path d="M206 74 L210 58 L200 68 Z" fill="#4ec3e0" opacity="0.7"/>
      <path d="M46 122 L32 180 L32 250 L56 250 L60 185 L90 115 Z" fill="#001828"/>
      <path d="M214 122 L228 180 L228 250 L204 250 L200 185 L170 115 Z" fill="#001828"/>
      <rect x="28" y="248" width="32" height="28" rx="6" fill="#001018"/>
      <rect x="200" y="248" width="32" height="28" rx="6" fill="#001018"/>
      <polygon points="34,248 38,234 42,248" fill="#4ec3e0" opacity="0.8"/>
      <polygon points="206,248 210,234 214,248" fill="#4ec3e0" opacity="0.8"/>
      <path d="M90 78 L90 212 L170 212 L170 78 Z" fill="#001828"/>
      <path d="M100 100 L130 108 L160 100" stroke="#4ec3e0" stroke-width="2" fill="none" opacity="0.9"/>
      <polygon points="130,138 146,158 130,174 114,158" fill="#4ec3e0" opacity="0.25"/>
      <polygon points="130,148 142,162 130,170 118,162" fill="#a0e8f8" opacity="0.9"/>
      <rect x="88" y="210" width="84" height="20" rx="4" fill="#001018"/>
      <path d="M90 230 L88 340 L118 340 L118 230 Z" fill="#001828"/>
      <rect x="86" y="296" width="34" height="18" rx="4" fill="#001018" stroke="#4ec3e0" stroke-width="1" opacity="0.9"/>
      <path d="M142 230 L142 340 L172 340 L170 230 Z" fill="#001828"/>
      <rect x="140" y="296" width="34" height="18" rx="4" fill="#001018" stroke="#4ec3e0" stroke-width="1" opacity="0.9"/>
      <path d="M85 338 L80 380 L120 382 L120 340 Z" fill="#001018"/>
      <path d="M140 338 L140 380 L180 382 L175 338 Z" fill="#001018"/>
      <polygon points="90,380 95,362 100,380" fill="#4ec3e0" opacity="0.7"/>
      <polygon points="160,380 165,362 170,380" fill="#4ec3e0" opacity="0.7"/>
    </svg>`
  },

  'Titan_strand': {
    bg: 'radial-gradient(ellipse 120% 80% at 50% 100%, #003520 0%, #001408 40%, #000500 100%)',
    accent: '#31c48d',
    svg: `<svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="Tstr_bg" cx="50%" cy="80%" r="60%"><stop offset="0%" stop-color="#31c48d" stop-opacity="0.55"/><stop offset="100%" stop-color="#31c48d" stop-opacity="0"/></radialGradient>
        <filter id="Tstr_f"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="130" cy="426" rx="95" ry="12" fill="url(#Tstr_bg)" filter="url(#Tstr_f)"/>
      <path d="M10 100 Q70 200 40 380" stroke="#31c48d" stroke-width="2" fill="none" opacity="0.25"/>
      <path d="M250 80 Q190 190 220 370" stroke="#31c48d" stroke-width="1.5" fill="none" opacity="0.2"/>
      <path d="M90 22 L90 72 L170 72 L170 22 Q130 8 90 22 Z" fill="#001e12"/>
      <rect x="94" y="40" width="72" height="18" rx="2" fill="#000e08" opacity="0.9"/>
      <rect x="96" y="42" width="68" height="14" rx="2" fill="#31c48d" opacity="0.35"/>
      <path d="M90 22 L84 28 L84 65 L90 72" fill="#001408" opacity="0.7"/>
      <path d="M170 22 L176 28 L176 65 L170 72" fill="#001408" opacity="0.7"/>
      <path d="M90 78 L46 72 L34 108 L46 122 L90 112 Z" fill="#001e12"/>
      <path d="M46 90 Q42 75 50 65" stroke="#31c48d" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M170 78 L214 72 L226 108 L214 122 L170 112 Z" fill="#001e12"/>
      <path d="M214 90 Q218 75 210 65" stroke="#31c48d" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M46 122 L32 180 L32 250 L56 250 L60 185 L90 115 Z" fill="#001a10"/>
      <path d="M214 122 L228 180 L228 250 L204 250 L200 185 L170 115 Z" fill="#001a10"/>
      <path d="M34 240 Q10 220 5 180" stroke="#31c48d" stroke-width="2.5" fill="none" opacity="0.8"/>
      <path d="M226 240 Q250 220 255 180" stroke="#31c48d" stroke-width="2.5" fill="none" opacity="0.8"/>
      <rect x="28" y="248" width="32" height="28" rx="6" fill="#000e08"/>
      <rect x="200" y="248" width="32" height="28" rx="6" fill="#000e08"/>
      <path d="M90 78 L90 212 L170 212 L170 78 Z" fill="#001a10"/>
      <path d="M100 100 L130 108 L160 100" stroke="#31c48d" stroke-width="2" fill="none" opacity="0.9"/>
      <circle cx="130" cy="152" r="14" fill="#31c48d" opacity="0.2" filter="url(#Tstr_f)"/>
      <circle cx="130" cy="152" r="8" fill="#31c48d" opacity="0.8"/>
      <circle cx="130" cy="152" r="4" fill="#90f0c8"/>
      <path d="M130 138 Q118 128 108 132" stroke="#31c48d" stroke-width="1.5" fill="none" opacity="0.7"/>
      <path d="M130 138 Q142 128 152 132" stroke="#31c48d" stroke-width="1.5" fill="none" opacity="0.7"/>
      <rect x="88" y="210" width="84" height="20" rx="4" fill="#000e08"/>
      <path d="M90 230 L88 340 L118 340 L118 230 Z" fill="#001a10"/>
      <rect x="86" y="296" width="34" height="18" rx="4" fill="#000e08" stroke="#31c48d" stroke-width="1" opacity="0.9"/>
      <path d="M142 230 L142 340 L172 340 L170 230 Z" fill="#001a10"/>
      <rect x="140" y="296" width="34" height="18" rx="4" fill="#000e08" stroke="#31c48d" stroke-width="1" opacity="0.9"/>
      <path d="M85 338 L80 380 L120 382 L120 340 Z" fill="#000e08"/>
      <path d="M140 338 L140 380 L180 382 L175 338 Z" fill="#000e08"/>
    </svg>`
  },
};
