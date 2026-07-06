import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BooksContext } from "../contexts/BooksProvider";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function SignupPage() {
    const [registrationData, setRegistrationData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useContext(BooksContext);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegistrationData({ ...registrationData, [name]: value });
    };

    useEffect(() => {
        if (currentUser) {
            navigate("/bookings");
        }
    }, [currentUser, navigate]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setMessage('');

        if (registrationData.password !== registrationData.confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, registrationData.email, registrationData.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
            });

            navigate("/bookings");
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
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            // Check if document exists first so we don't overwrite existing profile details if they log in again
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                // Provision new metadata parameters if they are registering for the first time via Google Provider
                await setDoc(userDocRef, {
                    email: user.email,
                });
            }

            navigate("/bookings");
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    };

    return (
        <div className="login-bg-container min-vh-100">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="glass-login-card border-0 shadow-lg text-white">
                            <Card.Body className="p-4 p-sm-5 text-center">
                                <div className="mb-4">
                                    <div
                                        className="bg-white text-primary d-inline-flex align-items-center justify-content-center rounded-circle shadow mb-3"
                                        style={{ width: '70px', height: '70px' }}
                                    >
                                        <i className="bi bi-person-plus-fill fs-2"></i>
                                    </div>
                                    <h2 className="fw-bold h3 m-0">Create Account</h2>
                                    <p className="text-white-50 small">Join the MedSched Portal</p>
                                </div>

                                {message && <Alert variant="danger" className="py-2 small border-0 text-center mb-3">{message}</Alert>}

                                <Form onSubmit={handleSignUp}>
                                    <Form.Group className="mb-3 text-start" controlId="signupEmail">
                                        <Form.Label className="small fw-semibold text-white-50">Email Address</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-0 text-secondary"><i className="bi bi-envelope"></i></span>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                className="border-0"
                                                placeholder="name@clinic.com"
                                                value={registrationData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-3 text-start" controlId="signupPassword">
                                        <Form.Label className="small fw-semibold text-white-50">Choose Password</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-0 text-secondary"><i className="bi bi-lock"></i></span>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                className="border-0"
                                                placeholder="••••••••"
                                                value={registrationData.password}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4 text-start" controlId="signupConfirmPassword">
                                        <Form.Label className="small fw-semibold text-white-50">Confirm Password</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-0 text-secondary"><i className="bi bi-shield-check"></i></span>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                className="border-0"
                                                placeholder="••••••••"
                                                value={registrationData.confirmPassword}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="btn-lg w-100 fw-bold border-0 shadow-sm py-2 fs-6 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating Account...</span>
                                        ) : (
                                            'Register Account'
                                        )}
                                    </Button>

                                    <div className="text-center mb-3 text-white-50 small">or register with</div>

                                    <Button variant="danger" size="sm" className="w-100 py-2 mb-3" onClick={handleGoogleLogin}>
                                        <i className="bi bi-google me-2"></i> Sign Up with Google
                                    </Button>
                                </Form>

                                <div className="mt-4 pt-2 border-top border-light border-opacity-25 text-center">
                                    <span className="text-white-50 small">Already have an account? </span>
                                    <Link to="/login" className="text-white fw-semibold text-decoration-none small ms-1">Sign In</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}