package monitor

import (
	"context"
	"fmt"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"solana-hackthon-cli/config"
	"strings"
	"time"
)

var client influxdb2.Client
var queryAPI api.QueryAPI

var health = false

func GetHealth() bool {
	return health
}

func Init() GpuNode {
	if config.SkipGpu {
		return GpuNode{CpuCores: 8, Memory: 1024, Storage: 1024, GpuCardModel: "NVIDIA RTX 4090"}
	}
	client = influxdb2.NewClient(config.Influx_url, config.Influx_token)
	queryAPI = client.QueryAPI(config.Influx_org)
	core := GetCpu()
	fmt.Println("cpu core numer : ", core)
	memory := GetMemory() / (1024 * 1024)
	fmt.Printf("memory size : %d MB\n", memory)
	disk := GetDisk() / (1024 * 1024 * 1024)
	fmt.Printf("disk size : %d GB\n", disk)
	cardName := GetGpu()
	fmt.Println("GpuCardModel : ", cardName)
	return GpuNode{CpuCores: core, Memory: memory, Storage: disk, GpuCardModel: cardName}
}

func RefreshHealth() {
	ticker := time.NewTicker(config.Influx_Health_Refresh_Time * time.Second)
	go func() {
		for {
			select {
			case <-ticker.C:
				if config.SkipGpu {
					health = false
					return
				}
				health = false
				defer func() {
					if err := recover(); err != nil {
						fmt.Println(" refresh health error; msg:", err)
					}
				}()
				query := `from(bucket: "gpu")
						  |> range(start: -1m)
						  |> filter(fn: (r) => r["_measurement"] == "nvidia_smi")
						  |> filter(fn: (r) => r["_field"] == "utilization_gpu")
						  |> keep(columns: ["_time", "name", "_value", "uuid"])`
				result, err := queryAPI.Query(context.Background(), query)
				if err != nil {
					panic(err)
				}
				if result.Err() != nil {
					panic(result.Err())
				}
				defer result.Close()

				usePreMap := make(map[string]int, 0)
				for result.Next() {
					record := result.Record()
					if _, ok := record.Values()["uuid"]; !ok {
						continue
					}
					cardUid := record.ValueByKey("uuid").(string)
					usePre := record.Value().(int)
					usePreMap[cardUid] = usePre
				}

				for _, value := range usePreMap {
					if value <= 50 {
						health = true
					}
				}
				health = false
			}
		}
	}()
}

func GetCpu() int {
	query := `from(bucket: "gpu")
			  |> range(start: -2m)
			  |> filter(fn: (r) => r["_measurement"] == "cpu")
			  |> filter(fn: (r) => r["_field"] == "usage_user")
			  |> yield(name: "mean")
			  |> last()
			  |> group()
			  |> count()`
	result, err := queryAPI.Query(context.Background(), query)
	if err != nil {
		panic(err)
	}
	if result.Err() != nil {
		panic(result.Err())
	}
	defer result.Close()
	cpus := make(map[string]string, 0)
	for result.Next() {
		record := result.Record()
		if _, ok := record.Values()["cpu"]; !ok {
			continue
		}
		cpu := record.Values()["cpu"].(string)
		if strings.Contains(cpu, "-total") {
			continue
		}
		cpus[cpu] = cpu
	}
	return len(cpus)
}

func GetMemory() int64 {
	query := `from(bucket: "gpu")
			  |> range(start: -2m)
			  |> filter(fn: (r) => r["_measurement"] == "mem")
			  |> filter(fn: (r) => r["_field"] == "total")
			  |> yield(name: "mean")`
	result, err := queryAPI.Query(context.Background(), query)
	if err != nil {
		panic(err)
	}
	if result.Err() != nil {
		panic(result.Err())
	}
	defer result.Close()
	result.Next()
	record := result.Record()
	// Bytes
	return record.Value().(int64)
}

func GetDisk() int64 {
	query := `from(bucket: "gpu")
			  |> range(start: -2m)
			  |> filter(fn: (r) => r["_measurement"] == "disk")
			  |> filter(fn: (r) => r["_field"] == "total")
			  |> filter(fn: (r) => r["path"] == "/")
			  |> group(columns: ["_time"], mode: "by")
			  |> sum()
			  |> group()
			  |> yield(name: "sum")`
	result, err := queryAPI.Query(context.Background(), query)
	if err != nil {
		panic(err)
	}
	if result.Err() != nil {
		panic(result.Err())
	}
	defer result.Close()
	result.Next()
	record := result.Record()
	// Bytes
	return record.Value().(int64)
}

func GetGpu() string {
	query := `from(bucket: "gpu")
			  |> range(start: -2m)
			  |> filter(fn: (r) => r["_measurement"] == "nvidia_smi")
			  |> filter(fn: (r) => r["_field"] == "memory_total")
			  |> keep(columns: ["_time", "name", "_value", "uuid"])`
	result, err := queryAPI.Query(context.Background(), query)
	if err != nil {
		panic(err)
	}
	if result.Err() != nil {
		panic(result.Err())
	}
	defer result.Close()
	result.Next()
	record := result.Record()
	cardName := record.ValueByKey("name").(string)
	return cardName
	//cards := make(map[string]Card, 0)
	//for result.Next() {
	//	record := result.Record()
	//	if _, ok := record.Values()["uuid"]; !ok {
	//		continue
	//	}
	//	cardUid := record.ValueByKey("uuid").(string)
	//	cardName := record.ValueByKey("name").(string)
	//	// MB
	//	cardMemory := record.Value().(int64)
	//	card := Card{Name: cardName, Memory: cardMemory}
	//	cards[cardUid] = card
	//}
	//cardArr := make([]Card, 0)
	//for _, value := range cards {
	//	cardArr = append(cardArr, value)
	//}
	//return cardArr
}
