import { ethers, network } from "hardhat";
import hre from "hardhat";
import {
  KeyRegistry,
  KeyRegistry__factory,
  Myst,
  Myst__factory,
} from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    `ℹ️  Attempting to deploy the Key Registry smart contract to the ${hre.network.name} blockchain using ${deployer.address} address`
  );

  const keyRegistryFactory: KeyRegistry__factory =
    (await hre.ethers.getContractFactory(
      "KeyRegistry"
    )) as KeyRegistry__factory;

  const keyRegistryDeployer: KeyRegistry = await keyRegistryFactory
    .connect(deployer)
    .deploy();

  const keyRegistry = await keyRegistryDeployer.waitForDeployment();
  console.log("✅ Key Registry:", await keyRegistry.getAddress());

  await new Promise((resolve) => setTimeout(resolve, 50000));

  try {
    await hre.run(`verify:verify`, {
      address: await keyRegistry.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    console.log(
      `❌ Failed to verify the Key Registry smart contract on Etherscan: ${error}`
    );
  }

  console.log(
    `ℹ️  Attempting to deploy the Myst smart contract to the ${hre.network.name} blockchain using ${deployer.address} address`
  );

  const mystFactory: Myst__factory = (await hre.ethers.getContractFactory(
    "Myst"
  )) as Myst__factory;

  const mystDeployer: Myst = await mystFactory.connect(deployer).deploy();

  const myst = await mystDeployer.waitForDeployment();
  console.log("✅ Myst:", await myst.getAddress());

  await new Promise((resolve) => setTimeout(resolve, 50000));

  try {
    await hre.run(`verify:verify`, {
      address: await myst.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    console.log(
      `❌ Failed to verify the Myst smart contract on Etherscan: ${error}`
    );

    console.log("✅ All smart contracts have been deployed successfully");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
