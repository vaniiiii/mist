import { useState } from 'react';
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

const SetupPage = () => {
  const [message, setMessage] = useState("Sign this message to access your Myst account.");

  const { error, provider } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  const handleSendHelloClick = async () => {
    await invokeSnap({ method: 'hello' });
  };

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
    const msg = hexlify(toUtf8Bytes(message));

    // const resp = await invokeSnap({method: 'personal_sign', params: {
    //     msg, from: "0x9EdC84691580CBD5ED56Ff0e90390A0857FB3D49"
    // }})

    const accounts = await provider?.request({
        method: 'eth_requestAccounts'
    })

    if(!accounts) return;

    console.log(accounts)

    const rpcSnap = await provider?.request({
        method: 'personal_sign',
        // @ts-ignore
        params: [msg, accounts[0]]
    });

    console.log(rpcSnap)
  }

  const signMessageBlock = () => {
    return (
      <SignContent>
        <SignTitle>Generate and Publish Stealth Keys</SignTitle>
        <InfoBlockText>Use the button below to complete the setup process</InfoBlockText>
        <DFlex>
          <MAuto>
            <SetupButton onClick={signMessage}>Setup</SetupButton>
          </MAuto>
        </DFlex>
      </SignContent>
    );
  };

  return (
    <Container>
      <Heading>Setup</Heading>
      <InfoBlock>
        {!installedSnap && connectWalletBlock()}
        {installedSnap && signMessageBlock()}
      </InfoBlock>
    </Container>
  );
};

export default SetupPage;
