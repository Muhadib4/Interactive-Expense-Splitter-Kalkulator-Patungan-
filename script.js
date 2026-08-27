const initialParticipants = [
  { name: "Adiib", color: "#f47864" },
  { name: "Raka", color: "#2954e8" },
  { name: "Naya", color: "#a4c63f" },
  { name: "Bimo", color: "#8d75db" },
];

const themes = [
  { id: "minimalism", label: "Minimalism", note: "clean & quiet", swatch: "#f6f4ef", swatch2: "#2954e8", icon: "○" },
  { id: "bento-grid", label: "Bento Grid", note: "modular blocks", swatch: "#eaeaff", swatch2: "#5b5ce2", icon: "▦" },
  { id: "maximalism", label: "Maximalism", note: "more is more", swatch: "#ff2f83", swatch2: "#d4ff00", icon: "✳" },
  { id: "neo-brutalism", label: "Neo-Brutalism", note: "bold & raw", swatch: "#f7eecf", swatch2: "#ff5a36", icon: "▣" },
  { id: "liquid-glass", label: "Liquid Glass", note: "soft & fluid", swatch: "#d9effc", swatch2: "#3769f5", icon: "◌" },
  { id: "cyberpunk", label: "Cyberpunk", note: "neon after dark", swatch: "#070b14", swatch2: "#00eaff", icon: "⌁" },
  { id: "retro-terminal", label: "Retro Terminal", note: "green screen", swatch: "#09120c", swatch2: "#52ff75", icon: ">_" },
  { id: "frutiger-aero", label: "Frutiger Aero", note: "blue sky energy", swatch: "#d9f5ff", swatch2: "#0879db", icon: "☁" },
  { id: "dark-fantasy", label: "Dark Fantasy", note: "ink & ember", swatch: "#161217", swatch2: "#d7a657", icon: "♢" },
  { id: "medieval", label: "Medieval", note: "old world ledger", swatch: "#e7d2a6", swatch2: "#6b2e23", icon: "♜" },
  { id: "arcane", label: "Arcane", note: "mystic glow", swatch: "#0e0c1d", swatch2: "#ab82ff", icon: "✦" },
  { id: "celestial", label: "Celestial", note: "starlit calm", swatch: "#081426", swatch2: "#75b8ff", icon: "☾" },
];

const state = {
  participants: initialParticipants.map((person) => ({ ...person })),
  tip: 0,
  theme: localStorage.getItem("patungan-theme") || "minimalism",
  mode: localStorage.getItem("patungan-mode") || "light",
  sound: localStorage.getItem("patungan-sound") !== "off",
  timerSeconds: 0,
  timerPaused: false,
};

const elements = {
  root: document.documentElement,
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
  heroTotal: document.querySelector("#hero-total"),
  heroPeople: document.querySelector("#hero-people"),
  settlementList: document.querySelector("#settlement-list"),
  toast: document.querySelector("#toast"),
  themePicker: document.querySelector("#theme-picker"),
  themeTrigger: document.querySelector("#theme-trigger"),
  themeTriggerLabel: document.querySelector(".theme-trigger-label"),
  themeOptions: document.querySelector("#theme-options"),
  themeStatus: document.querySelector("#theme-status"),
  modeToggle: document.querySelector("#mode-toggle"),
  modeIcon: document.querySelector(".mode-icon"),
  modeLabel: document.querySelector(".mode-label"),
  soundToggle: document.querySelector("#sound-toggle"),
  soundIcon: document.querySelector(".sound-icon"),
  timerToggle: document.querySelector("#timer-toggle"),
  timerIcon: document.querySelector("#timer-icon"),
  timerDisplay: document.querySelector("#timer-display"),
  helpButton: document.querySelector("#help-button"),
  helpModal: document.querySelector("#help-modal"),
  modalClose: document.querySelector(".modal-close"),
  modalCloseAction: document.querySelector("#modal-close-action"),
  themeDetailsButton: document.querySelector("#theme-details-button"),
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

let audioContext;
let modalReturnFocus;

function formatRupiah(value) {
  return currency.format(Math.max(0, Math.round(Number(value) || 0)));
}

function initials(name) {
  const cleaned = name.trim() || "?";
  return cleaned.slice(0, 2).toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function playSound(type = "click") {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const sounds = {
      click: [440, 0.055],
      success: [660, 0.1],
      remove: [220, 0.08],
      theme: [330, 0.13],
    };
    const [frequency, duration] = sounds[type] || sounds.click;
    oscillator.type = type === "theme" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.35, audioContext.currentTime + duration);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.015);
  } catch {
    // Audio feedback is an enhancement; calculator behavior should remain silent and functional if unavailable.
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

function renderThemeOptions() {
  elements.themeOptions.innerHTML = themes.map((theme) => `
    <button type="button" class="theme-option${theme.id === state.theme ? " active" : ""}" data-theme="${theme.id}" role="menuitem" aria-pressed="${theme.id === state.theme}" title="${theme.note}">
      <span class="theme-swatch" style="--swatch:${theme.swatch};--swatch-2:${theme.swatch2}"></span>
      <span><b>${theme.icon}</b> ${theme.label}</span>
    </button>
  `).join("");
}

function applyTheme(themeId, withSound = false) {
  const selected = themes.find((theme) => theme.id === themeId) || themes[0];
  state.theme = selected.id;
  elements.root.dataset.theme = selected.id;
  localStorage.setItem("patungan-theme", selected.id);
  elements.themeTriggerLabel.textContent = selected.label;
  elements.themeStatus.textContent = `${selected.label} mode`;
  renderThemeOptions();
  elements.root.classList.remove("theme-shift");
  requestAnimationFrame(() => {
    elements.root.classList.add("theme-shift");
    window.setTimeout(() => elements.root.classList.remove("theme-shift"), 420);
  });
  if (withSound) {
    playSound("theme");
    showToast(`${selected.label} aktif.`);
  }
}

function applyMode(mode, withSound = false) {
  state.mode = mode === "dark" ? "dark" : "light";
  elements.root.dataset.mode = state.mode;
  localStorage.setItem("patungan-mode", state.mode);
  const dark = state.mode === "dark";
  elements.modeToggle.setAttribute("aria-pressed", String(dark));
  elements.modeToggle.setAttribute("aria-label", dark ? "Gunakan light mode" : "Gunakan dark mode");
  elements.modeIcon.textContent = dark ? "☾" : "☼";
  elements.modeLabel.textContent = dark ? "Dark" : "Light";
  if (withSound) {
    playSound("click");
    showToast(`${dark ? "Dark" : "Light"} mode aktif.`);
  }
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
      <span class="participant-amount">—</span>
      <button type="button" class="remove-participant" aria-label="Hapus ${escapeAttribute(person.name)}">×</button>
    `;
    elements.participantList.appendChild(row);
  });
  elements.participantCount.textContent = state.participants.length;
  updateSummary();
}

function updateSummary() {
  const subtotal = Math.max(0, Number(elements.billAmount.value) || 0);
  const serviceRate = Math.max(0, Math.min(100, Number(elements.serviceFee.value) || 0));
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
  elements.heroTotal.textContent = formatRupiah(perPerson);
  elements.heroPeople.textContent = `${state.participants.length} orang`;

  elements.participantList.querySelectorAll(".participant-amount").forEach((amount) => {
    amount.textContent = formatRupiah(perPerson);
  });

  elements.settlementList.innerHTML = state.participants.map((person) => `
    <div class="settlement-row"><span class="settlement-name"><span class="settlement-avatar">${initials(person.name)}</span><span class="settlement-label">${escapeHtml(person.name.trim() || "Tanpa nama")}</span></span><strong class="settlement-amount">${formatRupiah(perPerson)}</strong></div>
  `).join("");
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function updateTimer() {
  elements.timerDisplay.textContent = formatTimer(state.timerSeconds);
  elements.timerIcon.textContent = state.timerPaused ? "▶" : "Ⅱ";
  elements.timerToggle.setAttribute("aria-label", state.timerPaused ? "Lanjutkan timer" : "Pause timer");
  elements.timerToggle.classList.toggle("paused", state.timerPaused);
}

function openModal() {
  modalReturnFocus = document.activeElement;
  elements.helpModal.classList.add("open");
  elements.helpModal.setAttribute("aria-hidden", "false");
  elements.modalClose.focus();
  playSound("click");
}

function closeModal() {
  elements.helpModal.classList.remove("open");
  elements.helpModal.setAttribute("aria-hidden", "true");
  modalReturnFocus?.focus();
}

function closeThemeDropdown() {
  elements.themePicker.classList.remove("open");
  elements.themeTrigger.setAttribute("aria-expanded", "false");
}

elements.form.addEventListener("input", (event) => {
  if (event.target.matches("#bill-name, #bill-amount, #service-fee")) updateSummary();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSummary();
  playSound("success");
  showToast("Kalkulasi sudah diperbarui.");
  document.querySelector(".summary-panel").animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-5px)" }, { transform: "translateY(0)" }],
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
    playSound("remove");
    return;
  }
  const index = Number(removeButton.closest(".participant-row").dataset.index);
  state.participants.splice(index, 1);
  renderParticipants();
  playSound("remove");
  showToast("Peserta dihapus.");
});

document.querySelector("#add-participant").addEventListener("click", () => {
  const colors = ["#f47864", "#2954e8", "#a4c63f", "#8d75db", "#e0a93a", "#27a5a2"];
  state.participants.push({ name: `Peserta ${state.participants.length + 1}`, color: colors[state.participants.length % colors.length] });
  renderParticipants();
  const latest = elements.participantList.lastElementChild.querySelector("input");
  latest.focus();
  latest.select();
  playSound("click");
  showToast("Peserta baru ditambahkan.");
});

document.querySelectorAll(".tip-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.tip = Number(button.dataset.tip);
    elements.tipValue.value = state.tip;
    document.querySelectorAll(".tip-option").forEach((option) => option.classList.toggle("active", option === button));
    updateSummary();
    playSound("click");
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
  playSound("click");
  showToast("Formulir dikembalikan ke awal.");
});

document.querySelector("#copy-button").addEventListener("click", async () => {
  const subtotal = Number(elements.billAmount.value) || 0;
  const serviceFee = subtotal * (Number(elements.serviceFee.value) || 0) / 100;
  const tip = subtotal * state.tip / 100;
  const total = subtotal + serviceFee + tip;
  const perPerson = total / Math.max(1, state.participants.length);
  const lines = [`Patungan — ${elements.billName.value.trim() || "Tagihan bersama"}`, `Total: ${formatRupiah(total)}`, `Per orang (${state.participants.length}): ${formatRupiah(perPerson)}`, "", ...state.participants.map((person) => `• ${person.name.trim() || "Tanpa nama"}: ${formatRupiah(perPerson)}`)];
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    playSound("success");
    showToast("Ringkasan berhasil disalin.");
  } catch {
    showToast("Ringkasan siap dibagikan.");
  }
});

elements.themeTrigger.addEventListener("click", () => {
  const open = elements.themePicker.classList.toggle("open");
  elements.themeTrigger.setAttribute("aria-expanded", String(open));
  if (open) playSound("click");
});

elements.themeOptions.addEventListener("click", (event) => {
  const option = event.target.closest(".theme-option");
  if (!option) return;
  applyTheme(option.dataset.theme, true);
  closeThemeDropdown();
});

elements.modeToggle.addEventListener("click", () => applyMode(state.mode === "dark" ? "light" : "dark", true));

elements.soundToggle.addEventListener("click", () => {
  state.sound = !state.sound;
  localStorage.setItem("patungan-sound", state.sound ? "on" : "off");
  elements.soundToggle.setAttribute("aria-pressed", String(state.sound));
  elements.soundToggle.setAttribute("aria-label", state.sound ? "Matikan suara" : "Nyalakan suara");
  elements.soundIcon.textContent = state.sound ? "⌁" : "×";
  if (state.sound) playSound("success");
  showToast(state.sound ? "SFX dinyalakan." : "SFX dimatikan.");
});

elements.timerToggle.addEventListener("click", () => {
  state.timerPaused = !state.timerPaused;
  updateTimer();
  playSound("click");
  showToast(state.timerPaused ? "Timer dijeda." : "Timer dilanjutkan.");
});

elements.helpButton.addEventListener("click", openModal);
elements.themeDetailsButton.addEventListener("click", () => { closeThemeDropdown(); openModal(); });
elements.modalClose.addEventListener("click", closeModal);
elements.modalCloseAction.addEventListener("click", closeModal);
elements.helpModal.addEventListener("click", (event) => { if (event.target === elements.helpModal) closeModal(); });
document.addEventListener("click", (event) => { if (!elements.themePicker.contains(event.target)) closeThemeDropdown(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeThemeDropdown();
    if (elements.helpModal.classList.contains("open")) closeModal();
  }
});

window.setInterval(() => {
  if (!state.timerPaused) {
    state.timerSeconds += 1;
    updateTimer();
  }
}, 1000);

elements.root.dataset.theme = state.theme;
elements.root.dataset.mode = state.mode;
applyTheme(state.theme);
applyMode(state.mode);
elements.soundToggle.setAttribute("aria-pressed", String(state.sound));
elements.soundToggle.setAttribute("aria-label", state.sound ? "Matikan suara" : "Nyalakan suara");
elements.soundIcon.textContent = state.sound ? "⌁" : "×";
updateTimer();
renderParticipants();
