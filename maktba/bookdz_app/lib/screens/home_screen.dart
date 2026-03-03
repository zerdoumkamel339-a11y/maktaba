import 'package:bookdz_app/models/book.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../widgets/book_search_logo.dart';
import '../widgets/category_card.dart';
import '../widgets/book_card.dart';

/// ==========================================
/// 1. الشاشة الرئيسية (Home Screen)
/// ==========================================
class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            BookSearchLogo(),
            SizedBox(width: 10),
            Text('BookDZ'),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.notifications), onPressed: () {})
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // شريط البحث الوهمي (ينقلك لشاشة البحث الحقيقية)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: GestureDetector(
                onTap: () {
                  // This should navigate to the search screen.
                  // For now, we are on the home screen.
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10)
                    ],
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.search, color: Colors.grey),
                      SizedBox(width: 10),
                      Text('ابحث عن كتاب، مؤلف، أو مكتبة...', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            ),
            
            // التصنيفات
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text('التصنيفات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 100,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: const [
                  CategoryCard(title: 'روايات', icon: Icons.book),
                  CategoryCard(title: 'تاريخ', icon: Icons.history),
                  CategoryCard(title: 'دين', icon: Icons.mosque),
                  CategoryCard(title: 'تنمية بشرية', icon: Icons.self_improvement),
                  CategoryCard(title: 'طبخ', icon: Icons.restaurant),
                  CategoryCard(title: 'أطفال', icon: Icons.child_care),
                  CategoryCard(title: 'تعليم ولغات', icon: Icons.translate),
                  CategoryCard(title: 'كتب مدرسية', icon: Icons.school),
                  CategoryCard(title: 'مراجع جامعية', icon: Icons.account_balance),
                  CategoryCard(title: 'علوم', icon: Icons.science),
                  CategoryCard(title: 'تقنية وبرمجة', icon: Icons.computer),
                  CategoryCard(title: 'اقتصاد وأعمال', icon: Icons.business_center),
                  CategoryCard(title: 'فلسفة وفكر', icon: Icons.lightbulb),
                  CategoryCard(title: 'فن وثقافة', icon: Icons.palette),
                  CategoryCard(title: 'شعر وأدب', icon: Icons.history_edu),
                  CategoryCard(title: 'قانون', icon: Icons.gavel),
                  CategoryCard(title: 'صحة', icon: Icons.health_and_safety),
                  CategoryCard(title: 'مانغا', icon: Icons.chrome_reader_mode),
                ],
              ),
            ),

            // أقسام افتراضية (Firebase StreamBuilder يمكن إضافته هنا)
            const SizedBox(height: 20),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text('أحدث الكتب', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 10),
            StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance.collection('books').snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return const Center(child: Text('حدث خطأ ما'));
                }
                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return const Center(child: Text('لا توجد كتب حالياً'));
                }

                var books = snapshot.data!.docs.map((doc) => Book.fromFirestore(doc)).toList();

                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.7,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: books.length,
                  itemBuilder: (context, index) {
                    return BookCard(book: books[index]);
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
