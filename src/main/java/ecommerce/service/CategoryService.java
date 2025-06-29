package ecommerce.service;

import java.util.List;

import org.springframework.stereotype.Service;

import ecommerce.entity.Category;
import ecommerce.model.CategoryResponse;
import ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
  

  private final CategoryRepository categoryRepository;

  public List<CategoryResponse> findAll(){
    List<Category> parents = categoryRepository.findAllForAPI();
    return parents.stream().map(category -> {
      List<Category> children = category.getChildren();
      List<CategoryResponse> childResponses = children.stream().map(child -> {
      return CategoryResponse.builder().id(child.getId()).name(child.getName()).build();
    }).toList();
    
      return CategoryResponse.builder().id(category.getId()).name(category.getName()).children(childResponses).build();
    }).toList();

    
  }
}
