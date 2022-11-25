/* TESTNET */
export const Networks = {
  Testnet: {
    chainId: `0x${Number(process.env.REACT_APP_CHAIN_ID).toString(16)}`,
    chainName: process.env.REACT_APP_NETWORK,
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },

    rpcUrls: [
      "https://data-seed-prebsc-1-s1.binance.org:8545",
      "https://data-seed-prebsc-1-s2.binance.org:8545",
      "https://data-seed-prebsc-1-s3.binance.org:8545",
      "https://data-seed-prebsc-2-s2.binance.org:8545",
      "https://data-seed-prebsc-2-s3.binance.org:8545",
    ],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
  Smartchain: {
    chainId: `0x${Number(process.env.REACT_APP_CHAIN_ID).toString(16)}`,
    chainName: process.env.REACT_APP_NETWORK,
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },

    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
      "wss://bsc-ws-node.nariox.org",
    ],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  Mumbai: {
    chainId: `0x${Number(process.env.REACT_APP_CHAIN_ID).toString(16)}`,
    chainName: process.env.REACT_APP_NETWORK,
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },

    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
};

/* MAINNET */
// export const Networks = {
//   Smartchain: {
//     chainId: `0x${Number(process.env.REACT_APP_CHAIN_ID).toString(16)}`,
//     chainName: process.env.REACT_APP_NETWORK,
//     nativeCurrency: {
//       name: "Binance Chain Native Token",
//       symbol: "BNB",
//       decimals: 18,
//     },

//     rpcUrls: [
//       "https://bsc-dataseed1.binance.org",
//       "https://bsc-dataseed2.binance.org",
//       "https://bsc-dataseed3.binance.org",
//       "https://bsc-dataseed4.binance.org",
//       "https://bsc-dataseed1.defibit.io",
//       "https://bsc-dataseed2.defibit.io",
//       "https://bsc-dataseed3.defibit.io",
//       "https://bsc-dataseed4.defibit.io",
//       "https://bsc-dataseed1.ninicoin.io",
//       "https://bsc-dataseed2.ninicoin.io",
//       "https://bsc-dataseed3.ninicoin.io",
//       "https://bsc-dataseed4.ninicoin.io",
//       "wss://bsc-ws-node.nariox.org",
//     ],
//     blockExplorerUrls: ["https://bscscan.com"],
//   },
// };
