Rails.application.routes.draw do
  get '/', to: 'home#index'
  root 'home#index'

  get 'about', to: 'home#about'
  get 'menu', to: 'home#menu', as: 'default_menu'
  get 'menu/:category', to: 'home#menu', as: 'menu'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
