// Firestore references (will be initialized after Firebase scripts load)
let db;

// Mock Data (will be merged with Firestore data)
const defaultCategories = [
    { id: 'all', name: 'الكل', icon: '🌍' },
    { id: 'novels', name: 'روايات', icon: '📖' },
    { id: 'history', name: 'تاريخ', icon: '🏛️' },
    { id: 'religion', name: 'دين', icon: '🕌' },
    { id: 'self_improvement', name: 'تنمية بشرية', icon: '💡' },
    { id: 'cooking', name: 'طبخ', icon: '🍳' },
    { id: 'kids', name: 'أطفال', icon: '🧸' },
    { id: 'education_languages', name: 'تعليم ولغات', icon: '🌐' },
    { id: 'school_books', name: 'كتب مدرسية', icon: '🎒' },
    { id: 'university', name: 'مراجع جامعية', icon: '🎓' },
    { id: 'science', name: 'علوم', icon: '🔬' },
    { id: 'tech_programming', name: 'تقنية وبرمجة', icon: '💻' },
    { id: 'economy_business', name: 'اقتصاد وأعمال', icon: '💼' },
    { id: 'philosophy', name: 'فلسفة وفكر', icon: '🤔' },
    { id: 'art_culture', name: 'فن وثقافة', icon: '🎨' },
    { id: 'poetry_literature', name: 'شعر وأدب', icon: '📜' },
    { id: 'law', name: 'قانون', icon: '⚖️' },
    { id: 'health', name: 'صحة', icon: '⚕️' },
    { id: 'manga', name: 'مانغا', icon: '🎌' }
];

let allBooks = [];
let allLibraries = [];
let cartCount = 0;

// DOM Elements
const categoriesList = document.getElementById('categoriesList');
const librariesList = document.getElementById('librariesList');
const booksList = document.getElementById('booksList');
const searchInput = document.getElementById('searchInput');
const cartBadge = document.querySelector('.cart-badge');
const bookModal = document.getElementById('bookModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalBody = document.getElementById('modalBody');

// Initialize App
async function init() {
    console.log("Initializing app with Firestore...");
    db = firebase.firestore();

    // 7-day SaaS Logic for Publishers constants
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    try {
        // Fetch Data from Firestore
        const [booksSnap, libsSnap] = await Promise.all([
            db.collection('books').get(),
            db.collection('libraries').get()
        ]);

        allBooks = booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allLibraries = libsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter expired items for SaaS publishers
        const activeBooks = allBooks.filter(book => {
            const uploadedAt = new Date(book.date).getTime();
            if (book.publisherRole === 'publisher' && (now - uploadedAt > sevenDaysMs)) {
                return false;
            }
            return true;
        });

        renderCategories();
        renderLibraries(allLibraries);
        renderBooks(activeBooks);

        // Search Feature
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = allBooks.filter(b =>
                    (b.title && b.title.toLowerCase().includes(query)) ||
                    (b.author && b.author.toLowerCase().includes(query))
                );
                renderBooks(filtered);
            });
        }

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (bookModal) {
            bookModal.addEventListener('click', (e) => {
                if (e.target === bookModal) closeModal();
            });
        }

        initCheckoutForm();
    } catch (error) {
        console.error("Error loading Firestore data:", error);
        // Fallback or show error
    }
}

function renderCategories() {
    if (!categoriesList) return;
    categoriesList.innerHTML = '';
    defaultCategories.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = `category-item ${index === 0 ? 'active' : ''}`;
        div.innerHTML = `
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
        `;
        div.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');

            if (cat.id === 'all') {
                renderBooks(allBooks);
            } else {
                renderBooks(allBooks.filter(b => b.category === cat.id));
            }
        });
        categoriesList.appendChild(div);
    });
}

function renderLibraries(libsToRender) {
    if (!librariesList) return;
    librariesList.innerHTML = '';
    libsToRender.forEach(lib => {
        const div = document.createElement('div');
        div.className = 'library-card';
        div.innerHTML = `
            <div class="library-img-wrapper">
                <img src="${lib.image || 'https://via.placeholder.com/400'}" alt="${lib.name}" class="library-img">
                <div class="library-overlay"></div>
                <div class="library-rating"><i class="fas fa-star"></i> ${lib.rating || 5.0}</div>
            </div>
            <div class="library-info">
                <div class="library-name">${lib.name}</div>
                <div class="library-distance">
                    <i class="fas fa-map-marker-alt"></i> ${lib.wilaya || 'موقع غير محدد'}
                </div>
            </div>
        `;
        librariesList.appendChild(div);
    });
}

function renderBooks(booksToRender) {
    if (!booksList) return;
    booksList.innerHTML = '';
    if (booksToRender.length === 0) {
        booksList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">لا توجد نتائج مطابقة</p>';
        return;
    }

    booksToRender.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card';
        div.innerHTML = `
            <div style="position: relative;">
                <img src="${book.cover || 'https://via.placeholder.com/200'}" alt="${book.title}" class="book-cover">
                <div class="book-actions-overlay">
                    <button class="action-btn" title="أضف للمفضلة" onclick="event.stopPropagation()"><i class="far fa-heart"></i></button>
                    <button class="action-btn" title="مشاركة" onclick="event.stopPropagation()"><i class="fas fa-share-alt"></i></button>
                </div>
            </div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-price-row">
                    <div class="book-price">${book.price} <span class="currency">د.ج</span></div>
                    <button class="action-btn" style="background: var(--primary); color: white;" onclick="event.stopPropagation(); window.openBookModal('${book.id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        div.addEventListener('click', () => openBookModal(book.id));
        booksList.appendChild(div);
    });
}

window.openBookModal = function (bookId) {
    window.currentSelectedBook = bookId;
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    let libListHtml = '';
    if (book.availableAt && Array.isArray(book.availableAt)) {
        book.availableAt.forEach(lib => {
            libListHtml += `
                <div class="modal-library-item">
                    <div class="modal-lib-details">
                        <h4>${lib.name}</h4>
                        <div class="modal-lib-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${lib.wilaya || 'عبر البريد'}</span>
                            <span><i class="fas fa-check-circle" style="color:var(--secondary)"></i> متوفر</span>
                        </div>
                    </div>
                    <div style="text-align: left;">
                        <div class="modal-lib-price">${lib.price || book.price} <span class="currency">د.ج</span></div>
                        <button class="action-btn" style="background: var(--bg-main); width: auto; padding: 4px 12px; border-radius: 12px; font-size:0.8rem; margin-top:8px;" onclick="window.addToCart()">
                            أضف للسلة
                        </button>
                    </div>
                </div>
            `;
        });
    }

    if (modalBody) {
        modalBody.innerHTML = `
            <div class="modal-book-header">
                <img src="${book.cover || 'https://via.placeholder.com/200'}" alt="${book.title}" class="modal-book-cover">
                <div class="modal-book-info">
                    <h3 class="modal-book-title">${book.title}</h3>
                    <span class="modal-book-author">${book.author}</span>
                    <p class="modal-book-desc">${book.desc || 'لا يوجد وصف متاح.'}</p>
                </div>
            </div>
            <h3 style="margin-bottom: 12px; font-size: 1.1rem; border-top: 1px solid var(--border); padding-top: 16px;">متوفر في المكتبات التالية:</h3>
            <div class="modal-libraries-list">
                ${libListHtml || '<p style="text-align:center; padding: 10px;">متوفر للشراء المباشر</p>'}
            </div>
            <button class="order-btn" onclick="window.addToCart(true)">طلب التوصيل الآن</button>
        `;
    }

    if (bookModal) bookModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (bookModal) bookModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

window.addToCart = function (isFullOrder = false) {
    if (isFullOrder) {
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } else {
        cartCount++;
        if (cartBadge) {
            cartBadge.textContent = cartCount;
            cartBadge.style.transform = 'scale(1.5)';
            setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
        }
    }
}

// Checkout Form Logic
function initCheckoutForm() {
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const nameInput = document.getElementById('nameInput');
    const wilayaSelect = document.getElementById('wilayaSelect');
    const baladiyaSelect = document.getElementById('baladiyaSelect');
    const phoneInput = document.getElementById('phoneInput');

    if (wilayaSelect && typeof algeriaWilayas !== 'undefined') {
        algeriaWilayas.forEach(w => {
            const option = document.createElement('option');
            option.value = w.id;
            option.textContent = `NODE.WILAYA_${w.id} ["${w.name}"]`;
            wilayaSelect.appendChild(option);
        });

        wilayaSelect.addEventListener('change', (e) => {
            const wilayaId = e.target.value;
            baladiyaSelect.innerHTML = '<option value="">> --SELECT_BRANCH_ID--</option>';

            if (wilayaId) {
                baladiyaSelect.disabled = false;
                const wilayaObj = algeriaWilayas.find(w => w.id == wilayaId);
                wilayaObj.communes.forEach((c, idx) => {
                    const option = document.createElement('option');
                    option.value = c;
                    option.textContent = `BRANCH.${wilayaId}${idx + 1} ["${c}"]`;
                    baladiyaSelect.appendChild(option);
                });
            } else {
                baladiyaSelect.disabled = true;
            }
        });
    }

    if (closeCheckoutBtn && checkoutModal) {
        closeCheckoutBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) checkoutModal.classList.remove('active');
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value;
            const selectedWilaya = wilayaSelect.options[wilayaSelect.selectedIndex].text;
            const selectedBaladiya = baladiyaSelect.value;
            const phone = phoneInput.value;

            const book = allBooks.find(b => b.id === window.currentSelectedBook);
            const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

            const newOrder = {
                id: orderId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                time: 'الآن',
                customer: name,
                wilaya: selectedWilaya,
                baladiya: selectedBaladiya,
                phone: phone,
                deliveryCorp: 'قيد التحديد',
                bookTitle: book ? book.title : 'كتاب غير معروف',
                price: book ? book.price : '0',
                qty: 1,
                status: 'pending',
                targetPartnerId: book ? book.publisherId : 'A1B2C3D4' // Link order to specific partner
            };

            try {
                await db.collection('orders').add(newOrder);
                alert(`تم إرسال طلبك بنجاح! 🎉\nالطلب رقم: #${orderId}\nسيتواصل المتجر معك قريباً لتأكيد شركة التوصيل والموعد.`);

                checkoutModal.classList.remove('active');
                closeModal();
                checkoutForm.reset();
                if (baladiyaSelect) baladiyaSelect.disabled = true;

                cartCount++;
                if (cartBadge) {
                    cartBadge.textContent = cartCount;
                }
            } catch (error) {
                console.error("Error submitting order:", error);
                alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
            }
        });
    }
}

// Run app
document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly for Firebase to be ready via standard script loading
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            clearInterval(checkFirebase);
            init();
        }
    }, 100);
});
