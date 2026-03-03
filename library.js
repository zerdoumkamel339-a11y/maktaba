// Firestore references
let db;
let vendorOrders = [];
let currentPartner = {
    id: sessionStorage.getItem('currentPartnerId') || 'A1B2C3D4',
    uid: sessionStorage.getItem('currentPartnerUID'),
    role: sessionStorage.getItem('currentPartnerRole') || 'library',
    name: sessionStorage.getItem('currentPartnerName') || 'مكتبة اقرأ'
};

const vendorOrdersList = document.getElementById('vendorOrdersList');
const pendingCountEl = document.getElementById('pendingCount');

async function initLibrary() {
    console.log("Initializing Dashboard with Firestore...");
    db = firebase.firestore();

    setupPartnerProfile();
    startOrdersListener();
    checkExpirationLogic(); // 7-day logic for publishers
}

function setupPartnerProfile() {
    const idDisp = document.getElementById('partnerIdDisplay');
    const nameDisp = document.getElementById('partnerNameDisplay');
    const roleBadge = document.getElementById('roleBadgeDisplay');
    const roleIcon = document.getElementById('roleIconSet');

    if (idDisp) idDisp.textContent = currentPartner.id;

    // In a real app, we would fetch the partner profile from a 'partners' collection
    // For now, we use the session name or default
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

function startOrdersListener() {
    if (!vendorOrdersList) return;

    console.log("Listening for orders for partner:", currentPartner.id);

    // Listen for orders targeted to this partner
    // We filter by targetPartnerId (which is the short 8-char ID)
    db.collection('orders')
        .where('targetPartnerId', '==', currentPartner.id)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            vendorOrders = snapshot.docs.map(doc => ({
                firestoreId: doc.id,
                ...doc.data()
            }));
            renderOrders();
        }, (error) => {
            console.error("Orders Listener Error:", error);
            // If index is missing, fallback to client-side filtering (common during first setup)
            if (error.code === 'failed-precondition') {
                console.warn("Firestore index required. Falling back to non-ordered fetch.");
                db.collection('orders')
                    .where('targetPartnerId', '==', currentPartner.id)
                    .onSnapshot(snapshot => {
                        vendorOrders = snapshot.docs.map(doc => ({
                            firestoreId: doc.id,
                            ...doc.data()
                        }));
                        renderOrders();
                    });
            }
        });
}

function checkExpirationLogic() {

    if (currentPartner.role !== 'publisher') return;

    // This would typically be a scheduled function on the server
    // For now, it's just a placeholder console log
    console.log("Checking SaaS expiration logic (controlled by Platform Policies)");
}

function renderOrders() {
    if (!vendorOrdersList) return;
    vendorOrdersList.innerHTML = '';
    let pendingCount = 0;

    vendorOrders.forEach(order => {
        if (order.status === 'pending') pendingCount++;

        const div = document.createElement('div');
        div.className = 'order-card';
        div.id = `order-${order.firestoreId}`;

        let actionsHtml = '';
        if (order.status === 'pending') {
            actionsHtml = `
                <div class="no-print" style="margin-top: 12px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
                    <div style="margin-bottom: 8px; font-weight: bold; font-size: 0.9rem; color: var(--text-primary);">اختر شركة التوصيل للمعالجة:</div>
                    <select id="delivery-select-${order.firestoreId}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border); margin-bottom: 12px; font-family: inherit;">
                        <option value="Yalidine Express">Yalidine Express</option>
                        <option value="ZR Express">ZR Express</option>
                        <option value="Maystro Delivery">Maystro Delivery</option>
                        <option value="Ecoline">Ecoline</option>
                        <option value="Nord et Ouest">Nord et Ouest</option>
                    </select>
                    <div class="order-actions">
                        <button class="btn-accept" onclick="acceptOrder('${order.firestoreId}')">
                             قُبول وتأكيد التوصيل
                        </button>
                        <button class="btn-reject" onclick="updateOrderStatus('${order.firestoreId}', 'rejected')">
                             رفض
                        </button>
                    </div>
                </div>
            `;
        } else if (order.status === 'accepted') {
            actionsHtml = `
                <div class="order-actions no-print" style="margin-top:12px;">
                    <button class="btn-accept" style="background:#475569; padding: 8px 16px;" onclick="printOrder('${order.firestoreId}')">
                        <i class="fas fa-print"></i> طباعة الوصل (فاتورة)
                    </button>
                    <div style="color: var(--secondary); font-weight: bold; flex: 1; display:flex; align-items:center; gap:8px; justify-content: flex-end;">
                        <i class="fas fa-check-circle"></i> تم القبول (${order.deliveryCorp})
                    </div>
                </div>`;
        } else {
            actionsHtml = `<div class="no-print" style="color: var(--accent); font-weight: bold; text-align: center; margin-top:12px;"><i class="fas fa-times-circle"></i> تم الرفض</div>`;
        }

        div.innerHTML = `
            <div class="order-header">
                <span class="order-id">#${order.id} | المشتري: ${order.customer}</span>
                <span class="order-time no-print">${order.time || 'الآن'}</span>
            </div>
            
            <div class="printable-section">
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

                <div class="data-box" style="border-right-color: var(--secondary);">
                    <div class="data-row">
                        <div class="data-icon accent"><i class="fas fa-map-marker-alt"></i></div>
                        <div class="data-content">
                            <span class="data-label">العنوان الكامل</span>
                            <span class="data-value">${order.baladiya}، ${order.wilaya}</span>
                        </div>
                    </div>
                    <div class="data-row">
                        <div class="data-icon"><i class="fas fa-phone-alt"></i></div>
                        <div class="data-content">
                            <span class="data-label">رقم التواصل</span>
                            <span class="data-value monospace" dir="ltr">${order.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            ${actionsHtml}
        `;
        vendorOrdersList.appendChild(div);
    });

    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
    if (vendorOrders.length === 0) {
        vendorOrdersList.innerHTML = '<p style="text-align:center; color: var(--text-secondary); margin-top: 20px;">لا توجد طلبات واردة حالياً.</p>';
    }
}

window.acceptOrder = async function (firestoreId) {
    const order = vendorOrders.find(o => o.firestoreId === firestoreId);
    if (order) {
        const selectEl = document.getElementById(`delivery-select-${firestoreId}`);
        const deliveryCorp = selectEl ? selectEl.value : 'Yalidine Express';

        try {
            await db.collection('orders').doc(firestoreId).update({
                status: 'accepted',
                deliveryCorp: deliveryCorp
            });
        } catch (error) {
            console.error("Error accepting order:", error);
        }
    }
}

window.updateOrderStatus = async function (firestoreId, newStatus) {
    try {
        await db.collection('orders').doc(firestoreId).update({
            status: newStatus
        });
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

window.printOrder = function (firestoreId) {
    const allCards = document.querySelectorAll('.order-card');
    allCards.forEach(card => card.classList.add('hide-for-print'));

    const targetCard = document.getElementById(`order-${firestoreId}`);
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

// Run app
document.addEventListener('DOMContentLoaded', () => {
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            clearInterval(checkFirebase);
            initLibrary();
        }
    }, 100);
});

