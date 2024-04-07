package config

import (
	"flag"
	"fmt"
	"os/exec"
)

var OwnerPubkey string
var ServerAddress string
var Price string
var Endpoint string

var SkipGpu bool

func init() {
	flag.StringVar(&OwnerPubkey, "ownerpubkey", "", "node owner publickey")
	flag.StringVar(&ServerAddress, "serveraddress", "https://solapi.apus.network", "register server address: https://host:port")
	flag.StringVar(&Price, "price", "0", "price for ai task")
	flag.StringVar(&Endpoint, "endpoint", "", "endpoint for access this node: ip/domain")
	flag.BoolVar(&SkipGpu, "skipgpu", false, "")
}

// 定义配置，读取配置。提供全局配置调用方法
func Init() {
	flag.Parse()

	if OwnerPubkey == "" {
		panic("ownerpubkey must be set: node owner publickey")
	}
	if ServerAddress == "" {
		panic("serveraddress must be set: register server address: https://host:port")
	}

	if Endpoint == "" {
		result, err := exec.Command("curl", "ifconfig.me").Output()
		if err != nil {
			fmt.Println("can not get endpoint; err:", err.Error())
			panic("programid must be set: endpoint for access this node: ip/domain")
		}
		fmt.Println("ip:", string(result))
		Endpoint = fmt.Sprintf("http://%s:80", string(result))

	}
}
