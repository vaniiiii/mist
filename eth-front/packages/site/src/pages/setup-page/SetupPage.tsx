import type { Maybe } from '@metamask/providers/dist/types/utils';
import * as secp from '@noble/secp256k1';
import { ethers, hexlify, toUtf8Bytes } from 'ethers';
import * as sha3 from 'js-sha3';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';
import styled from 'styled-components';

import { KEY_REGISTRY } from '../../abis/KeyRegistry';
import { ConnectButton } from '../../components';
import { defaultSnapOrigin } from '../../config';
import {
  useInvokeSnap,
  useMetaMask,
  useMetaMaskContext,
  useRequestSnap,
} from '../../hooks';
import { isLocalSnap } from '../../utils';

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

export type MistState = {
  spendingPublicKey: string;
  viewingPublicKey: string;
  spendingPrivateKey?: string;
  viewingPrivateKey?: string;
};

const REGISTRY_CONTRACT_ADDRESS = '0xC77484F08f260c571922C112C2AB671093ce1fA9';
window.Buffer = window.Buffer || require('buffer').Buffer;

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

      if (snapState === null) {
        return;
      }
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

  const getUserAddress = async () => {
    const accounts: Maybe<string[]> = await provider?.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || !accounts[0]) {
      return toast.error("Can't acquire users accounts");
    }

    return accounts[0];
  };

  const convert = (uint8Arr: Uint8Array) => {
    const { length } = uint8Arr;

    const buffer = Buffer.from(uint8Arr);
    const result = buffer.readUIntBE(0, length);

    return result;
  };

  const uint8ArrayToHex = (arr: Uint8Array) => {
    return `0x${Array.from(arr, (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('')}`;
  };

  // Helper function to convert hex string to BigInt
  const hexToBigInt = (hex: string) => {
    return BigInt(hex);
  };

  const signMessage = async () => {
    setLoadingSetup(true);
    const msg = hexlify(toUtf8Bytes(message));

    const account = await getUserAddress();

    const signature: Maybe<string> = await provider?.request({
      method: 'personal_sign',
      params: [msg, account],
    });

    if (!signature) {
      return toast.error('Error signing the message');
    }

    const sig1 = signature.slice(2, 66);
    const sig2 = signature.slice(66, 130);

    const hashedV = ethers.sha256(`0x${sig1}`);
    const hashedR = ethers.sha256(`0x${sig2}`);
    const n = ethers.getBigInt(
      '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141',
    );

    const privateKey1 = ethers.getBigInt(hashedV) % n; // r analogija
    const privateKey2 = ethers.getBigInt(hashedR) % n;

    const spendingPublicKey = secp.getPublicKey(privateKey1, true); // kG
    const viewingPublicKey = secp.getPublicKey(privateKey2, true); // vG

    // Generate random ephemeral private key r
    const r = secp.utils.randomPrivateKey(); // r

    // Calculate the ephemeral public key R = r * G
    const ephemeralPublicKeyCompressed = secp.getPublicKey(r, true);

    // shared secret = r * vG
    const sharedSecret = secp.getSharedSecret(r, viewingPublicKey);

    // shared secret 2 = v * rG, they should be equal
    const sharedSecret2 = secp.getSharedSecret(
      privateKey2,
      ephemeralPublicKeyCompressed,
    );

    let boolValue = true;
    for (let i = 0; i < sharedSecret.length; i++) {
      if (sharedSecret[i] !== sharedSecret2[i]) {
        boolValue = false;
        break;
      }
    }

    await invokeSnap({
      method: 'updateState',
      params: {
        spendingPublicKey: uint8ArrayToHex(spendingPublicKey),
        viewingPublicKey: uint8ArrayToHex(viewingPublicKey),
        spendingPrivateKey: privateKey1.toString(),
        viewingPrivateKey: privateKey2.toString(),
      },
    });

    setMistKeys({
      spendingPublicKey: uint8ArrayToHex(spendingPublicKey),
      viewingPublicKey: uint8ArrayToHex(viewingPublicKey),
    });

    await registerKeyContract({
      spendingPublicKey: uint8ArrayToHex(spendingPublicKey),
      viewingPublicKey: uint8ArrayToHex(viewingPublicKey),
    });

    setLoadingSetup(false);
    setKeysGenerated(true);
    toast.success('Successfully Generated Mist Keys');
  };

  const registerKeyContract = async (state: MistState) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      REGISTRY_CONTRACT_ADDRESS,
      KEY_REGISTRY,
      signer,
    );

    if (!contract) {
      return;
    }

    const { spendingPublicKey, viewingPublicKey } = state;

    const parsePublicKey = (publicKey: string) => {
      const hexString = publicKey.startsWith('0x')
        ? publicKey.slice(2)
        : publicKey;
      const prefix = parseInt(hexString.slice(0, 2), 16);
      const key = BigInt(`0x${hexString.slice(2)}`);
      return { prefix, key };
    };

    const { prefix: spendingPubKeyPrefix, key: spendingPubKey } =
      parsePublicKey(spendingPublicKey);
    const { prefix: viewingPubKeyPrefix, key: viewingPubKey } =
      parsePublicKey(viewingPublicKey);

    try {
      // @ts-ignore
      const tx = await contract.setStealthMetaAddress(
        spendingPubKeyPrefix,
        spendingPubKey,
        viewingPubKeyPrefix,
        viewingPubKey,
      );

      // Optionally, you can wait for the transaction to be mined
      await tx.wait();

      console.log('Stealth meta address registered successfully');
    } catch (e) {
      console.log(e);
    }
  };

  const calculateStealthAddressSender = async () => {
    const receiverAddress = await getUserAddress();
    console.log('Calculating stealth address');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract: any = new ethers.Contract(
      REGISTRY_CONTRACT_ADDRESS,
      KEY_REGISTRY,
      signer,
    );

    if (!contract) {
      return;
    }

    try {
      // debugger;
      const [
        spendingPubKeyPrefix,
        spendingPubKey,
        viewingPubKeyPrefix,
        viewingPubKey,
        // @ts-ignore
      ] = await contract.getStealthMetaAddress(receiverAddress);
      // KLJUCEVI SA PREFIXOM
      const state: MistState = await getSnapState();

      const fullSpendingPubKey =
        spendingPubKeyPrefix.toString() + spendingPubKey.toString();
      const fullViewingKey =
        viewingPubKeyPrefix.toString() + viewingPubKey.toString();

      // Convert BigInts to hex strings
      // NEMAJU PREFIX
      const spendingPubKeyHex = BigInt(spendingPubKey).toString(16);
      const viewingPubKeyHex = BigInt(viewingPubKey).toString(16);

      // // Ensure the hex strings are properly padded to 64 characters (32 bytes)
      const spendingPubKeyPadded = spendingPubKeyHex.padStart(64, '0');
      const viewingPubKeyPadded = viewingPubKeyHex.padStart(64, '0');

      // // Convert the padded hex strings to secp.Point objects
      const spendingPublicKey = secp.Point.fromHex(spendingPubKeyPadded);
      const viewingPublicKey = secp.Point.fromHex(viewingPubKeyPadded);

      // // Generate random ephemeral priv  console.log()ate key r
      const r = secp.utils.randomPrivateKey();

      // // Calculate the ephemeral public key R = r * G
      const ephemeralPublicKeyCompressed = secp.getPublicKey(r, true);

      const sharedSecret = secp.getSharedSecret(r, viewingPublicKey);
      const hashedSharedSecret = sha3.keccak_256(
        Buffer.from(sharedSecret.slice(1)),
      );

      // // Generate point from shared secret
      const hashedSharedSecretPoint = secp.Point.fromPrivateKey(
        Buffer.from(hashedSharedSecret, 'hex'),
      );

      const stealthPublicKey = spendingPublicKey.add(hashedSharedSecretPoint);
      const stAA = sha3
        .keccak_256(
          Uint8Array.prototype.slice.call(
            Buffer.from(stealthPublicKey.toHex(), 'hex'),
            1,
          ),
        )
        .toString();

      const stealthAddress = stAA.slice(-40);
      return ephemeralPublicKeyCompressed;
      // //console.log('stealth address:', stealthAddress);
    } catch (e) {
      console.log(e);
    }
  };

  const calculateStealthAddressReceiver = async () => {
    console.log('CALCULATE STEALTH RECEIVER');
    const R = await calculateStealthAddressSender();
    const state = await getSnapState();

    try {
      const sharedSecret = secp.getSharedSecret(
        BigInt(state.viewingPrivateKey as string),
        R as Uint8Array,
      );
      console.log(sharedSecret);

      const hashedSharedSecret = sha3.keccak_256(
        Buffer.from(sharedSecret.slice(1)),
      );
      const hashedSharedSecretPoint = secp.Point.fromPrivateKey(
        Buffer.from(hashedSharedSecret, 'hex'),
      );

      const spendingPubKey = state.spendingPublicKey.slice(4);
      const spendingPubKeyHex = spendingPubKey;

      const spendingPublicKey = secp.Point.fromHex(spendingPubKeyHex);

      const stealthPublicKey = spendingPublicKey.add(hashedSharedSecretPoint);
      const stAA = sha3
        .keccak_256(
          Uint8Array.prototype.slice.call(
            Buffer.from(stealthPublicKey.toHex(), 'hex'),
            1,
          ),
        )
        .toString();

      const stealthAddress = stAA.slice(-40);
      console.log('stealth address 2:', stealthAddress);
    } catch (e) {
      console.log(e);
    }
  };

  const getSnapState = async () => {
    setLoadingSetup(true);
    const state = (await invokeSnap({
      method: 'getState',
    })) as Promise<MistState>;

    setKeysGenerated(true);
    setMistKeys(state);
    setLoadingSetup(false);
    return state;
  };

  const keysGeneratedBlock = () => {
    return (
      <UserKeys>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '2rem',
          }}
        >
          <SignTitle>Spending Public Key</SignTitle>
          <div>{mistKeys.spendingPublicKey}</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '1rem',
          }}
        >
          <SignTitle>Viewing Public Key</SignTitle>
          <div>{mistKeys.viewingPublicKey}</div>
        </div>
      </UserKeys>
    );
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
                {/* <SetupButton onClick={() => calculateStealthAddressSender()}>
                  Spender
                </SetupButton> */}
                {/* <SetupButton onClick={() => calculateStealthAddressReceiver()}>
                  Receiver
                </SetupButton> */}
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
