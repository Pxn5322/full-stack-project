import { useContext, useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { BooksContext } from '../contexts/BooksProvider';

export default function BookingModal({ show, onHide, isEditing, currentBooking, onSubmit, status, setStatus, currentUser }) {
    const { doctors } = useContext(BooksContext);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        department: '',
        doctor: '',
        message: ''
    });

    // Reset or populate form fields whenever the modal opens or switches mode
    useEffect(() => {
        if (show) {
            setStatus(prev => ({ ...prev, error: null, success: false }));

            if (isEditing && currentBooking) {
                let initialDate = '';
                let initialTime = '';

                if (currentBooking.datetime) {
                    const parts = currentBooking.datetime.split(' ');
                    if (parts.length >= 3) {
                        initialDate = parts[0];
                        initialTime = `${parts[1]} ${parts[2]}`;
                    } else {
                        initialDate = currentBooking.datetime;
                    }
                }

                setFormData({
                    name: currentBooking.name || '',
                    gender: currentBooking.gender || '',
                    email: currentBooking.email || '',
                    phone: currentBooking.phone || '',
                    date: initialDate,
                    time: initialTime,
                    department: currentBooking.department || '',
                    doctor: currentBooking.doctor || '',
                    message: currentBooking.message || ''
                });
            } else {
                // Clear form for a fresh booking entry
                setFormData({ name: '', gender: '', email: currentUser?.email || '', phone: '', date: '', time: '', department: '', doctor: '', message: '' });
            }
        }
    }, [show, isEditing, currentBooking, currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (status.error) {
            setStatus(prev => ({ ...prev, error: null }));
        }

        if (name === 'department') {
            setFormData(prev => ({
                ...prev,
                department: value,
                doctor: ''
            }));
            return;
        }

        if (name === 'date' && value) {
            const selectedDate = new Date(value);
            const dayOfWeek = selectedDate.getUTCDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                setStatus(prev => ({ ...prev, error: "Appointments cannot be scheduled on weekends. Please pick a weekday (Monday to Friday)." }));
                setFormData(prev => ({ ...prev, date: '' }));
                return;
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (status.error) return;

        const unifiedDateTime = `${formData.date} ${formData.time}`;

        onSubmit({ ...formData, datetime: unifiedDateTime });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fw-bold text-secondary text-center w-100 mt-2">
                    {isEditing ? 'Modify Appointment Details' : 'Schedule Your Appointment'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 p-md-5 pt-3">
                {status.loading && <Alert variant="info" className="text-center py-2">🔄 Updating database parameters...</Alert>}
                {status.error && <Alert variant="danger" className="text-center py-2">❌ {status.error}</Alert>}
                {status.success && <Alert variant="success" className="text-center py-2">✨ Entry committed successfully.</Alert>}

                <Form onSubmit={handleFormSubmit} className="mt-3">
                    <Row className="g-4">
                        <Form.Group as={Col} md={6} controlId="formName">
                            <Form.Label className="small fw-semibold text-muted">Full Name</Form.Label>
                            <Form.Control size="lg" type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="formGender">
                            <Form.Label className="small fw-semibold text-muted">Gender</Form.Label>
                            <Form.Select size="lg" name="gender" value={formData.gender} onChange={handleInputChange} required>
                                <option value="">Choose Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="formEmail">
                            <Form.Label className="small fw-semibold text-muted">Email Address</Form.Label>
                            <Form.Control size="lg" type="email" name="email" placeholder="name@domain.com" value={formData.email} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="formPhone">
                            <Form.Label className="small fw-semibold text-muted">Phone Number</Form.Label>
                            <Form.Control size="lg" type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="formDate">
                            <Form.Label className="small fw-semibold text-muted">Preferred Date</Form.Label>
                            <Form.Control size="lg" type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="formTime">
                            <Form.Label className="small fw-semibold text-muted">Time Slot</Form.Label>
                            <Form.Select size="lg" name="time" value={formData.time} onChange={handleInputChange} required>
                                <option value="">Choose Time Slot</option>
                                <option value="08:00 AM">08:00 AM</option>
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="02:00 PM">02:00 PM</option>
                                <option value="03:00 PM">03:00 PM</option>
                                <option value="04:00 PM">04:00 PM</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="formDepartment">
                            <Form.Label className="small fw-semibold text-muted">Department</Form.Label>
                            <Form.Select size="lg" name="department" value={formData.department} onChange={handleInputChange} required>
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
                        <Form.Group as={Col} md={6} controlId="formDoctor">
                            <Form.Label className="small fw-semibold text-muted">Assigned Practitioner</Form.Label>
                            <Form.Select size="lg" name="doctor" value={formData.doctor} onChange={handleInputChange} required disabled={!formData.department}>
                                <option value="">{!formData.department ? 'Select a department first' : 'Select Doctor'}</option>
                                {doctors?.filter(doc => doc.department === formData.department)
                                    .map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name}
                                        </option>
                                    ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} xs={12} controlId="formMessage">
                            <Form.Label className="small fw-semibold text-muted">Additional Medical Notes (Optional)</Form.Label>
                            <Form.Control name="message" as="textarea" rows={3} placeholder="Symptoms, chronic details..." value={formData.message} onChange={handleInputChange} />
                        </Form.Group>
                        <Col xs={12} className="text-center mt-4">
                            <Button variant="primary" type="submit" size="lg" className="w-100 py-3 shadow-sm fw-bold" disabled={status.loading}>
                                {status.loading ? 'Saving Changes...' : isEditing ? 'Update Schedule Entry' : 'Book Appointment Now'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
                <Alert variant="warning" className="mt-4 mb-0 border-0 d-flex align-items-center gap-2 small py-2">
                    <i className="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                    <span>For medical emergencies, please call <strong>999</strong> immediately.</span>
                </Alert>
            </Modal.Body>
        </Modal>
    );
}