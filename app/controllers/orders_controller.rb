class OrdersController < ApplicationController
  before_action :auth, only: [:index]
  def index
    @orders = current_user.orders
    render layout: 'dark_wrapper'
  end

  def new
    session[:order_params] = nil
    order_params = params.require(:order).permit({items: [:product_id, :product_name, :price, :qty]}, :total)
    @order = Order.new(order_params)
    session[:order_params] = order_params.to_hash
    render layout: 'dark_wrapper'
  end

  def create
    params[:order].merge!(session[:order_params])
    delivery_params = params.require(:order).permit(:total,
                                          address: [:address1, :address2, :city, :postcode],
                                          contact: [:title, :first_name, :last_name, :email, :phone])
    items = params.require(:order).permit(items: [:product_id, :product_name, :price, :qty]).to_h[:items]
    @order = Order.new(delivery_params)
    @order.items = items
    email = @order.contact['email']
    phone = @order.contact['phone']
    if current_user.nil?
      user = User.where(@order.contact).first || User.create!(@order.contact)
      login(user)
    end

    @order.user_id = current_user.id
    @order.save!
    redirect_to orders_index_path
  end
end
