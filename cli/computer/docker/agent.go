package docker

import (
	"encoding/json"
	"fmt"
	"github.com/docker/docker/api/types"
	"io"
	"net/http"
	"solana-hackthon-cli/config"
	"strings"
)

// AI模型起始端口
const AGENT_START_PORT int64 = 9000

var index_Port = AGENT_START_PORT

var agentMap = make(map[string]Agent)
var agentTempMap = make(map[string]int)
var hashPortMap = make(map[string]int64)

type Agent struct {
	Id              string `json:"id"`
	Owner           string `json:"owner"`
	Poster          string `json:"poster"`
	Title           string `json:"title"`
	Desc            string `json:"desc"`
	Category        string `json:"category"`
	ApiDoc          string `json:"apiDoc"`
	Price           string `json:"price"`
	DockerImageLink string `json:"dockerImageLink"`   // image name
	DefaultPort     int64  `json:"dockerDefaultPort"` // image port
}

// 查询agent信息
func Agents() ([]Agent, error) {
	response, err := http.Get(fmt.Sprintf("%s/agents", config.ServerAddress))
	if err != nil {
		return []Agent{}, err
	}
	defer response.Body.Close()
	var agents []Agent
	body, _ := io.ReadAll(response.Body)
	json.Unmarshal(body, &agents)
	return agents, nil
}

func startAgents(containers []types.Container) error {
	// 拉取agentinfo
	agents, err := Agents()
	if err != nil {
		return err
	}
	// agentinfo设置map缓存
	for _, agent := range agents {
		if agent.DefaultPort == 0 {
			continue
		}
		agentMap[agent.Id] = agent
		agentTempMap[agent.Id] = 0
	}
	// 记录已经跑起来的容器和端口，创建的时候略过
	for _, container := range containers {
		cname := strings.TrimLeft(container.Names[0], "/")
		if agent, ok := agentMap[cname]; ok {
			port := int64(container.Ports[0].PublicPort)
			hashPortMap[agent.Id] = port
			agentTempMap[agent.Id] = 1
			if index_Port <= port {
				index_Port = port + 1
			}
			continue
		}
	}
	// 从现有容器中最大的port往后跑
	for k, v := range agentTempMap {
		if v == 1 {
			continue
		}
		agent := agentMap[k]
		dockerfileds := DockerFileds{
			Image:         agent.DockerImageLink,
			Port:          agent.DefaultPort,
			HostPort:      index_Port,
			ContainerName: agent.Id,
		}
		err = startImage(dockerfileds)
		if err != nil {
			fmt.Printf("create ai agent [%s] canister failed, msg: %s\n", agent.Id, err.Error())
			continue
		}
		index_Port = index_Port + 1
	}
	return nil
}

func GetPort(hash string) int64 {
	return hashPortMap[hash]
}
