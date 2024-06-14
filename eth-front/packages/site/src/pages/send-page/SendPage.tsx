import * as secp from '@noble/secp256k1';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from 'ethers';
import * as sha3 from 'js-sha3';
import React, { useState } from 'react';
import {
  Button,
  Container,
  Dropdown,
  DropdownButton,
  Form,
} from 'react-bootstrap';
import toast from 'react-hot-toast';

import { ERC20 } from '../../abis/ERC20';
import { KEY_REGISTRY } from '../../abis/KeyRegistry';
import {
  useInvokeSnap,
  useMetaMask,
  useMetaMaskContext,
  useRequestSnap,
} from '../../hooks';
import type { MistState } from '../setup-page/SetupPage';
import './SendPage.css';
import  SendImage from "./mist.png";

const REGISTRY_CONTRACT_ADDRESS = '0xC77484F08f260c571922C112C2AB671093ce1fA9'; // KEY REGISTRY
window.Buffer = window.Buffer || require('buffer').Buffer;

const SendPage: React.FC = () => {
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string>('ETH');
  const [loading, setLoading] = useState<boolean>(false);

  const { error, provider } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const MIST_CONTRACT_ADDRESS = '0x6f4ef23960C89145896ee15140128e1b93925668';
  const ABI = [
    'function sendERC721(address receiver, address tokenAddress, uint256 tokenId, bytes memory metadata)',
    'function sendEth(address receiver, bytes memory ephemeralPubKey, bytes memory metadata)',
    'function sendERC20(address receiver, address tokenAddress, uint256 amount, bytes memory metadata)',
  ];

  const approveERC20Txn = async (
    tokenAddress: string,
    tokenSpenderAddress: string,
    value: bigint,
  ) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, ERC20, signer);
      console.log(tokenAddress, tokenSpenderAddress, value);
      if (contract && contract.approve) {
        const approveTx = await contract.approve(tokenSpenderAddress, value, {
          gasLimit: 50000,
        });

        await approveTx.wait();

        return true;
      }

      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const getSnapState = async () => {
    const state = (await invokeSnap({
      method: 'getState',
    })) as Promise<MistState>;

    return state;
  };

  const calculateStealthAddressSender = async (receiverAddress: string) => {
    console.log('Calculating stealth address: ', receiverAddress);
    // debugger;
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
      console.log(hashedSharedSecret);
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

      const hashedSharedSecretBigInt = BigInt('0x' + hashedSharedSecret);
      const n =
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141';
      const myPrivateKey =
        (hashedSharedSecretBigInt +
          BigInt(state.spendingPrivateKey as string)) %
        BigInt(n);
      console.log("myprivatekey", myPrivateKey);
      return {
        stealthAddress: `0x${stealthAddress}`,
        ephemeralPublicKey: ephemeralPublicKeyCompressed,
      };
      // //console.log('stealth address:', stealthAddress);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(MIST_CONTRACT_ADDRESS, ABI, signer);

      //   @ts-ignore
      const { stealthAddress, ephemeralPublicKey } =
        await calculateStealthAddressSender(recipient);
      console.log(stealthAddress);

      let tx;
      if (selectedToken === 'ETH') {
        const value = ethers.parseEther(amount);

        console.log(value);

        const metadata = ethers.hexlify('0x'); // Placeholder for metadata
        if (contract && contract.sendEth) {
          // Check if contract and sendEth method are defined
          tx = await contract.sendEth(
            stealthAddress,
            ephemeralPublicKey,
            metadata,
            {
              value,
            },
          );
        }
      } else {
        const tokenAddress = getTokenAddress(selectedToken);
        const value = ethers.parseUnits(amount, 18); // Adjust the decimal places according to the token
        const metadata = ethers.hexlify('0x'); // Placeholder for metadata
        if (contract && contract.sendERC20) {
          // Check if contract and sendERC20 method are defined
          const approveTxn = await approveERC20Txn(
            tokenAddress,
            MIST_CONTRACT_ADDRESS,
            value,
          );

          if (!approveTxn) {
            return toast.error('Error approving the transaction');
          }

          tx = await contract.sendERC20(
            stealthAddress,
            tokenAddress,
            value,
            ephemeralPublicKey,
            metadata,
          );
        }
      }

      if (tx) {
        await tx.wait();
        alert('Transaction successful');
      }
    } catch (error) {
      console.error('Transaction failed', error);
      alert('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectToken = (token: string | null) => {
    if (token) {
      setSelectedToken(token);
    }
  };

  const getTokenAddress = (token: string): string => {
    switch (token) {
      case 'USDT':
        return '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // Sepolia USDT address if different
      case 'USDC':
        return '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48'; // Sepolia USDC address if different
      case 'MIST':
        return '0xC21e26f5453393c88D2fE67B41Aa76aBB0A30109';
      default:
        return '0x0000000000000000000000000000000000000000';
    }
  };

  return (
    <div className="send-main">
    <img src={SendImage} alt="Send" className="send-image" />
    <Container className="send-form-container">
      <p className="sendText">Send ≋</p>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formRecipient">
          <Form.Label>Recipient's ENS name or address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="custom-input"
          />
        </Form.Group>

        <Form.Group controlId="formToken">
          <Form.Label>Select token to send</Form.Label>
          <DropdownButton
            id="dropdown-basic-button"
            title={`Token: ${selectedToken}`}
            onSelect={handleSelectToken}
            className="custom-dropdown"
          >
            <Dropdown.Item eventKey="ETH">ETH</Dropdown.Item>
            <Dropdown.Item eventKey="USDT">USDT</Dropdown.Item>
            <Dropdown.Item eventKey="USDC">USDC</Dropdown.Item>
            <Dropdown.Item eventKey="MIST">MIST</Dropdown.Item>
          </DropdownButton>
        </Form.Group>

        <Form.Group controlId="formAmount">
          <Form.Label>Amount</Form.Label>
          <div className="amount-input-group">
            <Form.Control
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="custom-input"
            />
          </div>
        </Form.Group>

                <Button variant="primary" type="submit" className="send-button" disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </Button>
            </Form>
        </Container>
        <img src={SendImage} alt="Send" className="send-image-second" />
    </div>
    );
};

export default SendPage;
