class ReplaceCategoryWithCategoryId < ActiveRecord::Migration[5.1]
  def change
    remove_column :dishes, :category
    add_reference :dishes, :category, foreign_key: true
  end
end
