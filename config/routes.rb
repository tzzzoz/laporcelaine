Rails.application.routes.draw do
  get 'login', to: 'sessions#new'

  post 'login', to: 'sessions#create', as: 'auth'
  delete 'logout', to: 'sessions#destroy'

  post 'checkout', to: 'orders#new', as: 'checkout'
  post 'orders', to: 'orders#create'
  get 'orders', to: 'orders#index', as: 'orders_index'

  get '/', to: 'home#index'
  root 'home#index'

  get 'about', to: 'home#about'
  get 'menu', to: 'home#menu', as: 'default_menu'
  get 'menu/:category', to: 'home#menu', as: 'menu'
  get 'gallery', to: 'home#gallery', as: 'gallery'
  get 'book', to: 'home#book', as: 'book'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
