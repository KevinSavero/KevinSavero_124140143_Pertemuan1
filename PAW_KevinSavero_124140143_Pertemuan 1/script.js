const productForm = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productQty = document.getElementById("productQty");
const formMessage = document.getElementById("formMessage");
const cartBody = document.getElementById("cartBody");
const paymentInput = document.getElementById("payment");
const paymentMessage = document.getElementById("paymentMessage");

let cart = [];

function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(number);
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getDiscount(subtotal) {
  return subtotal >= 50000 ? subtotal * 0.10 : 0;
}

function renderCart() {
  cartBody.innerHTML = "";

  if (cart.length === 0) {
    cartBody.innerHTML = '<tr class="empty-row"><td colspan="5">Keranjang masih kosong. Tambahkan produk dulu, ya.</td></tr>';
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHTML(item.name)}</td>
        <td>${rupiah(item.price)}</td>
        <td>${item.qty}</td>
        <td>${rupiah(item.price * item.qty)}</td>
        <td><button class="remove-btn" data-index="${index}" type="button">Hapus</button></td>
      `;
      cartBody.appendChild(row);
    });
  }

  const subtotal = getSubtotal();
  const discount = getDiscount(subtotal);
  const total = subtotal - discount;
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  document.getElementById("subtotal").textContent = rupiah(subtotal);
  document.getElementById("discount").textContent = rupiah(discount);
  document.getElementById("total").textContent = rupiah(total);
  document.getElementById("summaryTotal").textContent = rupiah(total);
  document.getElementById("itemCount").textContent = cart.length;
  document.getElementById("cartPill").textContent = `${itemCount} item`;
  updateChange();
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = productName.value.trim();
  const price = Number(productPrice.value);
  const qty = Number(productQty.value);

  if (name.length < 3) {
    formMessage.textContent = "Nama produk minimal 3 karakter.";
    productName.focus();
    return;
  }
  if (!Number.isInteger(price) || price < 500) {
    formMessage.textContent = "Harga harus berupa angka minimal Rp500.";
    productPrice.focus();
    return;
  }
  if (!Number.isInteger(qty) || qty < 1) {
    formMessage.textContent = "Jumlah harus berupa bilangan bulat minimal 1.";
    productQty.focus();
    return;
  }

  cart.push({ name, price, qty });
  formMessage.textContent = "";
  paymentMessage.textContent = "";
  productForm.reset();
  productQty.value = 1;
  productName.focus();
  renderCart();
});

cartBody.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-btn");
  if (!button) return;
  cart.splice(Number(button.dataset.index), 1);
  paymentMessage.textContent = "";
  renderCart();
});

function updateChange() {
  const subtotal = getSubtotal();
  const total = subtotal - getDiscount(subtotal);
  const payment = Number(paymentInput.value) || 0;
  const change = payment - total;
  document.getElementById("change").textContent = rupiah(Math.max(0, change));
  if (paymentInput.value === "") {
    paymentMessage.textContent = "";
  } else if (payment < total) {
    paymentMessage.textContent = "Uang yang diterima belum mencukupi.";
  } else {
    paymentMessage.textContent = total > 0 ? "Nominal pembayaran sudah mencukupi." : "";
    paymentMessage.style.color = "#24966a";
  }
  if (payment < total) paymentMessage.style.color = "";
}

paymentInput.addEventListener("input", updateChange);

document.getElementById("finishBtn").addEventListener("click", () => {
  const subtotal = getSubtotal();
  const total = subtotal - getDiscount(subtotal);
  const payment = Number(paymentInput.value);

  if (cart.length === 0) {
    paymentMessage.style.color = "";
    paymentMessage.textContent = "Tambahkan produk sebelum menyelesaikan transaksi.";
    return;
  }
  if (!Number.isFinite(payment) || payment < total) {
    paymentMessage.style.color = "";
    paymentMessage.textContent = "Pembayaran gagal: uang belum mencukupi.";
    return;
  }

  alert(`Transaksi berhasil!\\nTotal: ${rupiah(total)}\\nKembalian: ${rupiah(payment - total)}`);
  cart = [];
  paymentInput.value = "";
  paymentMessage.style.color = "#24966a";
  paymentMessage.textContent = "Transaksi berhasil diselesaikan.";
  renderCart();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  cart = [];
  productForm.reset();
  productQty.value = 1;
  paymentInput.value = "";
  formMessage.textContent = "";
  paymentMessage.textContent = "";
  paymentMessage.style.color = "";
  renderCart();
});

renderCart();
