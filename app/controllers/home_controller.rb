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

  def book
  end

  def gallery
    @photos = (1..13).map { |i| "/upload/gallery/photo-#{i.to_s.rjust(2, '0')}.jpg" }
  end
end
