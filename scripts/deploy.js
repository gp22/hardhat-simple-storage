const { ethers, run, network } = require('hardhat')

async function deploy() {
  const SimpleStorageFactory = await ethers.getContractFactory('SimpleStorage')

  console.log('Deploying contract...')

  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.deployed()

  console.log(`Deployed contract to: ${simpleStorage.address}`)

  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block tx's...")
    await simpleStorage.deployTransaction.wait(6)
    await verify(simpleStorage.address, [])
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current value is: ${currentValue}`)

  // Update current value.
  const transactionRepsonse = await simpleStorage.store(7)
  await transactionRepsonse.wait(1)
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated value is ${updatedValue}`)
}

async function verify(contractAddress, args) {
  console.log('Verifying contract...')
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    console.log(e)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
