export interface GameTemplate {
  id: string;
  title: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

export const templates: GameTemplate[] = [
  {
    id: "clicker",
    title: "Classic Clicker",
    description: "Simple clicker game to increment a counter.",
    html: `<div id="game-container"><button id="click-btn">Click Me</button><p id="count">0</p></div>`,
    css: `#game-container{display:flex;flex-direction:column;align-items:center;margin-top:50px;}#click-btn{padding:10px 20px;font-size:20px;}#count{margin-top:10px;font-size:24px;}`,
    js: `document.addEventListener('DOMContentLoaded',function(){let count=0;const btn=document.getElementById('click-btn');const p=document.getElementById('count');btn.addEventListener('click',function(){count++;p.textContent=String(count);});});`,
  },
  {
    id: "idle",
    title: "Idle Resource",
    description: "Generates resources over time with upgrades.",
    html: `<div id="game-container"><p id="resources">0</p><button id="upgrade">Upgrade (cost 10)</button></div>`,
    css: `#game-container{display:flex;flex-direction:column;align-items:center;margin-top:50px;}#upgrade{margin-top:10px;}`,
    js: `document.addEventListener('DOMContentLoaded',function(){let resources=0;let rate=1;const p=document.getElementById('resources');const up=document.getElementById('upgrade');function tick(){resources+=rate;p.textContent=String(resources);requestAnimationFrame(tick);}tick();up.addEventListener('click',function(){if(resources>=10){resources-=10;rate++;}});});`,
  },
];
