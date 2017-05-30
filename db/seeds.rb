# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
categories = [
  { name: 'Entrée', symbol: 'entree' },
  { name: 'Plat', symbol: 'plat' },
  { name: 'Soupe', symbol: 'soupe' },
  { name: 'Accompagnement', symbol: 'accompagnement' },
  { name: 'Déssert', symbol: 'dessert' }
]
categories.each { |category_params| Category.create(category_params) }
all_dishes = Oj.load(File.read("db/seeds/dishes.json"))
dish_attrs = %w(name desc price)
all_dishes.each do |category, dish_list|
  category = Category.find_by(symbol: category)
  dish_list.each do |dish_params|
    category.dishes.create!(dish_params.slice(*dish_attrs))
  end
end
