let items = [];
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥'
};

const statusColors = {
  UNPAID: '#e67e22',
  PAID: '#27ae60',
  OVERDUE: '#e74c3c',
  DRAFT: '#95a5a6'
};

document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  document.getElementById('serviceDate').valueAsDate = new Date();
  
  // Load saved company data
  loadData();
  
  // Initialize listeners
  setupListeners();
  
  // Run entrance animation
  animateEntrance();
});

function animateEntrance() {
  if (typeof gsap !== 'undefined') {
    gsap.from(".glass-card", {
      duration: 1,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: "power3.out"
    });
  }
}

function setupListeners() {
  const inputs = ['customerName', 'serviceDate', 'companyName', 'companyAddress', 'customerAddress', 'invoiceNumber', 'tax', 'discount', 'currency', 'paymentStatus', 'logoShape', 'thankYouNote', 'termsInfo', 'showFooter'];
  
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const eventType = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(eventType, () => {
        updatePreview();
        saveData();
      });
    }
  });

  // Logo Upload
  const logoUpload = document.getElementById('logoUpload');
  if (logoUpload) {
    logoUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const logoBase64 = event.target.result;
          document.getElementById('prevLogo').src = logoBase64;
          document.getElementById('prevLogoContainer').style.display = 'block';
          localStorage.setItem('zoho_invoice_logo', logoBase64);
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function saveData() {
  const settings = {
    companyName: document.getElementById('companyName').value,
    companyAddress: document.getElementById('companyAddress').value,
    currency: document.getElementById('currency').value,
    tax: document.getElementById('tax').value,
    discount: document.getElementById('discount').value,
    logoShape: document.getElementById('logoShape').value,
    thankYouNote: document.getElementById('thankYouNote').value,
    termsInfo: document.getElementById('termsInfo').value,
    showFooter: document.getElementById('showFooter').checked
  };
  localStorage.setItem('zoho_invoice_settings', JSON.stringify(settings));
}

function loadData() {
  const settings = JSON.parse(localStorage.getItem('zoho_invoice_settings'));
  if (settings) {
    if (document.getElementById('companyName')) document.getElementById('companyName').value = settings.companyName || '';
    if (document.getElementById('companyAddress')) document.getElementById('companyAddress').value = settings.companyAddress || '';
    if (document.getElementById('currency')) document.getElementById('currency').value = settings.currency || 'USD';
    if (document.getElementById('tax')) document.getElementById('tax').value = settings.tax || '0';
    if (document.getElementById('discount')) document.getElementById('discount').value = settings.discount || '0';
    if (document.getElementById('logoShape')) document.getElementById('logoShape').value = settings.logoShape || 'original';
    if (document.getElementById('thankYouNote')) document.getElementById('thankYouNote').value = settings.thankYouNote || 'Thank you for your business!';
    if (document.getElementById('termsInfo')) document.getElementById('termsInfo').value = settings.termsInfo || 'Payment is due within 30 days.';
    if (document.getElementById('showFooter')) document.getElementById('showFooter').checked = settings.showFooter !== undefined ? settings.showFooter : true;
  }
  
  const savedLogo = localStorage.getItem('zoho_invoice_logo');
  if (savedLogo) {
    const prevLogo = document.getElementById('prevLogo');
    if (prevLogo) {
      prevLogo.src = savedLogo;
      document.getElementById('prevLogoContainer').style.display = 'block';
    }
  }
  
  updatePreview();
}

function addItem() {
  const name = document.getElementById("itemName").value;
  const qty = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);

  if (!name || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
    showNotification("Please enter valid item details.", "error");
    return;
  }

  const id = Date.now();
  items.push({ id, name, qty, price });
  renderItemsList();
  updatePreview();
  
  document.getElementById("itemName").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("price").value = "";
  document.getElementById("itemName").focus();
}

function deleteItem(id) {
  items = items.filter(item => item.id !== id);
  renderItemsList();
  updatePreview();
}

function renderItemsList() {
  const list = document.getElementById('itemsList');
  if (!list) return;
  list.innerHTML = '';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <span style="font-weight: 500">${item.name}</span>
      <span>${item.qty}</span>
      <span>${item.price.toFixed(2)}</span>
      <span style="font-weight: 600">${(item.qty * item.price).toFixed(2)}</span>
      <button class="btn btn-delete" onclick="deleteItem(${item.id})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    `;
    list.appendChild(row);
  });
}

function updatePreview() {
  // Logo Shape
  const shape = document.getElementById('logoShape').value;
  const prevLogo = document.getElementById('prevLogo');
  if (prevLogo) prevLogo.className = 'logo-preview ' + shape;

  // Company & Customer Info
  const compName = document.getElementById('companyName').value;
  if (document.getElementById('prevCompanyName')) {
    document.getElementById('prevCompanyName').innerText = compName || 'YOUR COMPANY';
    document.getElementById('prevCompanyName').style.display = compName ? 'block' : 'none';
  }

  const compAddr = document.getElementById('companyAddress').value;
  if (document.getElementById('prevCompanyAddress')) {
    document.getElementById('prevCompanyAddress').innerText = compAddr;
    document.getElementById('prevCompanyAddress').style.display = compAddr ? 'block' : 'none';
  }

  const custName = document.getElementById('customerName').value;
  if (document.getElementById('prevCustomerName')) {
    document.getElementById('prevCustomerName').innerText = custName || 'Customer Name';
  }

  const custAddr = document.getElementById('customerAddress').value;
  if (document.getElementById('prevCustAddressDisplay')) {
    document.getElementById('prevCustAddressDisplay').innerText = custAddr;
    document.getElementById('prevCustAddressDisplay').style.display = custAddr ? 'block' : 'none';
  }

  // Invoice Details
  const invNum = document.getElementById('invoiceNumber').value;
  if (document.getElementById('prevInvoiceNumber'))
    document.getElementById('prevInvoiceNumber').innerText = invNum ? '#' + invNum : '';
  
  if (document.getElementById('prevDate'))
    document.getElementById('prevDate').innerText = document.getElementById('serviceDate').value;

  const statusEl = document.getElementById('prevStatus');
  if (statusEl) {
    const status = document.getElementById('paymentStatus').value;
    statusEl.innerText = status;
    statusEl.style.color = statusColors[status];
  }

  const symbol = currencySymbols[document.getElementById('currency').value] || '$';

  // Table & Totals
  const tableBody = document.getElementById('prevTableBody');
  if (tableBody) {
    tableBody.innerHTML = '';
    let subtotal = 0;
    items.forEach(item => {
      const total = item.qty * item.price;
      subtotal += total;
      tableBody.innerHTML += `<tr><td>${item.name}</td><td>${item.qty}</td><td>${symbol}${item.price.toFixed(2)}</td><td>${symbol}${total.toFixed(2)}</td></tr>`;
    });

    const taxPercent = parseFloat(document.getElementById('tax').value) || 0;
    const discountPercent = parseFloat(document.getElementById('discount').value) || 0;
    const taxAmount = subtotal * (taxPercent / 100);
    const discountAmount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal + taxAmount - discountAmount;

    if (document.getElementById('prevSubtotal')) document.getElementById('prevSubtotal').innerText = symbol + subtotal.toFixed(2);
    if (document.getElementById('prevTax')) document.getElementById('prevTax').innerText = symbol + taxAmount.toFixed(2);
    if (document.getElementById('prevDiscount')) document.getElementById('prevDiscount').innerText = '-' + symbol + discountAmount.toFixed(2);
    if (document.getElementById('prevGrandTotal')) document.getElementById('prevGrandTotal').innerText = symbol + grandTotal.toFixed(2);
    
    if (document.getElementById('taxLabel')) document.getElementById('taxLabel').innerText = `Tax (${taxPercent}%)`;
    if (document.getElementById('discountLabel')) document.getElementById('discountLabel').innerText = `Discount (${discountPercent}%)`;
  }

  // Footer Toggle & Notes
  const showFooter = document.getElementById('showFooter').checked;
  const footerEl = document.querySelector('.invoice-footer');
  const footerInputs = document.getElementById('footerInputs');
  
  if (footerEl) footerEl.style.display = showFooter ? 'block' : 'none';
  if (footerInputs) footerInputs.style.display = showFooter ? 'block' : 'none';

  if (showFooter) {
    const thankYou = document.getElementById('thankYouNote').value;
    const terms = document.getElementById('termsInfo').value;
    if (document.getElementById('prevThankYou')) document.getElementById('prevThankYou').innerText = thankYou || 'Thank you for your business!';
    if (document.getElementById('prevTerms')) document.getElementById('prevTerms').innerText = terms || 'Payment is due within 30 days.';
  }
}

function downloadPDF() {
  window.print();
}

function printInvoice() {
  window.print();
}

function copyGrandTotal() {
  const el = document.getElementById('prevGrandTotal');
  const text = el ? el.innerText.trim() : '';
  if (!text) {
    showNotification('No total to copy yet.', 'error');
    return;
  }
  const done = () => showNotification('Grand total copied to clipboard.', 'success');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    const ok = document.execCommand('copy');
    if (ok && onSuccess) onSuccess();
    else showNotification('Copy failed — select the total manually.', 'error');
  } catch (e) {
    showNotification('Copy failed — select the total manually.', 'error');
  }
  document.body.removeChild(ta);
}

function downloadPNG() {
  const invoice = document.getElementById('invoicePreview');
  showNotification("Generating PNG...", "success");
  
  html2canvas(invoice, {
    scale: 2, // Higher quality
    useCORS: true,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Invoice_${document.getElementById('invoiceNumber').value || '001'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showNotification("PNG Downloaded!", "success");
  }).catch(err => {
    console.error(err);
    showNotification("Error generating PNG.", "error");
  });
}

function showNotification(message, type) {
  const notify = document.createElement('div');
  notify.style.position = 'fixed';
  notify.style.bottom = '20px';
  notify.style.right = '20px';
  notify.style.padding = '1rem 2rem';
  notify.style.background = type === 'error' ? '#ff7675' : '#27ae60';
  notify.style.color = 'white';
  notify.style.borderRadius = '10px';
  notify.style.zIndex = '1000';
  notify.innerText = message;
  document.body.appendChild(notify);
  setTimeout(() => notify.remove(), 3000);
}
