import { ethers } from 'ethers';

export async function getETHPrice(currency: string = 'usd'): Promise<number> {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currency}`);
        const data = await response.json();
        return data.ethereum[currency] || 0;
    } catch (error) {
        console.error('Failed to fetch ETH price:', error);
        return 3000;
    }
}

export async function convertFiatToETH(amountInFiat: number, currency: string = 'usd'): Promise<string> {
    try {
        const ethPrice = await getETHPrice(currency);
        const ethAmount = amountInFiat / ethPrice;
        return ethAmount.toFixed(6);
    } catch (error) {
        console.error('Failed to convert fiat to ETH:', error);
        return '0.0001';
    }
}

export function formatWeiToEth(wei: string | bigint): string {
    const eth = ethers.formatEther(typeof wei === 'string' ? wei : wei.toString());
    return parseFloat(eth).toFixed(6);
}

export function formatEthToWei(eth: string | number): string {
    const wei = ethers.parseEther(typeof eth === 'string' ? eth : eth.toString());
    return wei.toString();
}
