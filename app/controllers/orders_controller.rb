class OrdersController < ApplicationController
  def index
  end

  def new
    order_params = params.require(:order).permit({items: [:product_id, :product_name, :price, :qty]}, :total)
    @order = Order.new(order_params)
    render layout: 'order'
  end

  def create
    # order = params.require(:order).permit(items: [:product_id, :product_name, :qty, :price], :subtotal,
    #                                       :total, address: [:address1, :address2, :city, :postcode],
    #                                       contact: [:phone, :title, :last_name])
    Logger.info order
  end
end
