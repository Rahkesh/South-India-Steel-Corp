// South India Steel Corporation - Admin Panel Logic

(function() {
  const PASSCODE = "admin123";
  let onUpdateCallback = null;
  let editingProductId = null;

  // DOM references inside the admin dialog
  let adminDialog, tabButtons, tabContents, inquiryList, productAdminGrid, productForm, formTitle, submitBtn;

  function initAdmin(updateCallback) {
    onUpdateCallback = updateCallback;

    // Hook the footer link
    const adminLink = document.getElementById("admin-portal-link");
    if (adminLink) {
      adminLink.addEventListener("click", (e) => {
        e.preventDefault();
        challengeAdmin();
      });
    }

    // Capture dialog and components
    adminDialog = document.getElementById("admin-dialog");
    if (!adminDialog) return;

    tabButtons = adminDialog.querySelectorAll(".admin-tab-btn");
    tabContents = adminDialog.querySelectorAll(".admin-tab-content");
    inquiryList = adminDialog.querySelector("#admin-inquiry-list");
    productAdminGrid = adminDialog.querySelector("#admin-product-grid");
    productForm = adminDialog.querySelector("#admin-product-form");
    formTitle = adminDialog.querySelector("#admin-form-title");
    submitBtn = adminDialog.querySelector("#admin-submit-btn");

    // Close button inside header
    const closeBtn = adminDialog.querySelector(".dialog-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => adminDialog.close());
    }

    // Hook tab buttons
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        switchTab(tabId);
      });
    });

    // Hook product form submit
    if (productForm) {
      productForm.addEventListener("submit", handleProductFormSubmit);
      const cancelBtn = productForm.querySelector(".btn-secondary");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
          e.preventDefault();
          resetProductForm();
        });
      }
    }
  }

  function challengeAdmin() {
    const code = prompt("Enter Admin Passcode:");
    if (code === null) return; // User cancelled
    
    if (code === PASSCODE) {
      showToast("Access Granted", "success");
      openAdminPortal();
    } else {
      showToast("Invalid Passcode. Access Denied.", "error");
    }
  }

  function openAdminPortal() {
    if (!adminDialog) return;
    
    // Refresh lists
    renderInquiries();
    renderProductsList();
    resetProductForm();
    switchTab("inquiries");
    
    adminDialog.showModal();
  }

  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    tabContents.forEach(content => {
      content.classList.toggle("active", content.id === `tab-${tabId}`);
    });
  }

  // Render inquiries list
  function renderInquiries() {
    if (!inquiryList) return;
    const inquiries = window.SISC_DATA.getInquiries();

    if (inquiries.length === 0) {
      inquiryList.innerHTML = `<div class="empty-state">No inquiries received yet.</div>`;
      return;
    }

    inquiryList.innerHTML = inquiries.map(item => `
      <div class="inquiry-item">
        <div class="inquiry-meta">
          <h5>${escapeHTML(item.name)}</h5>
          <div class="date">${item.date}</div>
          <div class="inquiry-details">
            <span><strong>Mobile:</strong> <a href="tel:${item.mobile}" style="color:var(--primary)">${escapeHTML(item.mobile)}</a></span>
            <span><strong>Email:</strong> ${escapeHTML(item.email)}</span>
            <span><strong>Material:</strong> ${escapeHTML(item.material)}</span>
            <span><strong>Quantity:</strong> ${escapeHTML(item.quantity)}</span>
            ${item.message ? `<span style="margin-top: 0.5rem; display:block; font-style: italic;">"${escapeHTML(item.message)}"</span>` : ''}
          </div>
        </div>
        <button class="inquiry-delete-btn" data-id="${item.id}">Delete</button>
      </div>
    `).join("");

    // Add delete listeners
    inquiryList.querySelectorAll(".inquiry-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("Delete this inquiry?")) {
          window.SISC_DATA.deleteInquiry(id);
          renderInquiries();
          showToast("Inquiry deleted successfully", "success");
        }
      });
    });
  }

  // Render products for management grid
  function renderProductsList() {
    if (!productAdminGrid) return;
    const products = window.SISC_DATA.getProducts();

    if (products.length === 0) {
      productAdminGrid.innerHTML = `<div class="empty-state">No products found.</div>`;
      return;
    }

    productAdminGrid.innerHTML = products.map(p => `
      <div class="product-admin-item">
        <div class="product-admin-info">
          <h6>${escapeHTML(p.name)}</h6>
          <span>${escapeHTML(p.category)}</span>
        </div>
        <div class="product-admin-actions">
          <button class="product-admin-btn edit" data-id="${p.id}">Edit</button>
          <button class="product-admin-btn delete" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `).join("");

    // Add action listeners
    productAdminGrid.querySelectorAll(".product-admin-btn.edit").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        loadProductIntoForm(id);
      });
    });

    productAdminGrid.querySelectorAll(".product-admin-btn.delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("Are you sure you want to delete this product?")) {
          deleteProduct(id);
        }
      });
    });
  }

  function loadProductIntoForm(id) {
    const products = window.SISC_DATA.getProducts();
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    editingProductId = id;
    formTitle.textContent = "Edit Product";
    submitBtn.textContent = "Update Product";

    // Populate inputs
    productForm.querySelector("#prod-name").value = p.name;
    productForm.querySelector("#prod-category").value = p.category;
    productForm.querySelector("#prod-desc").value = p.description;
    
    // Specs
    const keys = Object.keys(p.specs || {});
    productForm.querySelector("#prod-spec-key1").value = keys[0] || "";
    productForm.querySelector("#prod-spec-val1").value = p.specs ? p.specs[keys[0]] : "";
    productForm.querySelector("#prod-spec-key2").value = keys[1] || "";
    productForm.querySelector("#prod-spec-val2").value = p.specs ? p.specs[keys[1]] : "";
    productForm.querySelector("#prod-spec-key3").value = keys[2] || "";
    productForm.querySelector("#prod-spec-val3").value = p.specs ? p.specs[keys[2]] : "";

    // Smooth scroll form into view
    productForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleProductFormSubmit(e) {
    e.preventDefault();

    const name = productForm.querySelector("#prod-name").value.trim();
    const category = productForm.querySelector("#prod-category").value;
    const description = productForm.querySelector("#prod-desc").value.trim();

    if (!name || !description) {
      showToast("Please fill out name and description.", "error");
      return;
    }

    // Assemble specs
    const specs = {};
    const key1 = productForm.querySelector("#prod-spec-key1").value.trim();
    const val1 = productForm.querySelector("#prod-spec-val1").value.trim();
    const key2 = productForm.querySelector("#prod-spec-key2").value.trim();
    const val2 = productForm.querySelector("#prod-spec-val2").value.trim();
    const key3 = productForm.querySelector("#prod-spec-key3").value.trim();
    const val3 = productForm.querySelector("#prod-spec-val3").value.trim();

    if (key1 && val1) specs[key1] = val1;
    if (key2 && val2) specs[key2] = val2;
    if (key3 && val3) specs[key3] = val3;

    const products = window.SISC_DATA.getProducts();

    if (editingProductId) {
      // Modify existing
      const pIndex = products.findIndex(prod => prod.id === editingProductId);
      if (pIndex !== -1) {
        products[pIndex].name = name;
        products[pIndex].category = category;
        products[pIndex].description = description;
        products[pIndex].specs = specs;
        showToast("Product updated successfully", "success");
      }
    } else {
      // Add new
      const newId = category.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      
      // Select appropriate stock image based on category
      let image = "assets/images/tmt_bars.png";
      if (category === "Roofing Sheets") image = "assets/images/roofing_sheets.png";
      else if (category === "MS Pipes") image = "assets/images/ms_pipes.png";
      else if (category === "Steel Angles" || category === "Flats") image = "assets/images/steel_angles.png";
      else if (category === "CR Sheets") image = "assets/images/cr_sheets.png";
      else if (category === "HR Plates") image = "assets/images/hr_plates.png";

      products.push({
        id: newId,
        name,
        category,
        image,
        description,
        specs
      });
      showToast("Product added successfully", "success");
    }

    window.SISC_DATA.saveProducts(products);
    resetProductForm();
    renderProductsList();
    
    // Trigger site catalog re-render
    if (onUpdateCallback) onUpdateCallback();
  }

  function deleteProduct(id) {
    const products = window.SISC_DATA.getProducts();
    const filtered = products.filter(prod => prod.id !== id);
    
    window.SISC_DATA.saveProducts(filtered);
    renderProductsList();
    
    // Trigger site catalog re-render
    if (onUpdateCallback) onUpdateCallback();
    showToast("Product deleted", "success");
  }

  function resetProductForm() {
    editingProductId = null;
    productForm.reset();
    formTitle.textContent = "Add New Product";
    submitBtn.textContent = "Add Product";
  }

  // Helpers
  function escapeHTML(str) {
    if (!str) return '';
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

  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        ${type === "success" 
          ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>' 
          : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>'}
      </svg>
      <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);
    
    // Trigger entrance animation
    setTimeout(() => toast.classList.add("show"), 50);

    // Remove toast after duration
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Attach SISC_ADMIN to window
  window.SISC_ADMIN = {
    init: initAdmin,
    showToast: showToast
  };
})();
