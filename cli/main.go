package main

import (
	"solana-hackthon-cli/server"
	"solana-hackthon-cli/startup"
)

func main() {
	startup.Startup()
	server.Init()
}
