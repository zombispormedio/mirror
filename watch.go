package main

import (
	"log"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/gofiber/fiber"
	"github.com/gofiber/websocket"
)

type WatchedRequest struct {
	Path   string `json:"path"`
	Method string `json:"method"`
	Body   string `json:"body"`
	Sent time.Time `json:"sent"`
	Headers string `json:"headers"`
}

type Observer interface {
	update(WatchedRequest)
	getID() string
}

type RequestObserver struct {
	id       string
	callback func(WatchedRequest)
}

func newRequestObserver(callback func(WatchedRequest)) *RequestObserver {
	return &RequestObserver{
		id:       uuid.New().String(),
		callback: callback,
	}
}

func (o *RequestObserver) getID() string {
	return o.id
}

func (o *RequestObserver) update(r WatchedRequest) {
	o.callback(r)
}

type Subject interface {
	register(observer Observer)
	deregister(observer Observer)
}

var lock = &sync.Mutex{}

type RequestWatcher struct {
	observers []Observer
}

var requestWatcherInstance *RequestWatcher

func getRequestWatcher() *RequestWatcher {
	if requestWatcherInstance == nil {
		lock.Lock()
		defer lock.Unlock()
		if requestWatcherInstance == nil {
			requestWatcherInstance = &RequestWatcher{}
		}
	}

	return requestWatcherInstance
}

func (watcher *RequestWatcher) newRequest(request WatchedRequest) {
	for _, observer := range watcher.observers {
		observer.update(request)
	}
}

func (watcher *RequestWatcher) register(observer Observer) {
	watcher.observers = append(watcher.observers, observer)
}

func (watcher *RequestWatcher) unregister(observerToRemove Observer) {
	observersLength := len(watcher.observers)
	for i, observer := range watcher.observers {
		if observerToRemove.getID() == observer.getID() {
			watcher.observers[observersLength-1], watcher.observers[i] = watcher.observers[i], watcher.observers[observersLength-1]
			watcher.observers = watcher.observers[:observersLength-1]
			break
		}
	}
}

func createWatchServer() *fiber.App {
	app := fiber.New(&fiber.Settings{DisableStartupMessage: true})

	app.Static("/", "./public")

	upgrader := websocket.New(func(c *websocket.Conn) {
		observer := newRequestObserver(func(r WatchedRequest) {
			c.WriteJSON(r)
		})

		getRequestWatcher().register(observer)

		log.Printf("websocket opened: %s", observer.getID())

		defer c.Close()

		for {
			_, _, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				log.Printf("websocket closed: %s", observer.getID())
				getRequestWatcher().unregister(observer)
				break
			}
		}
	})

	app.Get("/ws", upgrader)

	return app

}
