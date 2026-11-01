'use strict';
const MATERIALS = { holografico: 'Holográfico', papel: 'Papel', plastico: 'Plástico blanco' };
const KEY = 'stickermania.catalog.v1', CART_KEY = 'stickermania.cart.v1';
const money = n => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => globalThis.crypto?.randomUUID?.() || `st-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const safeImage = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const samples = [
 ['Flor con flow','Una flor para alegrar tus días.','✿','#e9dfef'],
 ['Buena cara','Un recordatorio de buscar el lado bonito.','☺','#e8edda'],
 ['Amor del bueno','Pequeñas dosis de amor para llevar.','♥','#f1dfdf'],
 ['Energía bonita','Un rayo de actitud para tus favoritos.','ϟ','#efe8d8'],
 ['Estrella de tu mundo','Brilla a tu manera, todos los días.','✦','#e0e6f0'],
 ['Flower power','Un jardín de ideas para tu cuaderno.','❀','#e8e5d7'],
 ['Corazón creativo','Para quienes hacen todo con corazón.','♡','#ede0e9'],
 ['Un toque de magia','Haz extraordinarias las cosas pequeñas.','✳','#e0e9e4']
].map(([name,description,symbol,color],i)=>({id:`demo-${i}`,name,description,symbol,color,image:'',demo:true,prices:{holografico:5000,papel:2500,plastico:3500}}));
let products = [], cart = [], filter = 'all', editing = null, toastTimer;
function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800); }
function validateProduct(p, allowDemo=false) {
 if (!p || typeof p !== 'object') throw new Error('Cada sticker debe ser un objeto.');
 const name=String(p.name||'').trim(), description=String(p.description||'').trim(), image=String(p.image||'').trim();
 if (!name || name.length>100 || !description || description.length>500) throw new Error('Completa nombre (máximo 100 caracteres) y descripción (máximo 500).');
 if (!(allowDemo && p.demo) && !safeImage(image)) throw new Error('La imagen debe tener un enlace HTTPS público y directo.');
 const prices={};
 for (const key of Object.keys(MATERIALS)) {
  const v=p.prices?.[key]; if (v === '' || v === null || v === undefined) continue;
  const n=Number(v); if (!Number.isSafeInteger(n) || n<=0 || n>100000000) throw new Error('Los precios deben ser enteros entre 1 y 100.000.000 COP.'); prices[key]=n;
 }
 if (!Object.keys(prices).length) throw new Error('Indica el precio de al menos un material.');
 const result={id:typeof p.id==='string'&&p.id?p.id:uid(),name,description,image,prices};
 if(allowDemo && p.demo) Object.assign(result,{demo:true,symbol:String(p.symbol||'✦'),color:/^#[0-9a-f]{6}$/i.test(p.color)?p.color:'#e8e5df'});
 return result;
}
function validateCatalog(data,allowDemo=false) {
 if(!Array.isArray(data)||data.length>5000) throw new Error('El catálogo debe ser una lista de hasta 5000 stickers.');
 const checked=data.map(p=>validateProduct(p,allowDemo));
 if(new Set(checked.map(p=>p.id)).size!==checked.length) throw new Error('El catálogo contiene identificadores duplicados.');
 return checked;
}
function persist(next) { localStorage.setItem(KEY,JSON.stringify(next)); products=next; }
function imageMarkup(p) { return p.demo?`<span class="sample">${esc(p.symbol)}</span>`:`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer">`; }
function handleImageErrors(root) { root.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const fallback=document.createElement('span');fallback.textContent='Imagen no disponible';fallback.className='muted';img.replaceWith(fallback);},{once:true})); }
function renderProducts() {
 const query=$('#search').value.trim().toLocaleLowerCase('es');
 const shown=products.filter(p=>(filter==='all'||p.prices[filter])&&`${p.name} ${p.description}`.toLocaleLowerCase('es').includes(query));
 $('#products').innerHTML=shown.map(p=>{const keys=Object.keys(MATERIALS).filter(k=>p.prices[k]);const selected=filter==='all'?keys[0]:filter;
 return `<article class="product" data-id="${esc(p.id)}"><div class="product-art" style="background:${p.demo?p.color:'#eeede6'}">${imageMarkup(p)}<span class="tag">${p.demo?'COLECCIÓN DE MUESTRA':'HECHO PARA TI'}</span></div><h3><button class="product-detail-link" data-details="${esc(p.id)}">${esc(p.name)} ↗</button></h3><p>${esc(p.description)}</p><select aria-label="Material de ${esc(p.name)}">${keys.map(k=>`<option value="${k}" ${k===selected?'selected':''}>${MATERIALS[k]}</option>`).join('')}</select><div class="product-bottom"><strong>${money(p.prices[selected])}</strong><button class="add" aria-label="Agregar ${esc(p.name)} a la bolsa">+</button></div></article>`;}).join('');
 $('#empty').hidden=!!shown.length; $('#demo-note').hidden=!products.some(p=>p.demo); handleImageErrors($('#products'));
}
function reconcileCart() { cart=cart.filter(row=>products.some(p=>p.id===row.id&&p.prices[row.material])).map(row=>({...row,quantity:Math.max(1,Math.min(999,Math.floor(Number(row.quantity))||1))})); }
function saveCart() { try{localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch{toast('No se pudo guardar la bolsa en este navegador.');} $('#cart-count').textContent=cart.reduce((n,r)=>n+r.quantity,0); }
function renderCart() {
 reconcileCart(); saveCart();
 $('#cart-items').innerHTML=cart.length?cart.map((r,i)=>{const p=products.find(p=>p.id===r.id);return `<div class="cart-row"><div><h3>${esc(p.name)}</h3><small>${MATERIALS[r.material]} · ${money(p.prices[r.material])} c/u</small><div class="quantity"><button data-action="minus" data-index="${i}" aria-label="Quitar una unidad de ${esc(p.name)}">−</button><span>${r.quantity}</span><button data-action="plus" data-index="${i}" aria-label="Añadir una unidad de ${esc(p.name)}">+</button><button class="remove" data-action="remove" data-index="${i}">Quitar</button></div></div><strong>${money(p.prices[r.material]*r.quantity)}</strong></div>`;}).join(''):'<p class="muted">Tu bolsa espera un poquito de personalidad. Agrega tus favoritos ✦</p>';
 $('#cart-total').textContent=money(cart.reduce((n,r)=>n+products.find(p=>p.id===r.id).prices[r.material]*r.quantity,0)); $('#checkout').disabled=!cart.length;
}
function checkoutMessage() {
 const lines=['¡Hola, StickerManiaCol! ✦ Quiero hacer este pedido:',''];
 if($('#customer-name').value.trim()) lines.push(`Nombre: ${$('#customer-name').value.trim()}`,'');
 let total=0;
 for(const r of cart){const p=products.find(p=>p.id===r.id);const subtotal=p.prices[r.material]*r.quantity;total+=subtotal;lines.push(`• ${p.name} | ${MATERIALS[r.material]} | Cantidad: ${r.quantity} | ${money(p.prices[r.material])} c/u | Subtotal: ${money(subtotal)}`);}
 lines.push('',`Total de productos: ${money(total)}`,'Envío, disponibilidad y pago por confirmar.');
 if($('#order-notes').value.trim()) lines.push('',`Notas: ${$('#order-notes').value.trim()}`);
 return lines.join('\n');
}
function setupStore() {
 try{const stored=JSON.parse(localStorage.getItem(CART_KEY)||'[]');cart=Array.isArray(stored)?stored.filter(r=>r&&typeof r.id==='string'&&Object.hasOwn(MATERIALS,r.material)):[];}catch{cart=[];}
 renderProducts();renderCart(); $('#year').textContent=new Date().getFullYear();
 $('#search').addEventListener('input',renderProducts);
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderProducts();}));
 $('#products').addEventListener('change',e=>{if(e.target.matches('select')){const p=products.find(p=>p.id===e.target.closest('article').dataset.id);e.target.closest('article').querySelector('strong').textContent=money(p.prices[e.target.value]);}});
 $('#products').addEventListener('click',e=>{if(!e.target.closest('.add'))return;const card=e.target.closest('article');const id=card.dataset.id,material=card.querySelector('select').value;const existing=cart.find(r=>r.id===id&&r.material===material);if(existing){existing.quantity=Math.min(999,existing.quantity+1);}else cart.push({id,material,quantity:1});renderCart();toast('Un poquito más de onda en tu bolsa ✦');});
 $('#cart-open').addEventListener('click',()=>$('#cart').showModal());$('#cart-close').addEventListener('click',()=>$('#cart').close());
 $('#cart-items').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const i=Number(b.dataset.index),r=cart[i];if(!r)return;if(b.dataset.action==='remove'||b.dataset.action==='minus'&&r.quantity===1)cart.splice(i,1);else r.quantity=Math.max(1,Math.min(999,r.quantity+(b.dataset.action==='plus'?1:-1)));renderCart();});
 $('#checkout').addEventListener('click',()=>{if(!cart.length)return;const url=`https://wa.me/573126611414?text=${encodeURIComponent(checkoutMessage())}`;window.open(url,'_blank','noopener,noreferrer');});
}
function resetForm() {editing=null;$('#product-form').reset();$('#form-title').textContent='Agregar un sticker';$('#cancel-edit').hidden=true;$('#form-error').textContent='';}
function renderAdmin() {
 $('#admin-count').textContent=`(${products.length})`;
 $('#admin-list').innerHTML=products.length?products.map(p=>`<div class="admin-list-row"><div class="row-info">${p.demo?`<span class="sample">${esc(p.symbol)}</span>`:`<img class="admin-preview" src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`}<div><strong>${esc(p.name)}</strong><p>${Object.keys(MATERIALS).filter(k=>p.prices[k]).map(k=>`${MATERIALS[k]}: ${money(p.prices[k])}`).join(' · ')}${p.demo?' · Ejemplo':''}</p></div></div><div><button data-edit="${esc(p.id)}">Editar</button> <button data-delete="${esc(p.id)}">Eliminar</button></div></div>`).join(''):'<p class="muted">Tu catálogo está vacío. Agrega tu primer diseño.</p>';handleImageErrors($('#admin-list'));
}
function addBulkRow(values=[]) {
 const tr=document.createElement('tr');tr.innerHTML=['Nombre','URL de imagen','Descripción','Holográfico','Papel','Plástico blanco'].map((label,i)=>`<td><input aria-label="${label}" ${i>2?'type="number" min="1" step="1"':i===1?'type="url"':'type="text"'} value="${esc(values[i]||'')}"></td>`).join('')+'<td><button aria-label="Eliminar fila">✕</button></td>';tr.querySelector('button').addEventListener('click',()=>tr.remove());$('#bulk-rows').append(tr);
}
function parseCSV(text) {
 const rows=[];let row=[],field='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}else field+=c;}
 if(quoted)throw new Error('El CSV contiene comillas sin cerrar.');row.push(field);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
function download(filename,data){const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function setupAdmin() {
 renderAdmin();
 $('#product-form').addEventListener('submit',e=>{e.preventDefault();try{const f=new FormData(e.target);const p=validateProduct({id:editing||uid(),name:f.get('name'),image:f.get('image'),description:f.get('description'),prices:Object.fromEntries(Object.keys(MATERIALS).map(k=>[k,f.get(k)]))});const next=editing?products.map(x=>x.id===editing?p:x):[...products,p];persist(next);resetForm();renderAdmin();toast('Sticker guardado en este navegador');}catch(error){$('#form-error').textContent=error.message;}});
 $('#cancel-edit').addEventListener('click',resetForm);
 $('#admin-list').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.delete){const p=products.find(p=>p.id===b.dataset.delete);if(confirm(`¿Eliminar «${p.name}» del catálogo local?`)){try{persist(products.filter(x=>x.id!==p.id));if(editing===p.id)resetForm();renderAdmin();toast('Sticker eliminado');}catch(error){toast(error.message);}}}if(b.dataset.edit){const p=products.find(p=>p.id===b.dataset.edit);editing=p.id;const form=$('#product-form');for(const k of ['name','image','description'])form.elements[k].value=p[k];for(const k of Object.keys(MATERIALS))form.elements[k].value=p.prices[k]||'';$('#form-title').textContent=`Editar: ${p.name}`;$('#cancel-edit').hidden=false;form.scrollIntoView({behavior:'smooth',block:'center'});}});
 $('#add-row').addEventListener('click',()=>addBulkRow());
 $('#prepare-bulk').addEventListener('click',()=>{const links=$('#bulk-links').value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);if(!links.length){toast('Pega al menos un enlace de imagen');return;}if(links.length>500){toast('Agrega hasta 500 enlaces por carga');return;}const prices=Object.keys(MATERIALS).map(k=>$(`#default-${k}`).value);links.forEach(url=>addBulkRow(['',url,'',...prices]));$('#bulk-links').value='';$('#bulk-status').textContent=`${links.length} filas creadas. Completa nombres y descripciones antes de guardar.`;});
 $('#save-bulk').addEventListener('click',()=>{const rows=[...$('#bulk-rows').rows];if(!rows.length){toast('Agrega filas antes de guardar');return;}try{const additions=rows.map((row,i)=>{const v=[...row.querySelectorAll('input')].map(x=>x.value.trim());try{return validateProduct({name:v[0],image:v[1],description:v[2],prices:{holografico:v[3],papel:v[4],plastico:v[5]}});}catch(error){throw new Error(`Fila ${i+1}: ${error.message}`);}});persist([...products,...additions]);$('#bulk-rows').replaceChildren();renderAdmin();$('#bulk-status').textContent=`${additions.length} stickers guardados correctamente en este navegador.`;toast('Carga masiva completada ✦');}catch(error){$('#bulk-status').textContent=error.message;}});
 $('#csv-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>3000000)throw new Error('El CSV debe pesar menos de 3 MB.');const rows=parseCSV(await file.text());const expected=['nombre','imagen','descripcion','holografico','papel','plastico'];const header=rows.shift()?.map(x=>x.trim().toLowerCase());if(!header||expected.some((x,i)=>header[i]!==x)||header.length!==6)throw new Error('Usa las seis columnas indicadas y separa los campos con comas.');if(rows.length>500)throw new Error('Importa hasta 500 filas por carga.');if(rows.some(r=>r.length!==6))throw new Error('Cada fila debe tener seis columnas.');rows.forEach(addBulkRow);$('#bulk-status').textContent=`${rows.length} filas importadas para revisar. Presiona Guardar todos para incorporarlas al catálogo.`;}catch(error){$('#bulk-status').textContent=error.message;}e.target.value='';});
 $('#export').addEventListener('click',()=>{download('catalog.json',JSON.stringify(products,null,2));toast('Catálogo exportado');});
 $('#json-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10000000)throw new Error('El archivo debe pesar menos de 10 MB.');const next=validateCatalog(JSON.parse(await file.text()),true);if(confirm(`¿Reemplazar el catálogo local por los ${next.length} stickers del archivo?`)){persist(next);resetForm();renderAdmin();toast('Catálogo importado');}}catch(error){toast(`No se importó: ${error.message}`);}e.target.value='';});
 $('#use-published').addEventListener('click',()=>{if(confirm('¿Descartar el catálogo local y volver a cargar el publicado? Exporta primero para conservar tus cambios.')){try{localStorage.removeItem(KEY);location.reload();}catch(error){toast(error.message);}}});
}
async function init() {
 let local=null;try{local=localStorage.getItem(KEY);}catch{}
 if(local!==null){try{products=validateCatalog(JSON.parse(local),true);}catch{toast('El catálogo local no se pudo leer; se cargará el publicado.');local=null;}}
 if(local===null){try{const response=await fetch('catalog.json',{cache:'no-cache'});if(!response.ok)throw new Error('Catálogo no disponible');products=validateCatalog(await response.json(),true);}catch{products=samples;toast('Mostrando colección de muestra. No se pudo cargar el catálogo.');}}
 if(document.body.dataset.admin)setupAdmin();else setupStore();
}
if(typeof document!=='undefined')init();
if(typeof module!=='undefined')module.exports={validateProduct,validateCatalog,parseCSV,safeImage,samples};
