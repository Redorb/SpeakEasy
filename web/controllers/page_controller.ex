defmodule Speakeasy.PageController do
  use Speakeasy.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
