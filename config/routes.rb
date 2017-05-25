Rails.application.routes.draw do
  get '/', to: 'home#index'
  root 'home#index'

  get 'about', to: 'home#about'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
