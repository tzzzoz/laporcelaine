module ApplicationHelper
  def unordered_list(items, options = {})
    content_tag(:ul, options) do
      items.collect do |item|
        concat yield(item)
      end
    end
  end
end
