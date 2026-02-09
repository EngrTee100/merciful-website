// MERCIFUL CRUNCHY — Complete frontend script with cart, checkout, and payment options
(() => {
  const API_BASE = 'http://localhost:3000'; // Change if backend is elsewhere; use empty string for same origin
  const PRODUCTS_KEY = 'mc_products';
  const PRODUCTS_VERSION_KEY = 'mc_products_version';
  const PRODUCTS_VERSION = 5;
  const CART_KEY = 'mc_cart';
  const ORDERS_KEY = 'mc_orders';

  // Edit this array to add new products
  const defaultProducts = [
    {
      id: 'chinchin-01',
      name: 'Chin Chin',
      price: 14000,
      description: 'Lightly sweet chin chin with a crisp, golden crunch.',
      image: 'images/14,000 chin chin.jpeg'
    },
    {
      id: 'peanut-02',
      name: 'Peanut Burger',
      price: 2300,
      description: 'Roasted peanut burger with a rich, nutty aroma.',
      image: 'images/2300 peanut.jpeg'
    },
    {
      id: 'chinchin-03',
      name: 'Chin Chin',
      price: 850,
      description: 'Extra-crunchy chin chin with a buttery finish.',
      image: '../images/general snacks.jpeg'
    },
    {
      id: 'peanut-04',
      name: 'Peanut Burger',
      price: 1200,
      description: 'Crunchy peanut burger blended with mild caramel notes.',
      image: '../images/plantain-chips.jpg'
    },
    {
      id: 'chinchin-05',
      name: 'Chin Chin',
      price: 650,
      description: 'Classic chin chin pieces with a soft-spiced sweetness.',
      image: '../images/meat-pie.jpg'
    },
    {
      id: 'peanut-06',
      name: 'Peanut Burger',
      price: 1300,
      description: 'Thick peanut burger slabs with a satisfying bite.',
      image: '../images/samosa.jpg'
    },
    {
      id: 'chinchin-07',
      name: 'Chin Chin',
      price: 750,
      description: 'Sweet chin chin nuggets made in small batches.',
      image: '../images/spring-rolls.jpg'
    },
    {
      id: 'peanut-08',
      name: 'Peanut Burger',
      price: 1400,
      description: 'Crunchy peanut burger with a roasted peanut finish.',
      image: '../images/akara-balls.jpg'
    },
    {
      id: 'chinchin-09',
      name: 'Chin Chin',
      price: 500,
      description: 'Mini chin chin bites with a gentle vanilla aroma.',
      image: '../images/coconut-balls.jpg'
    },
    {
      id: 'peanut-10',
      name: 'Peanut Burger',
      price: 1500,
      description: 'Premium peanut burger bars with extra nutty crunch.',
      image: '../images/chin-chin-regular.jpg'
    },
    {
      id: 'chinchin-11',
      name: 'Chin Chin',
      price: 800,
      description: 'Crisp chin chin with a toasted sugar glaze.',
      image: '../images/fish-roll.jpg'
    },
    {
      id: 'peanut-12',
      name: 'Peanut Burger',
      price: 1600,
      description: 'Hearty peanut burger squares with deep roasted flavor.',
      image: '../images/donuts.jpg'
    }
  ];

  // DOM refs (may be missing on some pages)
  const productGrid = document.getElementById('product-grid');
  const cartCountEl = document.getElementById('cart-count');
  const cartContainer = document.getElementById('cart-container');
  const orderSummary = document.getElementById('order-summary');
  const checkoutForm = document.getElementById('checkout-form');
  const contactForm = document.getElementById('contact-form');
  const orderResult = document.getElementById('order-result');

  // Storage helpers
  function loadProducts() {
    try {
      const storedVersion = Number(localStorage.getItem(PRODUCTS_VERSION_KEY) || '0');
      const raw = localStorage.getItem(PRODUCTS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const isValidArray = Array.isArray(parsed);

      if (!raw || !isValidArray || storedVersion !== PRODUCTS_VERSION || parsed.length < defaultProducts.length) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
        localStorage.setItem(PRODUCTS_VERSION_KEY, String(PRODUCTS_VERSION));
        return defaultProducts.slice();
      }

      return parsed;
    } catch {
      return defaultProducts.slice();
    }
  }
  function saveProducts(list) {
    try { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list)); } catch (e) { console.error(e); }
  }

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }
  function updateCartCount() {
    if (!cartCountEl) return;
    const cart = loadCart();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    cartCountEl.textContent = String(count);
  }

  // Utilities
  function formatCurrency(n) {
    try { return '₦' + Number(n).toLocaleString(); } catch { return '₦' + n; }
  }
  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function resolveImage(path = '') {
    const isPaymentPage = window.location.pathname.includes('/payment page/');
    const base = isPaymentPage ? '../images/' : 'images/';
    if (path.startsWith('../images/')) return base + path.slice('../images/'.length);
    if (path.startsWith('images/')) return base + path.slice('images/'.length);
    return path;
  }

  // Render product list by looping the products array
  function renderProducts() {
    if (!productGrid) return;
    const products = loadProducts();
    productGrid.innerHTML = '';

    products.forEach(p => {
      const card = document.createElement('article');
      card.className = 'product';
      card.innerHTML = `
        <img src="${escapeHtml(resolveImage(p.image))}" alt="${escapeHtml(p.name)}" loading="lazy" />
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price">${formatCurrency(p.price)}</div>
        <p class="muted">${escapeHtml(p.description || '')}</p>
        
        <!-- Quantity Controls -->
        <div class="qty-selector" style="margin:12px 0;display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="qty-btn" data-id="${p.id}" data-qty="-1" style="min-width:32px;padding:6px;font-size:16px;font-weight:bold">−</button>
          <span class="qty-display" data-id="${p.id}" style="min-width:40px;text-align:center;font-weight:bold;font-size:14px">1</span>
          <button class="qty-btn" data-id="${p.id}" data-qty="1" style="min-width:32px;padding:6px;font-size:16px;font-weight:bold">+</button>
        </div>
        
        <div class="actions">
          <button class="btn" data-id="${p.id}" data-action="details">Details</button>
          <button class="btn buy" data-id="${p.id}" data-action="add-qty">Add to Cart</button>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }

  // Add product to cart (local)
  function addToCart(productId, qty = 1) {
    const products = loadProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) { alert('Product not found'); return; }
    const cart = loadCart();
    const found = cart.find(c => c.id === productId);
    if (found) found.qty += qty;
    else cart.push({ id: productId, qty });
    saveCart(cart);
    alert(`${prod.name} added to cart.`);
  }

  // Render cart page
  function renderCartPage() {
    if (!cartContainer) return;
    const cart = loadCart();
    if (!cart.length) {
      cartContainer.innerHTML = '<p>Your cart is empty. <a href="index.html">Continue shopping</a>.</p>';
      if (orderSummary) orderSummary.innerHTML = '';
      return;
    }
    const products = loadProducts();
    cartContainer.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item => {
      const p = products.find(x => x.id === item.id) || { name: item.id, price: 0, image: 'images/placeholder.png' };
      const itemTotal = (p.price || 0) * item.qty;
      subtotal += itemTotal;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${escapeHtml(resolveImage(p.image))}" alt="${escapeHtml(p.name)}" />
        <div style="flex:1">
          <div><strong>${escapeHtml(p.name)}</strong></div>
          <div class="muted">${formatCurrency(p.price || 0)} each</div>
          <div class="qty-controls">
            <button class="btn" data-action="dec" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="btn" data-action="remove" data-id="${item.id}" style="margin-left:12px">Remove</button>
          </div>
        </div>
        <div><strong>${formatCurrency(itemTotal)}</strong></div>
      `;
      cartContainer.appendChild(row);
    });
    const totalEl = document.createElement('div');
    totalEl.style.marginTop = '12px';
    totalEl.innerHTML = `<div class="muted">Subtotal:</div><h3>${formatCurrency(subtotal)}</h3>`;
    cartContainer.appendChild(totalEl);
    if (orderSummary) orderSummary.innerHTML = `<p>Items: ${cart.reduce((s,i)=>s+i.qty,0)} • Subtotal: ${formatCurrency(subtotal)}</p>`;
  }

  // Event handlers for product actions and cart controls
  let isProcessing = false;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    // Quantity buttons on product cards (home page)
    if (btn.classList.contains('qty-btn')) {
      if (isProcessing) return;
      isProcessing = true;
      setTimeout(() => { isProcessing = false; }, 100);
      
      const id = btn.dataset.id;
      const qty = parseInt(btn.dataset.qty, 10);
      const display = document.querySelector(`.qty-display[data-id="${id}"]`);
      if (display) {
        let currentQty = parseInt(display.textContent, 10) || 1;
        currentQty = Math.max(1, currentQty + qty); // Never go below 1
        display.textContent = currentQty;
      }
      return;
    }
    
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    
    if (!action) return;

    if (action === 'add' && id) { addToCart(id, 1); return; }
    
    // Add to cart with quantity from display
    if (action === 'add-qty' && id) {
      const display = document.querySelector(`.qty-display[data-id="${id}"]`);
      const qty = display ? parseInt(display.textContent, 10) || 1 : 1;
      addToCart(id, qty);
      // Reset quantity display to 1
      if (display) display.textContent = '1';
      return;
    }
    
    if (action === 'details' && id) {
      const products = loadProducts();
      const p = products.find(x => x.id === id);
      if (!p) { alert('Product not found'); return; }
      alert(`${p.name}\n\nPrice: ${formatCurrency(p.price)}\n\n${p.description || ''}`);
      return;
    }

    // Cart actions
    if (action === 'inc' || action === 'dec' || action === 'remove') {
      if (isProcessing) return;
      isProcessing = true;
      setTimeout(() => { isProcessing = false; }, 100);
      
      const cart = loadCart();
      const idx = cart.findIndex(i => i.id === id);
      if (idx === -1) return;
      if (action === 'inc') cart[idx].qty += 1;
      if (action === 'dec') {
        // If quantity is 1, remove the product. Otherwise, decrease by 1
        if (cart[idx].qty <= 1) {
          cart.splice(idx, 1);
        } else {
          cart[idx].qty -= 1;
        }
      }
      if (action === 'remove') cart.splice(idx, 1);
      saveCart(cart);
      renderCartPage();
      return;
    }
  });

  // Redirect to WhatsApp for payment
  function redirectToWhatsApp(orderId, customerName, total, paymentType = 'online', cartItems = [], customerPhone = '', customerEmail = '', customerAddress = '') {
    // Replace with your WhatsApp business number (with country code, no spaces or +)
    const whatsappNumber = '2349037464756'; // Update this with your WhatsApp number
    
    // Build product list from cart items
    const products = loadProducts();
    let productsList = '';
    if (cartItems && cartItems.length > 0) {
      productsList = '\n📦 *Items Ordered:*\n';
      cartItems.forEach((cartItem, idx) => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
          const itemPrice = product.price * cartItem.qty;
          productsList += `${idx + 1}. ${product.name}\n   Description: ${product.description}\n   Qty: ${cartItem.qty} | Price: ₦${itemPrice.toLocaleString()}\n\n`;
        }
      });
    }

    // Build customer delivery information
    let customerInfo = '';
    if (customerPhone || customerEmail || customerAddress) {
      customerInfo = '\n👤 *Delivery Information:*\n';
      if (customerPhone) customerInfo += `Phone: ${customerPhone}\n`;
      if (customerEmail) customerInfo += `Email: ${customerEmail}\n`;
      if (customerAddress) customerInfo += `Address: ${customerAddress}\n`;
    }
    
    let message;
    if (paymentType === 'cash') {
      // Cash payment message - customer tells what they want
      message = encodeURIComponent(
        `Hello! I would like to place an order and pay via cash.\n\n` +
        `Order ID: ${orderId}\n` +
        `Customer Name: ${customerName}` +
        productsList +
        customerInfo +
        `💰 *Total Amount: ₦${total.toLocaleString()}*\n\n` +
        `Please let me know the best way to arrange payment and delivery.`
      );
    } else {
      // Online/Direct payment message
      message = encodeURIComponent(
        `Hello! I would like to complete my payment now.\n\n` +
        `Order ID: ${orderId}\n` +
        `Customer Name: ${customerName}` +
        productsList +
        customerInfo +
        `💰 *Total Amount: ₦${total.toLocaleString()}*\n\n` +
        `Please confirm and provide payment details.`
      );
    }
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  // Place order: POST to backend, fallback to local save if network fails
  async function placeOrderToBackend(payload) {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || res.statusText);
      return { success: true, response: json };
    } catch (err) {
      console.warn('Backend order failed, saving locally', err);
      const orders = JSON.parse(localStorage.getItem('mc_orders') || '[]');
      const id = 'LOCAL-' + Date.now();
      orders.push({ id, createdAt: new Date().toISOString(), ...payload, total: payload.items_total || 0 });
      localStorage.setItem('mc_orders', JSON.stringify(orders));
      return { success: false, response: { id, savedLocally: true } };
    }
  }

  // Checkout form submit
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cart = loadCart();
      if (!cart.length) { alert('Your cart is empty.'); return; }
      const name = document.getElementById('cust-name').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      const address = document.getElementById('cust-address').value.trim();
      const email = document.getElementById('cust-email').value.trim();
      if (!name || !phone || !address) { alert('Please fill name, phone and address.'); return; }

      const items = cart.map(i => ({ product_id: i.id, qty: i.qty }));
      const products = loadProducts();
      const items_total = cart.reduce((s, it) => {
        const p = products.find(x => x.id === it.id);
        return s + (p ? p.price * it.qty : 0);
      }, 0);

      const payload = { customer: { name, phone, address, email }, items, paymentMethod: 'whatsapp_cash' };
      const result = await placeOrderToBackend(payload);

      // Clear cart after placing order
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      
      const id = result.response && result.response.id ? result.response.id : 'UNKNOWN';
      
      // Redirect to WhatsApp for cash payment
      try {
        if (orderResult) orderResult.innerHTML = `<strong>Order placed!</strong> Your order number is <em>${escapeHtml(id)}</em>. Opening WhatsApp to arrange payment...`;
        
        setTimeout(() => {
          redirectToWhatsApp(id, name, items_total, 'cash', cart, phone, email, address);
        }, 1000);
      } catch (err) {
        console.error('WhatsApp redirect error', err);
        renderCartPage();
        if (orderResult) orderResult.innerHTML = `<strong>Order placed!</strong> Your order number is <em>${escapeHtml(id)}</em>. Please contact us on WhatsApp to arrange payment.`;
      }
      checkoutForm.reset();
    });

    // Pay Now button handler - both buttons now use WhatsApp
    const payNowBtn = document.getElementById('pay-now');
    if (payNowBtn) {
      payNowBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const cart = loadCart();
        if (!cart.length) { alert('Your cart is empty.'); return; }
        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const address = document.getElementById('cust-address').value.trim();
        const email = document.getElementById('cust-email').value.trim();
        if (!name || !phone || !address) { alert('Please fill name, phone and address.'); return; }

        const items = cart.map(i => ({ product_id: i.id, qty: i.qty }));
        const products = loadProducts();
        const items_total = cart.reduce((s, it) => {
          const p = products.find(x => x.id === it.id);
          return s + (p ? p.price * it.qty : 0);
        }, 0);

        const payload = { customer: { name, phone, address, email }, items, paymentMethod: 'whatsapp_online' };
        
        try {
          const result = await placeOrderToBackend(payload);
          const id = result.response && result.response.id ? result.response.id : 'UNKNOWN';
          
          // Clear cart before redirect
          localStorage.removeItem(CART_KEY);
          updateCartCount();
          
          // Show confirmation message
          if (orderResult) orderResult.innerHTML = `<strong>Order placed!</strong> Your order number is <em>${escapeHtml(id)}</em>. Opening WhatsApp for payment...`;
          
          // Redirect to WhatsApp after 1 second with online payment message
          setTimeout(() => {
            redirectToWhatsApp(id, name, items_total, 'online', cart, phone, email, address);
          }, 1000);
          
        } catch (err) {
          console.error('Order error', err);
          alert('Could not place order: ' + (err.message || err));
        }
      });
    }
  }

  // Contact form submit
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      if (!name || !message) { alert('Please fill name and message.'); return; }
      try {
        const res = await fetch(`${API_BASE}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, message })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || res.statusText);
        const statusEl = document.getElementById('contact-status');
        if (statusEl) statusEl.textContent = 'Thank you! Your message has been received.';
        contactForm.reset();
      } catch (err) {
        console.warn('Contact submit failed, saved locally', err);
        const contacts = JSON.parse(localStorage.getItem('mc_contacts') || '[]');
        contacts.push({ name, email, phone, message, createdAt: new Date().toISOString() });
        localStorage.setItem('mc_contacts', JSON.stringify(contacts));
        const statusEl = document.getElementById('contact-status');
        if (statusEl) statusEl.textContent = 'Message saved locally (offline).';
        contactForm.reset();
      }
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderProducts();
    renderCartPage();
  });
})();



