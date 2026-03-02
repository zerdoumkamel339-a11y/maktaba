// 🚀 BookDZ - Professional SPA Logic (Consolidated)

// 1. Supabase Initialization
const supabaseUrl = "https://xeaxsqzwefwhbgqcdkwx.supabase.co";
const supabaseKey = "sb_publishable_b_6zjVWUXuaoif3ZhpiHcg_xR91S-Fk";

if (typeof window.supabase === 'undefined') {
    alert("Supabase SDK not found. Make sure the CDN script is included.");
}
const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. Authentication Service
const AuthService = {
    user: null,
    profile: null,

    async login(email, password) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async register(email, password, metadata) {
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
        if (error) throw error;
        return data;
    },

    async logout() {
        const { error } = await sb.auth.signOut();
        if (error) throw error;
        this.user = null;
        this.profile = null;
    },

    async getProfile(userId) {
        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    async checkSession() {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            this.user = session.user;
            this.profile = await this.getProfile(session.user.id);
        }
        return session;
    }
};

// 3. Routing System
const routes = {
    '/': { section: 'view-home', roles: ['user', 'admin'] },
    '/login': { section: 'view-login', roles: [] },
    '/register': { section: 'view-register', roles: [] },
    '/dashboard': { section: 'view-dashboard', roles: ['bookstore', 'admin'] },
    '/publisher': { section: 'view-publisher', roles: ['publisher', 'admin'] },
    '/admin': { section: 'view-admin', roles: ['admin'] },
    '/unauthorized': { section: 'view-unauthorized', roles: [] }
};

const Router = {
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = routes[hash] || routes['/unauthorized'];

        if (route.roles.length > 0 && !AuthService.user) {
            window.location.hash = '/login';
            return;
        }

        if (route.roles.length > 0 && !route.roles.includes(AuthService.profile?.role)) {
            window.location.hash = '/unauthorized';
            return;
        }

        this.render(route.section);
    },

    render(sectionId) {
        document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
        const target = document.getElementById(sectionId);
        if (target) target.style.display = 'block';
    },

    navigate(path) {
        window.location.hash = path;
    }
};

// 4. Main App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await AuthService.checkSession();
    Router.init();

    sb.auth.onAuthStateChange(async (event, session) => {
        if (session) {
            AuthService.user = session.user;
            AuthService.profile = await AuthService.getProfile(session.user.id);
            const hash = window.location.hash.slice(1);
            if (hash === '/login' || hash === '/register' || hash === '') {
                redirectToDashboard(AuthService.profile.role);
            }
        } else {
            AuthService.user = null;
            AuthService.profile = null;
            Router.navigate('/login');
        }
        updateUI();
    });

    // Search Logic with Debounce
    let searchTimeout;
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => renderMarket(e.target.value), 500);
        });
    }

    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        try { await AuthService.logout(); } catch (err) { alert(err.message); }
    });

    updateUI();
    if (window.location.hash === '#/' || window.location.hash === '') renderMarket();
});

// 5. Market Logic
async function renderMarket(query = '') {
    const marketList = document.getElementById('market-list');
    if (!marketList) return;

    marketList.innerHTML = `<div style="text-align:center; padding:20px; width:100%;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>`;

    try {
        let q = sb.from('books').select(`*, profiles(full_name, store_id)`).order('created_at', { ascending: false });
        if (query) q = q.ilike('title', `%${query}%`);

        const { data: books, error } = await q;
        if (error) throw error;

        if (!books || books.length === 0) {
            marketList.innerHTML = `<p style="padding:20px; color:gray;">لم يتم العثور على نتائج.</p>`;
            return;
        }

        marketList.innerHTML = books.map(book => `
            <div class="book-card">
                <img src="${book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200'}" class="book-cover">
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">${book.profiles?.full_name || 'بائع مجهول'} ${book.profiles?.store_id ? `<span class="badge-role" style="font-size:0.6rem; padding:1px 5px;">${book.profiles.store_id}</span>` : ''}</div>
                    <div class="book-price">${book.price} د.ج</div>
                    <button class="btn-primary" style="padding:5px; font-size:0.8rem;" onclick="alert('قريباً: سلة المشتريات')">
                        <i class="fas fa-shopping-cart"></i> سلة
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        marketList.innerHTML = `<p style="color:red; padding:20px;">خطأ في تحميل البيانات.</p>`;
    }
}

function redirectToDashboard(role) {
    if (role === 'admin') Router.navigate('/admin');
    else if (role === 'bookstore') Router.navigate('/dashboard');
    else if (role === 'publisher') Router.navigate('/publisher');
    else Router.navigate('/');
}

function updateUI() {
    const isAuth = !!AuthService.user;
    const role = AuthService.profile?.role;

    document.querySelectorAll('.auth-only').forEach(el => el.style.display = isAuth ? 'block' : 'none');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = isAuth ? 'none' : 'block');

    if (document.getElementById('user-name')) document.getElementById('user-name').innerText = AuthService.profile?.full_name || 'زائر';

    const rb = document.getElementById('role-badge');
    if (rb) {
        rb.innerText = role || '';
        rb.style.display = role ? 'inline-block' : 'none';
        if (role === 'admin') rb.style.background = 'var(--accent)';
        else if (role === 'bookstore') rb.style.background = 'var(--secondary)';
        else rb.style.background = 'var(--primary)';
    }

    if (window.location.hash === '#/' || window.location.hash === '') renderMarket();
}

// Global Exports
window.AuthService = AuthService;
window.Router = Router;
window.sb = sb;
