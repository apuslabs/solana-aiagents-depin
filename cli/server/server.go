package server

import (
	"fmt"
	"net/http"
	"solana-hackthon-cli/computer/docker"
	"solana-hackthon-cli/computer/monitor"

	"github.com/gin-gonic/gin"
)

// 启动web服务，提供查询接口
func Init() {
	gin.SetMode(gin.DebugMode)
	r := gin.Default()

	r.GET("/healthCheck", HealthCheckHandler)

	host := fmt.Sprintf("0.0.0.0:%d", 80)
	if err := r.Run(host); err != nil {
		fmt.Printf("start service failed, err:%v\n", err)
		panic(err)
	}
}

func HealthCheckHandler(c *gin.Context) {
	health := monitor.GetHealth()
	agent := c.Query("agent")
	if agent == "" {
		c.JSON(http.StatusOK, Response{Code: 200, Msg: "", Data: Health{Busy: health, Port: 0}})
		return
	}

	port := docker.GetPort(agent)
	c.JSON(http.StatusOK, Response{Code: 200, Msg: "", Data: Health{Busy: health, Port: port}})
}
