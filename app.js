/* ══ PUBLIC API ROUTES ══════════════════════════════════ */
/* Product data, enquiries and subscriber signups are routed through server-side endpoints. */

/* ══ ENQUIRY MODAL ══════════════════════════════════ */
// Your HACE WhatsApp number — change this
const HACE_WHATSAPP = '254795149469'

let currentEnquiry = {}

function openEnquiry(name, ref, price, slug) {
  currentEnquiry = { name, ref, price, slug }
  document.getElementById('eq-watch-name').textContent = name
  document.getElementById('eq-watch-ref').textContent  = 'Ref. ' + ref
  document.getElementById('eq-watch-price').textContent = price
  document.getElementById('eq-name').value    = ''
  document.getElementById('eq-phone').value   = ''
  document.getElementById('eq-message').value = ''
  document.getElementById('eq-error').style.display = 'none'
  document.getElementById('eq-btn').textContent = 'Send Enquiry via WhatsApp'
  const overlay = document.getElementById('enquiry-overlay')
  overlay.style.display = 'flex'
}

function closeEnquiry() {
  document.getElementById('enquiry-overlay').style.display = 'none'
}

// Close on overlay click
document.getElementById('enquiry-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeEnquiry()
})

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeEnquiry()
})

async function submitEnquiry() {
  const name    = document.getElementById('eq-name').value.trim()
  const phone   = document.getElementById('eq-phone').value.trim()
  const message = document.getElementById('eq-message').value.trim()

  // Validate
  if (!name || !phone) {
    document.getElementById('eq-error').style.display = 'block'
    return
  }
  document.getElementById('eq-error').style.display = 'none'

  const btn = document.getElementById('eq-btn')
  btn.textContent = 'Sending...'
  btn.style.opacity = '.7'

  const response = await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      phone,
      message: message || null,
      product_name: currentEnquiry.name,
      status: 'new'
    })
  })

  if (!response.ok) {
    console.error('Enquiry save failed:', await response.text())
    // Still open WhatsApp even if the save fails
  }

  // Build WhatsApp message
  const waText = encodeURIComponent(
    `Hello HACE Watch House! 👋\n\n` +
    `I'm interested in the *${currentEnquiry.name}* (${currentEnquiry.ref})\n` +
    `Price: ${currentEnquiry.price}\n\n` +
    `My name: ${name}\n` +
    (message ? `Message: ${message}\n\n` : '\n') +
    `Please get in touch. Thank you!`
  )

  btn.textContent = '✓ Opening WhatsApp...'

  // Close modal and open WhatsApp
  setTimeout(() => {
    closeEnquiry()
    window.open(`https://wa.me/${HACE_WHATSAPP}?text=${waText}`, '_blank')
  }, 600)
}

/* ══ NEWSLETTER ═════════════════════════════════════ */
async function submitNewsletter() {
  const name  = document.getElementById('nl-name').value.trim()
  const email = document.getElementById('nl-email').value.trim()
  const phone = document.getElementById('nl-phone').value.trim()
  const msg   = document.getElementById('nl-msg')
  const btn   = document.getElementById('nl-btn')

  // Validate
  if (!email) {
    msg.style.display = 'block'
    msg.style.color   = '#e05555'
    msg.textContent   = 'Please enter your email address.'
    return
  }

  btn.textContent  = 'Submitting...'
  btn.style.opacity = '.7'

  const response = await fetch('/api/subscribers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name || null, email, phone: phone || null })
  })

  btn.style.opacity = '1'

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const errorMessage = body.error || 'Something went wrong. Please try again.'
    if (errorMessage.toLowerCase().includes('duplicate')) {
      msg.style.color   = '#c8a55a'
      msg.textContent   = 'You are already on our private list.'
    } else {
      msg.style.color   = '#e05555'
      msg.textContent   = errorMessage
    }
    msg.style.display = 'block'
    btn.textContent   = 'Request Private Access'
    return
  }

  // Success
  msg.style.display = 'block'
  msg.style.color   = '#4dba7f'
  msg.textContent   = '✓ You are on the list. We will be in touch.'
  btn.textContent   = '✓ Subscribed'
  btn.style.background = '#4dba7f'

  // Clear fields
  document.getElementById('nl-name').value  = ''
  document.getElementById('nl-email').value = ''
  document.getElementById('nl-phone').value = ''
}

async function loadProducts() {
  try {
    console.log('📦 Loading products from server API...')

    const response = await fetch('/api/products')
    if (!response.ok) throw new Error('Failed to load products')
    const products = await response.json()

    if (!products || products.length === 0) {
      console.warn('⚠️ No products found in database')
      return
    }

    // ── Dynamically build ALL cards from database ──
    const grid = document.querySelector('.col-grid')
    if (!grid) {
      console.error('❌ .col-grid container not found!')
      return
    }

    grid.innerHTML = ''

    products.forEach((p, i) => {
      const delays = ['', ' d1', ' d2', ' d3', ' d4']
      const delay  = delays[i] || ' d4'

      const card = document.createElement('a')
      card.href      = `product.html?id=${p.id}`
      card.className = `w-card${i === 0 ? ' featured' : ''} reveal${delay}`

      card.innerHTML = `
        <div class="card-bg card-art">
          <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
            <circle cx="65" cy="65" r="55" stroke="rgba(200,165,90,0.25)" stroke-width="1.2"/>
            <circle cx="65" cy="65" r="44" stroke="rgba(200,165,90,0.1)" stroke-width=".5"/>
            <circle cx="65" cy="65" r="3.5" fill="rgba(200,165,90,0.9)"/>
            <line x1="65" y1="65" x2="65" y2="22" stroke="rgba(200,165,90,0.95)" stroke-width="2" stroke-linecap="round"/>
            <line x1="65" y1="65" x2="88" y2="77" stroke="rgba(200,165,90,0.7)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
        <div class="card-admin admin-only" data-action="add-to-inventory">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-ref">Ref. ${p.ref_number}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-sub">${p.complications || ''}</div>
          <div class="card-footer">
            <div class="card-price">KES ${Number(p.price_kes).toLocaleString('en-KE')}</div>
            <div class="card-cta" onclick="event.preventDefault();openEnquiry('${p.name}','${p.ref_number}','KES ${Number(p.price_kes).toLocaleString('en-KE')}','${p.slug}')">Enquire</div>
          </div>
        </div>
        <div class="card-shimmer"></div>
      `
      grid.appendChild(card)
    })

    // Re-run reveal observer on new cards
    if (typeof revObs !== 'undefined') {
      document.querySelectorAll('.reveal').forEach(el => revObs.observe(el))
    }

    // Re-apply admin visibility
    if (localStorage.getItem('hace_role') === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex')
    }

    console.log(`✅ ${products.length} products loaded from Supabase`)

  } catch (err) {
    console.error('Supabase error:', err.message)
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadProducts()
})

// ══ MODAL FUNCTIONS ════════════════════════════════
async function loadModalProducts() {
  try {
    const { data: products, error } = await db
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!products || products.length === 0) return

    const grid = document.querySelector('.modal-grid')
    if (!grid) return

    grid.innerHTML = ''

    products.forEach((p, i) => {
      const card = document.createElement('a')
      card.href      = `product.html?id=${p.id}`
      card.className = `w-card reveal`

      card.innerHTML = `
        <div class="card-bg card-art">
          <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
            <circle cx="65" cy="65" r="55" stroke="rgba(200,165,90,0.25)" stroke-width="1.2"/>
            <circle cx="65" cy="65" r="44" stroke="rgba(200,165,90,0.1)" stroke-width=".5"/>
            <circle cx="65" cy="65" r="3.5" fill="rgba(200,165,90,0.9)"/>
            <line x1="65" y1="65" x2="65" y2="22" stroke="rgba(200,165,90,0.95)" stroke-width="2" stroke-linecap="round"/>
            <line x1="65" y1="65" x2="88" y2="77" stroke="rgba(200,165,90,0.7)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
        <div class="card-admin admin-only" data-action="add-to-inventory">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-ref">Ref. ${p.ref_number}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-sub">${p.complications || ''}</div>
          <div class="card-footer">
            <div class="card-price">KES ${Number(p.price_kes).toLocaleString('en-KE')}</div>
            <div class="card-cta" onclick="event.preventDefault();openEnquiry('${p.name}','${p.ref_number}','KES ${Number(p.price_kes).toLocaleString('en-KE')}','${p.slug}')">Enquire</div>
          </div>
        </div>
        <div class="card-shimmer"></div>
      `
      grid.appendChild(card)
    })

    // Re-run reveal observer
    if (typeof revObs !== 'undefined') {
      document.querySelectorAll('.modal-grid .reveal').forEach(el => revObs.observe(el))
    }

  } catch (err) {
    console.error('Modal load error:', err.message)
  }
}

function openModal() {
  const modal = document.getElementById('collection-modal')
  modal.style.display = 'flex'
  document.body.style.overflow = 'hidden' // Prevent background scroll
  loadModalProducts()
}

function closeModal() {
  const modal = document.getElementById('collection-modal')
  modal.style.display = 'none'
  document.body.style.overflow = '' // Restore scroll
}

// Close on overlay click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('collection-modal')
  if (e.target === modal) {
    closeModal()
  }
})

// Close on ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal()
  }
})

// ══ NAV TOGGLE ═════════════════════════════════════
function toggleNav() {
  const navCenter = document.querySelector('.nav-center')
  if (navCenter.style.display === 'flex') {
    navCenter.style.display = 'none'
  } else {
    navCenter.style.display = 'flex'
    navCenter.style.flexDirection = 'column'
    navCenter.style.position = 'absolute'
    navCenter.style.top = '100%'
    navCenter.style.left = '0'
    navCenter.style.width = '100%'
    navCenter.style.background = 'var(--bg)'
    navCenter.style.padding = '20px'
    navCenter.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
  }
}
