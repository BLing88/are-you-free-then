Rails.application.routes.draw do
  get 'sessions/new'
  root 'static_pages#welcome'
  get '/welcome', to: 'static_pages#welcome'
  get '/signup', to: 'users#new'
  post '/signup', to: 'users#create'
  get '/login', to: 'sessions#new'
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#delete'
  resources :users, except: [:index, :create]
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
