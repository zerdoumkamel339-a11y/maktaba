let vendorOrders = [];

const vendorOrdersList = document.getElementById('vendorOrdersList');
const pendingCountEl = document.getElementById('pendingCount');

async function checkAuth() {
    const { data: { session }, error } = await sb.auth.getSession();
    if (!session || error) {
        window.location.href = 'login.html';
        return;
    }

    const { data: profile } = await sb.from('profiles').select('role, store_id').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'bookstore') {
        alert('هذه الصفحة مخصصة للمكتبات فقط!');
        window.location.href = 'home.html';
        return;
    }

    // Set UI info
    const storeIdDisplay = document.querySelector('.lib-id-badge');
    if (storeIdDisplay) storeIdDisplay.innerText = profile.store_id;

    initLibrary();
}

async function initLibrary() {
    await loadOrdersFromSupabase();
    renderOrders();
}

async function loadOrdersFromSupabase() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    // Filter by seller_id (the library's user id)
    const { data, error } = await sb.from('orders')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });

    if (!error && data) {
        vendorOrders = data.map(o => {
            const items = Array.isArray(o.items) ? o.items : [];
            const titles = items.map(item => item.title).join(', ') || 'كتاب مجهول';

            return {
                id: o.id,
                time: new Date(o.created_at).toLocaleString('ar-DZ'),
                customer: o.phone,
                wilaya: o.state,
                baladiya: o.municipality,
                phone: o.phone,
                deliveryCorp: o.delivery_corp || null,
                bookTitle: titles,
                price: o.total_price,
                qty: items.length || 1,
                status: o.status || 'pending'
            };
        });
    }
}

function renderOrders() {
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
                    <div style="color: var(--secondary); font-weight: bold; flex: 1; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-check-circle"></i> تم القبول
                    </div>
                    <button class="btn-accept" style="background:#475569; padding: 8px 16px;" onclick="printOrder('${order.id}')">
                        <i class="fas fa-print"></i> طباعة الوصل
                    </button>
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
                        <h4>الكتاب: ${order.bookTitle} (x${order.qty})</h4>
                        <p style="color: var(--text-secondary); margin-top:4px;">
                            <i class="fas fa-truck"></i> توصيل عبر: <strong>${order.deliveryCorp || 'غير محدد'}</strong>
                        </p>
                    </div>
                    <div style="color: var(--primary); font-weight: bold; font-size: 1.2rem;">
                        ${order.price * order.qty} د.ج
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.9rem; border: 1px bordered var(--border);">
                    <div style="margin-bottom: 4px;"><i class="fas fa-map-marker-alt" style="color:var(--accent); width:20px;"></i> <strong>العنوان:</strong> ${order.baladiya}، ${order.wilaya}</div>
                    <div><i class="fas fa-phone-alt" style="color:var(--secondary); width:20px;"></i> <strong>رقم الهاتف:</strong> <span dir="ltr">${order.phone}</span></div>
                </div>
            </div>

            ${actionsHtml}
        `;
        vendorOrdersList.appendChild(div);
    });

    pendingCountEl.textContent = pendingCount;
    if (vendorOrders.length === 0) {
        vendorOrdersList.innerHTML = '<p style="text-align:center; color: var(--text-secondary); margin-top: 20px;">لا توجد طلبات قيد الانتظار حالياً.</p>';
    }
}

window.acceptOrder = async function (orderId) {
    const order = vendorOrders.find(o => o.id === orderId);
    if (order) {
        const selectEl = document.getElementById(`delivery-select-${orderId}`);
        const deliveryCorp = selectEl ? selectEl.value : 'Yalidine Express';

        const { error } = await sb.from('orders').update({
            status: 'accepted',
            delivery_corp: deliveryCorp
        }).eq('id', orderId);

        if (!error) {
            order.status = 'accepted';
            order.deliveryCorp = deliveryCorp;
            renderOrders();
        } else {
            alert('خطأ في تحديث الطلب: ' + error.message);
        }
    }
}

window.updateOrderStatus = async function (orderId, newStatus) {
    const order = vendorOrders.find(o => o.id === orderId);
    if (order) {
        const { error } = await sb.from('orders').update({
            status: newStatus
        }).eq('id', orderId);

        if (!error) {
            order.status = newStatus;
            renderOrders();
        } else {
            alert('خطأ في تحديث الحالة: ' + error.message);
        }
    }
}

window.printOrder = function (orderId) {
    // نقوم بتطبيق كلاس مؤقت على الكارد لتلوينه للطباعة، وإخفاء البقية
    const allCards = document.querySelectorAll('.order-card');
    allCards.forEach(card => card.classList.add('hide-for-print'));

    const targetCard = document.getElementById(`order-${orderId}`);
    if (targetCard) {
        targetCard.classList.remove('hide-for-print');
        targetCard.classList.add('printing-now');
        window.print();

        // إرجاع كل شيء لطبيعته بعد الطباعة
        allCards.forEach(card => card.classList.remove('hide-for-print'));
        targetCard.classList.remove('printing-now');
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);

window.logout = async function () {
    const { error } = await sb.auth.signOut();
    localStorage.clear();
    window.location.href = 'login.html';
}
