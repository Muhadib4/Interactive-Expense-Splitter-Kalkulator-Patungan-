const initialParticipants = [
  { name: "Adiib", color: "#f47864" },
  { name: "Raka", color: "#2954e8" },
  { name: "Naya", color: "#a4c63f" },
  { name: "Bimo", color: "#8d75db" },
];

const state = {
  participants: initialParticipants.map((person) => ({ ...person })),
  tip: 0,
};

const elements = {
  form: document.querySelector("#split-form"),
  billName: document.querySelector("#bill-name"),
  billAmount: document.querySelector("#bill-amount"),
  serviceFee: document.querySelector("#service-fee"),
  tipValue: document.querySelector("#tip-value"),
  participantList: document.querySelector("#participant-list"),
  participantCount: document.querySelector("#participant-count"),
  summaryBillName: document.querySelector("#summary-bill-name"),
  summarySubtotal: document.querySelector("#summary-subtotal"),
  summaryFee: document.querySelector("#summary-fee"),
  summaryFeeRate: document.querySelector("#summary-fee-rate"),
  summaryTip: document.querySelector("#summary-tip"),
  summaryTipRate: document.querySelector("#summary-tip-rate"),
  summaryTotal: document.querySelector("#summary-total"),
  summaryPeople: document.querySelector("#summary-people"),
  perPerson: document.querySelector("#per-person"),
  settlementList: document.querySelector("#settlement-list"),
  toast: document.querySelector("#toast"),
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatRupiah(value) {
  return currency.format(Math.max(0, Math.round(Number(value) || 0)));
}

function initials(name) {
  const cleaned = name.trim() || "?";
  return cleaned.slice(0, 2).toUpperCase();
}

function renderParticipants() {
  elements.participantList.innerHTML = "";
  state.participants.forEach((person, index) => {
    const row = document.createElement("div");
    row.className = "participant-row";
    row.dataset.index = index;
    row.innerHTML = `
      <span class="participant-avatar" style="background:${person.color}">${initials(person.name)}</span>
      <input type="text" aria-label="Nama peserta ${index + 1}" value="${escapeAttribute(person.name)}" autocomplete="off" />
      <button type="button" class="remove-participant" aria-label="Hapus ${escapeAttribute(person.name)}">×</button>
    `;
    elements.participantList.appendChild(row);
  });
  elements.participantCount.textContent = state.participants.length;
  updateSummary();
}

function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function updateSummary() {
  const subtotal = Math.max(0, Number(elements.billAmount.value) || 0);
  const serviceRate = Math.max(0, Number(elements.serviceFee.value) || 0);
  const serviceFee = subtotal * serviceRate / 100;
  const tip = subtotal * state.tip / 100;
  const total = subtotal + serviceFee + tip;
  const count = Math.max(1, state.participants.length);
  const perPerson = total / count;

  elements.summaryBillName.textContent = elements.billName.value.trim() || "Tagihan bersama";
  elements.summarySubtotal.textContent = formatRupiah(subtotal);
  elements.summaryFee.textContent = formatRupiah(serviceFee);
  elements.summaryFeeRate.textContent = `${serviceRate}%`;
  elements.summaryTip.textContent = formatRupiah(tip);
  elements.summaryTipRate.textContent = `${state.tip}%`;
  elements.summaryTotal.textContent = formatRupiah(total);
  elements.summaryPeople.textContent = state.participants.length;
  elements.perPerson.textContent = formatRupiah(perPerson);

  elements.participantList.querySelectorAll(".participant-amount").forEach((amount) => {
    amount.textContent = formatRupiah(perPerson);
  });

  elements.settlementList.innerHTML = state.participants.map((person) => `
    <div class="settlement-row">
      <span class="settlement-name"><span class="settlement-avatar">${initials(person.name)}</span>${escapeHtml(person.name.trim() || "Tanpa nama")}</span>
      <strong class="settlement-amount">${formatRupiah(perPerson)}</strong>
    </div>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

elements.form.addEventListener("input", (event) => {
  if (event.target.matches("#bill-name, #bill-amount, #service-fee")) updateSummary();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSummary();
  showToast("Kalkulasi sudah diperbarui.");
  document.querySelector(".summary-panel").animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-4px)" }, { transform: "translateY(0)" }],
    { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
});

elements.participantList.addEventListener("input", (event) => {
  if (!event.target.matches("input")) return;
  const row = event.target.closest(".participant-row");
  const index = Number(row.dataset.index);
  state.participants[index].name = event.target.value;
  row.querySelector(".participant-avatar").textContent = initials(event.target.value);
  row.querySelector(".remove-participant").setAttribute("aria-label", `Hapus ${event.target.value || "peserta"}`);
  updateSummary();
});

elements.participantList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-participant");
  if (!removeButton) return;
  if (state.participants.length <= 1) {
    showToast("Minimal harus ada satu peserta.");
    return;
  }
  const index = Number(removeButton.closest(".participant-row").dataset.index);
  state.participants.splice(index, 1);
  renderParticipants();
});

document.querySelector("#add-participant").addEventListener("click", () => {
  const colors = ["#f47864", "#2954e8", "#a4c63f", "#8d75db", "#e0a93a"];
  state.participants.push({ name: `Peserta ${state.participants.length + 1}`, color: colors[state.participants.length % colors.length] });
  renderParticipants();
  const latest = elements.participantList.lastElementChild.querySelector("input");
  latest.focus();
  latest.select();
});

document.querySelectorAll(".tip-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.tip = Number(button.dataset.tip);
    elements.tipValue.value = state.tip;
    document.querySelectorAll(".tip-option").forEach((option) => option.classList.toggle("active", option === button));
    updateSummary();
  });
});

document.querySelector("#reset-button").addEventListener("click", () => {
  elements.billName.value = "Makan malam Jumat";
  elements.billAmount.value = 750000;
  elements.serviceFee.value = 5;
  state.tip = 0;
  elements.tipValue.value = 0;
  document.querySelectorAll(".tip-option").forEach((option) => option.classList.toggle("active", option.dataset.tip === "0"));
  state.participants = initialParticipants.map((person) => ({ ...person }));
  renderParticipants();
  showToast("Formulir dikembalikan ke awal.");
});

document.querySelector("#copy-button").addEventListener("click", async () => {
  const subtotal = Number(elements.billAmount.value) || 0;
  const serviceFee = subtotal * (Number(elements.serviceFee.value) || 0) / 100;
  const tip = subtotal * state.tip / 100;
  const total = subtotal + serviceFee + tip;
  const perPerson = total / Math.max(1, state.participants.length);
  const lines = [
    `Patungan — ${elements.billName.value.trim() || "Tagihan bersama"}`,
    `Total: ${formatRupiah(total)}`,
    `Per orang (${state.participants.length}): ${formatRupiah(perPerson)}`,
    "",
    ...state.participants.map((person) => `• ${person.name.trim() || "Tanpa nama"}: ${formatRupiah(perPerson)}`),
  ];
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    showToast("Ringkasan berhasil disalin.");
  } catch {
    showToast("Ringkasan siap dibagikan.");
  }
});

renderParticipants();
