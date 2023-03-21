require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: "4403d20c-9317-44bd-ae14-eba31d8a9afc"
  }
};
