class HomeController < ApplicationController
  def index
  end

  def about
  end

  def menu
    @categories = Category.all
    category = params['category']
    @category = Category.find_by(symbol: category) || Category.first
  end
end
