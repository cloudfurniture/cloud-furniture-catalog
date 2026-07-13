const grid = document.querySelector('#grid');
const statusEl = document.querySelector('#status');
const q = document.querySelector('#q');
const cat = document.querySelector('#cat');

let all = [];

const esc = (s) =>
  String(s || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

const chips = (s) =>
  (s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => `<span class="chip">${esc(x)}</span>`)
    .join('');

function render() {
  const text = q.value.toLowerCase();
  const selectedCategory = cat.value;

  const rows = all.filter((p) =>
    p.visible !== false &&
    (!text ||
      [p.name, p.category, p.description]
        .join(' ')
        .toLowerCase()
        .includes(text)) &&
    (!selectedCategory || p.category === selectedCategory)
  );

  grid.innerHTML = rows.map((p) => {
    const whatsappMessage = encodeURIComponent(
      `Greetings from Cloud Furniture! 👋
I am interested in the ${p.name}. Please share more details regarding availability and order.`
    );

    return `
      <article class="card">
        <img
          src="${p.image || 'https://placehold.co/800x600?text=Cloud+Furniture'}"
          alt="${esc(p.name)}"
        >

        <div class="body">
          <div class="muted">${esc(p.category)}</div>
          <h3>${esc(p.name)}</h3>
          <p class="muted">${esc(p.description || '')}</p>

          <div class="price">${money(p.price)}</div>

          <div class="chips">
            ${chips(p.sizes)}
            ${chips(p.colours)}
          </div>

          <a
            class="inq"
            href="https://wa.me/919123397611?text=${whatsappMessage}"
            target="_blank"
            rel="noopener"
          >
            Inquiry on WhatsApp
          </a>
        </div>
      </article>
    `;
  }).join('');

  statusEl.textContent = rows.length ? '' : 'No products found.';
}

fetch('/api/products')
  .then((response) => response.json())
  .then((data) => {
    all = data.products || [];

    [...new Set(all.map((item) => item.category).filter(Boolean))]
      .sort()
      .forEach((categoryName) => {
        cat.insertAdjacentHTML(
          'beforeend',
          `<option>${esc(categoryName)}</option>`
        );
      });

    render();
  })
  .catch(() => {
    statusEl.textContent = 'Unable to load products.';
  });

q.oninput = render;
cat.onchange = render;
