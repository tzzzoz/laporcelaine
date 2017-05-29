# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
all_dishes = Oj.load(File.read("db/seeds/dishes.json"))
dish_attrs = %w(name desc category price)
all_dishes.each do |category, dish_list|
  dish_list.each do |dish_params|
    Dish.create(dish_params.merge({"category" => category}).slice(*dish_attrs))
  end
end
