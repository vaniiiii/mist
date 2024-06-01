import { useState, useEffect } from 'react';
import { Card, ConnectButton, ReconnectButton } from '../../components';
import { defaultSnapOrigin } from '../../config';
import {
  useInvokeSnap,
  useMetaMask,
  useMetaMaskContext,
  useRequestSnap,
} from '../../hooks';
import { isLocalSnap, shouldDisplayReconnectButton } from '../../utils';
import styled from 'styled-components';
import { ethers, hexlify, toUtf8Bytes } from 'ethers';
import { Maybe } from '@metamask/providers/dist/types/utils';
import toast, { Toaster } from 'react-hot-toast';
import { Spinner } from 'react-bootstrap';
import { KEY_REGISTRY } from '../../abis/KeyRegistry';

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
  width: 30vw;
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

interface MistState {
  spendingPublicKey: string;
  viewingPublicKey: string;
}

const CONTRACT_ADDRESS = '0xB975979f60EE73A9b0E807cD11634300d1f26644';

const SetupPage = () => {
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [mistKeys, setMistKeys] = useState<any>(null);

  const { error, provider } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  useEffect(() => {
    const readState = async () => {
      const snapState = await getSnapState();

      if (snapState === null) return;
      setKeysGenerated(true);
      setMistKeys(snapState);
    };
  }, []);

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  const [message, setMessage] = useState(
    'Sign this message to access your Mist account.',
  );

  const connectWalletBlock = () => {
    return (
      <>
        <InfoBlockText>Connect your wallet to setup your account</InfoBlockText>
        <DFlex>
          <MAuto>
            <ConnectButton onClick={requestSnap} disabled={!isMetaMaskReady} />
          </MAuto>
        </DFlex>
      </>
    );
  };

  const signMessage = async () => {
    setLoadingSetup(true);
    const msg = hexlify(toUtf8Bytes(message));

    const accounts: Maybe<string[]> = await provider?.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || !accounts[0])
      return toast.error("Can't acquire users accounts");

    const signature: Maybe<string> = await provider?.request({
      method: 'personal_sign',
      params: [msg, accounts[0]],
    });

    if (!signature) return toast.error('Error signing the message');

    const sig1 = signature.slice(2, 66);
    const sig2 = signature.slice(66, 130);

    const hashedV = ethers.sha256('0x' + sig1);
    const hashedR = ethers.sha256('0x' + sig2);
    const n = ethers.getBigInt(
      '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141',
    );

    const privateKey1 = ethers.getBigInt(hashedV) % n;
    const privateKey2 = ethers.getBigInt(hashedR) % n;

    const keyPair1 = new ethers.Wallet('0x' + privateKey1.toString(16));
    const keyPair2 = new ethers.Wallet('0x' + privateKey2.toString(16));

    const spendingPublicKey = keyPair1.signingKey.compressedPublicKey;
    const viewingPublicKey = keyPair2.signingKey.compressedPublicKey;

    await invokeSnap({
      method: 'updateState',
      params: {
        spendingPublicKey,
        viewingPublicKey,
        spendingPrivateKey: keyPair1.privateKey,
        viewingPrivateKey: keyPair2.privateKey,
      },
    });

    await registerKeyContract({
      spendingPublicKey,
      viewingPublicKey
    });
    setLoadingSetup(false);
    toast.success('Successfully Generated Mist Keys');
  };

  const registerKeyContract = async (state: MistState) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      KEY_REGISTRY,
      signer,
    );

    if(!contract) return;

    let {spendingPublicKey, viewingPublicKey} = state;

    console.log(spendingPublicKey);
    console.log(viewingPublicKey);

    const parsePublicKey = (publicKey: string) => {
      const hexString = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
      const prefix = parseInt(hexString.slice(0, 2), 16);
      const key = BigInt('0x' + hexString.slice(2));
      return { prefix, key };
    };

    const { prefix: spendingPubKeyPrefix, key: spendingPubKey } = parsePublicKey(spendingPublicKey);
    const { prefix: viewingPubKeyPrefix, key: viewingPubKey } = parsePublicKey(viewingPublicKey);


    console.log(spendingPubKeyPrefix);
    console.log(viewingPubKeyPrefix);
    console.log(spendingPubKey);
    console.log(viewingPubKey);

    try {
      // @ts-ignore
      const tx = await contract.setStealthMetaAddress(
        spendingPubKeyPrefix,
        spendingPubKey,
        viewingPubKeyPrefix,
        viewingPubKey
      );
      
      // Optionally, you can wait for the transaction to be mined
      await tx.wait();
      
      console.log('Stealth meta address registered successfully');
    }catch(e) {
      console.log(e)
    }
  };

  const getSnapState = async () => {
    setLoadingSetup(true);
    const state = await invokeSnap({
      method: 'getState',
    });

    setKeysGenerated(true);
    setMistKeys(state);
    setLoadingSetup(false);
    return state;
  };

  const keysGeneratedBlock = () => {
    return <>{mistKeys.spendingPublicKey}</>;
  };

  const signMessageBlock = () => {
    return (
      <SignContent>
        <SignTitle>Generate and Publish Stealth Keys</SignTitle>
        <InfoBlockText>
          Use the button below to complete the setup process
        </InfoBlockText>
        <DFlex>
          <MAuto>
            {loadingSetup ? (
              <Spinner />
            ) : (
              <>
                <SetupButton onClick={signMessage}>Setup</SetupButton>
                <SetupButton onClick={getSnapState}>Setup</SetupButton>
              </>
            )}
          </MAuto>
        </DFlex>
      </SignContent>
    );
  };

  return (
    <Container>
      <Toaster position="top-right" reverseOrder={false} />
      <Heading>Setup</Heading>
      <InfoBlock>
        {!installedSnap && connectWalletBlock()}
        {installedSnap && !keysGenerated && signMessageBlock()}
        {keysGenerated && keysGeneratedBlock()}
      </InfoBlock>
    </Container>
  );
};

export default SetupPage;
