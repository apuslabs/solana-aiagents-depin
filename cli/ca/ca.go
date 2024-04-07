package ca

import (
	"encoding/json"
	"fmt"
	"github.com/blocto/solana-go-sdk/types"
	"io"
	"os"
)

var pubkey_file = "/etc/apus-miner-pubkey-id.json"

type KeyPaire struct {
	Pubkey    string `json:"pubkey"`
	SecretKey []byte `json:"secretKey"`
}

var keyPaire KeyPaire

func Init() {
	// 判断是否需要初始化 pubkeyid, 不存在则创建pubkeyid，存在则读取放到模块变量中
	_, err := os.Stat(pubkey_file)
	if err == nil {
		ReadLocalKey()
	} else {
		GenerateKey()
	}
}

func GenerateKey() {
	wallet := types.NewAccount()
	pubkeyid := wallet.PublicKey.ToBase58()
	fmt.Printf("pubkey-id: %s\n", pubkeyid)

	keyPaire = KeyPaire{Pubkey: pubkeyid, SecretKey: wallet.PrivateKey.Seed()}
	content, err := json.Marshal(keyPaire)
	if err != nil {
		panic(err)
	}
	f, err := os.Create(pubkey_file)
	defer f.Close()
	if err != nil {
		panic(err)
	}
	_, err = f.Write(content)
	if err != nil {
		panic(err)
	}
}

func ReadLocalKey() {
	f, err := os.Open(pubkey_file)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	contentByte, err := io.ReadAll(f)
	err = json.Unmarshal(contentByte, &keyPaire)
	fmt.Printf("pubkey: %s\n", keyPaire.Pubkey)
	if err != nil {
		panic(err)
	}
}

func GetPubkey() KeyPaire {
	return keyPaire
}
