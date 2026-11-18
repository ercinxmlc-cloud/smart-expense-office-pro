(() => {
  "use strict";

  const STORAGE_KEY = "smart_expense_office_pro_v1";

  const MODE_CONFIG = {
    personal: {
      name: "Personal",
      bnName: "ব্যক্তিগত",
      cashLabel: "হাতের ক্যাশ (পকেট)",
      headerBg: "bg-blue-700",
      themeColor: "#1d4ed8",
      primaryBtn: "bg-blue-600 hover:bg-blue-700",
      activeText: "text-blue-700",
      badgeBg: "bg-blue-100 text-blue-700",
      barBg: "bg-blue-600",
      activeBorder: "border-blue-600 bg-blue-50 text-blue-800",
      categories: [
        { id: "চা-নাস্তা", label: "চা-নাস্তা", icon: "☕", color: "bg-amber-50 border-amber-200 text-amber-900" },
        { id: "যাতায়াত", label: "যাতায়াত", icon: "🚌", color: "bg-sky-50 border-sky-200 text-sky-900" },
        { id: "বাজার", label: "বাজার", icon: "🛒", color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
        { id: "বিল/রিচার্জ", label: "বিল/রিচার্জ", icon: "📱", color: "bg-violet-50 border-violet-200 text-violet-900" },
        { id: "ব্যক্তিগত", label: "ব্যক্তিগত", icon: "👤", color: "bg-rose-50 border-rose-200 text-rose-900" },
        { id: "অন্যান্য", label: "অন্যান্য", icon: "📦", color: "bg-slate-100 border-slate-200 text-slate-800" },
      ],
    },
    office: {
      name: "Office",
      bnName: "অফিস",
      cashLabel: "অফিস ক্যাশ (Petty Cash)",
      headerBg: "bg-emerald-700",
      themeColor: "#047857",
      primaryBtn: "bg-emerald-600 hover:bg-emerald-700",
      activeText: "text-emerald-700",
      badgeBg: "bg-emerald-100 text-emerald-700",
      barBg: "bg-emerald-600",
      activeBorder: "border-emerald-600 bg-emerald-50 text-emerald-800",
      categories: [
        { id: "আপ্যায়ন/নাস্তা", label: "আপ্যায়ন/নাস্তা", icon: "🍵", color: "bg-amber-50 border-amber-200 text-amber-900" },
        { id: "অফিস যাতায়াত", label: "অফিস যাতায়াত", icon: "🚕", color: "bg-sky-50 border-sky-200 text-sky-900" },
        { id: "স্টেশনারি", label: "স্টেশনারি", icon: "📎", color: "bg-teal-50 border-teal-200 text-teal-900" },
        { id: "ইউটিলিটি/বিল", label: "ইউটিলিটি/বিল", icon: "💡", color: "bg-violet-50 border-violet-200 text-violet-900" },
        { id: "ডকুমেন্ট/কুরিয়ার", label: "ডকুমেন্ট/কুরিয়ার", icon: "📄", color: "bg-indigo-50 border-indigo-200 text-indigo-900" },
        { id: "অফিস অন্যান্য", label: "অফিস অন্যান্য", icon: "🏢", color: "bg-slate-100 border-slate-200 text-slate-800" },
      ],
    },
  };

  const BENGALI_MONTHS = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];

  // Persistent State
  let state = loadState();
  let currentMode = "personal"; // 'personal' | 'office'
  let currentFilter = "today";  // 'today' | 'month' | 'all'
  let activeTab = "history";    // 'history' | 'breakdown' | 'dues'

  // Entry Modal State
  let modalAction = "expense";  // 'expense' | 'cashin' | 'transfer'
  let editingTxId = null;
  let selectedCategory = MODE_CONFIG.personal.categories[0];
  let selectedMethod = "cash";  // 'cash' | 'digital'
  let transferDir = "digital_to_cash"; // 'digital_to_cash' | 'cash_to_digital'
  let keypadValue = "0";
  let capturedReceiptBase64 = "";

  // Due Modal State
  let selectedDueType = "receivable"; // 'receivable' | 'payable'
  let activePersonKey = null;

  // DOM References
  const metaThemeEl = document.getElementById("meta-theme-color");
  const appHeaderEl = document.getElementById("app-header");
  const modePersonalBtn = document.getElementById("mode-personal-btn");
  const modeOfficeBtn = document.getElementById("mode-office-btn");
  const cashWalletLabelEl = document.getElementById("cash-wallet-label");
  const dashCashEl = document.getElementById("dash-cash");
  const dashDigitalEl = document.getElementById("dash-digital");
  const dashMonthlyExpenseEl = document.getElementById("dash-monthly-expense");
  const currentDateLabelEl = document.getElementById("current-date-label");
  const currentMonthNameEl = document.getElementById("current-month-name");
  const btnOpenCashIn = document.getElementById("btn-open-cash-in");
  const quickModeBadgeEl = document.getElementById("quick-mode-badge");
  const quickGridEl = document.getElementById("quick-categories-grid");

  const tabHistoryBtn = document.getElementById("tab-history");
  const tabBreakdownBtn = document.getElementById("tab-breakdown");
  const tabDuesBtn = document.getElementById("tab-dues");
  const panelHistoryEl = document.getElementById("panel-history");
  const panelBreakdownEl = document.getElementById("panel-breakdown");
  const panelDuesEl = document.getElementById("panel-dues");

  const transactionListEl = document.getElementById("transaction-list");
  const historyCountEl = document.getElementById("history-count");
  const breakdownListEl = document.getElementById("breakdown-list");

  const duesTotalReceivableEl = document.getElementById("dues-total-receivable");
  const duesTotalPayableEl = document.getElementById("dues-total-payable");
  const duesPersonListEl = document.getElementById("dues-person-list");

  // Entry Modal DOM
  const entryModalEl = document.getElementById("entry-modal");
  const modalIconEl = document.getElementById("modal-icon");
  const modalTitleEl = document.getElementById("modal-title");
  const modalSubtitleEl = document.getElementById("modal-subtitle");
  const keypadDisplayEl = document.getElementById("keypad-display");
  const walletSourceGroupEl = document.getElementById("wallet-source-group");
  const transferDirectionGroupEl = document.getElementById("transfer-direction-group");
  const modalNoteEl = document.getElementById("modal-note");
  const receiptCaptureGroupEl = document.getElementById("receipt-capture-group");
  const receiptFileInputEl = document.getElementById("receipt-file-input");
  const receiptPreviewWrapEl = document.getElementById("receipt-preview-wrap");
  const receiptPreviewImgEl = document.getElementById("receipt-preview-img");
  const btnSaveEntry = document.getElementById("btn-save-entry");

  // Due Modals DOM
  const dueModalEl = document.getElementById("due-modal");
  const duePersonNameEl = document.getElementById("due-person-name");
  const dueAmountEl = document.getElementById("due-amount");
  const dueNoteEl = document.getElementById("due-note");

  const personDueModalEl = document.getElementById("person-due-modal");
  const personDueTitleEl = document.getElementById("person-due-title");
  const personDueSubtitleEl = document.getElementById("person-due-subtitle");
  const personDueItemsEl = document.getElementById("person-due-items");

  // Lightbox & Toast
  const lightboxModalEl = document.getElementById("lightbox-modal");
  const lightboxImgEl = document.getElementById("lightbox-img");
  const toastEl = document.getElementById("toast");

  function getDefaultState() {
    return {
      personal: { transactions: [], dues: [] },
      office: { transactions: [], dues: [] },
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      return {
        personal: {
          transactions: Array.isArray(parsed?.personal?.transactions) ? parsed.personal.transactions : [],
          dues: Array.isArray(parsed?.personal?.dues) ? parsed.personal.dues : [],
        },
        office: {
          transactions: Array.isArray(parsed?.office?.transactions) ? parsed.office.transactions : [],
          dues: Array.isArray(parsed?.office?.dues) ? parsed.office.dues : [],
        },
      };
    } catch (err) {
      console.error("Load error:", err);
      return getDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error("Save error:", err);
      showToast("স্টোরেজ পূর্ণ! পুরনো ছবি বা ডাটা ডিলিট করুন।");
      return false;
    }
  }

  function activeLedger() {
    return state[currentMode];
  }

  function cfg() {
    return MODE_CONFIG[currentMode];
  }

  function formatMoney(amount) {
    const num = Number(amount) || 0;
    const sign = num < 0 ? "-" : "";
    const abs = Math.abs(num);
    const formatted = Number.isInteger(abs)
      ? abs.toLocaleString("en-IN")
      : abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${sign}৳ ${formatted}`;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isSameDay(ts1, ts2) {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  function isSameMonth(ts1, ts2) {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  }

  function computeSummary() {
    const now = Date.now();
    let cash = 0;
    let digital = 0;
    let monthlyExpense = 0;

    for (const tx of activeLedger().transactions) {
      const amt = Number(tx.amount) || 0;
      if (tx.kind === "income") {
        if (tx.method === "cash") cash += amt;
        else digital += amt;
      } else if (tx.kind === "transfer") {
        if (tx.transferDir === "digital_to_cash") {
          digital -= amt;
          cash += amt;
        } else {
          cash -= amt;
          digital += amt;
        }
      } else if (tx.kind === "expense") {
        if (tx.method === "cash") cash -= amt;
        else digital -= amt;

        if (isSameMonth(tx.timestamp, now)) {
          monthlyExpense += amt;
        }
      }
    }
    return { cash, digital, monthlyExpense };
  }

  function applyTheme() {
    const c = cfg();
    metaThemeEl.setAttribute("content", c.themeColor);
    appHeaderEl.className = `${c.headerBg} text-white px-4 pt-4 pb-5 rounded-b-3xl shadow-md sticky top-0 z-20 safe-top transition-colors duration-200`;
    cashWalletLabelEl.textContent = c.cashLabel;
    btnOpenCashIn.className = `${c.primaryBtn} active:scale-[0.98] transition text-white font-bold py-2.5 px-3 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 text-xs`;
    quickModeBadgeEl.className = `text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.badgeBg}`;
    quickModeBadgeEl.textContent = c.name;
    btnSaveEntry.className = `flex-1 py-3 rounded-xl ${c.primaryBtn} text-white font-bold text-sm shadow-sm active:scale-[0.99] transition`;

    if (currentMode === "personal") {
      modePersonalBtn.className = "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-blue-700 shadow-sm";
      modeOfficeBtn.className = "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-white/85 hover:text-white";
    } else {
      modeOfficeBtn.className = "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-emerald-700 shadow-sm";
      modePersonalBtn.className = "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-white/85 hover:text-white";
    }

    updateTabsUI();
    updateFilterButtonsUI();
  }

  function renderHeaderDates() {
    const now = new Date();
    const monthName = BENGALI_MONTHS[now.getMonth()];
    currentDateLabelEl.textContent = `${now.getDate()} ${monthName}, ${now.getFullYear()}`;
    currentMonthNameEl.textContent = monthName;
  }

  function renderDashboard() {
    const { cash, digital, monthlyExpense } = computeSummary();
    dashCashEl.textContent = formatMoney(cash);
    dashDigitalEl.textContent = formatMoney(digital);
    dashMonthlyExpenseEl.textContent = formatMoney(monthlyExpense);
  }

  function renderQuickCategories() {
    const cats = cfg().categories;
    quickGridEl.innerHTML = cats.map((cat) => `
      <button
        type="button"
        data-category-id="${cat.id}"
        class="quick-cat-btn ${cat.color} border rounded-2xl py-3 px-2 flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
      >
        <span class="text-2xl leading-none">${cat.icon}</span>
        <span class="text-[11px] font-bold truncate max-w-full">${cat.label}</span>
      </button>
    `).join("");

    quickGridEl.querySelectorAll(".quick-cat-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const catId = btn.getAttribute("data-category-id");
        const cat = cats.find((c) => c.id === catId) || cats[0];
        openExpenseModal(cat);
      });
    });
  }

  function formatTxTime(ts) {
    const d = new Date(ts);
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    if (isSameDay(ts, Date.now())) return `আজ, ${timeStr}`;
    return `${d.getDate()} ${BENGALI_MONTHS[d.getMonth()]}, ${timeStr}`;
  }

  function getFilteredTransactions() {
    const now = Date.now();
    const sorted = [...activeLedger().transactions].sort((a, b) => b.timestamp - a.timestamp);
    if (currentFilter === "today") return sorted.filter((tx) => isSameDay(tx.timestamp, now));
    if (currentFilter === "month") return sorted.filter((tx) => isSameMonth(tx.timestamp, now));
    return sorted;
  }

  function renderHistory() {
    const list = getFilteredTransactions();
    historyCountEl.textContent = `${list.length}টি লেনদেন`;

    if (list.length === 0) {
      transactionListEl.innerHTML = `
        <div class="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-400">
          <div class="text-3xl mb-1.5">🧾</div>
          <p class="text-xs font-medium">এই তালিকায় কোনো লেনদেন নেই</p>
        </div>
      `;
      return;
    }

    transactionListEl.innerHTML = list.map((tx) => {
      const isExpense = tx.kind === "expense";
      const isTransfer = tx.kind === "transfer";
      const amountClass = isExpense ? "text-rose-600" : isTransfer ? "text-sky-600" : "text-emerald-600";
      const prefix = isExpense ? "-" : isTransfer ? "" : "+";

      let methodLabel = "";
      if (isTransfer) {
        methodLabel = tx.transferDir === "digital_to_cash" ? "বিকাশ → ক্যাশ" : "ক্যাশ → বিকাশ";
      } else {
        methodLabel = tx.method === "cash" ? "Cash (পকেট)" : "Digital (বিকাশ/ব্যাংক)";
      }

      const noteHtml = tx.note
        ? `<p class="text-[11px] text-slate-500 truncate mt-0.5">${escapeHtml(tx.note)}</p>`
        : "";

      const receiptBtn = tx.receipt
        ? `<button type="button" data-receipt-id="${tx.id}" class="view-receipt-btn inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">📷 ভাউচার দেখুন</button>`
        : "";

      return `
        <div class="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
              ${tx.icon || "💸"}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-bold text-slate-800 truncate">${escapeHtml(tx.category)}</span>
                <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">${methodLabel}</span>
              </div>
              ${noteHtml}
              <p class="text-[10px] text-slate-400 mt-0.5">${formatTxTime(tx.timestamp)}</p>
              ${receiptBtn}
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0 no-print">
            <span class="text-sm font-extrabold ${amountClass} mr-1">${prefix}${formatMoney(tx.amount)}</span>
            <button type="button" data-edit-id="${tx.id}" class="edit-tx-btn w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs" title="এডিট">✏️</button>
            <button type="button" data-delete-id="${tx.id}" class="delete-tx-btn w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center text-xs" title="মুছুন">🗑️</button>
          </div>
        </div>
      `;
    }).join("");

    transactionListEl.querySelectorAll(".view-receipt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tx = activeLedger().transactions.find((t) => t.id === btn.getAttribute("data-receipt-id"));
        if (tx?.receipt) openLightbox(tx.receipt);
      });
    });

    transactionListEl.querySelectorAll(".edit-tx-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tx = activeLedger().transactions.find((t) => t.id === btn.getAttribute("data-edit-id"));
        if (tx) openEditModal(tx);
      });
    });

    transactionListEl.querySelectorAll(".delete-tx-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteTransaction(btn.getAttribute("data-delete-id"));
      });
    });
  }

  function renderBreakdown() {
    const now = Date.now();
    const cats = cfg().categories;
    const totals = {};
    for (const c of cats) totals[c.id] = 0;

    let grandTotal = 0;
    for (const tx of activeLedger().transactions) {
      if (tx.kind === "expense" && isSameMonth(tx.timestamp, now)) {
        const amt = Number(tx.amount) || 0;
        const key = Object.prototype.hasOwnProperty.call(totals, tx.category) ? tx.category : cats[cats.length - 1].id;
        totals[key] += amt;
        grandTotal += amt;
      }
    }

    if (grandTotal === 0) {
      breakdownListEl.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">এই মাসে এখনো কোনো খরচ নেই</p>`;
      return;
    }

    const barClass = cfg().barBg;
    breakdownListEl.innerHTML = cats.map((cat) => {
      const amt = totals[cat.id] || 0;
      const pct = Math.round((amt / grandTotal) * 100);
      return `
        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>${cat.icon}</span>
              <span>${cat.label}</span>
            </span>
            <span class="font-bold text-slate-800">${formatMoney(amt)} <span class="text-slate-400 font-normal">(${pct}%)</span></span>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full ${barClass} rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderDues() {
    const dues = activeLedger().dues;
    let totalReceivable = 0;
    let totalPayable = 0;
    const personMap = new Map();

    for (const d of dues) {
      const amt = Number(d.amount) || 0;
      if (d.status !== "settled") {
        if (d.type === "receivable") totalReceivable += amt;
        else totalPayable += amt;
      }

      const key = d.personName.trim().toLowerCase();
      if (!personMap.has(key)) {
        personMap.set(key, {
          key,
          displayName: d.personName.trim(),
          unpaidReceivable: 0,
          unpaidPayable: 0,
          count: 0,
          latestTs: d.timestamp,
        });
      }
      const p = personMap.get(key);
      p.count += 1;
      if (d.timestamp > p.latestTs) p.latestTs = d.timestamp;
      if (d.status !== "settled") {
        if (d.type === "receivable") p.unpaidReceivable += amt;
        else p.unpaidPayable += amt;
      }
    }

    duesTotalReceivableEl.textContent = formatMoney(totalReceivable);
    duesTotalPayableEl.textContent = formatMoney(totalPayable);

    const people = Array.from(personMap.values()).sort((a, b) => b.latestTs - a.latestTs);
    if (people.length === 0) {
      duesPersonListEl.innerHTML = `
        <div class="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-400">
          <div class="text-3xl mb-1.5">🤝</div>
          <p class="text-xs font-medium">কোনো পাওনা বা দেনা রেকর্ড নেই</p>
        </div>
      `;
      return;
    }

    duesPersonListEl.innerHTML = people.map((p) => {
      const net = p.unpaidReceivable - p.unpaidPayable;
      let statusBadge = `<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">পরিশোধিত ✓</span>`;
      if (net > 0) {
        statusBadge = `<span class="text-xs font-extrabold text-emerald-600">পাবো ${formatMoney(net)}</span>`;
      } else if (net < 0) {
        statusBadge = `<span class="text-xs font-extrabold text-rose-600">দেবো ${formatMoney(Math.abs(net))}</span>`;
      }

      return `
        <button
          type="button"
          data-person-key="${escapeHtml(p.key)}"
          class="person-due-card w-full text-left bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.99] transition"
        >
          <div>
            <p class="text-sm font-bold text-slate-800">${escapeHtml(p.displayName)}</p>
            <p class="text-[11px] text-slate-400">${p.count}টি এন্ট্রি • বিস্তারিত দেখতে ট্যাপ করুন</p>
          </div>
          <div>${statusBadge}</div>
        </button>
      `;
    }).join("");

    duesPersonListEl.querySelectorAll(".person-due-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        openPersonDueModal(btn.getAttribute("data-person-key"));
      });
    });
  }

  function renderAll() {
    renderDashboard();
    renderHistory();
    renderBreakdown();
    renderDues();
  }

  // Entry Modal Logic
  function openExpenseModal(category) {
    modalAction = "expense";
    editingTxId = null;
    selectedCategory = category;
    selectedMethod = "cash";
    keypadValue = "0";
    capturedReceiptBase64 = "";
    modalNoteEl.value = "";

    modalIconEl.textContent = category.icon;
    modalTitleEl.textContent = category.label;
    modalSubtitleEl.textContent = `${cfg().bnName} • খরচের পরিমাণ লিখুন`;

    walletSourceGroupEl.classList.remove("hidden");
    transferDirectionGroupEl.classList.add("hidden");
    receiptCaptureGroupEl.classList.remove("hidden");

    updateMethodUI();
    updateReceiptPreview();
    keypadDisplayEl.textContent = keypadValue;
    showEntryModal();
  }

  function openCashInModal() {
    modalAction = "cashin";
    editingTxId = null;
    selectedMethod = "cash";
    keypadValue = "0";
    capturedReceiptBase64 = "";
    modalNoteEl.value = "";

    modalIconEl.textContent = "💰";
    modalTitleEl.textContent = "টাকা যোগ (Cash In)";
    modalSubtitleEl.textContent = `${cfg().bnName} • বেতন, বাজেট বা ফান্ড যোগ করুন`;

    walletSourceGroupEl.classList.remove("hidden");
    transferDirectionGroupEl.classList.add("hidden");
    receiptCaptureGroupEl.classList.add("hidden");

    updateMethodUI();
    keypadDisplayEl.textContent = keypadValue;
    showEntryModal();
  }

  function openTransferModal() {
    modalAction = "transfer";
    editingTxId = null;
    transferDir = "digital_to_cash";
    keypadValue = "0";
    capturedReceiptBase64 = "";
    modalNoteEl.value = "";

    modalIconEl.textContent = "🔄";
    modalTitleEl.textContent = "ক্যাশ-আউট / ট্রান্সফার";
    modalSubtitleEl.textContent = "ক্যাশ ও ডিজিটাল ব্যালেন্স সমন্বয় করুন";

    walletSourceGroupEl.classList.add("hidden");
    transferDirectionGroupEl.classList.remove("hidden");
    receiptCaptureGroupEl.classList.add("hidden");

    updateTransferUI();
    keypadDisplayEl.textContent = keypadValue;
    showEntryModal();
  }

  function openEditModal(tx) {
    editingTxId = tx.id;
    keypadValue = String(tx.amount);
    modalNoteEl.value = tx.note || "";
    capturedReceiptBase64 = tx.receipt || "";

    if (tx.kind === "expense") {
      modalAction = "expense";
      selectedCategory = cfg().categories.find((c) => c.id === tx.category) || { id: tx.category, label: tx.category, icon: tx.icon || "💸" };
      selectedMethod = tx.method || "cash";
      modalIconEl.textContent = selectedCategory.icon;
      modalTitleEl.textContent = `${selectedCategory.label} (এডিট)`;
      modalSubtitleEl.textContent = "তথ্য পরিবর্তন করে সেভ করুন";
      walletSourceGroupEl.classList.remove("hidden");
      transferDirectionGroupEl.classList.add("hidden");
      receiptCaptureGroupEl.classList.remove("hidden");
      updateMethodUI();
      updateReceiptPreview();
    } else if (tx.kind === "income") {
      modalAction = "cashin";
      selectedMethod = tx.method || "cash";
      modalIconEl.textContent = "💰";
      modalTitleEl.textContent = "টাকা যোগ (এডিট)";
      modalSubtitleEl.textContent = "তথ্য পরিবর্তন করে সেভ করুন";
      walletSourceGroupEl.classList.remove("hidden");
      transferDirectionGroupEl.classList.add("hidden");
      receiptCaptureGroupEl.classList.add("hidden");
      updateMethodUI();
    } else {
      modalAction = "transfer";
      transferDir = tx.transferDir || "digital_to_cash";
      modalIconEl.textContent = "🔄";
      modalTitleEl.textContent = "ট্রান্সফার (এডিট)";
      modalSubtitleEl.textContent = "তথ্য পরিবর্তন করে সেভ করুন";
      walletSourceGroupEl.classList.add("hidden");
      transferDirectionGroupEl.classList.remove("hidden");
      receiptCaptureGroupEl.classList.add("hidden");
      updateTransferUI();
    }

    keypadDisplayEl.textContent = keypadValue;
    showEntryModal();
  }

  function showEntryModal() {
    entryModalEl.classList.remove("hidden");
    entryModalEl.classList.add("flex");
  }

  function closeEntryModal() {
    entryModalEl.classList.add("hidden");
    entryModalEl.classList.remove("flex");
  }

  function updateMethodUI() {
    const activeCls = cfg().activeBorder;
    document.querySelectorAll(".method-toggle-btn").forEach((btn) => {
      const m = btn.getAttribute("data-method");
      btn.className = m === selectedMethod
        ? `method-toggle-btn py-2.5 px-3 rounded-xl text-xs font-bold border-2 ${activeCls} flex items-center justify-center gap-1.5`
        : "method-toggle-btn py-2.5 px-3 rounded-xl text-xs font-bold border-2 border-slate-200 bg-white text-slate-600 flex items-center justify-center gap-1.5";
    });
  }

  function updateTransferUI() {
    const activeCls = cfg().activeBorder;
    document.querySelectorAll(".transfer-dir-btn").forEach((btn) => {
      const dir = btn.getAttribute("data-transfer");
      btn.className = dir === transferDir
        ? `transfer-dir-btn py-2.5 px-2 rounded-xl text-[11px] font-bold border-2 ${activeCls} text-center`
        : "transfer-dir-btn py-2.5 px-2 rounded-xl text-[11px] font-bold border-2 border-slate-200 bg-white text-slate-600 text-center";
    });
  }

  function updateReceiptPreview() {
    if (capturedReceiptBase64) {
      receiptPreviewImgEl.src = capturedReceiptBase64;
      receiptPreviewWrapEl.classList.remove("hidden");
    } else {
      receiptPreviewImgEl.src = "";
      receiptPreviewWrapEl.classList.add("hidden");
    }
  }

  function compressReceiptImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 720;
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        capturedReceiptBase64 = canvas.toDataURL("image/jpeg", 0.65);
        updateReceiptPreview();
        showToast("ভাউচার ছবি যুক্ত হয়েছে");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleKeypadInput(key) {
    if (key === "backspace") {
      keypadValue = keypadValue.length > 1 ? keypadValue.slice(0, -1) : "0";
      keypadDisplayEl.textContent = keypadValue;
      return;
    }
    if (key === ".") {
      if (!keypadValue.includes(".")) keypadValue += ".";
      keypadDisplayEl.textContent = keypadValue;
      return;
    }
    if (keypadValue.includes(".")) {
      const [, dec] = keypadValue.split(".");
      if (dec && dec.length >= 2) return;
    }
    if (keypadValue.replace(".", "").length >= 9) return;
    keypadValue = keypadValue === "0" ? key : keypadValue + key;
    keypadDisplayEl.textContent = keypadValue;
  }

  function saveEntry() {
    const amount = parseFloat(keypadValue);
    if (!amount || amount <= 0) {
      showToast("সঠিক পরিমাণ লিখুন");
      return;
    }

    const note = modalNoteEl.value.trim();
    const list = activeLedger().transactions;

    const recordBase = modalAction === "expense"
      ? {
          kind: "expense",
          category: selectedCategory.id,
          icon: selectedCategory.icon,
          method: selectedMethod,
          amount,
          note,
          receipt: capturedReceiptBase64 || "",
        }
      : modalAction === "cashin"
      ? {
          kind: "income",
          category: selectedMethod === "cash" ? "ক্যাশ জমা (Cash In)" : "ডিজিটাল জমা (Cash In)",
          icon: "💰",
          method: selectedMethod,
          amount,
          note,
          receipt: "",
        }
      : {
          kind: "transfer",
          category: transferDir === "digital_to_cash" ? "ক্যাশ-আউট (বিকাশ → ক্যাশ)" : "ক্যাশ-ইন (ক্যাশ → বিকাশ)",
          icon: "🔄",
          method: "transfer",
          transferDir,
          amount,
          note,
          receipt: "",
        };

    if (editingTxId) {
      const idx = list.findIndex((t) => t.id === editingTxId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...recordBase };
      }
    } else {
      list.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        ...recordBase,
      });
    }

    if (saveState()) {
      closeEntryModal();
      renderAll();
      showToast(editingTxId ? "আপডেট হয়েছে!" : "সেভ হয়েছে!");
    }
  }

  function deleteTransaction(id) {
    const tx = activeLedger().transactions.find((t) => t.id === id);
    if (!tx) return;
    if (!confirm(`"${tx.category}" (${formatMoney(tx.amount)}) মুছে ফেলতে চান?`)) return;
    activeLedger().transactions = activeLedger().transactions.filter((t) => t.id !== id);
    saveState();
    renderAll();
    showToast("মুছে ফেলা হয়েছে");
  }

  // Dues Logic
  function openDueModal() {
    duePersonNameEl.value = "";
    dueAmountEl.value = "";
    dueNoteEl.value = "";
    selectedDueType = "receivable";
    updateDueTypeUI();
    dueModalEl.classList.remove("hidden");
    dueModalEl.classList.add("flex");
  }

  function closeDueModal() {
    dueModalEl.classList.add("hidden");
    dueModalEl.classList.remove("flex");
  }

  function updateDueTypeUI() {
    document.querySelectorAll(".due-type-btn").forEach((btn) => {
      const t = btn.getAttribute("data-due-type");
      if (t === selectedDueType) {
        btn.className = t === "receivable"
          ? "due-type-btn py-2.5 px-3 rounded-xl text-xs font-bold border-2 border-emerald-600 bg-emerald-50 text-emerald-800"
          : "due-type-btn py-2.5 px-3 rounded-xl text-xs font-bold border-2 border-rose-600 bg-rose-50 text-rose-800";
      } else {
        btn.className = "due-type-btn py-2.5 px-3 rounded-xl text-xs font-bold border-2 border-slate-200 bg-white text-slate-600";
      }
    });
  }

  function saveDueEntry() {
    const personName = duePersonNameEl.value.trim();
    const amount = parseFloat(dueAmountEl.value);
    const note = dueNoteEl.value.trim();

    if (!personName) {
      showToast("ব্যক্তি বা প্রতিষ্ঠানের নাম লিখুন");
      return;
    }
    if (!amount || amount <= 0) {
      showToast("সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    activeLedger().dues.push({
      id: `due_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      personName,
      type: selectedDueType,
      amount,
      note,
      status: "unpaid",
      timestamp: Date.now(),
    });

    saveState();
    closeDueModal();
    renderDues();
    showToast("পাওনা/দেনা সেভ হয়েছে!");
  }

  function openPersonDueModal(personKey) {
    activePersonKey = personKey;
    renderPersonDueItems();
    personDueModalEl.classList.remove("hidden");
    personDueModalEl.classList.add("flex");
  }

  function closePersonDueModal() {
    personDueModalEl.classList.add("hidden");
    personDueModalEl.classList.remove("flex");
  }

  function renderPersonDueItems() {
    const items = activeLedger().dues
      .filter((d) => d.personName.trim().toLowerCase() === activePersonKey)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (items.length === 0) {
      closePersonDueModal();
      return;
    }

    personDueTitleEl.textContent = items[0].personName;
    personDueSubtitleEl.textContent = `${items.length}টি লেনদেন (${cfg().bnName})`;

    personDueItemsEl.innerHTML = items.map((d) => {
      const isRec = d.type === "receivable";
      const isSettled = d.status === "settled";
      const badge = isRec
        ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">পাবো</span>`
        : `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">দেবো</span>`;

      return `
        <div class="p-3 rounded-2xl border ${isSettled ? "bg-slate-50 border-slate-200 opacity-75" : "bg-white border-slate-200"} flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              ${badge}
              <span class="text-sm font-extrabold text-slate-800">${formatMoney(d.amount)}</span>
            </div>
            ${d.note ? `<p class="text-[11px] text-slate-500 truncate">${escapeHtml(d.note)}</p>` : ""}
            <p class="text-[10px] text-slate-400">${formatTxTime(d.timestamp)}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            ${isSettled
              ? `<span class="text-[11px] font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">পরিশোধিত ✓</span>`
              : `<button type="button" data-settle-id="${d.id}" class="settle-due-btn px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold active:scale-95 transition">Settled ✓</button>`
            }
            <button type="button" data-del-due-id="${d.id}" class="del-due-btn w-7 h-7 rounded-lg bg-rose-50 text-rose-500 text-xs flex items-center justify-center">🗑️</button>
          </div>
        </div>
      `;
    }).join("");

    personDueItemsEl.querySelectorAll(".settle-due-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-settle-id");
        const target = activeLedger().dues.find((d) => d.id === id);
        if (target) {
          target.status = "settled";
          saveState();
          renderDues();
          renderPersonDueItems();
          showToast("পরিশোধিত হিসেবে চিহ্নিত হয়েছে ✓");
        }
      });
    });

    personDueItemsEl.querySelectorAll(".del-due-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-due-id");
        activeLedger().dues = activeLedger().dues.filter((d) => d.id !== id);
        saveState();
        renderDues();
        renderPersonDueItems();
        showToast("মুছে ফেলা হয়েছে");
      });
    });
  }

  // Lightbox
  function openLightbox(src) {
    lightboxImgEl.src = src;
    lightboxModalEl.classList.remove("hidden");
    lightboxModalEl.classList.add("flex");
  }

  function closeLightbox() {
    lightboxModalEl.classList.add("hidden");
    lightboxModalEl.classList.remove("flex");
    lightboxImgEl.src = "";
  }

  // CSV Export (Separate for Personal and Office)
  function exportCsv() {
    const txs = activeLedger().transactions;
    if (txs.length === 0) {
      showToast("এক্সপোর্ট করার মতো কোনো ডাটা নেই");
      return;
    }

    const headers = ["Mode", "Date", "Time", "Type", "Category", "Method", "Amount (BDT)", "Note"];
    const rows = [...txs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((tx) => {
        const d = new Date(tx.timestamp);
        const dateStr = d.toLocaleDateString("en-CA");
        const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        const methodStr = tx.kind === "transfer"
          ? (tx.transferDir === "digital_to_cash" ? "Digital to Cash" : "Cash to Digital")
          : (tx.method === "cash" ? "Cash" : "Digital");
        const safeNote = `"${String(tx.note || "").replace(/"/g, '""')}"`;
        const safeCat = `"${String(tx.category || "").replace(/"/g, '""')}"`;
        return [cfg().name, dateStr, timeStr, tx.kind, safeCat, methodStr, tx.amount, safeNote].join(",");
      });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const fileName = `${currentMode}-expense-report-${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    if (typeof File === "function") {
      const file = new File([blob], fileName, { type: "text/csv" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: `${cfg().name} Expense Report` }).catch(() => downloadBlob(blob, fileName));
        return;
      }
    }
    downloadBlob(blob, fileName);
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`${cfg().name} CSV ডাউনলোড হয়েছে!`);
  }

  // Tabs & Filter UI
  function updateTabsUI() {
    const activeTxt = cfg().activeText;
    const tabs = [
      { id: "history", btn: tabHistoryBtn, panel: panelHistoryEl },
      { id: "breakdown", btn: tabBreakdownBtn, panel: panelBreakdownEl },
      { id: "dues", btn: tabDuesBtn, panel: panelDuesEl },
    ];
    for (const t of tabs) {
      if (t.id === activeTab) {
        t.btn.className = `flex-1 py-2 text-[11px] font-bold rounded-lg transition bg-white ${activeTxt} shadow-sm`;
        t.panel.classList.remove("hidden");
      } else {
        t.btn.className = "flex-1 py-2 text-[11px] font-bold rounded-lg transition text-slate-600";
        t.panel.classList.add("hidden");
      }
    }
  }

  function updateFilterButtonsUI() {
    const activeBtn = cfg().primaryBtn;
    document.querySelectorAll(".filter-btn").forEach((b) => {
      const isMatch = b.getAttribute("data-filter") === currentFilter;
      b.className = isMatch
        ? `filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold ${activeBtn} text-white`
        : "filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200 text-slate-600";
    });
  }

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2300);
  }

  function bindEvents() {
    modePersonalBtn.addEventListener("click", () => {
      if (currentMode === "personal") return;
      currentMode = "personal";
      applyTheme();
      renderQuickCategories();
      renderAll();
    });

    modeOfficeBtn.addEventListener("click", () => {
      if (currentMode === "office") return;
      currentMode = "office";
      applyTheme();
      renderQuickCategories();
      renderAll();
    });

    btnOpenCashIn.addEventListener("click", openCashInModal);
    document.getElementById("btn-open-transfer").addEventListener("click", openTransferModal);
    document.getElementById("btn-export-csv").addEventListener("click", exportCsv);
    document.getElementById("btn-export-pdf").addEventListener("click", () => window.print());

    document.getElementById("btn-close-modal").addEventListener("click", closeEntryModal);
    document.getElementById("btn-save-entry").addEventListener("click", saveEntry);
    document.getElementById("btn-clear-keypad").addEventListener("click", () => {
      keypadValue = "0";
      keypadDisplayEl.textContent = keypadValue;
    });

    entryModalEl.addEventListener("click", (e) => {
      if (e.target === entryModalEl) closeEntryModal();
    });

    document.querySelectorAll(".keypad-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleKeypadInput(btn.getAttribute("data-key")));
    });

    document.querySelectorAll(".method-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedMethod = btn.getAttribute("data-method");
        updateMethodUI();
      });
    });

    document.querySelectorAll(".transfer-dir-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        transferDir = btn.getAttribute("data-transfer");
        updateTransferUI();
      });
    });

    document.getElementById("btn-capture-receipt").addEventListener("click", () => {
      receiptFileInputEl.click();
    });

    receiptFileInputEl.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) compressReceiptImage(file);
      e.target.value = "";
    });

    document.getElementById("btn-remove-receipt").addEventListener("click", () => {
      capturedReceiptBase64 = "";
      updateReceiptPreview();
    });

    // Tabs
    tabHistoryBtn.addEventListener("click", () => { activeTab = "history"; updateTabsUI(); });
    tabBreakdownBtn.addEventListener("click", () => { activeTab = "breakdown"; updateTabsUI(); renderBreakdown(); });
    tabDuesBtn.addEventListener("click", () => { activeTab = "dues"; updateTabsUI(); renderDues(); });

    // Filters
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentFilter = btn.getAttribute("data-filter");
        updateFilterButtonsUI();
        renderHistory();
      });
    });

    // Dues Modals
    document.getElementById("btn-open-add-due").addEventListener("click", openDueModal);
    document.getElementById("btn-close-due-modal").addEventListener("click", closeDueModal);
    document.getElementById("btn-save-due").addEventListener("click", saveDueEntry);
    document.querySelectorAll(".due-type-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDueType = btn.getAttribute("data-due-type");
        updateDueTypeUI();
      });
    });
    document.getElementById("btn-close-person-due").addEventListener("click", closePersonDueModal);

    // Lightbox
    document.getElementById("btn-close-lightbox").addEventListener("click", closeLightbox);
    lightboxModalEl.addEventListener("click", (e) => {
      if (e.target === lightboxModalEl) closeLightbox();
    });
  }

  // Init
  renderHeaderDates();
  applyTheme();
  renderQuickCategories();
  bindEvents();
  renderAll();
})();
