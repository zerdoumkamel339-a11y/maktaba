import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/book_model.dart';
import '../services/backend_service.dart';

class BuyerHomeScreen extends StatefulWidget {
  final UserModel user;
  final VoidCallback onLogout;

  const BuyerHomeScreen({Key? key, required this.user, required this.onLogout}) : super(key: key);

  @override
  State<BuyerHomeScreen> createState() => _BuyerHomeScreenState();
}

class _BuyerHomeScreenState extends State<BuyerHomeScreen> {
  List<BookModel> _books = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchBooks();
  }

  void _fetchBooks() {
    setState(() {
      _books = BackendService.searchBooks(_searchQuery);
    });
  }

  Future<void> _handleOrder(BookModel book) async {
    // محاكاة طلب الشبكة للـ Firebase
    await Future.delayed(const Duration(milliseconds: 300));
    
    // فحص مهم لتجنب انهيار التطبيق إذا خرج المستخدم من الشاشة أثناء الانتظار
    if (!mounted) return;
    
    final success = BackendService.createOrder(widget.user.id, book.libraryId, book.id);
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'تم إرسال طلب شراء ${book.title} بنجاح!' : 'عذراً، الكتاب غير متاح حالياً.'),
        backgroundColor: success ? Colors.green : Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('مرحباً ${widget.user.name} 👋'),
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: widget.onLogout, tooltip: 'تسجيل خروج')
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'ابحث عن كتاب أو مؤلف...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                _searchQuery = value;
                _fetchBooks();
              },
            ),
          ),
          Expanded(
            child: _books.isEmpty
                ? const Center(child: Text('لا توجد نتائج بحث'))
                : ListView.builder(
                    itemCount: _books.length,
                    itemBuilder: (context, index) {
                      final book = _books[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        elevation: 2,
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.blueAccent,
                            child: Icon(Icons.book, color: Colors.white),
                          ),
                          title: Text(book.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${book.author}\nالمتجر: ${book.libraryId}\nالكمية المتاحة: ${book.stock}'),
                          isThreeLine: true,
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('${book.price} دج', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  minimumSize: Size.zero,
                                ),
                                // تعطيل الزر إذا نفد المخزون
                                onPressed: book.stock > 0 ? () => _handleOrder(book) : null,
                                child: Text(book.stock > 0 ? 'اطلب الآن' : 'نفد من المخزون'),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
