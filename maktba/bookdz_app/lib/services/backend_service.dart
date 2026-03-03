import '../models/book_model.dart';
import '../models/order_model.dart';

class BackendService {
  static final List<BookModel> _booksCollection = [
    BookModel(id: 'b1', libraryId: 'lib_1', title: 'مقدمة ابن خلدون', author: 'ابن خلدون', price: 1500, stock: 5),
    BookModel(id: 'b2', libraryId: 'lib_2', title: 'البؤساء', author: 'فيكتور هوجو', price: 1200, stock: 2),
    BookModel(id: 'b3', libraryId: 'lib_1', title: 'الخيميائي', author: 'باولو كويلو', price: 800, stock: 10),
  ];

  static final List<OrderModel> _ordersCollection = [];

  // جلب كتاب عن طريق المعرف (Id) بطريقة آمنة
  static BookModel? getBookById(String bookId) {
    try {
      return _booksCollection.firstWhere((b) => b.id == bookId);
    } catch (e) {
      return null;
    }
  }

  // بحث عن الكتب
  static List<BookModel> searchBooks(String query) {
    final cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.isEmpty) return List.from(_booksCollection); // إرجاع نسخة جديدة
    
    return _booksCollection.where((book) => 
      book.title.toLowerCase().contains(cleanQuery) || 
      book.author.toLowerCase().contains(cleanQuery)
    ).toList();
  }

  // إضافة طلب شراء جديد بالمخزون الوهمي
  static bool createOrder(String buyerId, String libraryId, String bookId) {
    final book = getBookById(bookId);
    if (book != null && book.stock > 0) {
      // لا ننقص المخزون فوراً هنا بل ننتظر موافقة البائع (أو يمكن حجزه)
      final order = OrderModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        buyerId: buyerId,
        libraryId: libraryId,
        bookId: bookId,
      );
      _ordersCollection.insert(0, order); // إضافة في بداية القائمة
      return true; // نجاح الطلب
    }
    return false; // فشل الطلب (نفد المخزون أو الكتاب غير موجود)
  }

  // جلب طلبات مكتبة معينة
  static List<OrderModel> getLibraryOrders(String libraryId) {
    return _ordersCollection.where((order) => order.libraryId == libraryId).toList();
  }

  // تحديث حالة الطلب
  static void updateOrderStatus(String orderId, OrderStatus newStatus) {
    final orderIndex = _ordersCollection.indexWhere((o) => o.id == orderId);
    if (orderIndex >= 0) {
      final order = _ordersCollection[orderIndex];
      
      // إذا تم القبول، نقوم بإنقاص المخزون الفعلي
      if (newStatus == OrderStatus.accepted && order.status != OrderStatus.accepted) {
         final book = getBookById(order.bookId);
         if (book != null && book.stock > 0) {
            book.stock -= 1;
            order.status = newStatus;
         } else {
            order.status = OrderStatus.rejected; // نرفض الطلب لعدم كفاية المخزون
         }
      } else {
         order.status = newStatus;
      }
    }
  }
}
