package ecommerce.service;

import java.time.Duration;
import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import ecommerce.entity.Category;
import ecommerce.model.CategoryResponse;
import ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;

@Service
@RequiredArgsConstructor
public class CategoryService {
  

  private final CategoryRepository categoryRepository;

  private final StringRedisTemplate stringRedisTemplate;

  private final ObjectMapper objectMapper;

  @SneakyThrows
  public List<CategoryResponse> findAll(){

    String json = stringRedisTemplate.opsForValue().get("categories");
    if (json != null) {
      List<CategoryResponse> cachedCategories = objectMapper.readValue(json, new TypeReference<List<CategoryResponse>>() {});
      return cachedCategories;
    }

    List<Category> parents = categoryRepository.findAllForAPI();

    List<CategoryResponse> responses = parents.stream().map(category -> {

      List<Category> children = category.getChildren();
      List<CategoryResponse> childResponses = children.stream().map(child -> {
      return CategoryResponse.builder().id(child.getId()).name(child.getName()).build();
    }).toList();

      return CategoryResponse.builder().id(category.getId()).name(category.getName()).children(childResponses).build();
    }).toList();

    json = objectMapper.writeValueAsString(responses);
    stringRedisTemplate.opsForValue().set("categories", json, Duration.ofHours(1));

    return responses;
  }
}
