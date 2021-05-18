package main

import (
	"time"

	"github.com/gofiber/fiber"
)

func createTargetServer() *fiber.App {
	app := fiber.New(&fiber.Settings{DisableStartupMessage: true})

	app.All("*", func(c *fiber.Ctx) {
		getRequestWatcher().newRequest(WatchedRequest{
			Path:   c.OriginalURL(),
			Method: c.Method(),
			Sent:   time.Now(),
			Body:   c.Body(),
			Headers: string(c.Fasthttp.Request.Header.Header()),
		})
		c.SendStatus(200)
	})

	return app
}
