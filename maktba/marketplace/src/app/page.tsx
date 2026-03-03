"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
    const [activeTab, setActiveTab] = useState<"home" | "cart" | "tracking">("home");
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [cart, setCart] = useState<any[]>([]);

    const books = [
        { id: 1, title: "مقدمة ابن خلدون", author: "ابن خلدون", price: 1500, stock: 10, image: "https://via.placeholder.com/150" },
        { id: 2, title: "فن اللامبالاة", author: "مارك مانسون", price: 1200, stock: 5, image: "https://via.placeholder.com/150" },
    ];

    const wilayas = [
        { id: "16", name: "الجزائر - 16" },
        { id: "31", name: "وهران - 31" },
    ];
    const communes = [
        { id: "1", wilayaId: "16", name: "باب الواد" },
        { id: "2", wilayaId: "16", name: "القبة" },
    ];

    const addToCart = (book: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === book.id);
            if (existing) {
                return prev.map((item) => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...book, quantity: 1 }];
        });
        setSelectedBook(null);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold">مكتبة إقرأ</h1>
                <div className="flex gap-2">
                    {userStats()}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-20">
                {activeTab === "home" && (
                    <div className="grid grid-cols-2 gap-4">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className="bg-white rounded border cursor-pointer flex flex-col items-center p-2 shadow-sm"
                                onClick={() => setSelectedBook(book)}
                            >
                                <img src={book.image} alt={book.title} className="w-full h-32 object-cover mb-2" />
                                <h3 className="font-semibold text-sm text-center">{book.title}</h3>
                                <p className="text-xs text-gray-500">{book.author}</p>
                                <div className="mt-2 text-blue-600 font-bold">{book.price} د.ج</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "cart" && (
                    <div>
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">سلة المشتريات</h2>
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center mt-10">السلة فارغة</p>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 border p-2 bg-white rounded">
                                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-bold">{item.title}</h4>
                                            <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                                            <p className="text-blue-600 font-bold">{item.price * item.quantity} د.ج</p>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    className="w-full bg-blue-600 text-white font-bold p-3 rounded mt-4"
                                    onClick={() => setCheckoutOpen(true)}
                                >
                                    إتمام الطلب
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "tracking" && (
                    <div>
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">تتبع الطلبات</h2>
                        <div className="border p-4 bg-white rounded shadow-sm">
                            <p className="font-bold">طلب رقم: #10024</p>
                            <p className="text-sm text-gray-500 mt-1">المبلغ الإجمالي: 1500 د.ج</p>
                            <div className="mt-3 flex gap-2 items-center">
                                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                                <span className="text-sm font-semibold">قيد المعالجة</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Book Detail Modal */}
            {selectedBook && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded shadow-lg overflow-hidden flex flex-col">
                        <img src={selectedBook.image} alt={selectedBook.title} className="w-full h-48 object-cover" />
                        <div className="p-4 flex-1">
                            <h2 className="text-xl font-bold">{selectedBook.title}</h2>
                            <p className="text-gray-600 mb-2">{selectedBook.author}</p>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-3">تفاصيل الكتاب والوصف تظهر هنا. كتاب رائع يستحق القراءة، متوفر الآن.</p>
                            <div className="flex justify-between items-center mb-4 border-t pt-4">
                                <span className="text-xl text-blue-600 font-bold">{selectedBook.price} د.ج</span>
                                <span className="text-sm text-green-600 font-semibold">متوفر في المخزن</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 bg-blue-600 text-white p-2 rounded font-bold"
                                    onClick={() => addToCart(selectedBook)}
                                >
                                    أضف للسلة
                                </button>
                                <button
                                    className="border border-gray-300 p-2 rounded text-red-500 font-bold"
                                    onClick={() => setSelectedBook(null)}
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {checkoutOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded shadow-lg p-5">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">تأكيد الطلب</h2>
                        <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setCheckoutOpen(false); setCart([]); setActiveTab("tracking"); }}>
                            <div>
                                <label className="text-sm font-semibold mb-1 block">رقم الهاتف <span className="text-red-500">*</span></label>
                                <input type="tel" required pattern="(05|06|07)[0-9]{8}" placeholder="0555000000" className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1 block">الولاية <span className="text-red-500">*</span></label>
                                <select className="w-full border p-2 rounded" required>
                                    <option value="">اختر الولاية</option>
                                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1 block">البلدية <span className="text-red-500">*</span></label>
                                <select className="w-full border p-2 rounded" required>
                                    <option value="">اختر البلدية</option>
                                    {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded font-bold">تأكيد الشراء</button>
                                <button type="button" className="border p-2 rounded font-bold" onClick={() => setCheckoutOpen(false)}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <footer className="bg-white border-t p-3 flex justify-around sticky bottom-0 z-10 w-full">
                <button className={`flex flex-col items-center ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab("home")}>
                    <span className="text-xs font-bold mt-1">الرئيسية</span>
                </button>
                <button className={`flex flex-col items-center relative gap-1 ${activeTab === 'cart' ? 'text-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab("cart")}>
                    <span className="text-xs font-bold mt-1">السلة</span>
                    {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">{cart.length}</span>}
                </button>
                <button className={`flex flex-col items-center ${activeTab === 'tracking' ? 'text-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab("tracking")}>
                    <span className="text-xs font-bold mt-1">تتبع</span>
                </button>
            </footer>
        </div>
    );
}

function userStats() {
    return (
        <div className="text-xs text-right">
            <div className="opacity-80">عضوية المشتري</div>
        </div>
    );
}
