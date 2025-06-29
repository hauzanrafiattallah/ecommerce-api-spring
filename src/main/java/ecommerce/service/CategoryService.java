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
    List<Category> parents = categoryRepository.findAllByParentIsNull();
    List<CategoryResponse> responses = parents.stream().map(category -> {
      return CategoryResponse.builder().id(category.getId()).name(category.getName()).build();
    }).toList();

    for (CategoryResponse response : responses ) {
      List<Category> children = categoryRepository.findAllByParentId(response.getId());
      List<CategoryResponse> childResponses = children.stream().map(category -> {
      return CategoryResponse.builder().id(category.getId()).name(category.getName()).build();
    }).toList();
    response.setChildren(childResponses);
    }

    return responses;
  }
}
