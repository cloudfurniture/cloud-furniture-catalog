const grid = document.querySelector('#grid');
const statusEl = document.querySelector('#status');
const q = document.querySelector('#q');
const cat = document.querySelector('#cat');
const modal = document.querySelector('#productModal');
let all = [];
let activeProduct = null;

const esc = s => String(s || '').replace(/[&<>"']/g, m => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]));

const money = n => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(Number(n) || 0);

const list = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
const chips = s => list(s).map(x => `<span class="chip">${esc(x)}</span>`).join('');

function productUrl(product) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = `product=${encodeURIComponent(product.id)}`;
  return url.toString();
}

function render() {
  const text = q.value.trim().toLowerCase();
  const selectedCategory = cat.value;
  const rows = all.filter(p => p.visible !== false
    && (!text || [p.name, p.category].join(' ').toLowerCase().includes(text))
    && (!selectedCategory || p.category === selectedCategory));

  grid.innerHTML = rows.map(p => `
    <article class="card" tabindex="0" role="button" data-product-id="${esc(p.id)}" aria-label="View ${esc(p.name)} details">
      <img loading="lazy" src="${esc(p.image || 'https://placehold.co/800x600?text=Cloud+Furniture')}" alt="${esc(p.name)}">
      <div class="body">
        <div class="muted">${esc(p.category)}</div>
        <h3>${esc(p.name)}</h3>
        <div class="starting-label">Starting From</div>
        <div class="price">${money(p.price)}</div>
        ${p.sizes ? `<div class="card-sizes">Sizes: ${esc(list(p.sizes).join(' • '))}</div>` : ''}
        <span class="view-link">View Details →</span>
      </div>
    </article>`).join('');

  statusEl.textContent = rows.length ? '' : 'No products found.';
}

function openProduct(product, updateHash = true) {
  if (!product) return;
  activeProduct = product;
  document.querySelector('#detailImage').src = product.image || 'https://placehold.co/1000x750?text=Cloud+Furniture';
  document.querySelector('#detailImage').alt = product.name || 'Cloud Furniture product';
  document.querySelector('#detailCategory').textContent = product.category || '';
  document.querySelector('#detailName').textContent = product.name || '';
  document.querySelector('#detailPrice').innerHTML = `<small>Starting From</small>${money(product.price)}`;
  document.querySelector('#detailSizes').innerHTML = chips(product.sizes) || '<span class="muted">Ask your dealer for available sizes.</span>';
  document.querySelector('#copyMsg').textContent = '';
  modal.hidden = false;
  document.body.classList.add('modal-open');
  if (updateHash) history.replaceState(null, '', `#product=${encodeURIComponent(product.id)}`);
  setTimeout(() => document.querySelector('.modal-close').focus(), 0);
}

function closeProduct(updateHash = true) {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  activeProduct = null;
  if (updateHash && location.hash.startsWith('#product=')) history.replaceState(null, '', location.pathname + location.search);
}

function openFromHash() {
  if (!location.hash.startsWith('#product=')) return;
  const id = decodeURIComponent(location.hash.slice('#product='.length));
  const product = all.find(p => p.id === id);
  if (product) openProduct(product, false);
}

grid.addEventListener('click', e => {
  const card = e.target.closest('[data-product-id]');
  if (card) openProduct(all.find(p => p.id === card.dataset.productId));
});

grid.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('[data-product-id]');
  if (!card) return;
  e.preventDefault();
  openProduct(all.find(p => p.id === card.dataset.productId));
});

document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', () => closeProduct()));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeProduct(); });
window.addEventListener('hashchange', () => location.hash.startsWith('#product=') ? openFromHash() : closeProduct(false));

document.querySelector('#copyLink').addEventListener('click', async () => {
  if (!activeProduct) return;
  const msg = document.querySelector('#copyMsg');
  try {
    await navigator.clipboard.writeText(productUrl(activeProduct));
    msg.textContent = 'Product link copied.';
  } catch {
    msg.textContent = 'Copy the link from your browser address bar.';
  }
});

fetch('/api/products')
  .then(r => r.json())
  .then(d => {
    all = d.products || [];
    [...new Set(all.map(x => x.category).filter(Boolean))].sort().forEach(c => {
      cat.insertAdjacentHTML('beforeend', `<option value="${esc(c)}">${esc(c)}</option>`);
    });
    render();
    openFromHash();
  })
  .catch(() => statusEl.textContent = 'Unable to load products.');

q.addEventListener('input', render);
cat.addEventListener('change', render);
