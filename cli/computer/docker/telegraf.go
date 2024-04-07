package docker

import (
	"github.com/docker/docker/api/types"
	"os/exec"
	"strings"
)

const git_local = "https://github.com/apuslabs/solana-hackthon-images.git"
const container_telegraf = "telegraf"
const container_influxdb = "influxdb"

// 拉取docker-compose.yaml 执行docker-compose up -d
func startTelegraf(containers []types.Container) {
	// 判断是否已经有telegraf
	telegrafFlag := false
	influxdbFlag := false
	for _, container := range containers {
		if strings.Contains(container.Names[0], container_telegraf) {
			telegrafFlag = true
		}
		if strings.Contains(container.Names[0], container_influxdb) {
			influxdbFlag = true
		}
	}
	// 两个都启动才不执行up -d
	if telegrafFlag && influxdbFlag {
		return
	}
	downLoad()
	start()
}

func downLoad() {
	_, err := exec.Command("git", "clone", git_local).Output()
	if err != nil {
		panic("down load telegraf failed; error msg:" + err.Error())
	}
}

func start() {
	cmd := exec.Command("docker-compose", "up", "-d")
	cmd.Dir = "./solana-hackthon-images"
	err := cmd.Run()
	if err != nil {
		panic("cmd [docker-compose up -d] failed; error msg:" + err.Error())
	}
}
