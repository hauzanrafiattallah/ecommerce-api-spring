package ecommerce.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import ecommerce.model.CategoryResponse;
import ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;
  
  @GetMapping(value = "/api/categories", produces = "application/json")
  public List<CategoryResponse> findAll() {
    return categoryService.findAll();
  }
}
