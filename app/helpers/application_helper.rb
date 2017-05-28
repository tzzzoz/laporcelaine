module ApplicationHelper
  def slideshow_list(images)
    content_tag(:ul, id: "slideshow") do
      images.collect do |img_src|
        concat content_tag(:li, nil) { image_tag(img_src, alt: "slideshow image") }
      end
    end
  end
end
