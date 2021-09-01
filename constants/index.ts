export const trackList: {
    txHash: string;
    nonce: number;
    from: string;
}[] = [];

export let lastBlockProcessed: number;

export function setLastBlockProcessed(block) {
    lastBlockProcessed = block;
}
