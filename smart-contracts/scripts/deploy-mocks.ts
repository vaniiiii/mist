import { ethers, network } from "hardhat";
import hre from "hardhat";
import {
  MockERC20,
  MockERC20__factory,
  MockERC721,
  MockERC721__factory,
} from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    `ℹ️  Attempting to deploy the MockERC20 smart contract to the ${hre.network.name} blockchain using ${deployer.address} address`
  );

  const mockERC20Factory: MockERC20__factory =
    (await hre.ethers.getContractFactory(
      "contracts/mocks/MockERC20.sol:MockERC20"
    )) as MockERC20__factory;

  const mockERC20Deployer: MockERC20 = await mockERC20Factory
    .connect(deployer)
    .deploy();

  const mockERC20 = await mockERC20Deployer.waitForDeployment();
  console.log("✅ MockERC20:", await mockERC20.getAddress());

  await new Promise((resolve) => setTimeout(resolve, 50000));

  try {
    await hre.run(`verify:verify`, {
      address: await mockERC20.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    console.log(
      `❌ Failed to verify the MockERC20 smart contract on Etherscan: ${error}`
    );
  }

  console.log(
    `ℹ️  Attempting to deploy the MockERC721 smart contract to the ${hre.network.name} blockchain using ${deployer.address} address`
  );

  const mockERC721Factory: MockERC721__factory =
    (await hre.ethers.getContractFactory(
      "contracts/mocks/MockERC20.sol:MockERC721"
    )) as MockERC721__factory;

  const mockERC721Deployer: MockERC721 = await mockERC721Factory
    .connect(deployer)
    .deploy();

  const mockERC721 = await mockERC721Deployer.waitForDeployment();
  console.log("✅ MockERC721:", await mockERC721.getAddress());

  await new Promise((resolve) => setTimeout(resolve, 50000));

  try {
    await hre.run(`verify:verify`, {
      address: await mockERC721.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    console.log(
      `❌ Failed to verify the MockERC721 smart contract on Etherscan: ${error}`
    );
  }

  console.log("✅ All smart contracts have been deployed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
