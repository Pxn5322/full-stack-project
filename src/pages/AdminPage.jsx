import { useState, useContext, useEffect } from 'react';
import { Form, Button, Row, Col, Table, Alert, Card, Container, Tab, Badge, Tabs } from 'react-bootstrap';
import { BooksContext } from '../contexts/BooksProvider';

export default function AdminPage() {
    const { doctors, addDoctors, allBookings, allBookingsLoading, fetchAllBookings } = useContext(BooksContext);
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [status, setStatus] = useState({ loading: false, error: null, success: false });

    const getDoctorName = (doctorId) => {
        const foundDoctor = doctors.find(doc => doc.id === doctorId);
        return foundDoctor ? foundDoctor.name : "Unknown Practitioner";
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        if (!name || !department) return;

        setStatus({ loading: true, error: null, success: false });

        try {
            await addDoctors(name, department);

            setName('');
            setDepartment('');
            setStatus({ loading: false, error: null, success: true });

            setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);
        } catch (error) {
            console.error("Error adding practitioner:", error);
            setStatus({ loading: false, error: error.message, success: false });
        }
    };

    useEffect(() => {
        fetchAllBookings();
    }, [fetchAllBookings]);

    return (
        <Container className="py-5">
            <h1 className="fw-bold text-secondary mb-4">Administration Console</h1>

            <Tabs defaultActiveKey="bookings" id="admin-dashboard-tabs" className="mb-4 custom-tabs">
                {/* TAB 1: Global System Bookings */}
                <Tab eventKey="bookings" title={`Global Appointments (${allBookings.length})`}>
                    <Card className="shadow-sm border-0 p-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold text-secondary m-0">Patient Bookings Index</h3>
                                <Button variant="outline-primary" size="sm" onClick={fetchAllBookings} disabled={allBookingsLoading}>
                                    {allBookingsLoading ? '🔄 Refreshing...' : '🔄 Refresh List'}
                                </Button>
                            </div>

                            {allBookingsLoading ? (
                                <p className="text-center text-muted py-4">Loading system schedule indices...</p>
                            ) : allBookings.length === 0 ? (
                                <p className="text-muted">No appointments found in the system registry.</p>
                            ) : (
                                <Table responsive hovered className="align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Patient Name</th>
                                            <th>Contact Details</th>
                                            <th>Schedule Time</th>
                                            <th>Department</th>
                                            <th>Doctor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allBookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>
                                                    <div className="fw-semibold">{booking.name}</div>
                                                    <small className="text-muted text-capitalize">{booking.gender}</small>
                                                </td>
                                                <td>
                                                    <div className="small">{booking.email}</div>
                                                    <div className="small text-muted">{booking.phone}</div>
                                                </td>
                                                <td>
                                                    <Badge bg="info" className="fw-medium p-2">
                                                        {booking.datetime}
                                                    </Badge>
                                                </td>
                                                <td className="text-capitalize text-secondary">{booking.department}</td>
                                                <td><code className="text-muted">{getDoctorName(booking.doctor)}</code></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                {/* TAB 2: Manage Practitioners Roster */}
                <Tab eventKey="doctors" title="Manage Practitioners">
                    <Row className="g-4">
                        <Col lg={5}>
                            <Card className="shadow-sm border-0 p-4">
                                <Card.Body>
                                    <h3 className="fw-bold text-secondary mb-4">Add New Practitioner</h3>
                                    {status.error && <Alert variant="danger">❌ {status.error}</Alert>}
                                    {status.success && <Alert variant="success">✨ Practitioner added successfully!</Alert>}

                                    <Form onSubmit={handleAddDoctor}>
                                        <Form.Group className="mb-3" controlId="docName">
                                            <Form.Label className="small fw-semibold text-muted">Doctor Name</Form.Label>
                                            <Form.Control type="text" placeholder="e.g. Dr. Alex Mercer" value={name} onChange={(e) => setName(e.target.value)} required />
                                        </Form.Group>
                                        <Form.Group className="mb-4" controlId="docDept">
                                            <Form.Label className="small fw-semibold text-muted">Assigned Department</Form.Label>
                                            <Form.Select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                                <option value="">Select Department</option>
                                                <option value="general">General Consultation</option>
                                                <option value="cardiology">Cardiology</option>
                                                <option value="neurology">Neurology</option>
                                                <option value="orthopedics">Orthopedics</option>
                                                <option value="pediatrics">Pediatrics</option>
                                                <option value="dermatology">Dermatology</option>
                                                <option value="oncology">Oncology</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={status.loading}>
                                            {status.loading ? 'Registering...' : 'Add Practitioner'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={7}>
                            <Card className="shadow-sm border-0 p-4">
                                <Card.Body>
                                    <h3 className="fw-bold text-secondary mb-4">Active Roster ({doctors.length})</h3>
                                    {doctors.length === 0 ? (
                                        <p className="text-muted">No doctors found in the database directory.</p>
                                    ) : (
                                        <Table responsive hovered className="align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Practitioner Name</th>
                                                    <th>Department</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {doctors.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td className="fw-semibold">{doc.name}</td>
                                                        <td className="text-capitalize text-muted">{doc.department}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
}