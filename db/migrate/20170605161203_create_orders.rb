class CreateOrders < ActiveRecord::Migration[5.1]
  def change
    create_table :orders do |t|
      t.text :items, array: true, default: []
      t.json :address
      t.json :contact
      t.float :subtotal
      t.float :total

      t.timestamps
    end
  end
end
