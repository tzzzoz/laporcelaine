class SessionsController < ApplicationController
  def new
    if logged_in?
      redirect_to root_path
    else
      render layout: 'dark_wrapper'
    end
  end

  def create
    user_params = params.permit(:email, :phone)
    user = User.where(user_params).first
    if user.nil?
      redirect_to login_url, alert: 'Veuillez verifier vos identifiants.'
    else
      login(user)
      redirect_back(fallback_location: root_path)
    end
  end

  def destroy
    logout
    redirect_to login_url
  end
end
