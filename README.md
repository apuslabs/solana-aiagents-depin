# Apus AIAgents DePIN

This Project works for solana 2024 hackthon

## Pitch Video: [https://youtu.be/FnBgjGDlMX8](https://youtu.be/FnBgjGDlMX8)
## Demo  Video: [https://youtu.be/XmX2lvm1khY](https://youtu.be/XmX2lvm1khY)

## Project structure

```
solana-aiagents-depin
|-- program
|  |-- app :delegate and realyer for dapp
|  |-- programs :solana sbf
|-- cli :cli for gpu nodes
|-- cosnole :console for miners & developers
|-- dapp :playground for users
|-- images
|  |-- comfyui :example aiagent of comfyui
|  |-- monitor :monitor using telegraf for cli
```
## Dev Repo
https://github.com/apuslabs/solana-hackthon-program

https://github.com/apuslabs/solana-hackthon-cli

https://github.com/apuslabs/solana-hackthon-relayer

https://github.com/apuslabs/solana-hackthon-playground

https://github.com/apuslabs/solana-hackthon-images

https://github.com/apuslabs/apus-website

## How to use

### cli

```shell
cd cli
go run main.go

# build
export GOOS=linux
go build

# use
solana-hackthon-cli --ownerpubkey <YOUR PUBKEY> --price 1 --endpoint http://<YOUR>:80
```

### console

```shell
cd console
npm install
npm run dev
```

### dapp

```shell
cd dapp
npm install
npm run dev
```

### images

```shell
cd images/comfyui
docker compose --profile download
cd services/comfy
docker build -t apuslabs/comfyui
```

```shell
cd images/monitor
docker compose up -d
```

### program

```shell
cd program
anchor build
anchor deploy

# relayer
npm install
npm run start
```

## Demo Config

Our Demo is built on Solana Devnet

- Porgram Address: `47VwehJMrzhe4i4JeKX2crv6fKYoEMhZPG8Bv8gRJ27v`
- Mint Address: `CrhmSkC19d8QeeBK5kUtreXfg1wvWvvVZhBTRjbmY18m`
- Approve Delegate Address: `5cs2T6hG7M39Yc22BrvHh6ESEFc9U8RXodseXR1eWTu4`

- Console Href: `https://apus.network`
- Playground Href: `https://solplayground.apus.network`
- Realyer API Endpoint: `https://solapi.apus.network`

Playground Customer Account

```json
[218,144,38,45,96,242,65,55,115,31,139,40,30,250,95,222,121,188,226,97,51,61,255,151,121,81,103,183,211,48,131,206,153,211,127,82,216,62,80,182,67,48,245,91,113,68,220,139,163,157,18,86,174,109,185,31,37,95,226,237,98,200,3,172]
```

Console GPU Supplier Accout

```json
[200,215,240,146,18,25,123,39,107,203,29,53,253,25,53,190,167,221,77,229,225,84,140,127,7,223,215,79,176,127,222,242,148,25,186,50,80,25,26,27,212,178,172,86,232,123,91,220,124,117,66,12,186,62,207,86,145,178,142,193,79,19,159,91]
```

## How to use our Demo

you can simply click[ https://apus.network](url)

1. navigate to `Cosnsole`, Follow intrstutions adding your GPU Nodes
2. navigate to `Playground`, Login & Hit generate
3. navigate to `Task`, check the transcations
