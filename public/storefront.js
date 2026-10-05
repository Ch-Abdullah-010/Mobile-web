/* ==========================================================================
   SmartPOS Mobile Store — standalone static demo script
   Shared by storefront.html, products.html, categories.html, about.html,
   contact.html. Vanilla JS only, no modules, no dependencies.
   Data mirrors prisma/seed-data.ts (demo data).
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Icons (inner markup for a 24x24 stroke SVG)
     ---------------------------------------------------------------------- */

  var ICONS = {
    smartphone:
      '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    headphones:
      '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    plug:
      '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
    "battery-charging":
      '<path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><path d="M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1"/><path d="m11 7-3 5h4l-3 5"/><line x1="22" x2="22" y1="11" y2="13"/>',
    shield:
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    "shield-check":
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    watch:
      '<circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-1.96-1.61h-2.72a2 2 0 0 0-1.96 1.61l-.81 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 1.97 1.64h2.72a2 2 0 0 0 1.96-1.61l.81-4.05"/>',
    speaker:
      '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M12 6h.01"/><circle cx="12" cy="14" r="4"/><path d="M12 14h.01"/>',
    cart:
      '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    user:
      '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    truck:
      '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    "credit-card":
      '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    headset:
      '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
    "package-check":
      '<path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" x2="12" y1="22" y2="12"/>',
    sparkles:
      '<path d="M9.94 14.34 8.5 18l-1.44-3.66L3.4 13l3.66-1.34L8.5 8l1.44 3.66L13.6 13z"/><path d="M18 4v4"/><path d="M20 6h-4"/><path d="M18 14v3"/><path d="M19.5 15.5h-3"/>',
    "map-pin":
      '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone:
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    target:
      '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    heart:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    users:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'
  };

  function icon(name, cls) {
    var body = ICONS[name] || "";
    return (
      '<svg class="' +
      (cls || "icon") +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body +
      "</svg>"
    );
  }

  /* ----------------------------------------------------------------------
     Data
     ---------------------------------------------------------------------- */

  var CATEGORIES = [
    { name: "Smartphones", slug: "smartphones", icon: "smartphone", description: "Latest 5G smartphones from Samsung, Apple, Xiaomi, OnePlus and Google with official warranty." },
    { name: "Earbuds & Headphones", slug: "audio", icon: "headphones", description: "Wireless earbuds, over-ear headphones and audio accessories with active noise cancellation." },
    { name: "Chargers & Cables", slug: "charging", icon: "plug", description: "Fast chargers, USB-C cables and car chargers to keep your devices powered all day." },
    { name: "Power Banks", slug: "power-banks", icon: "battery-charging", description: "High-capacity portable power banks with fast charging and multiple output ports." },
    { name: "Cases & Covers", slug: "covers", icon: "shield", description: "Protective phone cases and covers with shock absorption and a premium finish." },
    { name: "Screen Protectors", slug: "screen-protectors", icon: "shield-check", description: "9H tempered glass screen protectors with full coverage and oleophobic coating." },
    { name: "Smart Watches", slug: "smart-watches", icon: "watch", description: "Fitness-focused smart watches with AMOLED displays, SpO2 and long battery life." },
    { name: "Bluetooth Speakers", slug: "speakers", icon: "speaker", description: "Portable Bluetooth speakers with rich bass, water resistance and long playtime." }
  ];

  var PRODUCTS = [
    { name: "Samsung Galaxy A16", slug: "samsung-galaxy-a16", brand: "Samsung", category: "smartphones", price: 54999, compareAt: 59999, short: '6.7" AMOLED · 50MP camera · 5000mAh battery', featured: true, isNew: false, sold: 142, rating: 4.6, reviews: 98, stock: 18 },
    { name: "Samsung Galaxy A25", slug: "samsung-galaxy-a25", brand: "Samsung", category: "smartphones", price: 69999, compareAt: 74999, short: '6.5" AMOLED · 8GB RAM · 5G', featured: true, isNew: false, sold: 118, rating: 4.5, reviews: 76, stock: 12 },
    { name: "Samsung Galaxy A35", slug: "samsung-galaxy-a35", brand: "Samsung", category: "smartphones", price: 104999, compareAt: 112999, short: '6.6" AMOLED · 256GB · 50MP OIS', featured: true, isNew: true, sold: 76, rating: 4.7, reviews: 54, stock: 10 },
    { name: "Apple iPhone 13", slug: "apple-iphone-13", brand: "Apple", category: "smartphones", price: 149999, compareAt: 159999, short: '6.1" Super Retina XDR · A15 Bionic · Dual camera', featured: true, isNew: false, sold: 98, rating: 4.9, reviews: 132, stock: 8 },
    { name: "Apple iPhone 14", slug: "apple-iphone-14", brand: "Apple", category: "smartphones", price: 179999, compareAt: 189999, short: '6.1" Super Retina XDR · Photonic Engine', featured: false, isNew: false, sold: 71, rating: 4.8, reviews: 88, stock: 7 },
    { name: "Apple iPhone 15", slug: "apple-iphone-15", brand: "Apple", category: "smartphones", price: 219999, compareAt: 229999, short: '6.1" Super Retina XDR · 48MP · Dynamic Island', featured: true, isNew: true, sold: 64, rating: 4.9, reviews: 61, stock: 6 },
    { name: "Xiaomi Redmi Note 13", slug: "redmi-note-13", brand: "Xiaomi", category: "smartphones", price: 54999, compareAt: 59999, short: '6.67" AMOLED · 108MP · 5000mAh', featured: false, isNew: false, sold: 205, rating: 4.5, reviews: 176, stock: 22 },
    { name: "Xiaomi Redmi Note 13 Pro", slug: "redmi-note-13-pro", brand: "Xiaomi", category: "smartphones", price: 84999, compareAt: 89999, short: '6.67" 1.5K AMOLED · 200MP · 67W', featured: false, isNew: true, sold: 133, rating: 4.7, reviews: 104, stock: 14 },
    { name: "OnePlus Nord CE 4", slug: "oneplus-nord-ce-4", brand: "OnePlus", category: "smartphones", price: 114999, compareAt: 124999, short: '6.7" AMOLED · 100W charging · 5500mAh', featured: false, isNew: false, sold: 58, rating: 4.6, reviews: 49, stock: 9 },
    { name: "OnePlus Nord 4", slug: "oneplus-nord-4", brand: "OnePlus", category: "smartphones", price: 149999, compareAt: 159999, short: '6.74" AMOLED · 12GB RAM · 100W', featured: false, isNew: true, sold: 41, rating: 4.7, reviews: 33, stock: 7 },
    { name: "Google Pixel 8a", slug: "google-pixel-8a", brand: "Google", category: "smartphones", price: 149999, compareAt: 159999, short: '6.1" Actua display · Tensor G3 · 7 years updates', featured: true, isNew: false, sold: 47, rating: 4.6, reviews: 40, stock: 8 },
    { name: "Google Pixel 8", slug: "google-pixel-8", brand: "Google", category: "smartphones", price: 199999, compareAt: 209999, short: '6.2" OLED · 50MP · Pure Android', featured: false, isNew: false, sold: 29, rating: 4.7, reviews: 26, stock: 5 },
    { name: "Anker Soundcore P40i Wireless Earbuds", slug: "anker-soundcore-p40i-earbuds", brand: "Anker", category: "audio", price: 12999, compareAt: 14999, short: "Bluetooth 5.3 · ANC · 60h total playtime", featured: true, isNew: false, sold: 176, rating: 4.6, reviews: 143, stock: 30 },
    { name: "Xiaomi Redmi Buds 5", slug: "redmi-buds-5", brand: "Xiaomi", category: "audio", price: 8999, compareAt: 9999, short: "Bluetooth 5.3 · 46dB ANC · 40h playtime", featured: false, isNew: false, sold: 154, rating: 4.4, reviews: 121, stock: 25 },
    { name: "Anker Soundcore H30i Headphones", slug: "anker-soundcore-h30i-headphones", brand: "Anker", category: "audio", price: 3999, compareAt: 4999, short: "Over-ear · 70h playtime · BassUp", featured: false, isNew: false, sold: 97, rating: 4.3, reviews: 74, stock: 22 },
    { name: "Anker 33W USB-C Fast Charger", slug: "anker-33w-usb-c-charger", brand: "Anker", category: "charging", price: 3499, compareAt: 3999, short: "33W GaN · USB-C · PowerIQ 3.0", featured: false, isNew: false, sold: 240, rating: 4.8, reviews: 188, stock: 40 },
    { name: "Anker USB-C to USB-C Cable 1.2m", slug: "anker-usb-c-cable", brand: "Anker", category: "charging", price: 1299, compareAt: 1699, short: "60W PD · Nylon braided · 1.2m", featured: false, isNew: false, sold: 365, rating: 4.7, reviews: 254, stock: 55 },
    { name: "Anker 20W USB-C Car Charger", slug: "anker-20w-car-charger", brand: "Anker", category: "charging", price: 2499, compareAt: null, short: "20W USB-C PD + USB-A · Dual port", featured: false, isNew: false, sold: 158, rating: 4.5, reviews: 112, stock: 35 },
    { name: "Anker PowerCore 20000mAh Power Bank", slug: "anker-powercore-20000", brand: "Anker", category: "power-banks", price: 5999, compareAt: 6999, short: "20000mAh · USB-C + dual USB-A · PowerIQ", featured: true, isNew: false, sold: 189, rating: 4.7, reviews: 156, stock: 26 },
    { name: "Spigen Rugged Armor Mobile Cover", slug: "spigen-rugged-armor-cover", brand: "Spigen", category: "covers", price: 1499, compareAt: 1999, short: "Shock-absorbing TPU · Air Cushion Technology", featured: false, isNew: false, sold: 320, rating: 4.6, reviews: 219, stock: 50 },
    { name: "Spigen iPhone 15 Silicone Cover", slug: "spigen-iphone-15-silicone-cover", brand: "Spigen", category: "covers", price: 1999, compareAt: 2499, short: "Liquid silicone · Microfibre lining · MagSafe ready", featured: false, isNew: true, sold: 88, rating: 4.5, reviews: 67, stock: 28 },
    { name: "Spigen Tempered Glass Screen Protector", slug: "spigen-tempered-glass", brand: "Spigen", category: "screen-protectors", price: 999, compareAt: 1499, short: "9H tempered glass · Oleophobic coating", featured: false, isNew: false, sold: 410, rating: 4.4, reviews: 289, stock: 60 },
    { name: "Xiaomi Smart Band 8", slug: "xiaomi-smart-band-8", brand: "Xiaomi", category: "smart-watches", price: 9999, compareAt: 11999, short: '1.62" AMOLED · 16-day battery · 150+ workout modes', featured: true, isNew: false, sold: 112, rating: 4.6, reviews: 91, stock: 18 },
    { name: "JBL Go 4 Bluetooth Speaker", slug: "jbl-go-4-speaker", brand: "JBL", category: "speakers", price: 6999, compareAt: 7999, short: "Bluetooth 5.3 · IP67 · 7h playtime", featured: false, isNew: false, sold: 143, rating: 4.5, reviews: 118, stock: 20 }
  ];

  var PRODUCT_IMAGES = {
    "samsung-galaxy-a16": "samsung-galaxy-a16.jpg",
    "samsung-galaxy-a25": "samsung-galaxy-a25.jpg",
    "samsung-galaxy-a35": "samsung-galaxy-a35.png",
    "apple-iphone-13": "apple-iphone-13.jpg",
    "apple-iphone-14": "apple-iphone-14.jpg",
    "apple-iphone-15": "apple-iphone-15.jpg",
    "redmi-note-13": "redmi-note-13.png",
    "redmi-note-13-pro": "redmi-note-13-pro.png",
    "oneplus-nord-ce-4": "oneplus-nord-ce-4.png",
    "oneplus-nord-4": "oneplus-nord-4.png",
    "google-pixel-8a": "google-pixel-8a.jpg",
    "google-pixel-8": "google-pixel-8.jpg",
    "anker-soundcore-p40i-earbuds": "anker-soundcore-p40i-earbuds.png",
    "redmi-buds-5": "redmi-buds-5.png",
    "anker-soundcore-h30i-headphones": "anker-soundcore-h30i-headphones.jpg",
    "anker-33w-usb-c-charger": "anker-33w-usb-c-charger.png",
    "anker-usb-c-cable": "anker-usb-c-cable.png",
    "anker-20w-car-charger": "anker-20w-car-charger.png",
    "anker-powercore-20000": "anker-powercore-20000.png",
    "spigen-rugged-armor-cover": "spigen-rugged-armor-cover.jpg",
    "spigen-iphone-15-silicone-cover": "spigen-iphone-15-silicone-cover.jpg",
    "spigen-tempered-glass": "spigen-tempered-glass.jpg",
    "xiaomi-smart-band-8": "xiaomi-smart-band-8.png",
    "jbl-go-4-speaker": "jbl-go-4-speaker.jpg"
  };

  var REVIEWS = [
    { author: "Bilal Ahmed", rating: 5, comment: "Ordered the iPhone 15 and it arrived next day in perfect condition. The specifications on the site matched exactly what I received.", product: "Apple iPhone 15", slug: "apple-iphone-15" },
    { author: "Aisha Khan", rating: 5, comment: "Really helpful team. I compared the Galaxy A35 and A25 on the site and they confirmed stock before I checked out. Genuine product with official warranty.", product: "Samsung Galaxy A35", slug: "samsung-galaxy-a35" },
    { author: "Sana Malik", rating: 5, comment: "The Anker power bank charges my phone four times over. Checkout was quick and tracking from my account was accurate.", product: "Anker PowerCore 20000mAh Power Bank", slug: "anker-powercore-20000" }
  ];

  /* ----------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */

  function productHref(slug) {
    return "/products/" + slug;
  }

  function money(value) {
    return "Rs " + Number(value).toLocaleString("en-US");
  }

  function categoryName(slug) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].slug === slug) return CATEGORIES[i].name;
    }
    return slug;
  }

  function categoryCount(slug) {
    var n = 0;
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].category === slug) n++;
    }
    return n;
  }

  function stars(value) {
    var out = '<span class="stars" role="img" aria-label="Rated ' + value + ' out of 5">';
    for (var i = 1; i <= 5; i++) {
      out +=
        '<svg class="' +
        (i <= Math.round(value) ? "" : "empty") +
        '" viewBox="0 0 24 24" aria-hidden="true">' +
        ICONS.star +
        "</svg>";
    }
    return out + "</span>";
  }

  function visual(product, extraClass) {
    var file = PRODUCT_IMAGES[product.slug] || product.slug + ".jpg";
    return (
      '<img class="visual ' +
      (extraClass || "") +
      '" src="images/products/' +
      file +
      '" alt="" loading="lazy" decoding="async" width="400" height="400">'
    );
  }

  function badges(product) {
    var out = "";
    if (product.isNew) out += '<span class="badge badge-new">New</span>';
    if (product.compareAt) out += '<span class="badge badge-sale">Sale</span>';
    if (product.featured && !product.isNew && !product.compareAt) {
      out += '<span class="badge badge-brand">Featured</span>';
    }
    return out ? '<div class="thumb-badges">' + out + "</div>" : "";
  }

  function stockNote(product) {
    if (product.stock <= 0) return '<span class="stock-note out">Out of stock</span>';
    if (product.stock < 5) return '<span class="stock-note low">Only ' + product.stock + " left</span>";
    return '<span class="stock-note">In stock</span>';
  }

  function productCard(product) {
    var href = productHref(product.slug);
    return (
      '<article class="product-card">' +
      '<a class="product-thumb" href="' +
      href +
      '" aria-label="View ' +
      product.name +
      '">' +
      badges(product) +
      visual(product) +
      "</a>" +
      '<div class="product-body">' +
      '<p class="product-brand">' +
      product.brand +
      "</p>" +
      '<a class="product-name" href="' +
      href +
      '">' +
      product.name +
      "</a>" +
      '<p class="product-desc">' +
      product.short +
      "</p>" +
      '<div class="rating">' +
      stars(product.rating) +
      "<span>" +
      product.rating.toFixed(1) +
      " (" +
      product.reviews +
      ")</span></div>" +
      '<div class="product-foot"><div><span class="price">' +
      money(product.price) +
      "</span>" +
      (product.compareAt ? '<span class="price-compare">' + money(product.compareAt) + "</span>" : "") +
      "</div>" +
      stockNote(product) +
      "</div></div></article>"
    );
  }

  function bySold(a, b) {
    return b.sold - a.sold;
  }

  function byNewest(a, b) {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return b.sold - a.sold;
  }

  function byPriceAsc(a, b) {
    return a.price - b.price;
  }

  function byPriceDesc(a, b) {
    return b.price - a.price;
  }

  /* ----------------------------------------------------------------------
     Rendering
     ---------------------------------------------------------------------- */

  function renderHome() {
    var hero = document.querySelector("[data-hero-product]");
    if (hero) {
      var featured = PRODUCTS.filter(function (p) {
        return p.featured;
      }).sort(bySold);
      var p = featured[0] || PRODUCTS[0];
      hero.innerHTML =
        '<div class="hero-card">' +
        visual(p, "") +
        '<div class="hero-card-foot"><div><p class="eyebrow">' +
        p.brand +
        '</p><p class="title">' +
        p.name +
        '</p></div><span class="badge badge-success">In stock</span></div>' +
        "</div>" +
        '<div class="float-chip left"><span class="chip-ok">' +
        icon("shield-check", "icon-sm") +
        " Genuine products</span></div>" +
        '<div class="float-chip right"><span class="chip-brand">' +
        icon("package-check", "icon-sm") +
        " Live stock levels</span></div>";
    }

    renderInto("[data-render='featured']", PRODUCTS.filter(function (p) { return p.featured; }).sort(bySold).slice(0, 4));
    renderInto("[data-render='popular']", PRODUCTS.slice().sort(bySold).slice(0, 8));
    renderInto("[data-render='new']", PRODUCTS.slice().sort(byNewest).filter(function (p) { return p.isNew; }).slice(0, 4));
    renderInto("[data-render='accessories']", PRODUCTS.filter(function (p) { return p.category !== "smartphones"; }).sort(bySold).slice(0, 4));
    renderInto("[data-render='reviews']", REVIEWS, reviewCard);
  }

  function renderInto(selector, list, template) {
    var el = document.querySelector(selector);
    if (!el) return;
    var tpl = template || productCard;
    var html = "";
    for (var i = 0; i < list.length; i++) html += tpl(list[i]);
    el.innerHTML = html;
  }

  function reviewCard(review) {
    return (
      '<figure class="review">' +
      "<div>" +
      stars(review.rating) +
      "</div>" +
      '<blockquote>"' +
      review.comment +
      '"</blockquote>' +
      "<figcaption><strong>" +
      review.author +
      "</strong><span>on <a href=\"" +
      productHref(review.slug) +
      '">' +
      review.product +
      "</a></span></figcaption></figure>"
    );
  }

  function renderCategories() {
    renderInto(
      "[data-category-grid]",
      CATEGORIES,
      function (c) {
        return (
          '<a class="category-card" href="products.html?category=' +
          c.slug +
          '">' +
          '<span class="category-icon">' +
          icon(c.icon) +
          "</span>" +
          "<span><span class=\"name\">" +
          c.name +
          '</span><span class="count">' +
          categoryCount(c.slug) +
          " products</span></span></a>"
        );
      }
    );

    renderInto(
      "[data-popular-categories]",
      CATEGORIES.slice()
        .sort(function (a, b) {
          return categoryCount(b.slug) - categoryCount(a.slug);
        })
        .slice(0, 4),
      function (c) {
        return (
          '<a class="category-card" href="products.html?category=' +
          c.slug +
          '">' +
          '<span class="category-icon">' +
          icon(c.icon) +
          "</span>" +
          "<span><span class=\"name\">" +
          c.name +
          '</span><span class="count">' +
          categoryCount(c.slug) +
          " products</span></span></a>"
        );
      }
    );

    renderInto("[data-category-detailed]", CATEGORIES, function (c) {
      return (
        '<a class="category-card" href="products.html?category=' +
        c.slug +
        '">' +
        '<span class="category-icon">' +
        icon(c.icon) +
        "</span>" +
        '<span><span class="name">' +
        c.name +
        '</span><span class="count">' +
        categoryCount(c.slug) +
        ' products</span><span class="desc">' +
        c.description +
        "</span></span></a>"
      );
    });
  }

  /* ----------------------------------------------------------------------
     Catalogue (products.html)
     ---------------------------------------------------------------------- */

  function initCatalog() {
    var grid = document.getElementById("catalog-grid");
    if (!grid) return;

    var searchInput = document.getElementById("catalog-search");
    var sortSelect = document.getElementById("catalog-sort");
    var countEl = document.getElementById("catalog-count");
    var emptyEl = document.getElementById("catalog-empty");
    var filterWrap = document.getElementById("category-filters");
    var activeCategory = "all";
    var query = "";

    var params = new URLSearchParams(window.location.search);
    if (params.get("category")) activeCategory = params.get("category");

    function buildFilters() {
      if (!filterWrap) return;
      var html =
        filterButton("all", "All products", PRODUCTS.length);
      for (var i = 0; i < CATEGORIES.length; i++) {
        html += filterButton(CATEGORIES[i].slug, CATEGORIES[i].name, categoryCount(CATEGORIES[i].slug));
      }
      filterWrap.innerHTML = html;
      filterWrap.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-category]");
        if (!btn) return;
        activeCategory = btn.getAttribute("data-category");
        apply();
      });
    }

    function filterButton(slug, label, count) {
      return (
        '<button type="button" class="filter-btn" data-category="' +
        slug +
        '" aria-pressed="' +
        (activeCategory === slug) +
        '"><span>' +
        label +
        '</span><span class="n">' +
        count +
        "</span></button>"
      );
    }

    function apply() {
      var list = PRODUCTS.slice();
      if (activeCategory !== "all") {
        list = list.filter(function (p) {
          return p.category === activeCategory;
        });
      }
      if (query) {
        var q = query.toLowerCase();
        list = list.filter(function (p) {
          return (
            p.name.toLowerCase().indexOf(q) !== -1 ||
            p.brand.toLowerCase().indexOf(q) !== -1 ||
            p.short.toLowerCase().indexOf(q) !== -1
          );
        });
      }

      var sort = sortSelect ? sortSelect.value : "popular";
      if (sort === "price-asc") list.sort(byPriceAsc);
      else if (sort === "price-desc") list.sort(byPriceDesc);
      else if (sort === "newest") list.sort(byNewest);
      else list.sort(bySold);

      var html = "";
      for (var i = 0; i < list.length; i++) html += productCard(list[i]);
      grid.innerHTML = html;
      if (emptyEl) emptyEl.style.display = list.length ? "none" : "block";
      if (countEl) {
        countEl.textContent =
          list.length +
          (list.length === 1 ? " product" : " products") +
          (activeCategory !== "all" ? " in " + categoryName(activeCategory) : "");
      }

      if (filterWrap) {
        var btns = filterWrap.querySelectorAll("[data-category]");
        for (var j = 0; j < btns.length; j++) {
          btns[j].setAttribute("aria-pressed", String(btns[j].getAttribute("data-category") === activeCategory));
        }
      }

      var url = new URL(window.location.href);
      if (activeCategory === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", activeCategory);
      window.history.replaceState({}, "", url.toString());
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        query = searchInput.value.trim();
        apply();
      });
    }
    if (sortSelect) sortSelect.addEventListener("change", apply);

    buildFilters();
    apply();
  }

  /* ----------------------------------------------------------------------
     Contact form (demo only)
     ---------------------------------------------------------------------- */

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var success = document.getElementById("contact-success");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var fields = [
        { el: form.elements.name, test: function (v) { return v.length > 1; } },
        { el: form.elements.email, test: function (v) { return /.+@.+\..+/.test(v); } },
        { el: form.elements.message, test: function (v) { return v.length > 9; } }
      ];
      var ok = true;
      fields.forEach(function (f) {
        var error = f.el.parentElement.querySelector(".field-error");
        var valid = f.test(f.el.value.trim());
        f.el.classList.toggle("invalid", !valid);
        if (error) error.textContent = valid ? "" : "Please complete this field.";
        if (!valid) ok = false;
      });
      if (!ok) return;

      if (success) {
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }

  /* ----------------------------------------------------------------------
     Shared chrome: nav, cart badge, year
     ---------------------------------------------------------------------- */

  function initNav() {
    var toggle = document.getElementById("menu-toggle");
    var mobile = document.getElementById("mobile-nav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.innerHTML = open ? icon("x") : icon("menu");
      });
    }

    var current = window.location.pathname.split("/").pop() || "storefront.html";
    var links = document.querySelectorAll(".main-nav a, .mobile-nav a[data-page]");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      if (href === current) links[i].setAttribute("aria-current", "page");
    }
  }

  function initCartBadge() {
    var count = 0;
    try {
      count = parseInt(window.localStorage.getItem("smartpos_cart_count") || "0", 10) || 0;
    } catch (e) {
      count = 0;
    }
    var badges = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = String(count);
      badges[i].style.display = count > 0 ? "inline-flex" : "none";
    }
  }

  function initYear() {
    var els = document.querySelectorAll("[data-year]");
    for (var i = 0; i < els.length; i++) els[i].textContent = String(new Date().getFullYear());
  }

  function initStats() {
    var p = document.querySelector("[data-stat-products]");
    if (p) p.textContent = String(PRODUCTS.length);
    var c = document.querySelector("[data-stat-categories]");
    if (c) c.textContent = String(CATEGORIES.length);
  }

  /* ---------------------------------------------------------------------- */

  function init() {
    initNav();
    initCartBadge();
    initYear();
    initStats();
    renderHome();
    renderCategories();
    initCatalog();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
