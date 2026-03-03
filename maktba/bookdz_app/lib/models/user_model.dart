enum UserRole { buyer, seller }

class UserModel {
  final String id;
  final String name;
  final UserRole role;
  final String? libraryId;

  UserModel({
    required this.id,
    required this.name,
    required this.role,
    this.libraryId,
  });
}
