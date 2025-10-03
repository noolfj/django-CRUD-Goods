(async function () {
  const grid = document.getElementById('grid');
  const status = document.getElementById('status');
  const search = document.getElementById('search');
  const typeFilter = document.getElementById('typeFilter');
  const sizeFilter = document.getElementById('sizeFilter');
  const clearBtn = document.getElementById('clearFilters');

  let allProducts = [];

  function formatMoney(x) {
    const n = Number(x);
    if (Number.isNaN(n)) return x;
    return n.toLocaleString('tj-TJ', { style: 'currency', currency: 'TJS' });
  }

  function render(items) {
    grid.innerHTML = '';
    if (!items.length) {
      status.textContent = 'Ничего не найдено.';
      status.classList.remove('error');
      status.hidden = false;
      grid.hidden = true;
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';

      const img = document.createElement('img');
      img.className = 'thumb';
      img.loading = 'lazy';
      img.alt = p.name || 'Фото товара';
      img.src = p.photo_url || '/static/placeholder.png';

      const body = document.createElement('div');
      body.className = 'body';

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = p.name;

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `
        <span>Тип: ${p.product_type}</span>
        <span>Размер: ${p.size}</span>
        <span>Цвет: ${p.color}</span>
      `;

      const price = document.createElement('div');
      price.className = 'price';
      const hasDiscount = p.discount_percent !== null && p.discount_percent !== undefined && Number(p.discount_percent) > 0;

      if (hasDiscount) {
        const oldP = document.createElement('span');
        oldP.className = 'old';
        oldP.textContent = formatMoney(p.price);
        const newP = document.createElement('span');
        newP.className = 'new';
        newP.textContent = formatMoney(p.price_after_discount);
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = `-${p.discount_percent}%`;
        price.appendChild(newP);
        price.appendChild(oldP);
        price.appendChild(tag);
      } else {
        const newP = document.createElement('span');
        newP.className = 'new';
        newP.textContent = formatMoney(p.price);
        price.appendChild(newP);
      }

      body.appendChild(title);
      if (p.description) {
        const desc = document.createElement('div');
        desc.className = 'desc';
        desc.textContent = p.description;
        desc.style.color = '#bcc6d7';
        desc.style.fontSize = '13px';
        desc.style.display = '-webkit-box';
        desc.style.webkitLineClamp = '3';
        desc.style.webkitBoxOrient = 'vertical';
        desc.style.overflow = 'hidden';
        body.appendChild(desc);
      }
      body.appendChild(meta);
      body.appendChild(price);

      card.appendChild(img);
      card.appendChild(body);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    status.hidden = true;
    grid.hidden = false;
  }

  function applyFilters() {
    const q = (search.value || '').trim().toLowerCase();
    const type = (typeFilter.value || '').toLowerCase();
    const size = (sizeFilter.value || '').toUpperCase();

    const filtered = allProducts.filter(p => {
      const okName = !q || (p.name && p.name.toLowerCase().includes(q));
      const okType = !type || (p.product_type && p.product_type.toLowerCase() === type);
      const okSize = !size || (p.size && p.size.toUpperCase() === size);
      return okName && okType && okSize;
    });
    render(filtered);
  }

  clearBtn.addEventListener('click', () => {
    search.value = '';
    typeFilter.value = '';
    sizeFilter.value = '';
    applyFilters();
  });

  [search, typeFilter, sizeFilter].forEach(el => el.addEventListener('input', applyFilters));

  // Загрузка данных
  try {
    status.textContent = 'Загрузка...';
    status.hidden = false;
    const res = await fetch(window.API_BASE, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // DRF без пагинации -> массив; с пагинацией -> { results: [...] }
    const items = Array.isArray(data) ? data : (data.results || []);
    allProducts = items;
    render(allProducts);
  } catch (e) {
    status.textContent = 'Ошибка загрузки товаров. Проверь API.';
    status.classList.add('error');
    grid.hidden = true;
  }
})();
