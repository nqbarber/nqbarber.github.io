const STORAGE_KEY = 'NQ_BARBER_APP_DATA_FINAL';
const SESSION_KEY = 'NQ_BARBER_CURRENT_SESSION_V1';
const FIREBASE_DB_URL = 'https://nq-barber-db-default-rtdb.asia-southeast1.firebasedatabase.app/nq_barber_store.json';

const BANK_NAMES = {
    MB: 'MB Bank',
    VCB: 'Vietcombank',
    TCB: 'Techcombank',
    BIDV: 'BIDV',
    ICB: 'VietinBank',
    ACB: 'ACB',
    VPB: 'VPBank',
    TPB: 'TPBank',
    STB: 'Sacombank',
    VIB: 'VIB',
    MSB: 'MSB',
    OCB: 'OCB',
    SHB: 'SHB',
    AGRI: 'Agribank'
};

const DEFAULT_DATA = {
    users: [
        { username: 'admin', password: '123456', role: 'admin', displayName: 'Quản Trị Viên (Chủ Tiệm)', isRoot: true },
        { username: 'nhanvien', password: '123456', role: 'staff', displayName: 'Nhân Viên Thu Ngân', isRoot: false }
    ],
    shopInfo: {
        name: 'NQ BARBER',
        tagline: 'Đẳng Cấp Phái Mạnh - Chuẩn Phong Cách',
        address: 'NQ Barber Shop - Xem vị trí trực tiếp trên Google Maps',
        bankId: 'MB',
        bankAcc: '0971886269',
        accountHolder: 'NGUYEN MINH QUAN',
        barbers: ['Minh Quân (Master)', 'Hoàng Nam', 'Tuấn Anh', 'Đức Huy']
    },
    services: [
        { id: 'srv-1', name: 'Cắt Tóc Tạo Kiểu VIP', price: 80000, desc: 'Tư vấn + Cắt + Xả sạch + Vuốt sáp (40p)' },
        { id: 'srv-2', name: 'Combo Đế Vương (Full)', price: 150000, desc: 'Cắt VIP + Cạo mặt + Ráy tai + Gội dưỡng sinh' },
        { id: 'srv-3', name: 'Cạo Mặt & Ráy Tai Thư Giãn', price: 50000, desc: 'Khăn nóng + Cạo râu + Lấy ráy tai êm ái' },
        { id: 'srv-4', name: 'Gội Đầu Dưỡng Sinh Cổ Vai Gáy', price: 70000, desc: 'Massage bấm huyệt thư giãn 30 phút' },
        { id: 'srv-5', name: 'Uốn Tóc Hàn Quốc / Premlock', price: 300000, desc: 'Thuốc uốn cao cấp giữ nếp chuẩn form' },
        { id: 'srv-6', name: 'Nhuộm Màu Thời Trang', price: 350000, desc: 'Lên màu chuẩn, bóng mượt, bảo vệ tóc' },
        { id: 'srv-7', name: 'Tẩy Tóc & Nhuộm Bạch Kim', price: 550000, desc: 'Kỹ thuật tẩy an toàn không rát da đầu' },
        { id: 'srv-8', name: 'Đắp Mặt Nạ Than Hoạt Tính', price: 40000, desc: 'Hút mụn cám, sáng da mặt sau khi cắt' }
    ],
    transactions: [
        {
            id: 'tx-101',
            type: 'income',
            title: 'Combo Đế Vương (Full) x1, Đắp Mặt Nạ Than Hoạt Tính x1',
            customer: 'Anh Hoàng Tuấn',
            staff: 'Minh Quân (Master)',
            amount: 190000,
            date: '19/11/2026 18:45'
        },
        {
            id: 'tx-102',
            type: 'income',
            title: 'Uốn Tóc Hàn Quốc / Premlock x1, Cắt Tóc Tạo Kiểu VIP x1',
            customer: 'Bạn Đức Anh',
            staff: 'Hoàng Nam',
            amount: 380000,
            date: '19/11/2026 16:20'
        },
        {
            id: 'tx-103',
            type: 'expense',
            title: 'Nhập 3 hũ sáp vuốt tóc Volcanic Clay + 2 hộp dao lam',
            customer: 'Vật tư tóc (Sáp, gôm, thuốc uốn/nhuộm)',
            staff: 'Admin',
            amount: 420000,
            date: '19/11/2026 10:15'
        }
    ],
    bookings: [],
    gallery: [
        {
            id: 'img-1',
            caption: 'Không gian ghế cắt sang trọng tại NQ Barber',
            url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'img-2',
            caption: 'Khu vực tạo kiểu & dụng cụ chuyên nghiệp',
            url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'img-3',
            caption: 'Đường cắt Fade sắc nét chuẩn Barber',
            url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'img-4',
            caption: 'Trải nghiệm dịch vụ VIP đẳng cấp phái mạnh',
            url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80'
        }
    ]
};

let appData = loadData();
let currentUser = null;
let selectedServices = {};
let guestSelectedServices = {};
let revealedPasswords = {};
let lastSyncedSnapshot = '';
let isSyncingToCloud = false;
let activeDateKey = getTodayDateStr();

function normalizeAppData(raw) {
    const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
    if (!raw || typeof raw !== 'object') return base;

    const merged = {
        ...base,
        ...raw,
        shopInfo: {
            ...base.shopInfo,
            ...(raw.shopInfo || {})
        }
    };

    if (!Array.isArray(merged.users) || merged.users.length === 0) {
        merged.users = base.users;
    }
    if (!Array.isArray(merged.services)) {
        merged.services = base.services;
    }
    if (!Array.isArray(merged.transactions)) {
        merged.transactions = [];
    }
    if (!Array.isArray(merged.bookings)) {
        merged.bookings = [];
    }
    if (!Array.isArray(merged.gallery)) {
        merged.gallery = base.gallery;
    }
    if (!Array.isArray(merged.shopInfo.barbers) || merged.shopInfo.barbers.length === 0) {
        merged.shopInfo.barbers = base.shopInfo.barbers;
    }
    return merged;
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return normalizeAppData(JSON.parse(saved));
        }
    } catch (e) {
        console.error(e);
    }
    return normalizeAppData(null);
}

// ==========================================
// DATE & MONTH HELPERS (TỰ ĐỘNG RESET QUA NGÀY MỚI)
// ==========================================
function getTodayDateStr() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}

function getTodayInputDate() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function getCurrentMonthValue() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

// Parse "DD/MM/YYYY HH:mm" -> { dateStr: "DD/MM/YYYY", monthKey: "YYYY-MM" }
function parseTxDateInfo(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return { dateStr: '', monthKey: '' };
    const datePart = dateStr.trim().split(' ')[0] || '';
    const parts = datePart.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return {
            dateStr: `${day}/${month}/${year}`,
            monthKey: `${year}-${month}`
        };
    }
    return { dateStr: datePart, monthKey: '' };
}

function updateSyncBadge(status) {
    const badge = document.getElementById('sync-status-badge');
    if (!badge) return;
    if (status === 'syncing') {
        badge.className = 'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-barber-gold/15 text-barber-gold border border-barber-gold/30';
        badge.innerHTML = '<i class="fa-solid fa-rotate fa-spin text-[9px]"></i> Đang đồng bộ...';
    } else if (status === 'offline') {
        badge.className = 'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-barber-red/15 text-barber-red border border-barber-red/30';
        badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-barber-red"></span> Lưu cục bộ';
    } else {
        badge.className = 'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
        badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Đã đồng bộ';
    }
}

async function pushDataToFirebase() {
    if (!FIREBASE_DB_URL) return;
    isSyncingToCloud = true;
    updateSyncBadge('syncing');
    try {
        const payload = JSON.stringify(appData);
        const res = await fetch(FIREBASE_DB_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
        if (res.ok) {
            lastSyncedSnapshot = payload;
            updateSyncBadge('synced');
        } else {
            updateSyncBadge('offline');
        }
    } catch (err) {
        console.error('Firebase push error:', err);
        updateSyncBadge('offline');
    } finally {
        isSyncingToCloud = false;
    }
}

async function pullDataFromFirebase(isInitial = false) {
    if (!FIREBASE_DB_URL || isSyncingToCloud) return;
    try {
        const res = await fetch(`${FIREBASE_DB_URL}?t=${Date.now()}`, {
            cache: 'no-store'
        });
        if (!res.ok) {
            updateSyncBadge('offline');
            return;
        }
        const remoteData = await res.json();
        if (!remoteData || typeof remoteData !== 'object') {
            if (isInitial) {
                await pushDataToFirebase();
            }
            return;
        }

        const normalizedRemote = normalizeAppData(remoteData);
        const remoteStr = JSON.stringify(normalizedRemote);
        const localStr = JSON.stringify(appData);

        if (remoteStr !== localStr) {
            appData = normalizedRemote;
            lastSyncedSnapshot = remoteStr;
            localStorage.setItem(STORAGE_KEY, remoteStr);

            if (!document.getElementById('guest-portal').classList.contains('hidden')) {
                renderGuestPortal();
            }

            if (currentUser) {
                const updatedCurrent = (appData.users || []).find(
                    u => u.username.toLowerCase() === currentUser.username.toLowerCase()
                );
                if (updatedCurrent) {
                    currentUser = updatedCurrent;
                    saveSession(currentUser);
                    applyRoleUI();
                    renderAll();
                    const accModal = document.getElementById('modal-accounts');
                    if (accModal && !accModal.classList.contains('hidden')) {
                        renderAccountsTable();
                    }
                    const bookModal = document.getElementById('modal-bookings');
                    if (bookModal && !bookModal.classList.contains('hidden')) {
                        renderBookingsModal();
                    }
                } else {
                    logout();
                    showToast('Tài khoản của bạn đã bị Quản Trị Viên thu hồi!', 'error');
                }
            }
        } else {
            lastSyncedSnapshot = remoteStr;
        }
        updateSyncBadge('synced');
    } catch (err) {
        console.error('Firebase pull error:', err);
        updateSyncBadge('offline');
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        console.error(e);
    }
    pushDataToFirebase();
}

// ==========================================
// PERSISTENT LOGIN SESSION
// ==========================================
function saveSession(user) {
    if (!user) return;
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            username: user.username,
            role: user.role,
            displayName: user.displayName,
            loginAt: Date.now()
        }));
    } catch (e) {
        console.error(e);
    }
}

function clearSession() {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (e) {
        console.error(e);
    }
}

function restoreSessionOnLoad() {
    try {
        const rawSession = localStorage.getItem(SESSION_KEY);
        if (!rawSession) return false;
        const parsedSession = JSON.parse(rawSession);
        if (!parsedSession || !parsedSession.username) return false;

        const matchedAccount = (appData.users || []).find(
            acc => acc.username.toLowerCase() === String(parsedSession.username).toLowerCase()
        );

        if (matchedAccount) {
            currentUser = matchedAccount;
            saveSession(matchedAccount);
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('guest-portal').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            applyRoleUI();
            renderAll();
            return true;
        } else {
            clearSession();
        }
    } catch (e) {
        console.error('Restore session error:', e);
    }
    return false;
}

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function getCurrentTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function removeAccents(str) {
    return (str || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

function getSelectedServiceItems() {
    const items = [];
    for (const srv of appData.services) {
        const qty = Number(selectedServices[srv.id]) || 0;
        if (qty > 0) {
            items.push({
                ...srv,
                qty: qty,
                subtotal: (Number(srv.price) || 0) * qty
            });
        }
    }
    return items;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const colors = {
        success: 'border-barber-gold bg-barber-dark text-white',
        error: 'border-barber-red bg-barber-dark text-white',
        info: 'border-blue-500 bg-barber-dark text-white'
    };
    const icons = {
        success: '<i class="fa-solid fa-circle-check text-barber-gold text-lg"></i>',
        error: '<i class="fa-solid fa-circle-exclamation text-barber-red text-lg"></i>',
        info: '<i class="fa-solid fa-circle-info text-blue-400 text-lg"></i>'
    };

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${colors[type] || colors.success}`;
    toast.innerHTML = `${icons[type]}<span class="text-xs sm:text-sm font-medium">${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

// ==========================================
// LOGIN PASSWORD EYE TOGGLE
// ==========================================
function toggleLoginPasswordVisibility() {
    const pwdInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('login-eye-icon');
    if (!pwdInput || !eyeIcon) return;

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// ==========================================
// GUEST PORTAL (KHÁCH HÀNG XEM GIÁ & ĐẶT LỊCH)
// ==========================================
function openGuestPortal() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('guest-portal').classList.remove('hidden');

    const dateInput = document.getElementById('book-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = getTodayInputDate();
    }

    renderGuestPortal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeGuestPortal() {
    document.getElementById('guest-portal').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function copyGuestLink() {
    const baseUrl = window.location.href.split('?')[0];
    const guestUrl = `${baseUrl}?guest=1`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(guestUrl).then(() => {
            showToast('Đã sao chép link đặt lịch dành cho khách hàng!', 'success');
        }).catch(() => {
            showToast(`Link khách hàng: ${guestUrl}`, 'info');
        });
    } else {
        showToast(`Link khách hàng: ${guestUrl}`, 'info');
    }
}

function renderGuestPortal() {
    document.getElementById('guest-shop-name').textContent = appData.shopInfo.name;
    document.getElementById('guest-shop-tagline').textContent = appData.shopInfo.tagline;
    document.getElementById('guest-shop-address').textContent = appData.shopInfo.address;
    document.getElementById('guest-map-address-sub').textContent = appData.shopInfo.address;

    const barberSelect = document.getElementById('book-barber');
    if (barberSelect) {
        const prev = barberSelect.value;
        barberSelect.innerHTML = `<option value="Bất kỳ thợ nào rảnh">Bất kỳ thợ nào rảnh</option>` +
            appData.shopInfo.barbers.map(b => `<option value="${b}">${b}</option>`).join('');
        if (prev) barberSelect.value = prev;
    }

    const grid = document.getElementById('guest-services-grid');
    if (!grid) return;

    grid.innerHTML = appData.services.map(srv => {
        const qty = Number(guestSelectedServices[srv.id]) || 0;
        const isChecked = qty > 0;
        const lineTotal = (Number(srv.price) || 0) * qty;
        return `
            <div onclick="incrementGuestServiceQty('${srv.id}')"
                class="cursor-pointer rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between select-none
                ${isChecked
                    ? 'bg-barber-gold/15 border-barber-gold shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                    : 'bg-barber-dark border-gray-800 hover:border-barber-gold/50'}">
                <div>
                    <div class="flex items-start justify-between gap-2">
                        <h4 class="font-bold text-sm sm:text-base ${isChecked ? 'text-barber-gold' : 'text-white'}">${srv.name}</h4>
                        ${isChecked
                            ? `<span class="px-2 py-0.5 rounded-full bg-barber-gold text-barber-black font-extrabold text-xs shrink-0 shadow">x${qty}</span>`
                            : `<span class="w-6 h-6 rounded-full flex items-center justify-center border border-gray-600 text-gray-500 shrink-0">
                                <i class="fa-solid fa-plus text-xs"></i>
                               </span>`}
                    </div>
                    <p class="text-xs text-gray-400 mt-1">${srv.desc || 'Dịch vụ tiêu chuẩn NQ Barber'}</p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between gap-2">
                    <div>
                        <span class="font-display text-lg font-bold text-barber-gold">${formatVND(srv.price)}</span>
                        ${isChecked ? `<span class="block text-[10px] text-emerald-400 font-semibold">Thành tiền: ${formatVND(lineTotal)}</span>` : ''}
                    </div>
                    <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                        ${isChecked ? `
                            <div class="inline-flex items-center bg-barber-black border border-barber-gold/60 rounded-lg overflow-hidden">
                                <button type="button" onclick="changeGuestServiceQty('${srv.id}', -1)"
                                    class="w-7 h-7 flex items-center justify-center text-gray-300 hover:bg-barber-red hover:text-white font-bold text-xs transition" title="Giảm số lượng">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <span class="px-2.5 text-xs font-extrabold text-barber-gold">${qty}</span>
                                <button type="button" onclick="changeGuestServiceQty('${srv.id}', 1)"
                                    class="w-7 h-7 flex items-center justify-center text-gray-300 hover:bg-barber-gold hover:text-barber-black font-bold text-xs transition" title="Tăng số lượng">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        ` : `
                            <button type="button" onclick="incrementGuestServiceQty('${srv.id}')"
                                class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-barber-gold hover:text-barber-black text-[11px] font-bold text-gray-300 transition">
                                + Chọn
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateGuestBookingSummary();
}

function incrementGuestServiceQty(id) {
    guestSelectedServices[id] = (Number(guestSelectedServices[id]) || 0) + 1;
    renderGuestPortal();
}

function changeGuestServiceQty(id, delta) {
    const nextQty = (Number(guestSelectedServices[id]) || 0) + delta;
    if (nextQty <= 0) {
        delete guestSelectedServices[id];
    } else {
        guestSelectedServices[id] = nextQty;
    }
    renderGuestPortal();
}

function getGuestSelectedItems() {
    const items = [];
    for (const srv of appData.services) {
        const qty = Number(guestSelectedServices[srv.id]) || 0;
        if (qty > 0) {
            items.push({
                id: srv.id,
                name: srv.name,
                price: Number(srv.price) || 0,
                qty: qty,
                subtotal: (Number(srv.price) || 0) * qty
            });
        }
    }
    return items;
}

function changeGuestCount(delta) {
    const el = document.getElementById('book-guest-count');
    if (!el) return;
    const next = Math.max(1, Math.min(50, (Number(el.value) || 1) + delta));
    el.value = next;
    updateGuestBookingSummary();
}

function updateGuestBookingSummary() {
    const selectedItems = getGuestSelectedItems();
    const total = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const guestCount = Math.max(1, Number(document.getElementById('book-guest-count')?.value) || 1);

    const totalEl = document.getElementById('book-estimated-total');
    const formulaEl = document.getElementById('book-price-formula');
    const noteEl = document.getElementById('book-service-note');

    if (totalEl) totalEl.textContent = formatVND(total);
    if (formulaEl) {
        formulaEl.textContent = selectedItems.length > 0
            ? `${selectedItems.map(i => `${i.name} x${i.qty}`).join(' + ')} • ${guestCount} khách`
            : `Chưa chọn dịch vụ • ${guestCount} khách`;
    }
    if (noteEl && selectedItems.length > 0) {
        const names = selectedItems.map(s => `${s.name} x${s.qty} (${formatVND(s.subtotal)})`).join(', ');
        noteEl.value = `${names} | SL khách: ${guestCount}`;
    } else if (noteEl && selectedItems.length === 0) {
        noteEl.value = '';
    }
}

document.getElementById('guest-booking-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('book-name').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const dateVal = document.getElementById('book-date').value;
    const timeVal = document.getElementById('book-time').value;
    const barber = document.getElementById('book-barber').value;
    const guestCount = Math.max(1, Number(document.getElementById('book-guest-count')?.value) || 1);

    const selectedItems = getGuestSelectedItems();
    const estimatedTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalServiceQty = selectedItems.reduce((sum, item) => sum + item.qty, 0) || 1;

    const defaultServiceDesc = selectedItems.length > 0
        ? selectedItems.map(s => `${s.name} x${s.qty}`).join(', ')
        : 'Cắt tóc tư vấn tại tiệm';
    const note = document.getElementById('book-service-note').value.trim() || defaultServiceDesc;

    const newBooking = {
        id: 'bk-' + Date.now(),
        customerName: name,
        phone: phone,
        date: dateVal,
        time: timeVal,
        barber: barber,
        guestCount: guestCount,
        serviceQty: totalServiceQty,
        servicesText: note,
        selectedItems: selectedItems,
        serviceIds: selectedItems.map(s => s.id),
        estimatedTotal: estimatedTotal,
        status: 'pending',
        createdAt: getCurrentTimestamp()
    };

    appData.bookings.unshift(newBooking);
    saveData();

    guestSelectedServices = {};
    document.getElementById('guest-booking-form').reset();
    document.getElementById('book-date').value = getTodayInputDate();
    if (document.getElementById('book-guest-count')) document.getElementById('book-guest-count').value = 1;
    renderGuestPortal();
    showToast(`Đặt lịch thành công (${guestCount} khách, ${totalServiceQty} DV)! Ước tính ${formatVND(estimatedTotal)}.`, 'success');
});

// ==========================================
// AUTHENTICATION & ROLE MANAGEMENT
// ==========================================
document.getElementById('login-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim().toLowerCase();
    const p = document.getElementById('login-password').value.trim();

    await pullDataFromFirebase(false);
    handleLogin(u, p);
});

function handleLogin(username, password) {
    const account = (appData.users || []).find(
        acc => acc.username.toLowerCase() === username && acc.password === password
    );
    if (account) {
        currentUser = account;
        saveSession(account);
        document.getElementById('login-form').reset();
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('guest-portal').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        applyRoleUI();
        renderAll();
        showToast(`Chào mừng ${account.displayName} đến với NQ BARBER!`, 'success');
    } else {
        showToast('Sai tên đăng nhập hoặc mật khẩu! Vui lòng kiểm tra lại.', 'error');
    }
}

function logout() {
    currentUser = null;
    clearSession();
    selectedServices = {};
    revealedPasswords = {};
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    showToast('Đã đăng xuất khỏi hệ thống.', 'info');
}

function applyRoleUI() {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const badge = document.getElementById('user-role-badge');

    if (isAdmin) {
        badge.innerHTML = `<i class="fa-solid fa-crown text-barber-gold"></i> <span class="font-bold text-barber-gold">${currentUser.displayName}</span>`;
        document.getElementById('btn-admin-accounts').classList.remove('hidden');
        document.getElementById('btn-admin-settings').classList.remove('hidden');
        document.getElementById('admin-finance-controls').classList.remove('hidden');
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    } else {
        badge.innerHTML = `<i class="fa-solid fa-user-tie text-emerald-400"></i> <span class="font-bold text-white">${currentUser ? currentUser.displayName : 'NHÂN VIÊN'}</span>`;
        document.getElementById('btn-admin-accounts').classList.add('hidden');
        document.getElementById('btn-admin-settings').classList.add('hidden');
        document.getElementById('admin-finance-controls').classList.add('hidden');
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
    }
}

// ==========================================
// BOOKINGS MANAGER (STAFF / ADMIN VIEW)
// ==========================================
function updateBookingBadge() {
    const badge = document.getElementById('booking-badge-count');
    if (!badge) return;
    const pendingCount = (appData.bookings || []).filter(b => b.status === 'pending').length;
    badge.textContent = pendingCount;
}

function openBookingsModal() {
    renderBookingsModal();
    openModal('modal-bookings');
}

function renderBookingsModal() {
    const container = document.getElementById('bookings-list-container');
    if (!container) return;

    const list = appData.bookings || [];
    if (list.length === 0) {
        container.innerHTML = `
            <div class="py-10 text-center text-gray-500 text-xs">
                <i class="fa-solid fa-calendar-xmark text-2xl mb-2 opacity-40"></i>
                <p>Chưa có lịch hẹn nào từ khách hàng.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(bk => {
        const isDone = bk.status === 'done';
        return `
            <div class="bg-barber-dark/90 rounded-xl p-4 border ${isDone ? 'border-gray-800 opacity-70' : 'border-barber-gold/40'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="font-bold text-white text-sm">${bk.customerName}</span>
                        <a href="tel:${bk.phone}" class="text-xs font-bold text-barber-gold hover:underline">
                            <i class="fa-solid fa-phone mr-1"></i>${bk.phone}
                        </a>
                        ${isDone
                            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">ĐÃ ĐẾN TIỆM</span>'
                            : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-barber-red/20 text-barber-gold">CHỜ ĐÓN KHÁCH</span>'}
                    </div>
                    <p class="text-xs text-gray-300">
                        <i class="fa-solid fa-clock text-barber-gold mr-1"></i>Hẹn lúc: <strong>${bk.time}</strong> ngày <strong>${bk.date}</strong> • Thợ: <span class="text-barber-gold">${bk.barber}</span>
                    </p>
                    <p class="text-xs text-gray-300">
                        <i class="fa-solid fa-users text-emerald-400 mr-1"></i>Số khách: <strong>${bk.guestCount || 1}</strong> • Số lượng DV: <strong>${bk.serviceQty || 1}</strong> • Ước tính: <span class="text-barber-gold font-bold">${formatVND(bk.estimatedTotal || 0)}</span>
                    </p>
                    <p class="text-xs text-gray-400">Dịch vụ: ${bk.servicesText}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    ${!isDone ? `
                        <button type="button" onclick="applyBookingToBill('${bk.id}')" class="px-3 py-2 rounded-lg bg-barber-gold hover:bg-barber-goldHover text-barber-black font-extrabold text-xs transition">
                            Đưa Vào Hóa Đơn
                        </button>
                    ` : ''}
                    <button type="button" onclick="deleteBooking('${bk.id}')" class="p-2 rounded-lg bg-gray-800 hover:bg-barber-red text-gray-300 hover:text-white text-xs transition" title="Xóa lịch hẹn">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function applyBookingToBill(id) {
    const bk = (appData.bookings || []).find(b => b.id === id);
    if (!bk) return;

    bk.status = 'done';
    document.getElementById('bill-customer').value = `${bk.customerName} (${bk.phone})`;

    if (Array.isArray(bk.selectedItems) && bk.selectedItems.length > 0) {
        selectedServices = {};
        bk.selectedItems.forEach(item => {
            if (appData.services.some(s => s.id === item.id)) {
                selectedServices[item.id] = Math.max(1, Number(item.qty) || 1);
            }
        });
    } else if (Array.isArray(bk.serviceIds) && bk.serviceIds.length > 0) {
        const qtyToApply = Math.max(1, Number(bk.serviceQty) || 1);
        selectedServices = {};
        bk.serviceIds.forEach(sid => {
            if (appData.services.some(s => s.id === sid)) {
                selectedServices[sid] = qtyToApply;
            }
        });
    }

    saveData();
    closeModal('modal-bookings');
    renderAll();
    showToast(`Đã chuyển lịch hẹn của ${bk.customerName} vào hóa đơn thanh toán!`, 'success');
}

function deleteBooking(id) {
    appData.bookings = (appData.bookings || []).filter(b => b.id !== id);
    saveData();
    updateBookingBadge();
    renderBookingsModal();
    showToast('Đã xóa lịch hẹn.', 'info');
}

// ==========================================
// ADMIN ACCOUNT & PASSWORD MANAGER
// ==========================================
function openAccountManagerModal() {
    if (!currentUser || currentUser.role !== 'admin') return;
    document.getElementById('add-account-form').reset();
    renderAccountsTable();
    openModal('modal-accounts');
}

function renderAccountsTable() {
    const tbody = document.getElementById('accounts-tbody');
    if (!tbody) return;

    tbody.innerHTML = (appData.users || []).map((u, idx) => {
        const isRevealed = !!revealedPasswords[u.username];
        const isAdminRole = u.role === 'admin';
        return `
            <tr class="hover:bg-barber-dark/70 transition">
                <td class="py-3 px-3.5 font-bold text-white whitespace-nowrap">
                    ${u.username}
                    ${u.isRoot ? '<span class="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-barber-gold/20 text-barber-gold">GỐC</span>' : ''}
                </td>
                <td class="py-3 px-3.5 text-gray-200">${u.displayName}</td>
                <td class="py-3 px-3.5 whitespace-nowrap">
                    ${isAdminRole
                        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-barber-gold/20 text-barber-gold border border-barber-gold/40">ADMIN</span>'
                        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">NHÂN VIÊN</span>'}
                </td>
                <td class="py-3 px-3.5">
                    <div class="flex items-center gap-1.5">
                        <div class="relative flex items-center">
                            <input type="${isRevealed ? 'text' : 'password'}" id="pwd-input-${idx}" value="${u.password}"
                                class="w-28 sm:w-32 px-2.5 py-1.5 pr-7 bg-barber-black border border-gray-700 rounded-lg text-xs text-barber-gold font-bold focus:border-barber-gold focus:outline-none">
                            <button type="button" onclick="toggleRevealPassword('${u.username}')"
                                class="absolute right-2 text-gray-400 hover:text-white text-[11px]" title="Hiện/Ẩn mật khẩu">
                                <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                            </button>
                        </div>
                        <button type="button" onclick="updateMemberPassword(${idx})"
                            class="px-2.5 py-1.5 rounded-lg bg-barber-gold hover:bg-barber-goldHover text-barber-black font-extrabold text-[11px] whitespace-nowrap transition shadow">
                            Đổi MK
                        </button>
                    </div>
                </td>
                <td class="py-3 px-3.5 text-center whitespace-nowrap">
                    ${u.isRoot
                        ? '<span class="text-gray-600 text-[11px]" title="Không thể xóa tài khoản Admin gốc"><i class="fa-solid fa-shield"></i></span>'
                        : `<button type="button" onclick="deleteMemberAccount('${u.username}')" class="p-1.5 rounded-lg bg-gray-800 hover:bg-barber-red text-gray-300 hover:text-white transition" title="Xóa tài khoản này">
                            <i class="fa-solid fa-trash"></i>
                           </button>`}
                </td>
            </tr>
        `;
    }).join('');
}

function toggleRevealPassword(username) {
    revealedPasswords[username] = !revealedPasswords[username];
    renderAccountsTable();
}

function updateMemberPassword(idx) {
    if (!currentUser || currentUser.role !== 'admin') return;
    const inputEl = document.getElementById(`pwd-input-${idx}`);
    if (!inputEl) return;

    const newPwd = inputEl.value.trim();
    if (!newPwd || newPwd.length < 4) {
        showToast('Mật khẩu mới phải có ít nhất 4 ký tự!', 'error');
        return;
    }

    const targetUser = appData.users[idx];
    if (!targetUser) return;

    targetUser.password = newPwd;
    if (currentUser.username === targetUser.username) {
        currentUser.password = newPwd;
        saveSession(currentUser);
    }
    saveData();
    renderAccountsTable();
    showToast(`Đã đổi mật khẩu thành công cho "${targetUser.displayName}" (${targetUser.username})!`, 'success');
}

document.getElementById('add-account-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;

    const username = document.getElementById('new-acc-username').value.trim().toLowerCase().replace(/\s+/g, '');
    const displayName = document.getElementById('new-acc-name').value.trim();
    const password = document.getElementById('new-acc-password').value.trim();
    const role = document.getElementById('new-acc-role').value;

    if (!username || !displayName || password.length < 4) {
        showToast('Vui lòng nhập đầy đủ thông tin và mật khẩu tối thiểu 4 ký tự!', 'error');
        return;
    }

    const exists = (appData.users || []).some(u => u.username.toLowerCase() === username);
    if (exists) {
        showToast(`Tên đăng nhập "${username}" đã tồn tại!`, 'error');
        return;
    }

    appData.users.push({
        username,
        password,
        role,
        displayName,
        isRoot: false
    });

    saveData();
    document.getElementById('add-account-form').reset();
    renderAccountsTable();
    showToast(`Đã tạo tài khoản "${username}" cho ${displayName}!`, 'success');
});

function deleteMemberAccount(username) {
    if (!currentUser || currentUser.role !== 'admin') return;
    const target = (appData.users || []).find(u => u.username === username);
    if (!target || target.isRoot) return;

    if (target.username === currentUser.username) {
        showToast('Không thể tự xóa tài khoản đang đăng nhập!', 'error');
        return;
    }

    appData.users = appData.users.filter(u => u.username !== username);
    saveData();
    renderAccountsTable();
    showToast(`Đã xóa tài khoản "${username}".`, 'info');
}

// ==========================================
// RENDER DASHBOARD (TODAY AUTO-RESET + MONTHLY + ALL-TIME)
// ==========================================
function renderAll() {
    renderShopHeader();
    renderStats();
    renderServices();
    renderCurrentBill();
    renderTransactions();
    renderGallery();
    updateBookingBadge();
}

function renderShopHeader() {
    document.getElementById('header-shop-name').textContent = appData.shopInfo.name;
    document.getElementById('header-shop-tagline').textContent = appData.shopInfo.tagline;
    document.getElementById('display-shop-address').textContent = appData.shopInfo.address;

    const barberSelect = document.getElementById('bill-barber');
    const prevSelected = barberSelect.value;
    barberSelect.innerHTML = appData.shopInfo.barbers
        .map(b => `<option value="${b}">${b}</option>`)
        .join('');
    if (prevSelected && appData.shopInfo.barbers.includes(prevSelected)) {
        barberSelect.value = prevSelected;
    }
}

function formatInputDateToVN(inputVal) {
    if (!inputVal || !inputVal.includes('-')) return getTodayDateStr();
    const [y, m, d] = inputVal.split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
}

function getOffsetInputDate(offsetDays = 0) {
    const dt = new Date();
    dt.setDate(dt.getDate() + offsetDays);
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function selectQuickDay(offsetDays) {
    const dayPicker = document.getElementById('day-picker');
    if (dayPicker) {
        dayPicker.value = getOffsetInputDate(offsetDays);
        const monthPicker = document.getElementById('month-picker');
        if (monthPicker) monthPicker.value = dayPicker.value.slice(0, 7);
    }
    renderStats();
    if (document.getElementById('tx-filter')?.value === 'selected-day') {
        renderTransactions();
    }
}

function onDayPickerChange() {
    const dayPicker = document.getElementById('day-picker');
    if (dayPicker && dayPicker.value) {
        const monthPicker = document.getElementById('month-picker');
        if (monthPicker) monthPicker.value = dayPicker.value.slice(0, 7);
    }
    renderStats();
    if (document.getElementById('tx-filter')?.value === 'selected-day') {
        renderTransactions();
    }
}

function filterTransactionsBySelectedDay() {
    const filterEl = document.getElementById('tx-filter');
    if (filterEl) {
        filterEl.value = 'selected-day';
        renderTransactions();
        document.getElementById('transactions-tbody')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function renderStats() {
    const todayStr = getTodayDateStr();
    const yesterdayStr = formatInputDateToVN(getOffsetInputDate(-1));
    activeDateKey = todayStr;

    const dayPicker = document.getElementById('day-picker');
    if (dayPicker && !dayPicker.value) {
        dayPicker.value = getTodayInputDate();
    }
    const viewingDateStr = dayPicker ? formatInputDateToVN(dayPicker.value) : todayStr;
    const isToday = viewingDateStr === todayStr;
    const isYesterday = viewingDateStr === yesterdayStr;

    const btnToday = document.getElementById('btn-quick-today');
    const btnYesterday = document.getElementById('btn-quick-yesterday');
    if (btnToday && btnYesterday) {
        btnToday.className = isToday
            ? 'px-3 py-1.5 rounded-lg bg-barber-gold text-barber-black font-extrabold text-xs transition'
            : 'px-3 py-1.5 rounded-lg text-gray-300 hover:text-white font-bold text-xs transition';
        btnYesterday.className = isYesterday
            ? 'px-3 py-1.5 rounded-lg bg-barber-gold text-barber-black font-extrabold text-xs transition'
            : 'px-3 py-1.5 rounded-lg text-gray-300 hover:text-white font-bold text-xs transition';
    }

    const dayShortLabel = isToday ? 'Hôm Nay' : (isYesterday ? 'Hôm Qua' : `Ngày ${viewingDateStr}`);
    const badgeEl = document.getElementById('day-mode-badge');
    if (badgeEl) {
        badgeEl.innerHTML = isToday
            ? '<i class="fa-solid fa-rotate mr-1"></i> Hôm Nay (Tự Reset 00:00)'
            : '<i class="fa-solid fa-clock-rotate-left mr-1"></i> Đang Tra Cứu Lịch Sử Ngày';
    }
    const titleEl = document.getElementById('day-board-title');
    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-calendar-day text-barber-gold"></i> Bảng Thu Nhập ${dayShortLabel}`;
    }
    const todayLabelEl = document.getElementById('today-date-label');
    if (todayLabelEl) todayLabelEl.textContent = `Ngày đang xem: ${viewingDateStr}`;

    document.getElementById('today-rev-label').textContent = `Doanh Thu ${dayShortLabel}`;
    document.getElementById('today-exp-label').textContent = `Chi Tiêu ${dayShortLabel}`;
    document.getElementById('today-profit-label').textContent = `Thực Nhận ${dayShortLabel} (Thu - Chi)`;

    const monthPicker = document.getElementById('month-picker');
    if (monthPicker && !monthPicker.value) {
        monthPicker.value = getCurrentMonthValue();
    }
    const selectedMonth = monthPicker ? monthPicker.value : getCurrentMonthValue();

    let monthDisplay = selectedMonth;
    if (selectedMonth && selectedMonth.includes('-')) {
        const [y, m] = selectedMonth.split('-');
        monthDisplay = `Tháng ${m}/${y}`;
    }

    document.getElementById('month-rev-label').textContent = `Doanh Thu ${monthDisplay}`;
    document.getElementById('month-exp-label').textContent = `Chi Tiêu ${monthDisplay}`;
    document.getElementById('month-profit-label').textContent = `Lợi Nhuận ${monthDisplay}`;

    let dayRev = 0, dayExp = 0, dayBills = 0, dayExps = 0;
    let monthRev = 0, monthExp = 0, monthBills = 0, monthExps = 0;
    let totalRev = 0, totalExp = 0;

    appData.transactions.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        const { dateStr, monthKey } = parseTxDateInfo(tx.date);

        if (tx.type === 'income') {
            totalRev += amt;
            if (dateStr === viewingDateStr) {
                dayRev += amt;
                dayBills++;
            }
            if (monthKey === selectedMonth) {
                monthRev += amt;
                monthBills++;
            }
        } else {
            totalExp += amt;
            if (dateStr === viewingDateStr) {
                dayExp += amt;
                dayExps++;
            }
            if (monthKey === selectedMonth) {
                monthExp += amt;
                monthExps++;
            }
        }
    });

    document.getElementById('today-revenue').textContent = formatVND(dayRev);
    document.getElementById('today-expense').textContent = formatVND(dayExp);
    document.getElementById('today-profit').textContent = formatVND(dayRev - dayExp);
    document.getElementById('today-bill-count').textContent = `${dayBills} hóa đơn ngày ${viewingDateStr}`;
    document.getElementById('today-expense-count').textContent = `${dayExps} khoản chi ngày ${viewingDateStr}`;

    const monthProfit = monthRev - monthExp;
    const monthMargin = monthRev > 0 ? Math.round((monthProfit / monthRev) * 100) : 0;
    document.getElementById('month-revenue').textContent = formatVND(monthRev);
    document.getElementById('month-expense').textContent = formatVND(monthExp);
    document.getElementById('month-profit').textContent = formatVND(monthProfit);
    document.getElementById('month-bill-count').innerHTML = `<i class="fa-solid fa-receipt mr-1"></i>${monthBills} hóa đơn trong tháng`;
    document.getElementById('month-expense-count').innerHTML = `<i class="fa-solid fa-box-open mr-1"></i>${monthExps} khoản chi`;
    document.getElementById('month-margin').textContent = `Tỷ suất lợi nhuận: ${monthMargin}%`;

    document.getElementById('stat-revenue').textContent = formatVND(totalRev);
    document.getElementById('stat-expense').textContent = formatVND(totalExp);
    document.getElementById('stat-profit').textContent = formatVND(totalRev - totalExp);
}

function clearServiceSearch() {
    const input = document.getElementById('service-search');
    if (input) {
        input.value = '';
        input.focus();
    }
    renderServices();
}

function renderServices() {
    const grid = document.getElementById('services-grid');
    const isAdmin = currentUser && currentUser.role === 'admin';
    const searchInput = document.getElementById('service-search');
    const clearBtn = document.getElementById('btn-clear-service-search');
    const countEl = document.getElementById('service-search-count');

    const rawKeyword = searchInput ? searchInput.value.trim() : '';
    const keyword = rawKeyword.toLowerCase();
    const keywordClean = removeAccents(keyword);

    if (clearBtn) {
        if (rawKeyword.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    const filteredServices = appData.services.filter(srv => {
        if (!keyword) return true;
        const nameLower = (srv.name || '').toLowerCase();
        const descLower = (srv.desc || '').toLowerCase();
        const priceStr = String(srv.price || '');
        const priceFormatted = formatVND(srv.price).toLowerCase();
        const numericKeyword = keyword.replace(/[.,\s₫đ]/g, '');

        return (
            nameLower.includes(keyword) ||
            removeAccents(nameLower).includes(keywordClean) ||
            descLower.includes(keyword) ||
            removeAccents(descLower).includes(keywordClean) ||
            (numericKeyword && priceStr.includes(numericKeyword)) ||
            priceFormatted.includes(keyword)
        );
    });

    if (countEl) {
        countEl.innerHTML = `Hiển thị: <strong class="text-barber-gold">${filteredServices.length}</strong>/${appData.services.length} dịch vụ`;
    }

    if (filteredServices.length === 0) {
        grid.innerHTML = `
            <div class="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-10 px-4 text-center bg-barber-dark/70 rounded-xl border border-dashed border-gray-700">
                <i class="fa-solid fa-magnifying-glass text-2xl text-gray-500 mb-2"></i>
                <p class="text-sm font-semibold text-gray-300">Không tìm thấy dịch vụ nào khớp với "${rawKeyword}"</p>
                <p class="text-xs text-gray-500 mt-1">Thử tìm bằng từ khóa ngắn hơn (VD: cắt, uốn, nhuộm, gội, ráy tai...)</p>
                <button type="button" onclick="clearServiceSearch()" class="mt-3 px-4 py-1.5 rounded-lg bg-barber-gold text-barber-black text-xs font-extrabold hover:bg-barber-goldHover transition">
                    Xem tất cả dịch vụ
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredServices.map(srv => {
        const qty = Number(selectedServices[srv.id]) || 0;
        const isSelected = qty > 0;
        return `
            <div onclick="incrementServiceQty('${srv.id}')"
                class="cursor-pointer rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between relative group select-none
                ${isSelected
                    ? 'bg-barber-gold/15 border-barber-gold shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                    : 'bg-barber-dark border-gray-800 hover:border-barber-gold/50'}">
                <div>
                    <div class="flex items-start justify-between gap-2">
                        <h3 class="font-bold text-sm sm:text-base ${isSelected ? 'text-barber-gold' : 'text-white'}">${srv.name}</h3>
                        ${isSelected
                            ? `<span class="px-2 py-0.5 rounded-full bg-barber-gold text-barber-black font-extrabold text-xs shrink-0 shadow">x${qty}</span>`
                            : `<div class="w-5 h-5 rounded-md flex items-center justify-center border border-gray-600 text-gray-500 shrink-0 group-hover:border-barber-gold group-hover:text-barber-gold transition">
                                <i class="fa-solid fa-plus text-[10px]"></i>
                               </div>`}
                    </div>
                    <p class="text-xs text-gray-400 mt-1 line-clamp-2">${srv.desc || 'Dịch vụ tiêu chuẩn NQ Barber'}</p>
                </div>

                <div class="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between gap-2">
                    <span class="font-display text-lg font-bold text-barber-gold">${formatVND(srv.price)}</span>
                    <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                        ${isSelected ? `
                            <div class="inline-flex items-center bg-barber-black border border-barber-gold/50 rounded-lg overflow-hidden">
                                <button type="button" onclick="changeServiceQty('${srv.id}', -1)"
                                    class="w-7 h-7 flex items-center justify-center text-gray-300 hover:bg-barber-red hover:text-white font-bold text-xs transition" title="Giảm số lượng">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <span class="px-2.5 text-xs font-extrabold text-barber-gold">${qty}</span>
                                <button type="button" onclick="changeServiceQty('${srv.id}', 1)"
                                    class="w-7 h-7 flex items-center justify-center text-gray-300 hover:bg-barber-gold hover:text-barber-black font-bold text-xs transition" title="Tăng số lượng">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        ` : `
                            <button type="button" onclick="incrementServiceQty('${srv.id}')"
                                class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-barber-gold hover:text-barber-black text-[11px] font-bold text-gray-300 transition">
                                + Chọn
                            </button>
                        `}
                        ${isAdmin ? `
                            <button type="button" onclick="openServiceModal('${srv.id}')" class="p-1.5 rounded-lg bg-gray-800 hover:bg-barber-gold hover:text-barber-black text-gray-300 text-xs transition" title="Sửa dịch vụ">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" onclick="deleteService('${srv.id}')" class="p-1.5 rounded-lg bg-gray-800 hover:bg-barber-red text-gray-300 hover:text-white text-xs transition" title="Xóa dịch vụ">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function incrementServiceQty(id) {
    selectedServices[id] = (Number(selectedServices[id]) || 0) + 1;
    renderServices();
    renderCurrentBill();
}

function changeServiceQty(id, delta) {
    const nextQty = (Number(selectedServices[id]) || 0) + delta;
    if (nextQty <= 0) {
        delete selectedServices[id];
    } else {
        selectedServices[id] = nextQty;
    }
    renderServices();
    renderCurrentBill();
}

function removeServiceFromBill(id) {
    delete selectedServices[id];
    renderServices();
    renderCurrentBill();
}

function clearCurrentBill() {
    selectedServices = {};
    document.getElementById('bill-customer').value = '';
    renderServices();
    renderCurrentBill();
}

function renderCurrentBill() {
    const listEl = document.getElementById('selected-services-list');
    const selectedItems = getSelectedServiceItems();
    const totalQty = selectedItems.reduce((sum, s) => sum + s.qty, 0);
    const totalAmount = selectedItems.reduce((sum, s) => sum + s.subtotal, 0);

    document.getElementById('selected-count').textContent = totalQty;
    document.getElementById('bill-total-amount').textContent = formatVND(totalAmount);

    if (selectedItems.length === 0) {
        listEl.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-500 py-8 text-center">
                <i class="fa-solid fa-scissors text-2xl mb-2 opacity-40"></i>
                <p class="text-xs">Chưa chọn dịch vụ nào.<br>Vui lòng chọn dịch vụ &amp; số lượng ở bảng bên trái.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = selectedItems.map(item => `
        <div class="flex items-center justify-between gap-2 bg-barber-card px-3 py-2.5 rounded-lg border border-gray-800">
            <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-white truncate">${item.name}</p>
                <p class="text-[11px] text-gray-400">
                    ${formatVND(item.price)} x <span class="text-barber-gold font-bold">${item.qty}</span> =
                    <span class="text-barber-gold font-extrabold">${formatVND(item.subtotal)}</span>
                </p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button type="button" onclick="changeServiceQty('${item.id}', -1)"
                    class="w-6 h-6 rounded bg-barber-dark border border-gray-700 hover:border-barber-red hover:text-barber-red text-gray-300 text-[10px] flex items-center justify-center transition" title="Giảm 1">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <span class="w-6 text-center text-xs font-extrabold text-white">${item.qty}</span>
                <button type="button" onclick="changeServiceQty('${item.id}', 1)"
                    class="w-6 h-6 rounded bg-barber-dark border border-gray-700 hover:border-barber-gold hover:text-barber-gold text-gray-300 text-[10px] flex items-center justify-center transition" title="Tăng 1">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <button type="button" onclick="removeServiceFromBill('${item.id}')"
                    class="ml-1 text-gray-500 hover:text-barber-red p-1 transition" title="Xóa dịch vụ này">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// VIETQR CHECKOUT & TRANSFER SUCCESS MODAL
// ==========================================
function openQRCheckoutModal() {
    const selectedItems = getSelectedServiceItems();
    if (selectedItems.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 dịch vụ khách đã làm!', 'error');
        return;
    }

    const customer = document.getElementById('bill-customer').value.trim() || 'Khách lẻ';
    const barber = document.getElementById('bill-barber').value;
    const total = selectedItems.reduce((sum, s) => sum + s.subtotal, 0);

    document.getElementById('qr-customer-info').textContent = `Khách: ${customer} • Thợ thực hiện: ${barber}`;
    document.getElementById('qr-total-display').textContent = formatVND(total);

    const bankId = appData.shopInfo.bankId || 'MB';
    const bankAcc = appData.shopInfo.bankAcc || '0971886269';
    const holder = (appData.shopInfo.accountHolder || 'NGUYEN MINH QUAN').toUpperCase();
    const bankDisplay = BANK_NAMES[bankId] || bankId;

    document.getElementById('qr-bank-info').textContent = `${bankDisplay} • STK: ${bankAcc}`;
    document.getElementById('qr-holder-info').textContent = holder;

    const serviceNamesClean = removeAccents(selectedItems.map(s => `${s.name} x${s.qty}`).join(', '));
    const rawInfo = `NQ BARBER ${removeAccents(customer)} - ${serviceNamesClean}`.slice(0, 50);
    document.getElementById('qr-note-display').textContent = `ND: ${rawInfo}`;

    document.getElementById('qr-services-summary').innerHTML = selectedItems.map((s, idx) => `
        <div class="flex items-center justify-between text-gray-300">
            <span>${idx + 1}. ${s.name} <strong class="text-white">(x${s.qty})</strong></span>
            <span class="font-semibold text-barber-gold">${formatVND(s.subtotal)}</span>
        </div>
    `).join('');

    const vietQrUrl = `https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(bankAcc)}-compact2.png?amount=${total}&addInfo=${encodeURIComponent(rawInfo)}&accountName=${encodeURIComponent(holder)}`;

    const imgEl = document.getElementById('vietqr-img');
    const fallbackEl = document.getElementById('qrcode-fallback');

    imgEl.classList.remove('hidden');
    fallbackEl.classList.add('hidden');
    fallbackEl.innerHTML = '';

    imgEl.onerror = function() {
        imgEl.classList.add('hidden');
        fallbackEl.classList.remove('hidden');
        try {
            new QRCode(fallbackEl, {
                text: `VIETQR|${bankId}|${bankAcc}|${total}|${rawInfo}`,
                width: 210,
                height: 210,
                colorDark: '#0A0A0A',
                colorLight: '#FFFFFF',
                correctLevel: QRCode.CorrectLevel.L
            });
        } catch (err) {
            console.error(err);
        }
    };

    imgEl.src = vietQrUrl;
    openModal('modal-qr');
}

function confirmBillPayment() {
    const selectedItems = getSelectedServiceItems();
    if (selectedItems.length === 0) return;

    const customer = document.getElementById('bill-customer').value.trim() || 'Khách lẻ';
    const barber = document.getElementById('bill-barber').value;
    const total = selectedItems.reduce((sum, s) => sum + s.subtotal, 0);
    const serviceTitles = selectedItems.map(s => `${s.name} x${s.qty}`).join(', ');
    const txId = 'tx-' + Date.now();
    const txTime = getCurrentTimestamp();

    const newTx = {
        id: txId,
        type: 'income',
        title: serviceTitles,
        customer: customer,
        staff: barber,
        amount: total,
        date: txTime
    };

    appData.transactions.unshift(newTx);
    saveData();
    closeModal('modal-qr');

    document.getElementById('success-tx-amount').textContent = formatVND(total);
    document.getElementById('success-tx-id').textContent = '#' + txId.toUpperCase();
    document.getElementById('success-tx-customer').textContent = customer;
    document.getElementById('success-tx-staff').textContent = barber;
    document.getElementById('success-tx-time').textContent = txTime;
    document.getElementById('success-tx-services').textContent = serviceTitles;

    clearCurrentBill();
    renderStats();
    renderTransactions();
    openModal('modal-transfer-success');
    showToast(`Chuyển khoản đã thành công! Đã cộng ${formatVND(total)} vào doanh thu.`, 'success');
}

// ==========================================
// TRANSACTIONS TABLE & EXPENSE FORM
// ==========================================
function renderTransactions() {
    const tbody = document.getElementById('transactions-tbody');
    const search = (document.getElementById('tx-search').value || '').toLowerCase();
    const filter = document.getElementById('tx-filter').value;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const todayStr = getTodayDateStr();

    const filtered = appData.transactions.filter(tx => {
        const { dateStr } = parseTxDateInfo(tx.date);
        const dayPicker = document.getElementById('day-picker');
        const selectedDateStr = dayPicker ? formatInputDateToVN(dayPicker.value) : todayStr;
        let matchType = true;
        if (filter === 'today') {
            matchType = dateStr === todayStr;
        } else if (filter === 'selected-day') {
            matchType = dateStr === selectedDateStr;
        } else if (filter !== 'all') {
            matchType = tx.type === filter;
        }

        const matchSearch =
            tx.title.toLowerCase().includes(search) ||
            (tx.customer || '').toLowerCase().includes(search) ||
            (tx.staff || '').toLowerCase().includes(search);
        return matchType && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-gray-500 text-xs">Không tìm thấy giao dịch phù hợp.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(tx => {
        const isIncome = tx.type === 'income';
        return `
            <tr class="hover:bg-barber-dark/70 transition">
                <td class="py-3.5 px-4 text-xs text-gray-400 whitespace-nowrap">${tx.date}</td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                    ${isIncome
                        ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">+ THU DỊCH VỤ</span>'
                        : '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-barber-red/15 text-barber-red border border-barber-red/30">- CHI TIÊU</span>'}
                </td>
                <td class="py-3.5 px-4">
                    <p class="font-semibold text-white text-xs sm:text-sm">${tx.title}</p>
                    <p class="text-[11px] text-gray-400">${isIncome ? 'Khách hàng: ' : 'Danh mục: '}${tx.customer || 'N/A'}</p>
                </td>
                <td class="py-3.5 px-4 text-xs text-gray-300 whitespace-nowrap">${tx.staff}</td>
                <td class="py-3.5 px-4 text-right font-display text-base font-bold whitespace-nowrap ${isIncome ? 'text-barber-gold' : 'text-barber-red'}">
                    ${isIncome ? '+' : '-'}${formatVND(tx.amount)}
                </td>
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                    ${isAdmin ? `
                        <div class="inline-flex items-center gap-1.5">
                            <button type="button" onclick="openEditTxModal('${tx.id}')" class="p-1.5 rounded-lg bg-gray-800 hover:bg-barber-gold hover:text-barber-black text-gray-300 text-xs transition" title="Admin sửa số tiền">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" onclick="deleteTransaction('${tx.id}')" class="p-1.5 rounded-lg bg-gray-800 hover:bg-barber-red text-gray-300 hover:text-white text-xs transition" title="Admin xóa giao dịch">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ` : `<span class="text-[11px] text-gray-600"><i class="fa-solid fa-lock"></i></span>`}
                </td>
            </tr>
        `;
    }).join('');
}

function openExpenseModal() {
    document.getElementById('expense-form').reset();
    openModal('modal-expense');
}

document.getElementById('expense-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const category = document.getElementById('exp-category').value;
    const desc = document.getElementById('exp-desc').value.trim();
    const amount = Number(document.getElementById('exp-amount').value);

    appData.transactions.unshift({
        id: 'tx-' + Date.now(),
        type: 'expense',
        title: desc,
        customer: category,
        staff: currentUser ? currentUser.displayName : 'Nhân viên',
        amount: amount,
        date: getCurrentTimestamp()
    });

    saveData();
    closeModal('modal-expense');
    renderStats();
    renderTransactions();
    showToast(`Đã ghi nhận khoản chi ${formatVND(amount)}!`, 'info');
});

// ==========================================
// ADMIN CONTROLS
// ==========================================
function openServiceModal(id = null) {
    if (!currentUser || currentUser.role !== 'admin') return;
    const form = document.getElementById('service-form');
    form.reset();

    if (id) {
        const srv = appData.services.find(s => s.id === id);
        if (!srv) return;
        document.getElementById('modal-service-title').textContent = 'Chỉnh Sửa Dịch Vụ';
        document.getElementById('srv-id').value = srv.id;
        document.getElementById('srv-name').value = srv.name;
        document.getElementById('srv-price').value = srv.price;
        document.getElementById('srv-desc').value = srv.desc || '';
    } else {
        document.getElementById('modal-service-title').textContent = 'Thêm Dịch Vụ Mới';
        document.getElementById('srv-id').value = '';
    }
    openModal('modal-service');
}

document.getElementById('service-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('srv-id').value;
    const name = document.getElementById('srv-name').value.trim();
    const price = Number(document.getElementById('srv-price').value);
    const desc = document.getElementById('srv-desc').value.trim();

    if (id) {
        const idx = appData.services.findIndex(s => s.id === id);
        if (idx > -1) appData.services[idx] = { id, name, price, desc };
        showToast('Đã cập nhật dịch vụ!', 'success');
    } else {
        appData.services.push({ id: 'srv-' + Date.now(), name, price, desc });
        showToast('Đã thêm dịch vụ mới!', 'success');
    }

    saveData();
    closeModal('modal-service');
    renderServices();
    renderCurrentBill();
});

function deleteService(id) {
    if (!currentUser || currentUser.role !== 'admin') return;
    appData.services = appData.services.filter(s => s.id !== id);
    delete selectedServices[id];
    saveData();
    renderServices();
    renderCurrentBill();
    showToast('Đã xóa dịch vụ khỏi bảng giá.', 'info');
}

function openEditTxModal(id) {
    if (!currentUser || currentUser.role !== 'admin') return;
    const tx = appData.transactions.find(t => t.id === id);
    if (!tx) return;
    document.getElementById('edit-tx-id').value = tx.id;
    document.getElementById('edit-tx-title').value = tx.title;
    document.getElementById('edit-tx-customer').value = tx.customer || '';
    document.getElementById('edit-tx-amount').value = tx.amount;
    openModal('modal-edit-tx');
}

document.getElementById('edit-tx-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-tx-id').value;
    const idx = appData.transactions.findIndex(t => t.id === id);
    if (idx > -1) {
        appData.transactions[idx].title = document.getElementById('edit-tx-title').value.trim();
        appData.transactions[idx].customer = document.getElementById('edit-tx-customer').value.trim();
        appData.transactions[idx].amount = Number(document.getElementById('edit-tx-amount').value);
        saveData();
        renderStats();
        renderTransactions();
        showToast('Admin đã cập nhật số tiền & thông tin giao dịch!', 'success');
    }
    closeModal('modal-edit-tx');
});

function deleteTransaction(id) {
    if (!currentUser || currentUser.role !== 'admin') return;
    appData.transactions = appData.transactions.filter(t => t.id !== id);
    saveData();
    renderStats();
    renderTransactions();
    showToast('Đã xóa giao dịch khỏi lịch sử.', 'info');
}

function openDirectAdjustModal() {
    if (!currentUser || currentUser.role !== 'admin') return;
    let rev = 0;
    let exp = 0;
    appData.transactions.forEach(t => {
        if (t.type === 'income') rev += Number(t.amount) || 0;
        else exp += Number(t.amount) || 0;
    });
    document.getElementById('adj-revenue').value = rev;
    document.getElementById('adj-expense').value = exp;
    openModal('modal-direct-adjust');
}

document.getElementById('direct-adjust-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const targetRev = Number(document.getElementById('adj-revenue').value);
    const targetExp = Number(document.getElementById('adj-expense').value);

    let currentRev = 0;
    let currentExp = 0;
    appData.transactions.forEach(t => {
        if (t.type === 'income') currentRev += Number(t.amount) || 0;
        else currentExp += Number(t.amount) || 0;
    });

    const diffRev = targetRev - currentRev;
    const diffExp = targetExp - currentExp;

    if (diffRev !== 0) {
        appData.transactions.unshift({
            id: 'tx-adj-' + Date.now(),
            type: 'income',
            title: 'Admin điều chỉnh số dư doanh thu trực tiếp',
            customer: 'Điều chỉnh hệ thống',
            staff: 'Admin',
            amount: diffRev,
            date: getCurrentTimestamp()
        });
    }

    if (diffExp !== 0) {
        appData.transactions.unshift({
            id: 'tx-adj-exp-' + (Date.now() + 1),
            type: 'expense',
            title: 'Admin điều chỉnh số dư chi tiêu trực tiếp',
            customer: 'Điều chỉnh hệ thống',
            staff: 'Admin',
            amount: diffExp,
            date: getCurrentTimestamp()
        });
    }

    saveData();
    closeModal('modal-direct-adjust');
    renderStats();
    renderTransactions();
    showToast('Đã cập nhật tổng số tiền quỹ tiệm theo thiết lập của Admin!', 'success');
});

function openShopSettingsModal() {
    if (!currentUser || currentUser.role !== 'admin') return;
    document.getElementById('set-shop-name').value = appData.shopInfo.name;
    document.getElementById('set-shop-tagline').value = appData.shopInfo.tagline;
    document.getElementById('set-shop-address').value = appData.shopInfo.address;
    document.getElementById('set-bank-id').value = appData.shopInfo.bankId || 'MB';
    document.getElementById('set-bank-acc').value = appData.shopInfo.bankAcc || '0971886269';
    document.getElementById('set-bank-holder').value = appData.shopInfo.accountHolder || 'NGUYEN MINH QUAN';
    document.getElementById('set-barbers').value = appData.shopInfo.barbers.join(', ');
    openModal('modal-shop-settings');
}

document.getElementById('shop-settings-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    appData.shopInfo.name = document.getElementById('set-shop-name').value.trim() || 'NQ BARBER';
    appData.shopInfo.tagline = document.getElementById('set-shop-tagline').value.trim();
    appData.shopInfo.address = document.getElementById('set-shop-address').value.trim();
    appData.shopInfo.bankId = document.getElementById('set-bank-id').value;
    appData.shopInfo.bankAcc = document.getElementById('set-bank-acc').value.trim();
    appData.shopInfo.accountHolder = removeAccents(document.getElementById('set-bank-holder').value.trim()).toUpperCase();

    const barberList = document.getElementById('set-barbers').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (barberList.length > 0) appData.shopInfo.barbers = barberList;

    saveData();
    closeModal('modal-shop-settings');
    renderShopHeader();
    showToast('Đã lưu cấu hình tiệm & tài khoản ngân hàng VietQR!', 'success');
});

function resetDemoData() {
    const preservedUsers = JSON.parse(JSON.stringify(appData.users || DEFAULT_DATA.users));
    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    appData.users = preservedUsers;
    saveData();
    closeModal('modal-shop-settings');
    renderAll();
    showToast('Đã khôi phục dữ liệu mẫu mặc định (giữ nguyên danh sách tài khoản)!', 'info');
}

// ==========================================
// GALLERY & LIGHTBOX
// ==========================================
function renderGallery() {
    const grid = document.getElementById('shop-gallery-grid');
    const isAdmin = currentUser && currentUser.role === 'admin';

    grid.innerHTML = appData.gallery.map(img => `
        <div class="relative group rounded-xl overflow-hidden border border-gray-800 aspect-video bg-barber-dark cursor-pointer"
            onclick="openLightbox('${img.url}', '${img.caption.replace(/'/g, "\\'")}')">
            <img src="${img.url}" alt="${img.caption}" loading="lazy"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition"></div>
            <p class="absolute bottom-2 left-2.5 right-2.5 text-[11px] font-medium text-white line-clamp-1">${img.caption}</p>
            ${isAdmin ? `
                <button type="button" onclick="event.stopPropagation(); deleteGalleryPhoto('${img.id}')"
                    class="absolute top-2 right-2 w-7 h-7 rounded-full bg-barber-red/90 hover:bg-barber-red text-white text-xs flex items-center justify-center shadow-lg transition"
                    title="Xóa ảnh">
                    <i class="fa-solid fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `).join('');
}

function openAddPhotoModal() {
    document.getElementById('add-photo-form').reset();
    openModal('modal-add-photo');
}

document.getElementById('add-photo-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const caption = document.getElementById('photo-caption').value.trim();
    const url = document.getElementById('photo-url').value.trim();
    appData.gallery.unshift({ id: 'img-' + Date.now(), caption, url });
    saveData();
    closeModal('modal-add-photo');
    renderGallery();
    showToast('Đã thêm ảnh mới vào bộ sưu tập tiệm!', 'success');
});

function deleteGalleryPhoto(id) {
    appData.gallery = appData.gallery.filter(g => g.id !== id);
    saveData();
    renderGallery();
    showToast('Đã xóa ảnh khỏi bộ sưu tập.', 'info');
}

function openLightbox(url, caption) {
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox-caption').textContent = caption;
    openModal('modal-lightbox');
}

// ==========================================
// INITIALIZE SESSION, MIDNIGHT AUTO-RESET & REAL-TIME SYNC
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const dayPicker = document.getElementById('day-picker');
    if (dayPicker) dayPicker.value = getTodayInputDate();
    const monthPicker = document.getElementById('month-picker');
    if (monthPicker) monthPicker.value = getCurrentMonthValue();

    const params = new URLSearchParams(window.location.search);
    if (params.get('guest') === '1') {
        openGuestPortal();
    } else {
        restoreSessionOnLoad();
    }

    pullDataFromFirebase(true);

    setInterval(() => {
        pullDataFromFirebase(false);
    }, 5000);

    // Tự động kiểm tra qua ngày mới mỗi 30 giây để reset bảng thu nhập hôm nay về 0 ₫
    setInterval(() => {
        const nowDateStr = getTodayDateStr();
        if (nowDateStr !== activeDateKey) {
            activeDateKey = nowDateStr;
            const dp = document.getElementById('day-picker');
            if (dp) dp.value = getTodayInputDate();
            const mp = document.getElementById('month-picker');
            if (mp) mp.value = getCurrentMonthValue();
            if (currentUser) {
                renderStats();
                renderTransactions();
                showToast(`Đã bước sang ngày mới (${nowDateStr}). Bảng thu nhập hôm nay đã tự làm mới!`, 'info');
            }
        }
    }, 30000);
});

window.addEventListener('focus', () => {
    pullDataFromFirebase(false);
    if (currentUser) renderStats();
});

// Đảm bảo mọi hàm onclick hoạt động ổn định trên mọi trình duyệt
window.normalizeAppData = normalizeAppData;
window.loadData = loadData;
window.getTodayDateStr = getTodayDateStr;
window.getTodayInputDate = getTodayInputDate;
window.getCurrentMonthValue = getCurrentMonthValue;
window.parseTxDateInfo = parseTxDateInfo;
window.updateSyncBadge = updateSyncBadge;
window.pushDataToFirebase = pushDataToFirebase;
window.pullDataFromFirebase = pullDataFromFirebase;
window.saveData = saveData;
window.saveSession = saveSession;
window.clearSession = clearSession;
window.restoreSessionOnLoad = restoreSessionOnLoad;
window.formatVND = formatVND;
window.getCurrentTimestamp = getCurrentTimestamp;
window.removeAccents = removeAccents;
window.getSelectedServiceItems = getSelectedServiceItems;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleLoginPasswordVisibility = toggleLoginPasswordVisibility;
window.openGuestPortal = openGuestPortal;
window.closeGuestPortal = closeGuestPortal;
window.copyGuestLink = copyGuestLink;
window.renderGuestPortal = renderGuestPortal;
window.toggleGuestService = toggleGuestService;
window.updateGuestBookingSummary = updateGuestBookingSummary;
window.handleLogin = handleLogin;
window.logout = logout;
window.applyRoleUI = applyRoleUI;
window.updateBookingBadge = updateBookingBadge;
window.openBookingsModal = openBookingsModal;
window.renderBookingsModal = renderBookingsModal;
window.applyBookingToBill = applyBookingToBill;
window.deleteBooking = deleteBooking;
window.openAccountManagerModal = openAccountManagerModal;
window.renderAccountsTable = renderAccountsTable;
window.toggleRevealPassword = toggleRevealPassword;
window.updateMemberPassword = updateMemberPassword;
window.deleteMemberAccount = deleteMemberAccount;
window.renderAll = renderAll;
window.renderShopHeader = renderShopHeader;
window.renderStats = renderStats;
window.clearServiceSearch = clearServiceSearch;
window.renderServices = renderServices;
window.incrementServiceQty = incrementServiceQty;
window.changeServiceQty = changeServiceQty;
window.removeServiceFromBill = removeServiceFromBill;
window.clearCurrentBill = clearCurrentBill;
window.renderCurrentBill = renderCurrentBill;
window.openQRCheckoutModal = openQRCheckoutModal;
window.confirmBillPayment = confirmBillPayment;
window.renderTransactions = renderTransactions;
window.openExpenseModal = openExpenseModal;
window.openServiceModal = openServiceModal;
window.deleteService = deleteService;
window.openEditTxModal = openEditTxModal;
window.deleteTransaction = deleteTransaction;
window.openDirectAdjustModal = openDirectAdjustModal;
window.openShopSettingsModal = openShopSettingsModal;
window.resetDemoData = resetDemoData;
window.renderGallery = renderGallery;
window.openAddPhotoModal = openAddPhotoModal;
window.deleteGalleryPhoto = deleteGalleryPhoto;
window.openLightbox = openLightbox;
window.formatInputDateToVN = formatInputDateToVN;
window.getOffsetInputDate = getOffsetInputDate;
window.selectQuickDay = selectQuickDay;
window.onDayPickerChange = onDayPickerChange;
window.filterTransactionsBySelectedDay = filterTransactionsBySelectedDay;

window.changeGuestCount = changeGuestCount;
window.incrementGuestServiceQty = incrementGuestServiceQty;
window.changeGuestServiceQty = changeGuestServiceQty;
window.getGuestSelectedItems = getGuestSelectedItems;
