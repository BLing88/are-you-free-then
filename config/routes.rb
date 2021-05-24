Rails.application.routes.draw do
  get 'sessions/new'
  root 'static_pages#welcome'
  get '/welcome', to: 'static_pages#welcome'
  get '/signup', to: 'users#new'
  post '/signup', to: 'users#create'
  get '/login', to: 'sessions#new'
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'
  resources :users, except: [:index, :create]
  resources :free_times, only: [:new, :create, :destroy]
  resources :users do 
    member do
    get :free_times
    get :free_times_json
    get :friends
    end
  end
  resources :events, only: [:new, :show, :create, :destroy]
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
