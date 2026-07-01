// 鼠标墨点跟随
document.addEventListener('mousemove', function(e){
  let dot = document.createElement('div');
  dot.style.cssText = `
    position:fixed;width:8px;height:8px;
    background:rgba(80,60,20,0.35);border-radius:50%;
    pointer-events:none;z-index:99999;
    left:${e.clientX}px;top:${e.clientY}px;
  `;
  document.body.appendChild(dot);
  setTimeout(()=> dot.style.opacity="0", 600);
  setTimeout(()=> dot.remove(), 600);
})