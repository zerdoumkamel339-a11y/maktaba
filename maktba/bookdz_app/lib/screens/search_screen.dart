import 'package:bookdz_app/models/book.dart';
import 'package:bookdz_app/widgets/book_card.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

/// ==========================================
/// 2. شاشة نتائج البحث وتفاصيل الكتاب
/// ==========================================
class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  List<Book> _searchResults = [];
  bool _isLoading = false;
  bool _hasSearched = false;

  void _performSearch(String query) async {
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _hasSearched = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _hasSearched = true;
    });

    try {
      // Using a simple query. For better performance, consider a dedicated search service like Algolia.
      var snapshot = await FirebaseFirestore.instance
          .collection('books')
          .where('title', isGreaterThanOrEqualTo: query)
          .where('title', isLessThanOrEqualTo: query + '\uf8ff')
          .get();
      
      var results = snapshot.docs.map((doc) => Book.fromFirestore(doc)).toList();
      setState(() {
        _searchResults = results;
      });

    } catch (e) {
      // Handle error
      print(e);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchCtrl,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'ابحث عن كتاب أو مؤلف...',
            hintStyle: TextStyle(color: Colors.white70),
            border: InputBorder.none,
          ),
          onChanged: _performSearch,
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (!_hasSearched) {
      return const Center(
        child: Text('اكتب اسم الكتاب أو المؤلف للبدء بالبحث', style: TextStyle(color: Colors.grey)),
      );
    }

    if (_searchResults.isEmpty) {
      return const Center(
        child: Text('لم يتم العثور على نتائج', style: TextStyle(color: Colors.grey)),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        return BookCard(book: _searchResults[index]);
      },
    );
  }
}
