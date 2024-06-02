import { useEffect, useState } from 'react';
import {
  useInvokeSnap,
  useMetaMask,
  useMetaMaskContext,
  useRequestSnap,
} from '../../hooks';
import styled from 'styled-components';
import { MistState } from '../setup-page/SetupPage';
import { ethers, hexlify } from 'ethers';
import * as sha3 from 'js-sha3';
import * as secp from '@noble/secp256k1';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin: auto;
  font-weight: 900;
  margin-top: 0;
  margin-bottom: 2rem;
`;

const InfoBlock = styled.div`
  width: 40vw;
  min-height: 20vh;
  background-color: ${({ theme }) => theme.colors.card?.default};

  border-radius: 7px;
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  padding: 10px;
`;

const InfoBlockText = styled.p`
  text-align: center;
`;

const DFlex = styled.div`
  display: flex;
`;

const MAuto = styled.div`
  margin: auto;
  margin-top: 2rem;
`;

const SignContent = styled.div`
  padding: 10px;
`;

const SetupButton = styled.button`
  width: 10rem;
  height: 1rem;
`;

const SignTitle = styled.div`
  font-size: 28px;
  text-align: center;

  margin-bottom: 1rem;
`;

const UserKeys = styled.div`
  text-align: center;
`;
window.Buffer = window.Buffer || require('buffer').Buffer;

const InfoPage = () => {
  const { error, provider } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const [privateLoaded, setPrivateLoaded] = useState(false);

  let fromBlock = 0;
  const providerJsonRpc = new ethers.JsonRpcProvider(
    'https://sepolia.gateway.tenderly.co',
  );

  const contractAddress = '0x6f4ef23960C89145896ee15140128e1b93925668';

  const contractABI = [
    'event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)',
  ];

  async function pollForEvents(blocksToQuery = 5000) {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      providerJsonRpc,
    );

    const latestBlock = await providerJsonRpc.getBlockNumber();
    if (fromBlock === 0) {
      fromBlock = latestBlock - blocksToQuery;
    }

    const eventInterface = new ethers.Interface(contractABI);

    const events = await contract.queryFilter(
      'Announcement',
      fromBlock,
      latestBlock,
    );

    const eventsFormatted = await Promise.all(
      events.map(async (event) => {
        const parsedLog = eventInterface.parseLog(event);
        const { transactionHash } = event;
        const transaction = await providerJsonRpc.getTransaction(
          transactionHash,
        );
        const valueInEther = ethers.formatEther(
          transaction?.value ?? BigInt(0),
        );
        return {
          schemeId: parsedLog?.args.schemeId.toString(),
          stealthAddress: parsedLog?.args.stealthAddress,
          caller: parsedLog?.args.caller,
          ephemeralPubKey: ethers.hexlify(parsedLog?.args.ephemeralPubKey),
          metadata: ethers.hexlify(parsedLog?.args.metadata),
          valueInEther,
        };
      }),
    );

    return {
      eventsLength: events.length,
      latestBlock,
      eventsFormatted,
      fromBlock,
      events,
    };
  }

  /**
   * Get the latest event from the contract.
   */
  async function getEvents() {
    const { eventsFormatted, latestBlock } = await pollForEvents();
    fromBlock = latestBlock;
    if (eventsFormatted.length === 0) {
      return undefined;
    }
    return eventsFormatted.at(-1); // just for hackathon
  }

  const getSnapState = async () => {
    const state = (await invokeSnap({
      method: 'getState',
    })) as Promise<MistState>;

    return state;
  };

  const calculatePrivateKey = async () => {
    setPrivateLoaded(true);

    const state = await getSnapState();

    const lastEvent = await getEvents();
    const stealth = lastEvent?.stealthAddress;
    console.log(lastEvent);

    const ephemeralSliced = (lastEvent?.ephemeralPubKey as string).slice(2);
    const ephemeralPadded = ephemeralSliced.padStart(64, '0');
    const ephemeralPoint = secp.Point.fromHex(ephemeralPadded);
    
    const sharedSecret = secp.getSharedSecret(
      BigInt(state.viewingPrivateKey as string).toString(16),
      ephemeralPoint,
    );

    const hashedSharedSecret = sha3.keccak_256(
      Buffer.from(sharedSecret.slice(1)),
    );
    const hashedSharedSecretBigInt = BigInt('0x' + hashedSharedSecret);
    const n =
      '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141';
    const myPrivateKey =
      (BigInt(hashedSharedSecret) +
        BigInt((state.spendingPrivateKey as string))) %
      BigInt(n);

    console.log(myPrivateKey.toString(16));
  };

  const revealBlock = () => {
    return (
      <>
        <InfoBlockText>
          Click the button to calculate your private key{' '}
        </InfoBlockText>
        <DFlex>
          <MAuto>
            <SetupButton onClick={calculatePrivateKey}>Calculate</SetupButton>
          </MAuto>
        </DFlex>
      </>
    );
  };

  return (
    <Container>
      <Heading>Info</Heading>
      {!privateLoaded && revealBlock()}
    </Container>
  );
};

export default InfoPage;
