package server

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

type Health struct {
	Busy bool  `json:"busy"`
	Port int64 `json:"port"`
}
