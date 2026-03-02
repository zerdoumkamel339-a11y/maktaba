// 🚀 BookDZ - Supabase Configuration (v2)
const supabaseUrl = "https://xeaxsqzwefwhbgqcdkwx.supabase.co";
const supabaseKey = "sb_publishable_b_6zjVWUXuaoif3ZhpiHcg_xR91S-Fk";

// تهيئة العميل فوراً وبشكل عالمي
if (!window.supabase) {
    console.error("يرجى إضافة سكريبت Supabase CDN قبل ملف supabase.js");
} else {
    if (!window.sb) {
        window.sb = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
}

// تعريف متغير محلي للاختصار في باقي الملفات
var sb = window.sb;
