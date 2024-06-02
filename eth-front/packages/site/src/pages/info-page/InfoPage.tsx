import { useEffect, useState } from 'react';
import {
  useInvokeSnap,
  useMetaMask,
  useMetaMaskContext,
  useRequestSnap,
} from '../../hooks';
import styled from 'styled-components';
import { MistState } from '../setup-page/SetupPage';

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

const InfoPage = () => {
  const { error, provider } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const [privateLoaded, setPrivateLoaded] = useState(false);

  const getSnapState = async () => {
    const state = (await invokeSnap({
      method: 'getState',
    })) as Promise<MistState>;

    return state;
  };

  const calculatePrivateKey = async () => {
    setPrivateLoaded(true);

    const state = await getSnapState();
    console.log(state);
  };

  const revealBlock = () => {
    return (
      <>
        <InfoBlockText>Click the button to reveal private key </InfoBlockText>
        <DFlex>
          <MAuto>
            <SetupButton onClick={calculatePrivateKey}>Reveal</SetupButton>
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
