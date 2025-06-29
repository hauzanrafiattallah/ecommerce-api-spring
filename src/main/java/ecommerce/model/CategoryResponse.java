package ecommerce.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryResponse {

  private String id;
  private String name;
  private List<CategoryResponse> children;
  
}
