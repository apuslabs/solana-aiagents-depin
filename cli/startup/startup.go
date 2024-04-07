package startup

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"solana-hackthon-cli/ca"
	"solana-hackthon-cli/computer"
	"solana-hackthon-cli/computer/monitor"
	"solana-hackthon-cli/config"
)

// 启动预设，检查环境信息。查询计算机配置，生成节点keypaire， 注册节点信息(如果第一次启动的话)
func Startup() {
	config.Init()
	ca.Init()
	gpuNode := computer.Init()
	RegisterGpuNode(gpuNode)
}

func RegisterGpuNode(gpuNode monitor.GpuNode) {
	gpuNode.Owner = config.OwnerPubkey
	gpuNode.Id = ca.GetPubkey().Pubkey
	gpuNode.Sk = ca.GetPubkey().SecretKey
	gpuNode.Price = config.Price
	gpuNode.Endpoint = config.Endpoint
	// http request
	err := register(gpuNode)
	if err != nil {
		fmt.Println("注册机器节点上链失败", err)
		panic(err)
	}
}

func register(gpuNode monitor.GpuNode) error {
	jsonData, err := json.Marshal(gpuNode)
	if err != nil {
		return err
	}
	url := fmt.Sprintf("%s/register-gpu-node", config.ServerAddress)
	resp, err := http.Post(url, "application/json", bytes.NewReader(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return errors.New(resp.Status)
	}
	return nil
}
