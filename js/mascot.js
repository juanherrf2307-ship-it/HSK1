// Huǒhuo 火火: panda rojo cuya cola arde más cuanto más larga es la racha.
// mood: happy | joy | sleepy | cheer · acc: '' | 'scarf' | 'scarf crown'
export function bao(mood='happy',size=140,acc=''){
 const lv=acc.includes('crown')?3:acc.includes('scarf')?2:1;
 const eyes={happy:'<ellipse cx="54" cy="66" rx="7" ry="8" fill="#2a1a14"/><ellipse cx="86" cy="66" rx="7" ry="8" fill="#2a1a14"/><circle cx="57" cy="62" r="3" fill="#fff"/><circle cx="89" cy="62" r="3" fill="#fff"/><circle cx="52" cy="70" r="1.5" fill="#fff"/><circle cx="84" cy="70" r="1.5" fill="#fff"/>',
  joy:'<path d="M46 68q8-11 16 0M78 68q8-11 16 0" stroke="#2a1a14" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
  sleepy:'<path d="M46 68q8 6 16 0M78 68q8 6 16 0" stroke="#2a1a14" stroke-width="4" fill="none" stroke-linecap="round"/>',
  cheer:'<ellipse cx="54" cy="66" rx="7.5" ry="9" fill="#2a1a14"/><ellipse cx="86" cy="66" rx="7.5" ry="9" fill="#2a1a14"/><circle cx="57" cy="61" r="3.4" fill="#fff"/><circle cx="89" cy="61" r="3.4" fill="#fff"/><path d="M45 54l12 4M95 54l-12 4" stroke="#2a1a14" stroke-width="3" stroke-linecap="round"/>'}[mood];
 const mouth={happy:'<path d="M64 84q6 5 12 0" stroke="#2a1a14" stroke-width="3" fill="none" stroke-linecap="round"/>',joy:'<path d="M61 82q9 14 18 0z" fill="#d94b4b"/><path d="M65 87q5 4 10 0" fill="#ff9a9a"/>',sleepy:'<ellipse cx="70" cy="86" rx="3.5" ry="3" fill="#2a1a14"/>',cheer:'<path d="M63 83q7 8 14 0" stroke="#2a1a14" stroke-width="3.2" fill="none" stroke-linecap="round"/>'}[mood];
 const fireS=[0,.75,1,1.3][lv];
 const fire=`<g class="flick" style="transform-origin:122px 44px"><g transform="translate(122 46) scale(${fireS}) translate(-122 -46)"><path d="M122 6c8 12 20 18 20 34a20 20 0 0 1-40 0c0-9 5-14 9-19 1 7 4 10 7 10-2-9 0-17 4-25z" fill="url(#fg${lv})"/><path d="M122 30c4 6 9 9 9 15a9 9 0 0 1-18 0c0-5 5-9 9-15z" fill="#fff6b0"/></g></g>`;
 const scarf=lv>=2?'<path d="M36 102q34 12 68 0l-1 9q-33 11-66 0z" fill="#3fb5ff"/><path d="M90 107l8 15-10-2-4-12z" fill="#1b8fd6"/>':'';
 const crown=lv>=3?'<path d="M52 18l7 10 11-14 11 14 7-10 2 17H50z" fill="#ffc23a" stroke="#e09a00" stroke-width="2" stroke-linejoin="round"/><circle cx="70" cy="26" r="2.6" fill="#ff5d9e"/>':'';
 const zzz=mood==='sleepy'?'<text x="104" y="34" font-family="Baloo 2" font-weight="800" font-size="16" fill="#3fb5ff">z</text><text x="114" y="22" font-family="Baloo 2" font-weight="800" font-size="12" fill="#3fb5ff">z</text>':'';
 const spark=mood==='joy'?'<path d="M14 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3zM8 90l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffc23a"/>':'';
 return `<svg width="${size}" height="${size*.93}" viewBox="0 0 150 140" aria-label="Huǒhuo, tu panda rojo">
  <defs><linearGradient id="fg${lv}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d2e"/><stop offset=".5" stop-color="#ff8a1f"/><stop offset="1" stop-color="#ffd23a"/></linearGradient></defs>
  <ellipse cx="72" cy="132" rx="44" ry="6" fill="#000" opacity=".12"/>
  <path d="M100 112c22-4 30-26 24-52" stroke="#c9531f" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M103 104l10-6M111 92l11-3M116 78l11 1" stroke="#7a3115" stroke-width="5" stroke-linecap="round"/>
  ${mood==='sleepy'?'':fire}
  <ellipse cx="70" cy="112" rx="34" ry="20" fill="#d9612a"/><ellipse cx="70" cy="116" rx="20" ry="12" fill="#5a2a18"/>
  <path d="M30 46l-6-24 24 10z" fill="#e8642c" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M110 46l6-24-24 10z" fill="#e8642c" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
  <ellipse cx="70" cy="70" rx="46" ry="38" fill="#e8642c"/>
  <ellipse cx="52" cy="56" rx="11" ry="7" fill="#fff8ee"/><ellipse cx="88" cy="56" rx="11" ry="7" fill="#fff8ee"/>
  <path d="M28 84q16 18 42 18t42-18q-8-6-20-4-10 4-22 4t-22-4q-12-2-20 4z" fill="#fff8ee"/>
  <path d="M50 75l-4 12M90 75l4 12" stroke="#b8441a" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="70" cy="79" rx="6" ry="4.5" fill="#2a1a14"/>
  <ellipse cx="38" cy="82" rx="7" ry="4.5" fill="#ff8f8f" opacity=".75"/><ellipse cx="102" cy="82" rx="7" ry="4.5" fill="#ff8f8f" opacity=".75"/>
  ${crown}${eyes}${mouth}${scarf}${zzz}${spark}</svg>`}

export const flame = (s = 34, c) => `<svg width="${s}" height="${s}" viewBox="0 0 96 96" aria-hidden="true"><path d="M48 8c6 14 24 22 24 42a24 24 0 0 1-48 0c0-12 6-18 12-24 0 8 4 13 8 13-2-12 0-22 4-31z" fill="${c || '#ff8a3d'}"/>${c ? '' : '<path d="M48 40c5 8 12 12 12 20a12 12 0 0 1-24 0c0-7 6-12 12-20z" fill="#ffc23a"/>'}</svg>`;
export const ice = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10"/></svg>`;
