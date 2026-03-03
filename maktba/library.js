let vendorOrders = [];
let currentPartner = {
    id: sessionStorage.getItem('currentPartnerId') || 'A1B2C3D4',
    role: sessionStorage.getItem('currentPartnerRole') || 'library',
    name: 'مكتبة اقرأ' // Default
};

const vendorOrdersList = document.getElementById('vendorOrdersList');
const pendingCountEl = document.getElementById('pendingCount');

function initLibrary() {
    setupPartnerProfile();
    loadOrdersFromStorage();
    renderOrders();
    checkExpirationLogic(); // 7-day logic for publishers
}

function setupPartnerProfile() {
    const idDisp = document.getElementById('partnerIdDisplay');
    const nameDisp = document.getElementById('partnerNameDisplay');
    const roleBadge = document.getElementById('roleBadgeDisplay');
    const roleIcon = document.getElementById('roleIconSet');

    if (idDisp) idDisp.textContent = currentPartner.id;

    // Simulate getting name from ID
    if (currentPartner.id !== 'A1B2C3D4') {
        currentPartner.name = 'شريك BookDZ الجديد';
    }
    if (nameDisp) nameDisp.textContent = currentPartner.name;

    // Role-specific UI setup
    if (roleBadge) {
        let roleText = 'مكتبة (Enterprise)';
        let iconClass = 'fa-store';
        if (currentPartner.role === 'publisher') {
            roleText = 'دار نشر (Pro)';
            iconClass = 'fa-print';
        } else if (currentPartner.role === 'seller') {
            roleText = 'بائع فردي (Basic)';
            iconClass = 'fa-user';
        }
        roleBadge.textContent = roleText;
        if (roleIcon) roleIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    }
}

function checkExpirationLogic() {
    if (currentPartner.role !== 'publisher') return;

    // Simulated 7-day expiration for publishers
    // In a real app, this would be handled on the server
    const books = JSON.parse(localStorage.getItem('maktbaBooks')) || [];
    const now = new Date().getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    let expiredCount = 0;
    const activeBooks = books.filter(book => {
        if (book.publisherId === currentPartner.id) {
            const uploadedAt = new Date(book.date || now).getTime();
            if (now - uploadedAt > sevenDaysMs) {
                expiredCount++;
                return false;
            }
        }
        return true;
    });

    if (expiredCount > 0) {
        localStorage.setItem('maktbaBooks', JSON.stringify(activeBooks));
        console.log(`${expiredCount} items expired due to 7-day Pro policy.`);
        // alert(`تنبيه: تم أرشفة ${expiredCount} منشورات لتجاوزها مدة 7 أيام (حسب خطة دار النشر).`);
    }
}

function loadOrdersFromStorage() {
    const saved = localStorage.getItem('maktbaOrders');
    if (saved) {
        vendorOrders = JSON.parse(saved);
    } else {
        // Mock data
        vendorOrders = [
            {
                id: 'ORD-998273',
                time: 'منذ 10 دقائق',
                customer: 'محمد وليد',
                wilaya: '16 - الجزائر',
                baladiya: 'الجزائر الوسطى',
                phone: '0555123456',
                deliveryCorp: 'Yalidine Express',
                bookTitle: 'مقدمة في الذكاء الاصطناعي',
                price: '1500',
                qty: 1,
                status: 'pending'
            }
        ];
        saveOrdersToStorage();
    }
}

function saveOrdersToStorage() {
    localStorage.setItem('maktbaOrders', JSON.stringify(vendorOrders));
}

function renderOrders() {
    if (!vendorOrdersList) return;
    vendorOrdersList.innerHTML = '';
    let pendingCount = 0;

    vendorOrders.forEach(order => {
        if (order.status === 'pending') pendingCount++;

        const div = document.createElement('div');
        div.className = 'order-card';
        div.id = `order-${order.id}`;

        let actionsHtml = '';
        if (order.status === 'pending') {
            actionsHtml = `
                <div class="no-print" style="margin-top: 12px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
                    <div style="margin-bottom: 8px; font-weight: bold; font-size: 0.9rem; color: var(--text-primary);">اختر شركة التوصيل للمعالجة:</div>
                    <select id="delivery-select-${order.id}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border); margin-bottom: 12px; font-family: inherit;">
                        <option value="Yalidine Express">Yalidine Express</option>
                        <option value="ZR Express">ZR Express</option>
                        <option value="Maystro Delivery">Maystro Delivery</option>
                        <option value="Ecoline">Ecoline</option>
                        <option value="Nord et Ouest">Nord et Ouest</option>
                    </select>
                    <div class="order-actions">
                        <button class="btn-accept" onclick="acceptOrder('${order.id}')">
                            <i class="fas fa-check"></i> قبول وتأكيد التوصيل
                        </button>
                        <button class="btn-reject" onclick="updateOrderStatus('${order.id}', 'rejected')">
                            <i class="fas fa-times"></i> رفض
                        </button>
                    </div>
                </div>
            `;
        } else if (order.status === 'accepted') {
            actionsHtml = `
                <div class="order-actions no-print" style="margin-top:12px;">
                    <button class="btn-accept" style="background:#475569; padding: 8px 16px;" onclick="printOrder('${order.id}')">
                        <i class="fas fa-print"></i> طباعة الوصل (فاتورة)
                    </button>
                    <div style="color: var(--secondary); font-weight: bold; flex: 1; display:flex; align-items:center; gap:8px; justify-content: flex-end;">
                        <i class="fas fa-check-circle"></i> تم القبول
                    </div>
                </div>`;
        } else {
            actionsHtml = `<div class="no-print" style="color: var(--accent); font-weight: bold; text-align: center; margin-top:12px;"><i class="fas fa-times-circle"></i> تم الرفض</div>`;
        }

        div.innerHTML = `
            <div class="order-header">
                <span class="order-id">#${order.id} | المشتري: ${order.customer}</span>
                <span class="order-time no-print">${order.time}</span>
            </div>
            
            <div class="printable-section">
                <!-- هذا الجزء يظهر بوضوح في الطباعة ويتضمن معلومات التوصيل -->
                <div class="order-book">
                    <div class="no-print" style="width: 40px; height: 40px; background: #e2e8f0; border-radius: 8px; display:flex; justify-content:center; align-items:center;">
                        <i class="fas fa-book" style="color: var(--text-secondary)"></i>
                    </div>
                    <div class="order-book-info" style="flex:1;">
                        <h4>العنصر: ${order.bookTitle} (x${order.qty})</h4>
                        <p style="color: var(--text-secondary); margin-top:4px;">
                            <i class="fas fa-truck"></i> التوصيل: <strong>${order.deliveryCorp || 'Aramex / COD'}</strong>
                        </p>
                    </div>
                    <div style="color: var(--primary); font-weight: bold; font-size: 1.2rem;">
                        ${order.price * order.qty} د.ج
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.9rem; border: 1px bordered var(--border);">
                    <div style="margin-bottom: 4px;"><i class="fas fa-map-marker-alt" style="color:var(--accent); width:20px;"></i> <strong>العنوان:</strong> ${order.baladiya}، ${order.wilaya}</div>
                    <div><i class="fas fa-phone-alt" style="color:var(--secondary); width:20px;"></i> <strong>الهاتف:</strong> <span dir="ltr">${order.phone}</span></div>
                    <div style="margin-top: 8px; border-top: 1px solid #ddd; padding-top: 4px; font-size: 0.75rem; color: #666;">
                        BookDZ SaaS Invoice - الدفع عند الاستلام (COD)
                    </div>
                </div>
            </div>

            ${actionsHtml}
        `;
        vendorOrdersList.appendChild(div);
    });

    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
    if (vendorOrders.length === 0) {
        vendorOrdersList.innerHTML = '<p style="text-align:center; color: var(--text-secondary); margin-top: 20px;">لا توجد طلبات قيد الانتظار حالياً.</p>';
    }
}

window.acceptOrder = function (orderId) {
    const order = vendorOrders.find(o => o.id === orderId);
    if (order) {
        const selectEl = document.getElementById(`delivery-select-${orderId}`);
        if (selectEl) {
            order.deliveryCorp = selectEl.value;
        }
        order.status = 'accepted';
        saveOrdersToStorage();
        renderOrders();
    }
}

window.updateOrderStatus = function (orderId, newStatus) {
    const order = vendorOrders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveOrdersToStorage();
        renderOrders();
    }
}

window.printOrder = function (orderId) {
    const allCards = document.querySelectorAll('.order-card');
    allCards.forEach(card => card.classList.add('hide-for-print'));

    const targetCard = document.getElementById(`order-${orderId}`);
    if (targetCard) {
        targetCard.classList.remove('hide-for-print');
        targetCard.classList.add('printing-now');
        window.print();

        allCards.forEach(card => card.classList.remove('hide-for-print'));
        targetCard.classList.remove('printing-now');
    }
}

window.copyMyId = function () {
    navigator.clipboard.writeText(currentPartner.id).then(() => {
        alert('تم نسخ معرف الشريك: ' + currentPartner.id);
    });
}

document.addEventListener('DOMContentLoaded', initLibrary);

