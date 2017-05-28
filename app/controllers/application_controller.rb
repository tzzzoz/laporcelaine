class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  helper_method :slideshow_images

  protected

  def slideshow_images
    (1..5).map { |i| "/upload/SONG_#{i.to_s.rjust(2, '0')}.jpg" }
  end
end
