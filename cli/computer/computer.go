package computer

import (
	"fmt"
	"os/exec"
	"regexp"
	"solana-hackthon-cli/computer/docker"
	"solana-hackthon-cli/computer/monitor"
	"solana-hackthon-cli/config"
	"strings"
	"time"
)

var cuda_version string

// 检查 nvidia-smi 查看是否有检查docker环境版本
func Init() monitor.GpuNode {
	if !config.SkipGpu {
		cuda_version = CheckNvidiaSmi()
		fmt.Println("cuda version: ", cuda_version)
		GpuCardCheck()
	}

	CheckGit()
	CheckDocker()
	CheckDockerCompose()

	docker.Init()
	// 最好等一段时间,等基础信息启动并且执行有数据
	time.Sleep(time.Duration(120) * time.Second)

	node := monitor.Init()
	monitor.RefreshHealth()
	return node
}

func CheckNvidiaSmi() string {
	informationByte, err := exec.Command("nvidia-smi").Output()
	if err != nil {
		panic("cmd nividia-smi error; msg:" + err.Error())
	}
	info := string(informationByte)
	result := regexp.MustCompile("CUDA Version:\\s+(\\d+(\\.\\d+)+)").FindString(info)
	return regexp.MustCompile("\\d+(\\.\\d+)+").FindString(result)
}

func GpuCardCheck() {
	infomationByte, err := exec.Command("nvidia-smi", "-L").Output()
	if err != nil {
		panic("cmd nividia-smi error; msg:" + err.Error())
	}
	info := string(infomationByte)
	if !strings.Contains(info, "UUID") {
		panic("not found GPU")
	}
}

func CheckDocker() {
	dockerVersionByte, err := exec.Command("docker", "-v").Output()
	if err != nil {
		panic("cmd docker version error; msg:" + err.Error())
	}
	version := regexp.MustCompile("\\d+(\\.\\d+)+").FindString(string(dockerVersionByte))
	fmt.Println("docker version: ", version)
}

func CheckDockerCompose() {
	dockerVersionByte, err := exec.Command("docker-compose", "-v").Output()
	if err != nil {
		panic("cmd docker-compose -v error; msg:" + err.Error())
	}
	version := regexp.MustCompile("\\d+(\\.\\d+)+").FindString(string(dockerVersionByte))
	fmt.Println("docker-compose version: ", version)
}

func CheckGit() {
	_, err := exec.Command("git", "version").Output()
	if err != nil {
		panic("cmd git version error; msg:" + err.Error())
	}
}
