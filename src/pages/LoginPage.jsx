import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BooksContext } from "../contexts/BooksProvider";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { auth } from "../firebase";

export default function LoginPage() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useContext(BooksContext);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    useEffect(() => {
        if (currentUser) {
            navigate("/bookings");
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };

    return (
        <div className="login-bg-container min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center w-100 m-0">
                    <Col md={6} lg={5}>
                        <Card className="glass-login-card border-0 shadow-lg text-white">
                            <Card.Body className="p-4 p-sm-5 text-center">
                                <div className="mb-4">
                                    <img
                                        src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=128&h=128&q=80"
                                        alt="CareBook Logo"
                                        width="50"
                                        height="50"
                                        className="d-inline-block align-middle rounded border border-primary border-2 me-2"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <span className="text-primary text-gradient fs-3 fw-bold align-middle">
                                        Care<span className="text-white">Book</span>
                                    </span>
                                    <p className="text-white-50 small mt-1mb-0">Medical Appointment Platform</p>
                                </div>

                                {message && <Alert variant="danger" className="py-2 small border-0 text-center mb-3">{message}</Alert>}

                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3 text-start" controlId="loginEmail">
                                        <Form.Label className="small fw-semibold text-white-50">Email Address</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-0 text-secondary"><i className="bi bi-envelope"></i></span>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                className="border-0"
                                                placeholder="name@clinic.com"
                                                value={credentials.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-3 text-start" controlId="loginPassword">
                                        <Form.Label className="small fw-semibold text-white-50">Secure Password</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-0 text-secondary"><i className="bi bi-lock"></i></span>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                className="border-0"
                                                placeholder="••••••••"
                                                value={credentials.password}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="btn-lg w-100 fw-bold border-0 shadow-sm py-2 fs-6 mt-2 mb-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verifying...</span>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>

                                    <div className="text-center mb-3 text-white-50 small">or sign in with</div>

                                    <Button variant="danger" size="sm" className="w-100 py-2 mb-3 fw-semibold" onClick={handleGoogleLogin}>
                                        <i className="bi bi-google me-2"></i>Google Workspace
                                    </Button>

                                    <div className="mt-4 pt-2 border-top border-light border-opacity-25 text-center">
                                        <span className="text-white-50 small">Don't have an account? </span>
                                        <Link to="/signup" className="text-white fw-semibold text-decoration-none small ms-1">Create Account</Link>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}