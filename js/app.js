// South India Steel Corporation - Core Site Orchestration

document.addEventListener("DOMContentLoaded", () => {
  // Initialize seed databases
  if (window.SISC_DATA) {
    window.SISC_DATA.init();
  }

  // 1. Mobile Menu Drawer
  const burgerMenuBtn = document.getElementById("burger-menu");
  const navMenu = document.getElementById("nav-menu");
  
  if (burgerMenuBtn && navMenu) {
    burgerMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const isActive = navMenu.classList.contains("active");
      burgerMenuBtn.setAttribute("aria-expanded", isActive ? "true" : "false");
      burgerMenuBtn.innerHTML = isActive 
        ? `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>` 
        : `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`;
    });

    // Close menu when clicking link
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        burgerMenuBtn.setAttribute("aria-expanded", "false");
        burgerMenuBtn.innerHTML = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`;
      });
    });
  }

  // 2. Dynamic Product Hydration & Filters
  const productsGrid = document.getElementById("products-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");
  let activeFilter = "All";

  function renderProducts() {
    if (!productsGrid || !window.SISC_DATA) return;
    const products = window.SISC_DATA.getProducts();
    
    const filtered = activeFilter === "All" 
      ? products 
      : products.filter(p => p.category === activeFilter);

    productsGrid.innerHTML = filtered.map(p => {
      // Build spec lines
      const specLines = Object.entries(p.specs || {}).map(([key, val]) => `
        <div class="spec-item">
          <span class="spec-label">${escapeHTML(key)}:</span>
          <span class="spec-value">${escapeHTML(val)}</span>
        </div>
      `).join("");

      const badgeHTML = p.badge 
        ? `<div class="product-badge" style="position: absolute; top: 1rem; right: 1rem; background-color: var(--primary); color: var(--text-white); padding: 0.35rem 0.85rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; z-index: 10;">${escapeHTML(p.badge)}</div>` 
        : '';

      return `
        <div class="product-card ${p.badge ? 'featured' : ''}">
          <div class="product-img">
            ${badgeHTML}
            <img src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy">
            <div class="product-cat">${escapeHTML(p.category)}</div>
          </div>
          <div class="product-info">
            <h3>${escapeHTML(p.name)}</h3>
            <p class="product-desc">${escapeHTML(p.description)}</p>
            <div class="product-specs">
              ${specLines}
            </div>
            <div class="product-actions">
              <button class="btn btn-primary quote-btn" data-product="${escapeHTML(p.name)}" data-category="${escapeHTML(p.category)}">Get Quote</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Rebind quote buttons on product cards
    productsGrid.querySelectorAll(".quote-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const prod = btn.dataset.product;
        const cat = btn.dataset.category;
        openQuotePopup(prod, cat);
      });
    });
  }

  // Initialize and filter listeners
  if (productsGrid) {
    renderProducts();

    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        renderProducts();
      });
    });
  }

  // Hook Admin Panel callback
  if (window.SISC_ADMIN) {
    window.SISC_ADMIN.init(renderProducts);
  }

  // 3. Modals and Dialog Handling (Closedby Fallback)
  const quoteDialog = document.getElementById("quote-dialog");
  const quoteForm = document.getElementById("quote-form");
  const closeQuoteBtn = quoteDialog ? quoteDialog.querySelector(".dialog-close-btn") : null;

  // Open Quote Modal helper
  function openQuotePopup(prodName = "", catName = "") {
    if (!quoteDialog) return;
    
    // Autofill form fields
    const matSelect = quoteDialog.querySelector("#quote-material");
    const msgText = quoteDialog.querySelector("#quote-message");

    if (matSelect && catName) {
      matSelect.value = catName;
    }
    if (msgText) {
      msgText.value = prodName ? `Inquiry for ${prodName}` : "";
    }

    quoteDialog.showModal();
  }

  // Bind trigger buttons across the site
  document.querySelectorAll(".trigger-quote-modal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openQuotePopup();
    });
  });

  if (closeQuoteBtn) {
    closeQuoteBtn.addEventListener("click", () => quoteDialog.close());
  }

  // Apply dialog click-backdrop close fallback
  setupDialogBackdropFallback(quoteDialog);
  setupDialogBackdropFallback(document.getElementById("admin-dialog"));

  // Helper for dialog fallback (Safari doesn't support closedby="any" natively)
  function setupDialogBackdropFallback(dialog) {
    if (!dialog) return;

    // Check support for closedBy
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;

        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          dialog.close();
        }
      });
    }
  }

  // 4. Form Submission & WhatsApp Link Formatting
  const activeForms = [
    { form: document.getElementById("quote-section-form"), isModal: false },
    { form: document.getElementById("quote-modal-form"), isModal: true }
  ];

  activeForms.forEach(({ form, isModal }) => {
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const mobile = form.querySelector('[name="mobile"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const material = form.querySelector('[name="material"]').value;
      const quantity = form.querySelector('[name="quantity"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      if (!name || !mobile || !material || !quantity) {
        if (window.SISC_ADMIN) {
          window.SISC_ADMIN.showToast("Please fill all required fields", "error");
        }
        return;
      }

      // 1. Save to Database
      const inquiry = { name, mobile, email, material, quantity, message };
      if (window.SISC_DATA) {
        window.SISC_DATA.saveInquiry(inquiry);
      }

      // 2. Format WhatsApp Message Template
      const waNumber = "917010219074"; // Primary business WhatsApp in international format (91 prefix for India)
      const waMessage = `Hello South India Steel Corporation, I would like to request a quote.

*Name:* ${name}
*Contact:* ${mobile}
*Email:* ${email || 'N/A'}
*Material:* ${material}
*Quantity:* ${quantity}
*Message:* ${message || 'N/A'}`;

      const encodedMessage = encodeURIComponent(waMessage);
      const waUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodedMessage}`;

      // 3. Open WhatsApp and Email, then trigger success feedback
      window.open(waUrl, "_blank");

      // Format Email Client Mailto Template
      const emailTo = "sisc2k23@gmail.com";
      const emailSubject = `SISC Quote Request - ${name}`;
      const emailBody = `Hello South India Steel Corporation,

I would like to request a quote for the following requirements:

- Name: ${name}
- Mobile: ${mobile}
- Email: ${email || 'N/A'}
- Material: ${material}
- Quantity: ${quantity}
- Message: ${message || 'N/A'}

Please calculate the weight and send me a quote.

Regards,
${name}`;

      const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Delay email trigger slightly so the browser doesn't block the simultaneous window opens
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 500);

      if (window.SISC_ADMIN) {
        window.SISC_ADMIN.showToast("Quote inquiry saved! Opening WhatsApp & Email...", "success");
      }

      // Reset form and close dialog if in modal
      form.reset();
      if (isModal && quoteDialog) {
        quoteDialog.close();
      }
    });
  });

  // 5. Product Gallery & Lightbox View
  const lightboxDialog = document.getElementById("lightbox-dialog");
  const lightboxImg = lightboxDialog ? lightboxDialog.querySelector(".lightbox-img") : null;
  const lightboxCaption = lightboxDialog ? lightboxDialog.querySelector(".lightbox-caption") : null;
  const closeLightboxBtn = lightboxDialog ? lightboxDialog.querySelector(".lightbox-close") : null;

  if (lightboxDialog && lightboxImg && lightboxCaption) {
    document.querySelectorAll(".gallery-item").forEach(item => {
      item.addEventListener("click", () => {
        const imgSrc = item.dataset.img || item.querySelector("img").src;
        const caption = item.dataset.caption || item.querySelector(".gallery-title").textContent;

        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = caption;
        lightboxDialog.showModal();
      });
    });

    if (closeLightboxBtn) {
      closeLightboxBtn.addEventListener("click", () => lightboxDialog.close());
    }

    setupDialogBackdropFallback(lightboxDialog);
  }


  // 7. Testimonials Carousel Navigation & Fallbacks
  const scroller = document.querySelector(".testimonials-scroller");
  const carouselPrevBtn = document.getElementById("carousel-prev");
  const carouselNextBtn = document.getElementById("carousel-next");

  if (scroller) {
    if (carouselPrevBtn) {
      carouselPrevBtn.addEventListener("click", () => {
        const slideWidth = scroller.querySelector(".testimonial-slide").clientWidth;
        scroller.scrollBy({ left: -(slideWidth + 32), behavior: "smooth" }); // 32px gap
      });
    }

    if (carouselNextBtn) {
      carouselNextBtn.addEventListener("click", () => {
        const slideWidth = scroller.querySelector(".testimonial-slide").clientWidth;
        scroller.scrollBy({ left: slideWidth + 32, behavior: "smooth" });
      });
    }

    // Scroll Driven Animation Fallback for cross-browser support (e.g. Firefox)
    if (!CSS.supports("(animation-timeline: view()) and (animation-range: entry)")) {
      const slides = scroller.querySelectorAll(".testimonial-slide");
      const animations = new Map();

      slides.forEach(slide => {
        const anim = slide.animate(
          {
            opacity: ["0.4", "1", "0.4"],
            transform: ["scale(0.92)", "scale(1)", "scale(0.92)"]
          },
          {
            duration: 1,
            fill: "both"
          }
        );
        anim.pause();
        animations.set(slide, anim);
      });

      const tick = () => {
        const scrollerRect = scroller.getBoundingClientRect();
        
        slides.forEach(slide => {
          const anim = animations.get(slide);
          if (!anim) return;

          const slideRect = slide.getBoundingClientRect();
          // Calculate relative horizontal progress center-point
          const centerOffset = slideRect.left + slideRect.width / 2 - scrollerRect.left;
          let progress = centerOffset / scrollerRect.width;

          // Clamp progress value between 0 and 1
          progress = Math.max(0, Math.min(1, progress));
          anim.currentTime = progress;
        });
      };

      scroller.addEventListener("scroll", tick);
      window.addEventListener("resize", tick);
      tick();
    }
  }

  // Helpers
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
