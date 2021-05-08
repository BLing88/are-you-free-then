Rails.application.routes.draw do
  root 'static_pages#welcome'
  get '/welcome', to: 'static_pages#welcome'
  get '/signup', to: 'users#new'
  post '/signup', to: 'users#create'
  resources :users, except: [:index, :create]
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
