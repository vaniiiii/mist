import styled, { useTheme } from 'styled-components';

import { getThemePreference } from '../utils';
import { HeaderButtons } from './Buttons';
import { Toggle } from './Toggle';
import Mist from './mistlogo.png';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border?.default};
  background-color: black;
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  color: whitesmoke;
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Navigation = styled.div`
  display: flex;
  flex-direction: row;
  font-size: ${(props) => props.theme.fontSizes.body};
  align-items: center;
  margin-left: 1.5rem;
  a {
    font-weight: bold;
    color: whitesmoke;
    text-decoration: none;
    margin-right: 1.5rem;
  }
`;

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const theme = useTheme();

  return (
    <HeaderWrapper>
      <LogoWrapper>
        <img src={Mist} alt="Mist Protocol" width="80" height="80" />
        <Title>Mist Protocol</Title>
        <Navigation>
          <a href="/setup-page/SetupPage/">Home</a>
          <a href="/send-page/SendPage/">Send</a>
          <a href="/info-page/InfoPage/">Info</a>

        </Navigation>
      </LogoWrapper>
      <RightContainer>
        <Toggle
          onToggle={handleToggleClick}
          defaultChecked={getThemePreference()}
        />
        <HeaderButtons />
      </RightContainer>
    </HeaderWrapper>
  );
};
