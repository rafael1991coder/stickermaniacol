'use strict';
let surpriseRunning = false, surpriseProduct = null, detailProduct = null;
function showStickerDetails(id) {
 const p = products.find(p => p.id === id);
 if (!p) return;
 detailProduct = p;
 const keys = Object.keys(MATERIALS).filter(k => p.prices[k]);
 $('#detail-title').textContent = p.name;
 $('#detail-description').textContent = p.description;
 $('#detail-art').innerHTML = imageMarkup(p);
 $('#detail-art').style.background = p.demo ? p.color : '#eee8fa';
 handleImageErrors($('#detail-art'));
 $('#detail-material').innerHTML = keys.map(k => `<option value="${k}">${MATERIALS[k]} · ${money(p.prices[k])}</option>`).join('');
 $('#detail-price').textContent = money(p.prices[keys[0]]);
 $('#detail-demo').hidden = !p.demo;
 $('#sticker-detail').showModal();
}
function previewSurprise(p) {
 $('#surprise-preview').innerHTML = imageMarkup(p);
 $('#surprise-preview').style.background = p.demo ? p.color : '#f3eefe';
 $('#surprise-name').textContent = p.name;
 handleImageErrors($('#surprise-preview'));
}
function pickRandomSticker() {
 if (surpriseRunning) return;
 if (!products.length) { $('#surprise-status').textContent = 'Pronto habrá stickers para descubrir. Vuelve cuando tengamos diseños disponibles.'; return; }
 // Cada sticker tiene la misma probabilidad, incluso si hay filtros activos.
 const pool = [...products];
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const winner = pool[Math.floor(Math.random()*pool.length)];
 surpriseRunning = true; surpriseProduct = null;
 $('#surprise-start').disabled = true; $('#surprise-result').disabled = true;
 $('#surprise-start').textContent = 'Buscando tu match…';
 $('#surprise-status').textContent = 'Recorriendo la colección… En unos segundos tendrás tu sticker.';
 $('#surprise-stage').classList.add('is-spinning');
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let step=0;
 const start=performance.now();
 function frame() {
  const elapsed=performance.now()-start;
  if(elapsed>=3600){
   surpriseProduct=winner;previewSurprise(winner);surpriseRunning=false;
   $('#surprise-stage').classList.remove('is-spinning');
   $('#surprise-result').disabled=false;$('#surprise-start').disabled=false;
   $('#surprise-start').textContent='Probar otra vez ↻';
   $('#surprise-status').textContent=`¡Tu match es ${winner.name}! Toca el sticker o abre sus detalles.`;
   return;
  }
  if(!reduced || step===0) previewSurprise(pool[step++%pool.length]);
  setTimeout(frame, reduced ? 3600 : 90+210*Math.pow(elapsed/3600,2));
 }
 frame();
}
$('#surprise-start').addEventListener('click',pickRandomSticker);
$('#surprise-result').addEventListener('click',()=>{if(surpriseProduct&&!surpriseRunning)showStickerDetails(surpriseProduct.id);});
$('#surprise-preview').addEventListener('click',()=>{if(surpriseProduct&&!surpriseRunning)showStickerDetails(surpriseProduct.id);});
$('#detail-close').addEventListener('click',()=>$('#sticker-detail').close());
$('#detail-material').addEventListener('change',()=>{if(detailProduct)$('#detail-price').textContent=money(detailProduct.prices[$('#detail-material').value]);});
$('#detail-add').addEventListener('click',()=>{
 if(!detailProduct)return;
 const material=$('#detail-material').value;
 const existing=cart.find(r=>r.id===detailProduct.id&&r.material===material);
 if(existing)existing.quantity=Math.min(999,existing.quantity+1);
 else cart.push({id:detailProduct.id,material,quantity:1});
 renderCart();$('#sticker-detail').close();toast('Sticker agregado a tu bolsa ✦');
});
$('#products').addEventListener('click',e=>{const button=e.target.closest('[data-details]');if(button)showStickerDetails(button.dataset.details);});
