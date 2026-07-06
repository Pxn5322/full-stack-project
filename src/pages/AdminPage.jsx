import { useState, useContext, useEffect } from 'react';
import { Form, Button, Row, Col, Table, Alert, Card, Container, Tabs, Tab, Badge, Modal, Dropdown } from 'react-bootstrap';
import { BooksContext } from '../contexts/BooksProvider';
import BookingModal from '../components/BookingModal';

export default function AdminPage() {
    const {
        users,
        doctors,
        status,
        allBookings,
        allBookingsLoading,
        setStatus,
        fetchUsers,
        fetchAllBookings,
        saveBooking,
        updateBooking,
        deleteBooking,
        addDoctors,
        editDoctors,
        deleteDoctor
    } = useContext(BooksContext);

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [filterText, setFilterText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchAllBookings();
    }, [fetchUsers, fetchAllBookings]);

    const getDoctorName = (doctorId) => {
        const foundDoctor = doctors.find(d => d.id === doctorId);
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
            setStatus({ loading: false, error: error.message, success: false });
        }
    };

    const handleOpenEditDoctor = (doctor) => {
        setEditingDoctor({ ...doctor });
        setShowDoctorModal(true);
    };

    const handleEditDoctor = async (e) => {
        e.preventDefault();
        try {
            await editDoctors(editingDoctor.id, editingDoctor.name, editingDoctor.department);
            setShowDoctorModal(false);
        } catch (error) {
            console.error("Error editing practitioner fields:", error);
        }
    };

    const handleDeleteDoctorClick = (doctorId) => {
        if (window.confirm("Are you sure you want to remove this practitioner? This will not remove past historical bookings data metrics.")) {
            deleteDoctor(doctorId);
        }
    };

    const handleOpenCreateBooking = (user) => {
        setIsEditing(false);
        setSelectedUser(user);
        setSelectedBooking(null);
        setShowBookingModal(true);
    };

    const handleOpenEditBooking = (booking) => {
        setIsEditing(true);
        setSelectedBooking({ ...booking });
        setShowBookingModal(true);
    };

    const handleFormSubmit = async (modalFormData) => {
        setStatus({ loading: true, error: null, success: false });

        try {
            if (isEditing) {
                await updateBooking(
                    selectedBooking.userId,
                    selectedBooking.id,
                    modalFormData.name,
                    modalFormData.gender,
                    modalFormData.email,
                    modalFormData.phone,
                    modalFormData.datetime,
                    modalFormData.department,
                    modalFormData.doctor,
                    modalFormData.message
                );
            } else {
                await saveBooking(
                    selectedUser.id,
                    modalFormData.name,
                    modalFormData.gender,
                    modalFormData.email,
                    modalFormData.phone,
                    modalFormData.datetime,
                    modalFormData.department,
                    modalFormData.doctor,
                    modalFormData.message
                );
            }

            setStatus({ loading: false, error: null, success: true });
            fetchAllBookings(); // Reload data logs reference grid
            setTimeout(() => setShowBookingModal(false), 1000);
        } catch (error) {
            setStatus({ loading: false, error: error.message, success: false });
        }
    };

    const handleDeleteBookingClick = (booking) => {
        if (window.confirm(`Cancel system booking registration reference for ${booking.name}?`)) {
            deleteBooking(booking.userId, booking.id);
            fetchAllBookings(); // Sync local grid arrays
        }
    };

    const filteredItems = users?.filter(item =>
        item.email.toUpperCase().includes(filterText.toUpperCase())
    );

    return (
        <Container className="py-5">
            <h1 className="fw-bold text-secondary mb-4">Administration Workspace</h1>

            <Tabs defaultActiveKey="bookings" id="admin-dashboard-tabs" className="mb-4 custom-tabs">

                <Tab eventKey="bookings" title={`Global Appointments (${allBookings.length})`}>
                    <Card className="shadow-sm border-0 p-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold text-secondary m-0">Patient Bookings Index</h3>
                                <div className="d-flex">
                                    <Dropdown className="mx-2" onToggle={(isOpen) => !isOpen && setFilterText('')}>
                                        <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-searchable">
                                            ➕ Create New Appointment
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <Form.Control
                                                autoFocus
                                                className="mb-2"
                                                placeholder="Search.."
                                                value={filterText}
                                                onChange={(e) => setFilterText(e.target.value)}
                                            />

                                            {filteredItems?.length > 0 ? (
                                                filteredItems.map((item) => (
                                                    <Dropdown.Item
                                                        key={item.id}
                                                        onClick={() => handleOpenCreateBooking(item)}
                                                    >
                                                        {item.email}
                                                    </Dropdown.Item>
                                                ))
                                            ) : (
                                                <div className="text-muted small px-2 py-1">No results found</div>
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <Button variant="outline-primary" size="sm" onClick={fetchAllBookings} disabled={allBookingsLoading}>
                                        {allBookingsLoading ? '🔄 Refreshing...' : '🔄 Refresh List'}
                                    </Button>
                                </div>
                            </div>

                            {allBookingsLoading ? (
                                <p className="text-center text-muted py-4">Loading system schedules...</p>
                            ) : allBookings.length === 0 ? (
                                <p className="text-muted">No appointments found in the registry.</p>
                            ) : (
                                <Table responsive hover className="align-middle">
                                    <thead>
                                        <tr>
                                            <th>Patient Name</th>
                                            <th>Contact Details</th>
                                            <th>Schedule Time</th>
                                            <th>Department</th>
                                            <th>Assigned Doctor</th>
                                            <th className="text-end">Actions</th>
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
                                                <td>
                                                    <span className="fw-semibold">{getDoctorName(booking.doctor)}</span>
                                                </td>
                                                <td className="text-end">
                                                    <Button variant="outline-secondary" size="sm" className="me-2 fw-semibold" onClick={() => handleOpenEditBooking(booking)}>
                                                        ✏️ Edit
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => handleDeleteBookingClick(booking)}>
                                                        🗑️ Cancel
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="doctors" title="Manage Practitioners">
                    <Row className="g-4">
                        <Col lg={4}>
                            <Card className="shadow-sm border-0 p-4">
                                <Card.Body>
                                    <h3 className="fw-bold text-secondary mb-4">Add Practitioner</h3>
                                    {status.error && <Alert variant="danger">❌ {status.error}</Alert>}
                                    {status.success && <Alert variant="success">✨ Added successfully!</Alert>}

                                    <Form onSubmit={handleAddDoctor}>
                                        <Form.Group className="mb-3" controlId="docName">
                                            <Form.Label className="small fw-semibold text-muted">Doctor Name</Form.Label>
                                            <Form.Control type="text" placeholder="Dr. Alex Mercer" value={name} onChange={(e) => setName(e.target.value)} required />
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
                        <Col lg={8}>
                            <Card className="shadow-sm border-0 p-4">
                                <Card.Body>
                                    <h3 className="fw-bold text-secondary mb-4">Active Roster ({doctors.length})</h3>
                                    {doctors.length === 0 ? (
                                        <p className="text-muted">No doctors found in directory.</p>
                                    ) : (
                                        <Table responsive hover className="align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Practitioner Name</th>
                                                    <th>Department</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {doctors.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td className="fw-semibold">{doc.name}</td>
                                                        <td className="text-capitalize text-muted">{doc.department}</td>
                                                        <td className="text-end">
                                                            <Button variant="outline-secondary" size="sm" className="me-2 fw-semibold" onClick={() => handleOpenEditDoctor(doc)}>
                                                                ✏️ Edit
                                                            </Button>
                                                            <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => handleDeleteDoctorClick(doc.id)}>
                                                                🗑️ Delete
                                                            </Button>
                                                        </td>
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

            <BookingModal
                show={showBookingModal}
                onHide={() => setShowBookingModal(false)}
                isEditing={isEditing}
                currentBooking={selectedBooking}
                onSubmit={handleFormSubmit}
                status={status}
                setStatus={setStatus}
                currentUser={selectedUser}
            />

            {editingDoctor && (
                <Modal show={showDoctorModal} onHide={() => setShowDoctorModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold text-secondary">Modify Practitioner profile</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleEditDoctor}>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-muted">Doctor Name</Form.Label>
                                <Form.Control type="text" value={editingDoctor.name} onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-muted">Department Wing</Form.Label>
                                <Form.Select value={editingDoctor.department} onChange={(e) => setEditingDoctor({ ...editingDoctor, department: e.target.value })} required>
                                    <option value="general">General Consultation</option>
                                    <option value="cardiology">Cardiology</option>
                                    <option value="neurology">Neurology</option>
                                    <option value="orthopedics">Orthopedics</option>
                                    <option value="pediatrics">Pediatrics</option>
                                    <option value="dermatology">Dermatology</option>
                                    <option value="oncology">Oncology</option>
                                </Form.Select>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" onClick={() => setShowDoctorModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit">Update Record</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            )}
        </Container>
    );
}