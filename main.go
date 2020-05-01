package main

import (
	"log"
	"os"
	"os/signal"
)

var targetServerPort = 8080
var watchServerPort = 4000

func main() {
	osSignals := make(chan os.Signal, 1)
	signal.Notify(osSignals, os.Interrupt)

	targetServer := createTargetServer()
	watchServer := createWatchServer()

	go func() {
		oscall := <-osSignals
		log.Printf("system call: %+v", oscall)
		log.Print("stopping target server")
		if err := targetServer.Shutdown(); err != nil {
			log.Fatalf("target server Shutdown Failed:%+s", err)
		}

		log.Print("stopping watch server")
		if err := watchServer.Shutdown(); err != nil {
			log.Fatalf("watch server Shutdown Failed:%+s", err)
		}

		log.Print("servers stopped")
	}()

	go func() {
		log.Printf("target server listenning at %d", targetServerPort)
		if err := targetServer.Listen(targetServerPort); err != nil {
			log.Fatalf("listen:%+s\n", err)
		}
	}()

	log.Printf("watch server listenning at %d", watchServerPort)
	if err := watchServer.Listen(watchServerPort); err != nil {
		log.Fatalf("listen:%+s\n", err)
	}
}
