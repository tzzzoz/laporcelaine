module ApplicationHelper
  def unordered_list(items, id: nil)
    content_tag(:ul, id: id) do
      items.collect do |item|
        concat yield(item)
      end
    end
  end
end
