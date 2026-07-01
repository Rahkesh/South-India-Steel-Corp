// Default seed data for South India Steel Corporation
const DEFAULT_PRODUCTS = [
  {
    id: "tmt-amman-try",
    name: "Amman-Try TMT Bars",
    category: "TMT Bars",
    badge: "Best Seller",
    image: "assets/images/tmt_real_2.jpg",
    description: "Premium high-strength steel reinforcement bars with excellent bendability and bonding strength. Ideal for all construction projects.",
    specs: {
      "Grade": "Fe 500D / Fe 550",
      "Sizes": "8mm - 32mm",
      "Features": "Corrosion Resistance, Earthquake Resistance, High Fatigue Strength"
    }
  },
  {
    id: "tmt-pulkit",
    name: "Pulkit TMT Bars",
    category: "TMT Bars",
    image: "assets/images/tmt_real_3.jpg",
    description: "Highly durable TMT bars manufactured using advanced technology, offering superior yield strength and corrosion resistance.",
    specs: {
      "Grade": "Fe 500D",
      "Sizes": "8mm - 25mm",
      "Features": "Thermo-Mechanically Treated, High Weldability, Economical"
    }
  },
  {
    id: "roofing-color",
    name: "Color Coated Roofing Sheets",
    category: "Roofing Sheets",
    image: "assets/images/roofing_sheets.png",
    description: "Aesthetically pleasing and weather-resistant galvalume sheets. Heat reflecting and perfect for residential and commercial buildings.",
    specs: {
      "Colors": "Royal Blue, Brick Red, Mist Green",
      "Thickness": "0.35mm - 0.50mm",
      "Material": "Alu-Zinc Coated Steel (Galvalume)"
    }
  },
  {
    id: "roofing-industrial",
    name: "Industrial Roofing Sheets",
    category: "Roofing Sheets",
    image: "assets/images/roofing_sheets.png",
    description: "Heavy-duty profiled roofing sheets designed for factories, warehouses, agricultural sheds, and industrial setups.",
    specs: {
      "Profile": "Trapezoidal, Corrugated",
      "Width": "1000mm - 1220mm",
      "Span": "High load-bearing capacity"
    }
  },
  {
    id: "pipes-ms",
    name: "MS Hollow Sections (Pipes)",
    category: "MS Pipes",
    image: "assets/images/ms_pipes.png",
    description: "High-grade Mild Steel pipes available in Round, Square, and Rectangular sections. Perfect for structural and fabrication jobs.",
    specs: {
      "Types": "Round, Square, Rectangular",
      "Sizes": "1/2 inch to 8 inch",
      "Grades": "YST-210 / YST-310 (IS 4923 / IS 1161)"
    }
  },
  {
    id: "steel-angles",
    name: "MS Angles (L-Sections)",
    category: "Steel Angles",
    image: "assets/images/steel_angles.png",
    description: "Hot-rolled structural steel equal angles. High load-bearing capacity, ideal for power transmission towers, frames, and trusses.",
    specs: {
      "Sizes": "25x25mm to 100x100mm",
      "Thickness": "3mm - 10mm",
      "Standards": "IS 2062 Gr A/B"
    }
  },
  {
    id: "steel-flats",
    name: "Mild Steel Flats (Flat Bars)",
    category: "Flats",
    image: "assets/images/steel_angles.png",
    description: "High-tensile MS flat bars, widely used for window grills, ornamental gates, structural bracing, and base plates.",
    specs: {
      "Width": "20mm - 150mm",
      "Thickness": "3mm - 12mm",
      "Finish": "Hot Rolled, Clean edges"
    }
  },
  {
    id: "cr-sheets",
    name: "Cold Rolled Sheets (CR)",
    category: "CR Sheets",
    image: "assets/images/cr_sheets.png",
    description: "Cold-rolled sheets offering smooth surface finish, uniform thickness, and high formability. Used for automotive and precision fabrication.",
    specs: {
      "Thickness": "0.50mm - 2.00mm",
      "Finish": "Bright, Matte, Semi-bright",
      "Formability": "Drawing quality / Extra Deep Drawing"
    }
  },
  {
    id: "hr-plates",
    name: "Hot Rolled Plates (HR)",
    category: "HR Plates",
    image: "assets/images/hr_plates.png",
    description: "Heavy-duty hot-rolled steel plates with rugged structure. Exceptional tensile strength, designed for structural girders and heavy machine beds.",
    specs: {
      "Thickness": "5.00mm - 50.00mm",
      "Grades": "IS 2062 E250 / E350",
      "Application": "Industrial flooring, structural panels, ships"
    }
  }
];

const STORAGE_KEYS = {
  PRODUCTS: "sisc_products",
  INQUIRIES: "sisc_inquiries"
};

// Seeding and storage interface
window.SISC_DATA = {
  init() {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored || !stored.includes('"badge"') || stored.includes('tmt_bars.png')) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
    }
  },

  getProducts() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  resetProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  },

  getInquiries() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES));
  },

  saveInquiry(inquiry) {
    this.init();
    const inquiries = this.getInquiries();
    inquiries.unshift({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ...inquiry
    });
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  },

  deleteInquiry(id) {
    const inquiries = this.getInquiries();
    const filtered = inquiries.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(filtered));
  }
};
