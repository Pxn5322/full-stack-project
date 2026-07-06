import { Container, Row, Col, Card } from 'react-bootstrap';

export default function NotFoundPage() {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="justify-content-center w-100">
                <Col md={8} lg={6} className="text-center">
                    <Card className="border-0 shadow-sm p-4 p-md-5 rounded-4">
                        <Card.Body>
                            <div className="display-1 fw-bold text-primary mb-2">404</div>
                            <h2 className="fw-bold text-secondary mb-3">Page Not Found</h2>

                            <p className="text-muted mb-4 fs-6">
                                Oops! The medical directory link you followed doesn't exist.
                            </p>

                            <hr className="my-4 border-light" />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}