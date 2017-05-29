class HomeController < ApplicationController
  def index
  end

  def about
  end

  def menu
    @dishes = Dish.all
  end
end
