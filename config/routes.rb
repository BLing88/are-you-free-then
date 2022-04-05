Rails.application.routes.draw do
  #get 'event_invites/new'
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
      get :invites, to: "users#event_invites"
    end
  end
  resources :events, only: [:new, :show, :edit, :update, :create, :destroy] do
    member do
      #resources :event_invites, only: [:create, :new]
      get '/invite', to: 'event_invites#new'
      post '/invite', to: 'event_invites#create'
      get '/join', to: 'events#join'
      # resources :participations, only: [:show], path: :join
    end
  end
  resources :event_invites, only: [:destroy]
  resources :participations, only: [:create]
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
