package ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ecommerce.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {
  List<Category> findAllByParentIsNull();

  List<Category> findAllByParentId(String parentId);

}
