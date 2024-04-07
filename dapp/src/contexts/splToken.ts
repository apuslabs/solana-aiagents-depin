import { useContext, useEffect, useState } from "react";
// import { TokenAddress } from "../utils/constant";
import { ConnectionContext } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TokenAccountNotFoundError, getAccount, getMint, getAssociatedTokenAddress } from '@solana/spl-token'
import { mintAccount } from "./const";

async function getTokenBalanceSpl(connection: Connection, tokenAccount: PublicKey) {
    const info = await getAccount(connection, tokenAccount);
    const amount = Number(info.amount);
    const mint = await getMint(connection, info.mint);
    const balance = amount / (10 ** mint.decimals);
    return balance;
}

export function useSPLTokens(tokenAccount: PublicKey | null) {
    const { connection } = useContext(ConnectionContext)
    const [balance, setBalance] = useState<number | null>(null);
    useEffect(() => {
        if (!tokenAccount) return;
        getAssociatedTokenAddress(mintAccount, tokenAccount).then(tokenATA => {
            getTokenBalanceSpl(connection, tokenATA)
                .then(setBalance)
                .catch(err => {
                    if (TokenAccountNotFoundError.name === err.name) {
                        setBalance(0);
                    }
                });
        }).catch(() => {
            setBalance(0)
        })
    }, [tokenAccount, connection])
    return { balance }
}