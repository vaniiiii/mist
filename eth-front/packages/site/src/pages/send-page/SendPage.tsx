import React, { useState } from 'react';
import { Form, Button, Container, Dropdown, DropdownButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SendPage.css';

const SendPage = () => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('ETH');

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        // Handle form submission logic
        console.log(`Recipient: ${recipient}, Amount: ${amount}, Token: ${selectedToken}`);
    };

    const handleSelectToken = (token: any) => {
        setSelectedToken(token);
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

                <Button variant="primary" type="submit" className="send-button">
                    Send
                </Button>
            </Form>
        </Container>
    );
}

export default SendPage;
