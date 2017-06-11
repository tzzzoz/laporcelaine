class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  helper_method :slideshow_images, :current_user

  protected

  def slideshow_images
    (1..5).map { |i| "/upload/SONG_#{i.to_s.rjust(2, '0')}.jpg" }
  end

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  def login(user)
    session[:user_id] = user.id
  end

  def logged_in?
    !current_user.nil?
  end

  def logout
    session[:user_id] = nil
    @current_user = nil
  end

  def auth
    redirect_to login_url, alert: 'Vous devez vous identifier pour accéder à cette page.' unless logged_in?
  end
end
