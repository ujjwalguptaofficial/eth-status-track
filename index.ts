import * as path from "path";
import { Fort } from "fortjs";
import { routes } from "./routes";
import dotenv from 'dotenv';

import Web3 from "web3";
import { trackList, lastBlockProcessed, setLastBlockProcessed } from "./constants";


const runTrackBlock = async (web3: Web3) => {
    if (trackList.length > 0) {
        const currentBlock = (await web3.eth.getBlockNumber()) - 1;
        if (lastBlockProcessed == null) {
            setLastBlockProcessed(currentBlock);
        }

        //   console.log("chainId", await web3.eth.net.getId());

        //process block
        const blockDifference = currentBlock - lastBlockProcessed;
        console.log("blockDifference", blockDifference);

        while (currentBlock - lastBlockProcessed > 0) {
            let blockToProcess = currentBlock + 1;
            console.log("processing block", blockToProcess);
            const block = await web3.eth.getBlock(blockToProcess, true);
            console.log("block", block);
            block.transactions.forEach(tx => {

                // move trackList to db for real time 
                const txToTrackIndex = trackList.findIndex(q => q.from === tx.from && q.nonce === tx.nonce);
                const txToTrack = trackList[txToTrackIndex];
                if (txToTrack) {
                    console.log("txTOTrackFound")
                    if (txToTrack.txHash === tx.hash) {
                        console.log("tx done");
                        // send to webhook
                    }
                    else {
                        console.log("tx dropped, speedup, replaced");
                    }
                   // process.exit(0);
                    trackList.splice(txToTrackIndex, 1);
                }
            })
            setLastBlockProcessed(blockToProcess);
        }
    }


    setTimeout(() => {
        runTrackBlock(web3);
    }, 2000);
}

export const createApp = async () => {
    dotenv.config({
        // path:"../"
    });
    Fort.folders = [{
        alias: "/",
        path: path.join(__dirname, "../static")
    }];
    Fort.routes = routes;
    await Fort.create();
    process.env.APP_URL = `http://localhost:${Fort.port}`;
};
if (process.env.NODE_ENV !== "test") {
    createApp().then(() => {
        Fort.logger.debug(`Your fort is located at address - ${process.env.APP_URL}`);
        const rpc = process.env.RPC || 'https://rpc-mumbai.matic.today'
        console.log("runing on rpc", rpc);
        runTrackBlock(new Web3(rpc));
    }).catch(err => {
        console.error(err);
    });
}

