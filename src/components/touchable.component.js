import styled from 'styled-components/native';

export const CloseTouchable = styled.TouchableOpacity`
  background-color: transparent;
  flex: 0 50px;
  align-items: center;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.borderColor};
`;
