Rails.application.routes.draw do
  root 'static_pages#welcome'
  get '/welcome', to: 'static_pages#welcome'
  resources :users, except: :index
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
