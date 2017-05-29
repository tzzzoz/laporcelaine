class CreateDishes < ActiveRecord::Migration[5.1]
  def change
    create_table :dishes do |t|
      t.string :name
      t.string :desc
      t.string :category
      t.float :price

      t.timestamps
    end
  end
end
