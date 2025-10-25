class Pending < Webmachine::Resource
  class << self
    attr_accessor :redis
  end

  def content_types_provided
    [
      ['application/json', :to_json],
      ['text/html', :to_html]
      ['text/plain', :to_text]
    ]
  end

  def to_text
    seen = {}

    # Collect queues
    self.class.redis.scan_each(:match => "pending*") do |queue|
      next if seen[queue]
      seen[queue] = true
    end

    # "pending" sorts before "pending-*" and "pending:*", and "-" sorts before ":", so no special treatment needed to get the desired sorting.

    buffer = []
    seen.keys.sort_by(&:downcase).each do |queue|
      b = []
      b << queue

      idents = self.class.redis.lrange(queue, 0, -1).reverse

      urls = self.class.redis.pipelined do
        idents.each { |ident| self.class.redis.hget(ident, 'url') }
      end

      idents.zip(urls).each.with_index do |(ident, url), i|
        b << "  #{i+1}. #{url} (#{ident})"
      end

      buffer << b.join("\n")
    end

    buffer.join("\n\n")
  end

  def to_json
    response.headers['Access-Control-Allow-Origin'] = '*'
    get_pending_jobs.to_json
  end

  def to_html
    File.read(File.expand_path('../../pending.html', __FILE__))
  end
end
