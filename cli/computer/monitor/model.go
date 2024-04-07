package monitor

type Card struct {
	Name   string `json:"name"`
	Memory int64  `json:"memory"` // MB
}

type GpuNode struct {
	Id       string `json:"id"`
	Sk       []byte `json:"sk"`
	Owner    string `json:"gpuNodeOwner"`
	CpuCores int    `json:"cpuCores"`
	Memory   int64  `json:"memory"`  // MB
	Storage  int64  `json:"storage"` // GB
	//CudaVersion string `json:"cuda_version"`
	//Cards    []Card `json:"cards"`
	GpuCardModel string `json:"gpuCardModel"`
	Price        string `json:"price"`
	Endpoint     string `json:"endpoint"` // ip or domain
}
