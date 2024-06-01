import React, { useState } from 'react';
import { Form, Button, Container, Dropdown, DropdownButton } from 'react-bootstrap';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SendPage.css';

const SendPage = () => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('ETH');
    const [loading, setLoading] = useState(false);

    const MYST_CONTRACT_ADDRESS = '0xE6AdA1DE7EE4fB1DdeA8618966dd1f3C5B6D0aF7';
    const ABI = [
        "function sendERC721(address receiver, address tokenAddress, uint256 tokenId, bytes memory metadata)",
        "function sendEth(address receiver, bytes memory ephemeralPubKey, bytes memory metadata)",
        "function sendERC20(address receiver, address tokenAddress, uint256 amount, bytes memory metadata)"
    ];

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (!window.ethereum) {
                alert('MetaMask is not installed');
                return;
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(MYST_CONTRACT_ADDRESS, ABI, await signer);

            let tx;
            if (selectedToken === 'ETH') {
                const value = ethers.utils.parseEther(amount);
                if (contract.sendEth) {
                    tx = await contract.sendEth(recipient, [], [], { value });
                } else {
                    throw new Error('sendEth method is undefined');
                }
            } else {
                const tokenAddress = getTokenAddress(selectedToken);
                const value = ethers.utils.parseUnits(amount, 18); // Adjust the decimal places according to the token
                if (contract.sendERC20) {
                    tx = await contract.sendERC20(recipient, tokenAddress, value, []);
                } else {
                    throw new Error('sendERC20 method is undefined');
                }
            }

            await tx.wait();
            alert('Transaction successful');
        } catch (error) {
            console.error('Transaction failed', error);
            alert('Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectToken = (token: any) => {
        setSelectedToken(token);
    };

    const getTokenAddress = (token: any) => {
        switch (token) {
            case 'USDT':
                return '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            case 'USDC':
                return '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48';
            default:
                return '0x0000000000000000000000000000000000000000';
        }
    };

    return (
        <Container className="send-form-container">
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
                        <Button variant="secondary" className="max-button">Max</Button>
                    </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="send-button" disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </Button>
            </Form>
        </Container>
    );
};

export default SendPage;
