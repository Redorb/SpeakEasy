defmodule Speakeasy.Presence do
  use Phoenix.Presence, otp_app: :speakeasy,
                        pubsub_server: Speakeasy.PubSub
end