/**
 * DOCES DA LU — App Principal
 * Loja Virtual de Ovos de Páscoa
 */

/* =====================================================
   CONSTANTES DE FRETE
   ===================================================== */
const SHIPPING_FEE = 10;   // R$10 por padrão
const FREE_SHIPPING_MIN_QTY = 2;    // Grátis a partir de 2 ovos (2 ou mais)

/* =====================================================
   ESTADO GLOBAL
   ===================================================== */
let products = [];
let config = {};
let cart = [];
let currentProduct = null;
let currentQty = 1;
let paymentMethod = 'pix';
let isPickup = false;

/* =====================================================
   INIT
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa o UI para não deixar a tela "travada"
  initParticles();
  initNavbar();
  initHeroParallax();
  initChocoParticles();
  initReveal();
  initCart();
  initModal();
  initCheckout();
  initOrderLookup();
  duplicateBanner();

  // 2. Busca e renderiza os dados
  fetchAndRender();
});

async function fetchAndRender() {
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.innerHTML = `
      <div style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem 1rem;">
        <div style="font-size: 3rem; display: inline-block; animation: bounce 0.8s infinite alternate ease-in-out;">🚚</div>
        <p style="color: var(--text-mid); margin-top: 1rem; font-weight: 600;">Preparando a vitrine...</p>
      </div>
      <style>@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-15px); } }</style>
    `;
  }

  products = await STORE.loadProducts();
  config = await STORE.loadConfig();

  applyConfig();
  renderProducts();
}

/* =====================================================
   APLICAR CONFIG
   ===================================================== */
async function applyConfig() {
  config = await STORE.loadConfig();
  const wa = document.getElementById('whatsapp-btn');
  if (wa) wa.href = `https://wa.me/${config.whatsapp}?text=Olá! Quero fazer um pedido de Ovos de Páscoa da ${config.storeName}!`;
  const ig = document.getElementById('instagram-btn');
  if (ig) ig.href = `https://instagram.com/${config.instagram}`;
  const pixD = document.getElementById('pix-key-display');
  if (pixD) pixD.textContent = `${config.pixKey} (${config.pixKeyType})`;
}

/* =====================================================
   FRETE
   ===================================================== */
function getTotalEggs() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

function getShippingFee() {
  if (isPickup) return 0;
  return getTotalEggs() >= FREE_SHIPPING_MIN_QTY ? 0 : SHIPPING_FEE;
}

function getSubtotal() {
  return cart.reduce((s, i) => s + i.qty * i.price, 0);
}

function getTotal() {
  return getSubtotal() + getShippingFee();
}

/* =====================================================
   PARTÍCULAS FUNDO
   ===================================================== */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 8 + Math.random() * 40;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 14}s;
      animation-delay: ${Math.random() * 12}s;
    `;
    container.appendChild(p);
  }
}

/* =====================================================
   NAVBAR
   ===================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.style.display === 'flex';
      navLinks.style.display = open ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'fixed';
      navLinks.style.top = '72px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'white';
      navLinks.style.padding = '1.5rem';
      navLinks.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
      navLinks.style.zIndex = '999';
    });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) navLinks.style.display = 'none';
    });
  });
}

/* =====================================================
   PARALLAX HERO
   ===================================================== */
function initHeroParallax() {
  const img = document.getElementById('hero-parallax');
  if (!img) return;
  window.addEventListener('scroll', () => {
    img.style.transform = `translateY(${window.scrollY * 0.35}px)`;
  }, { passive: true });
}

/* =====================================================
   PARTÍCULAS HERO
   ===================================================== */
function initChocoParticles() {
  const container = document.getElementById('choco-particles');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'choco-p';
      const size = 6 + Math.random() * 14;
      const tx = (Math.random() - 0.5) * 400;
      const ty = -(100 + Math.random() * 300);
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${10 + Math.random() * 80}%;
        bottom:${10 + Math.random() * 30}%;
        --tx:${tx}px; --ty:${ty}px;
        animation-duration:${4 + Math.random() * 5}s;
        animation-delay:${Math.random() * 4}s;
      `;
      container.appendChild(p);
    }, i * 300);
  }
}

/* =====================================================
   BANNER MARQUEE
   ===================================================== */
function duplicateBanner() {
  const inner = document.querySelector('.easter-banner-inner');
  if (!inner) return;
  inner.parentNode.appendChild(inner.cloneNode(true));
}

/* =====================================================
   REVEAL ON SCROLL
   ===================================================== */
function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* =====================================================
   RENDERIZAR PRODUTOS
   ===================================================== */
async function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  products = await STORE.loadProducts();

  grid.innerHTML = '';
  const available = products.filter(p => p.available !== false);

  available.forEach((product, idx) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver detalhes de ${product.name}`);
    // Animação de entrada estilo RGOK
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = `opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 90}ms, transform 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 90}ms`;

    card.innerHTML = `
      <div class="product-card-img-wrap">
        <img
          src="${product.image}"
          alt="${product.name}"
          class="product-card-img"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 300%22><rect fill=%22%23f3eeff%22 width=%22300%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2280%22>${product.emoji || '🥚'}</text></svg>'"
        />
        ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-card-body">
        <h3 class="product-card-name">${product.name}</h3>
        <p class="product-card-desc">${product.shortDesc || product.description}</p>
        <div class="product-card-footer">
          <div class="product-card-price-wrap">
            <span class="product-card-price">${formatPrice(product.price)}</span>
            <small>${product.weight || ''}</small>
          </div>
          <button class="product-card-add" data-id="${product.id}" aria-label="Adicionar ${product.name} ao carrinho">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.product-card-add')) {
        e.stopPropagation();
        addToCartById(e.target.closest('.product-card-add').dataset.id, 1);
      } else {
        openModal(product.id);
      }
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(product.id);
    });

    grid.appendChild(card);
  });

  // IntersectionObserver dedicado p/ cards (approach RGOK)
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  grid.querySelectorAll('.product-card').forEach(c => cardObserver.observe(c));

  // Reveal para o resto da página (seções, textos etc.)
  initReveal();
}

function toggleFav(btn) {
  if (btn.textContent === '♡') {
    btn.textContent = '♥';
    btn.style.color = 'var(--lilac)';
  } else {
    btn.textContent = '♡';
    btn.style.color = '';
  }
}

/* =====================================================
   FORMATAR PREÇO
   ===================================================== */
function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

/* =====================================================
   MODAL PRODUTO
   ===================================================== */
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const btnClose = document.getElementById('modal-close');
  const btnMinus = document.getElementById('qty-minus');
  const btnPlus = document.getElementById('qty-plus');
  const btnAdd = document.getElementById('modal-add-cart');

  if (btnClose) btnClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeOrderLookup(); } });

  if (btnMinus) btnMinus.addEventListener('click', () => updateQty(-1));
  if (btnPlus) btnPlus.addEventListener('click', () => updateQty(1));
  if (btnAdd) btnAdd.addEventListener('click', () => {
    if (currentProduct) { addToCartById(currentProduct.id, currentQty); closeModal(); }
  });
}

function openModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  currentProduct = product;
  currentQty = 1;

  document.getElementById('modal-img').src = product.image;
  document.getElementById('modal-img').alt = product.name;
  document.getElementById('modal-tag').textContent = product.badge || '🥚 Ovo de Páscoa';
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-desc').textContent = product.description;
  document.getElementById('modal-weight').textContent = product.weight || '';
  document.getElementById('modal-price').textContent = formatPrice(product.price);
  document.getElementById('qty-val').textContent = '1';

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function updateQty(delta) {
  currentQty = Math.max(1, Math.min(99, currentQty + delta));
  document.getElementById('qty-val').textContent = currentQty;
}

/* =====================================================
   CARRINHO
   ===================================================== */
function initCart() {
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-backdrop').addEventListener('click', closeCart);
  document.getElementById('cart-footer').addEventListener('click', e => {
    if (e.target.closest('#btn-checkout')) {
      closeCart();
      openCheckout();
    }
  });
  document.getElementById('cart-footer').addEventListener('change', e => {
    if (e.target.id === 'cart-pickup-toggle') {
      isPickup = e.target.checked;

      // Update checkout modal state silently
      const methodPickup = document.getElementById('method_pickup');
      const methodDelivery = document.getElementById('method_delivery');
      if (methodPickup) methodPickup.checked = isPickup;
      if (methodDelivery) methodDelivery.checked = !isPickup;

      const addressBlock = document.getElementById('address-block');
      if (addressBlock) addressBlock.classList.toggle('hidden', isPickup);

      updateCartUI();
      renderMiniOrder();
    }
  });
}

function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}

function addToCartById(id, qty = 1) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  updateCartUI();
  showToast(`${product.name} adicionado ao carrinho! 🛍️`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateCartItemQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartUI();
}

function updateCartUI() {
  const count = getTotalEggs();
  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const total = getTotal();

  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');

  countEl.textContent = count;
  countEl.classList.toggle('has-items', count > 0);

  if (cart.length === 0) {
    emptyEl.style.display = 'flex';
    footer.style.display = 'none';
    itemsEl.innerHTML = '';
    itemsEl.appendChild(emptyEl);
    return;
  }

  emptyEl.style.display = 'none';
  footer.style.display = 'block';

  // ---------- render items ----------
  itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img"
        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%23f3eeff%22 width=%2260%22 height=%2260%22/><text x=%2250%%22 y=%2255%%22 font-size=%2230%22 text-anchor=%22middle%22>${item.emoji || '🥚'}</text></svg>'"
      />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-qty-row">
          <button class="cart-item-qty-btn" data-id="${item.id}" data-delta="-1" aria-label="Diminuir">−</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-item-qty-btn" data-id="${item.id}" data-delta="1" aria-label="Aumentar">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remover ${item.name}">✕</button>
    `;
    itemsEl.insertBefore(div, emptyEl);
  });

  itemsEl.querySelectorAll('.cart-item-qty-btn').forEach(btn => {
    btn.onclick = () => updateCartItemQty(btn.dataset.id, parseInt(btn.dataset.delta));
  });
  itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.onclick = () => removeFromCart(btn.dataset.id);
  });

  // ---------- frete e totais no footer ----------
  const eggsRemaining = Math.max(0, FREE_SHIPPING_MIN_QTY - count);
  const isFreeShip = shipping === 0;

  footer.innerHTML = `
    <div class="shipping-progress-wrap">
      ${isFreeShip
      ? `<div class="shipping-free-msg">🎉 Frete grátis conquistado! Parabéns!</div>`
      : `<div class="shipping-nudge">
            🚚 Falta${eggsRemaining === 1 ? '' : 'm'} <strong>${eggsRemaining} ovo${eggsRemaining === 1 ? '' : 's'}</strong> para frete grátis!
           </div>
           <div class="shipping-bar-track">
             <div class="shipping-bar-fill" style="width:${Math.min(100, (count / FREE_SHIPPING_MIN_QTY) * 100)}%"></div>
           </div>
           <div class="shipping-policy-note">Frete R$10 · Grátis a partir de ${FREE_SHIPPING_MIN_QTY} ovos</div>`
    }
    </div>
    
    <div class="cart-delivery-toggle">
      <label class="delivery-option-cart ${isPickup ? 'active' : ''}">
        <input type="checkbox" id="cart-pickup-toggle" ${isPickup ? 'checked' : ''} />
        <span class="cart-pickup-icon">🏬</span>
        <span>Vou retirar na loja <br><small>(Frete Grátis)</small></span>
      </label>
    </div>

    <div class="cart-total-breakdown">
      <div class="cart-row-sub">
        <span>Subtotal</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      <div class="cart-row-ship ${isFreeShip ? 'free' : ''}">
        <span>Frete</span>
        <span>${isFreeShip ? '🎉 Grátis' : formatPrice(shipping)}</span>
      </div>
      <div class="cart-total-row">
        <span>Total</span>
        <span class="cart-total">${formatPrice(total)}</span>
      </div>
    </div>
    <button class="btn-checkout" id="btn-checkout">
      Finalizar Pedido
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  `;

  document.getElementById('btn-checkout').addEventListener('click', () => {
    closeCart();
    openCheckout();
  });
}

/* =====================================================
   CHECKOUT
   ===================================================== */
function initCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  const closeBtn = document.getElementById('checkout-close');
  const toPayBtn = document.getElementById('btn-to-payment');
  const backBtn = document.getElementById('btn-back-to-data');
  const confirmBtn = document.getElementById('btn-confirm-order');

  if (closeBtn) closeBtn.addEventListener('click', closeCheckout);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeCheckout(); });

  if (toPayBtn) toPayBtn.addEventListener('click', goToPayment);
  if (backBtn) backBtn.addEventListener('click', goToData);
  if (confirmBtn) confirmBtn.addEventListener('click', confirmOrder);

  // Payment tabs
  document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      paymentMethod = tab.dataset.method;
      document.getElementById('pix-content').classList.toggle('hidden', paymentMethod !== 'pix');
      document.getElementById('credit-content').classList.toggle('hidden', paymentMethod !== 'credit');
    });
  });

  // Delivery method toggle
  document.querySelectorAll('input[name="delivery_method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      isPickup = e.target.value === 'pickup';
      const addressBlock = document.getElementById('address-block');
      if (addressBlock) addressBlock.classList.toggle('hidden', isPickup);

      const cartToggle = document.getElementById('cart-pickup-toggle');
      if (cartToggle) cartToggle.checked = isPickup;

      renderMiniOrder();
      updateCartUI();
    });
  });

  // Máscaras
  const ccNum = document.getElementById('cc-number');
  if (ccNum) ccNum.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  });

  const ccExp = document.getElementById('cc-expiry');
  if (ccExp) ccExp.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
    e.target.value = v;
  });

  const cpfEl = document.getElementById('cust-cpf');
  if (cpfEl) cpfEl.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v;
  });

  const phoneEl = document.getElementById('cust-phone');
  if (phoneEl) phoneEl.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 11);
    if (v.length > 2) v = '(' + v.substring(0, 2) + ') ' + v.substring(2);
    if (v.length > 10) v = v.substring(0, 10) + '-' + v.substring(10);
    e.target.value = v;
  });
}

function openCheckout() {
  if (cart.length === 0) { showToast('Seu carrinho está vazio!'); return; }
  renderMiniOrder();
  goToStep(1);
  document.getElementById('checkout-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function goToStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`checkout-step-${i}`).classList.toggle('hidden', i !== n);
    const dot = document.getElementById(`step-${i}-dot`);
    dot.classList.toggle('active', i === n);
    dot.classList.toggle('done', i < n);
  });
}

function goToPayment() {
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const rawAddr = document.getElementById('cust-address').value.trim();
  const address = isPickup ? 'Retirada no Local' : rawAddr;

  if (!name || !phone || !address) {
    showToast('⚠️ Preencha todos os campos obrigatórios!');
    return;
  }
  goToStep(2);
}

function goToData() { goToStep(1); }

function renderMiniOrder() {
  const listEl = document.getElementById('mini-order-list');
  const totalEl = document.getElementById('mini-total');
  if (!listEl || !totalEl) return;

  const shipping = getShippingFee();
  const total = getTotal();

  listEl.innerHTML = cart.map(item => `
    <div class="mini-item">
      <span>${item.qty}× ${item.name}</span>
      <span>${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('') + `
    <div class="mini-item shipping-mini">
      <span>🚚 Frete</span>
      <span>${shipping === 0 ? '🎉 Grátis' : formatPrice(shipping)}</span>
    </div>
  `;

  totalEl.textContent = formatPrice(total);
}

async function confirmOrder() {
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const cpf = document.getElementById('cust-cpf').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const notes = document.getElementById('cust-notes').value.trim();

  if (paymentMethod === 'credit') {
    const ccName = document.getElementById('cc-name').value.trim();
    const ccNumber = document.getElementById('cc-number').value.trim();
    const ccExpiry = document.getElementById('cc-expiry').value.trim();
    const ccCvv = document.getElementById('cc-cvv').value.trim();
    if (!ccName || !ccNumber || !ccExpiry || !ccCvv) {
      showToast('⚠️ Preencha os dados do cartão!'); return;
    }
  }

  const confirmBtn = document.getElementById('btn-confirm-order');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Processando...';

  await new Promise(r => setTimeout(r, 1500));

  // Gera número do pedido
  const orderNum = 'LU' + Date.now().toString().slice(-6);
  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const total = getTotal();

  // Salva pedido no Supabase
  const order = {
    id: orderNum,
    date: new Date().toISOString(),
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    subtotal,
    shipping,
    total,
    customer: { name, phone, cpf, email, address, notes },
    paymentMethod,
    status: 'pending',
  };
  await window.supabaseClient.saveOrder(order);

  // Envia WhatsApp
  sendOrderWhatsApp({ name, phone, cpf, email, address, notes, orderNum, total, shipping });

  // Tela de confirmação
  document.getElementById('confirm-name').textContent = name;
  document.getElementById('confirm-phone').textContent = phone;
  document.getElementById('confirm-order-num').textContent = orderNum;

  if (paymentMethod === 'pix') {
    document.getElementById('confirm-pix-box').style.display = 'block';
    document.getElementById('confirm-pix-key').textContent = config.pixKey;
    document.getElementById('copy-pix').textContent = 'Copiar';
  } else {
    document.getElementById('confirm-pix-box').style.display = 'none';
  }

  goToStep(3);
  cart = [];
  updateCartUI();

  confirmBtn.disabled = false;
  confirmBtn.textContent = 'Confirmar Pedido 🎉';
}

/* =====================================================
   SALVAR / CARREGAR PEDIDOS - Removidos (usando Supabase)
   ===================================================== */

/* =====================================================
   CONSULTA DE PEDIDOS
   ===================================================== */
function initOrderLookup() {
  const openBtn = document.getElementById('open-order-lookup');
  const closeBtn = document.getElementById('order-lookup-close');
  const overlay = document.getElementById('order-lookup-overlay');
  const searchBtn = document.getElementById('order-search-btn');

  if (openBtn) openBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  if (closeBtn) closeBtn.addEventListener('click', closeOrderLookup);
  if (overlay) overlay.addEventListener('click', e => {
    if (e.target === overlay) closeOrderLookup();
  });
  if (searchBtn) searchBtn.addEventListener('click', searchOrders);

  const input = document.getElementById('order-lookup-input');
  if (input) input.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchOrders();
  });
}

function closeOrderLookup() {
  const overlay = document.getElementById('order-lookup-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function searchOrders() {
  const val = document.getElementById('order-lookup-input').value.trim();
  const result = document.getElementById('order-lookup-result');
  if (!val) { result.innerHTML = '<p class="ol-empty">Digite seu CPF ou WhatsApp.</p>'; return; }

  // Exibe indicativo de carregamento
  result.innerHTML = '<div class="ol-empty"><p>Buscando no banco de dados...</p></div>';

  const orders = await window.supabaseClient.findOrdersByKey(val);
  if (orders.length === 0) {
    result.innerHTML = '<div class="ol-empty"><span>🔍</span><p>Nenhum pedido encontrado.</p><small>Verifique o número digitado.</small></div>';
    return;
  }

  // Mais recentes primeiro
  const sorted = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  result.innerHTML = sorted.map(o => {
    const date = new Date(o.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const status = statusLabel(o.status);
    const items = o.items.map(i => `${i.qty}× ${i.name}`).join(', ');
    return `
      <div class="ol-order-card">
        <div class="ol-order-header">
          <div>
            <span class="ol-order-num">#${o.id}</span>
            <span class="ol-date">${date}</span>
          </div>
          <span class="ol-status ol-status-${o.status}">${status}</span>
        </div>
        <div class="ol-items">${items}</div>
        <div class="ol-footer">
          <span>Frete: ${o.shipping === 0 ? 'Grátis 🎉' : formatPrice(o.shipping)}</span>
          <strong>Total: ${formatPrice(o.total)}</strong>
        </div>
      </div>
    `;
  }).join('');
}

function statusLabel(s) {
  return { pending: '⏳ Aguardando', confirmed: '✅ Confirmado', preparing: '🍫 Preparando', delivered: '🚚 Entregue', cancelled: '❌ Cancelado' }[s] || s;
}

/* =====================================================
   WHATSAPP
   ===================================================== */
function sendOrderWhatsApp({ name, phone, cpf, email, address, notes, orderNum, total, shipping }) {
  const items = cart.map(i => `  • ${i.qty}× ${i.name} (${formatPrice(i.price * i.qty)})`).join('\n');
  const method = paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito';

  const addrStr = isPickup
    ? '📍 *Retirada no Local* (Rua Benjamin Constant, 1000 - Velha Marabá)'
    : `📍 *Endereço:* ${address}`;

  const msg = `🐰 *Novo Pedido — Doces da LU* 🍫\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Pedido:* #${orderNum}\n` +
    `👤 *Cliente:* ${name}\n` +
    `📱 *WhatsApp:* ${phone}\n` +
    `${cpf ? `🪪 *CPF:* ${cpf}\n` : ''}` +
    `${email ? `📧 *E-mail:* ${email}\n` : ''}` +
    `${addrStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `*Itens:*\n${items}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🚚 *Frete:* ${shipping === 0 ? 'Grátis 🎉' : formatPrice(shipping)}\n` +
    `💰 *Total:* ${formatPrice(total)}\n` +
    `💳 *Pagamento:* ${method}\n` +
    `${notes ? `\n📝 *Obs:* ${notes}` : ''}`;

  setTimeout(() => window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank'), 500);
}

/* =====================================================
   COPIAR PIX
   ===================================================== */
window.copyPix = function () {
  const key = document.getElementById('confirm-pix-key').textContent;
  navigator.clipboard.writeText(key).then(() => {
    document.getElementById('copy-pix').textContent = 'Copiado! ✓';
    showToast('Chave PIX copiada! 💠');
  }).catch(() => showToast('Copie manualmente: ' + key));
};

window.closeCheckout = closeCheckout;
window.closeOrderLookup = closeOrderLookup;

/* =====================================================
   TOAST
   ===================================================== */
function showToast(message, duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>💜</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
