document.addEventListener('DOMContentLoaded', () => {

const PRODUCTS = [
  { id:"w1", cat:"wasser", title:"Mineralwasser Classic (1,5 L)", price:1.5, icon:"bubbles" },
  { id:"w2", cat:"wasser", title:"Mineralwasser Medium (1,5 L)", price:1.5, icon:"droplets" },
  { id:"w3", cat:"wasser", title:"Stillwasser (1,5 L)", price:1.5, icon:"waves" },
  { id:"s1", cat:"soft", title:"Cola (1,5 L)", price:2.9, icon:"cup-soda" },
  { id:"s2", cat:"soft", title:"Fanta (1,5 L)", price:2.9, icon:"cup-soda" },
  { id:"s3", cat:"soft", title:"Sprite (1,5 L)", price:2.9, icon:"cup-soda" },
  { id:"s4", cat:"soft", title:"Mezzo Mix (1,5 L)", price:2.9, icon:"cup-soda" },
  { id:"s5", cat:"soft", title:"Eistee Pfirsich (1,5 L)", price:2.9, icon:"cup-soda" },
  { id:"s6", cat:"soft", title:"Eistee Zitrone (1,5 L)", price:2.9, icon:"cup-soda" },
  { id:"j1", cat:"saft", title:"Orangensaft (1,0 L)", price:2.9, icon:"citrus" },
  { id:"j2", cat:"saft", title:"Multivitaminsaft (1,0 L)", price:2.9, icon:"apple" },
  { id:"j3", cat:"saft", title:"Apfelsaft naturtrüb (1,0 L)", price:2.9, icon:"apple" },
  { id:"j4", cat:"saft", title:"Traubensaft (1,0 L)", price:2.9, icon:"grape" },
  { id:"e1", cat:"energy", title:"Red Bull (0,25 L)", price:3.9, icon:"zap" },
  { id:"e2", cat:"energy", title:"Monster Energy (0,5 L)", price:3.9, icon:"battery-charging" },
  { id:"e3", cat:"energy", title:"Rockstar Energy (0,5 L)", price:3.9, icon:"zap" },
  { id:"e4", cat:"energy", title:"Effect Energy (0,25 L)", price:3.9, icon:"bolt" },
  { id:"sal1", cat:"salziges", title:"Chips Paprika (200 g)", price:2.5, icon:"package" },
  { id:"sal2", cat:"salziges", title:"Chips gesalzen (200 g)", price:2.5, icon:"package" },
  { id:"sal3", cat:"salziges", title:"Erdnüsse geröstet (200 g)", price:2.5, icon:"nut" },
  { id:"sal4", cat:"salziges", title:"Salzstangen (150 g)", price:1.5, icon:"bread" },
  { id:"sue1", cat:"suess", title:"Schokoriegel Snickers", price:2.9, icon:"grid-3x3" },
  { id:"sue2", cat:"suess", title:"Kaugummi", price:1.5, icon:"candy" },
  { id:"sue3", cat:"suess", title:"Cookies Kekse", price:2.5, icon:"cookie" },
  { id:"sue4", cat:"suess", title:"Haribo", price:2.5, icon:"smile" }
];

const TAX = 0.19;
const DELIVERY = 1.90;
const MIN_ORDER = 15.0;

let state = { cat:'wasser', cart: JSON.parse(localStorage.getItem('cart')||'{}'), q:'' };

const grid = document.getElementById('grid');
const tabs = document.getElementById('tabs');
const search = document.getElementById('search');
const clearSearch = document.getElementById('clearSearch');
const searchInfo = document.getElementById('searchInfo');
const cartbar = document.getElementById('cartbar');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const drawer = document.getElementById('drawer');
const viewCart = document.getElementById('viewCart');
const viewForm = document.getElementById('viewForm');
const tabCart = document.getElementById('tabCart');
const tabData = document.getElementById('tabData');
const closeDrawer = document.getElementById('closeDrawer');
const openCartBtn = document.getElementById('openCart');
const openCheckout = document.getElementById('openCheckout');
const openCheckoutTop = document.getElementById('openCheckoutTop');
const toData = document.getElementById('toData');
const cartList = document.getElementById('cartList');
const cartSummaryRows = document.getElementById('cartSummaryRows');
const checkoutForm = document.getElementById('checkoutForm');
const plzInput = document.getElementById('zipcode');
const plzError = document.getElementById('plzError');

function format(n){ return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n); }

function lockScroll(lock){ document.documentElement.style.overflow=lock?'hidden':''; document.body.style.overflow=lock?'hidden':''; }

function filteredProducts(){
  const q = state.q;
  if(q){ return PRODUCTS.filter(p=>p.title.toLowerCase().includes(q)); }
  return PRODUCTS.filter(p=>p.cat===state.cat);
}

function renderGrid(){
  const items = filteredProducts();
  grid.innerHTML = '';
  if(items.length===0){
    grid.innerHTML=`<div class="chip" style="background:#fff"><i data-lucide="info"></i> Keine Treffer.</div>`;
    lucide.createIcons();
    updateSearchInfo(0);
    return;
  }
  items.forEach(p=>{
    const card=document.createElement('article');
    card.className='card';
    card.innerHTML=`
      <div class="thumb"><i data-lucide="${p.icon}" class="icon"></i></div>
      <div class="body">
        <div>
          <div class="title">${p.title}</div>
          <div class="price">${format(p.price)}</div>
        </div>
        <button class="add-btn" data-id="${p.id}"><i data-lucide="plus"></i></button>
      </div>`;
    grid.appendChild(card);
  });
  lucide.createIcons();
  grid.querySelectorAll('.add-btn').forEach(btn=>btn.addEventListener('click',onAdd));
  updateSearchInfo(items.length);
}

function updateSearchInfo(count){
  if(state.q){ searchInfo.textContent = `${count} Treffer für „${state.q}“ – Kategorien werden ignoriert.`; }
  else { searchInfo.textContent = ''; }
}

// ===== Tabs =====
tabs.addEventListener('click', e=>{
  const b=e.target.closest('.tab'); if(!b) return;
  tabs.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected','false'));
  b.setAttribute('aria-selected','true');
  state.cat=b.dataset.cat;
  renderGrid();
  if(state.q){ state.q=''; search.value=''; updateSearchInfo(0); }
});

search?.addEventListener('input', ()=>{ state.q=search.value.trim().toLowerCase(); renderGrid(); });
clearSearch?.addEventListener('click', ()=>{ state.q=''; search.value=''; renderGrid(); search.focus(); });

// ===== Warenkorb =====
function onAdd(e){
  const id=e.currentTarget.dataset.id;
  const prod=PRODUCTS.find(p=>p.id===id);
  if(!state.cart[id]) state.cart[id]={ qty:0, ...prod };
  state.cart[id].qty++;
  updateCartUI();
  openDrawer();
}

function addQty(id, delta){
  const line=state.cart[id]; if(!line) return;
  line.qty=Math.max(0,line.qty+delta);
  if(line.qty===0) delete state.cart[id];
  updateCartUI();
}
window.addQty=addQty;

// ===== Drawer =====
function setSegment(seg){
  const mobile=window.matchMedia('(max-width:900px)').matches;
  tabCart.classList.toggle('active',seg==='cart');
  tabData.classList.toggle('active',seg==='data');
  tabCart.setAttribute('aria-selected',seg==='cart');
  tabData.setAttribute('aria-selected',seg==='data');
  if(mobile){ viewCart.classList.toggle('hidden',seg!=='cart'); viewForm.classList.toggle('hidden',seg!=='data'); }
  else{ viewCart.classList.remove('hidden'); viewForm.classList.remove('hidden'); }
}

function openDrawer(seg='cart'){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); lockScroll(true); setSegment(seg); }
function closeDrawerFn(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); lockScroll(false); }

openCartBtn?.addEventListener('click',()=>openDrawer('cart'));
openCheckout?.addEventListener('click',()=>openDrawer('data'));
openCheckoutTop?.addEventListener('click',()=>openDrawer('data'));
toData.addEventListener('click',()=>setSegment('data'));
tabCart.addEventListener('click',()=>setSegment('cart'));
tabData.addEventListener('click',()=>setSegment('data'));
closeDrawer.addEventListener('click',closeDrawerFn);
drawer.addEventListener('click', e=>{ if(e.target===drawer) closeDrawerFn(); });

function updateCartUI(){
  const lines=Object.values(state.cart);
  const count=lines.reduce((s,l)=>s+l.qty,0);
  const subtotal=lines.reduce((s,l)=>s+l.qty*l.price,0);
  const tax=subtotal*TAX;
  const total=subtotal+tax+(subtotal>0?DELIVERY:0);

  cartCount.textContent=count;
  cartTotal.textContent=format(total);

  if(count>0){ cartbar.style.display='block'; document.body.classList.add('has-cartbar'); }
  else{ cartbar.style.display='none'; document.body.classList.remove('has-cartbar'); }

  cartList.innerHTML=count===0
    ? `<div class="chip" style="background:#fff"><i data-lucide="info"></i><span>Ihr Warenkorb ist leer</span></div>`
    : lines.map(l=>`
      <div class="cart-item">
        <div>${l.title}</div>
        <div class="qtyctrl">
          <button aria-label="entfernen" onclick="addQty('${l.id}',-1)">−</button>
          <span>${l.qty}</span>
          <button aria-label="hinzufügen" onclick="addQty('${l.id}',1)">+</button>
        </div>
        <div class="lineprice">${format(l.qty*l.price)}</div>
      </div>`).join('');

  cartSummaryRows.innerHTML=`<div>Zwischensumme: <strong>${format(subtotal)}</strong></div>
    <div>Steuer (19%): <strong>${format(tax)}</strong></div>
    <div>Lieferung: <strong>${format(subtotal>0?DELIVERY:0)}</strong></div>
    <div style="margin-top:6px;font-size:1.05rem"><strong>Gesamt: ${format(total)}</strong></div>
    ${subtotal < MIN_ORDER && subtotal>0 ? `<div style="color:#b91c1c;font-weight:800;margin-top:4px">Mindestbestellwert ${format(MIN_ORDER)}!</div>` : ``}`;

  document.getElementById('orderDetails').value = lines.map(l=>`${l.qty}× ${l.title} = ${format(l.qty*l.price)}`).join(' | ') + (lines.length?' | ':'') + `Gesamt: ${format(total)}`;
  localStorage.setItem('cart', JSON.stringify(state.cart));
  lucide.createIcons();
}

// ===== PLZ-Validierung =====
function validPLZ(v){ const m=v.match(/\b(\d{5})\b/); if(!m) return false; return /^80\d{3}$/.test(m[1]); }

checkoutForm.addEventListener('submit', e=>{
  const subtotal=Object.values(state.cart).reduce((s,l)=>s+l.qty*l.price,0);
  if(subtotal<MIN_ORDER){ alert(`Mindestbestellwert ${format(MIN_ORDER)} nicht erreicht.`); e.preventDefault(); return; }
  if(Object.values(state.cart).length===0){ alert('Bitte fügen Sie Produkte hinzu.'); e.preventDefault(); return; }
  if(!validPLZ(plzInput.value.trim())){ plzError.style.display='block'; e.preventDefault(); }
  else{ plzError.style.display='none'; closeDrawerFn(); }
});
plzInput.addEventListener('input', ()=>{ if(plzError.style.display==='block') plzError.style.display='none'; });

renderGrid();
updateCartUI();
lucide.createIcons();

});
