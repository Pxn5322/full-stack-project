import { useContext, useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import BookCard from '../components/BookCard';
import BookingModal from '../components/BookingModal'; // <-- Import your new component
import { BooksContext } from '../contexts/BooksProvider';
import { useNavigate } from 'react-router-dom';

export default function BookingPage() {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);


    const { currentUser, bookings, bookingsLoading, doctors, status, setStatus, fetchBookingsByUser, saveBooking, updateBooking, deleteBooking } = useContext(BooksContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
        } else {
            fetchBookingsByUser(currentUser.uid);
        }
    }, [currentUser, navigate, fetchBookingsByUser]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedBooking(null);
        setStatus({ loading: false, error: null, success: false });
        setShowModal(true);
    };

    const handleOpenEdit = (booking) => {
        setIsEditing(true);
        setSelectedBooking(booking);
        setStatus({ loading: false, error: null, success: false });
        setShowModal(true);
    };

    const handleFormSubmit = async (modalFormData) => {
        setStatus({ loading: true, error: null, success: false });

        try {
            if (isEditing) {
                await updateBooking(
                    currentUser.uid,
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
                    currentUser.uid,
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
            setTimeout(() => setShowModal(false), 1000);
        } catch (error) {
            setStatus({ loading: false, error: error.message, success: false });
        }
    };

    const handleDelete = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this appointment ticket?")) {
            await deleteBooking(currentUser.uid, bookingId);
        }
    };

    return (
        <main className="booking-bg-container py-5">
            <div className="page-title text-center mb-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <h1 className="fw-bold display-5">Appointment Dashboard</h1>
                            <p className="text-muted">Keep track, manage clinical reservations, or introduce a new schedule submission.</p>
                            <Button variant="primary" size="lg" className="fw-bold px-4 py-2 mt-2 shadow-sm" onClick={handleOpenCreate}>
                                <i className="bi bi-calendar-plus me-2"></i>Add Appointment
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <section id="appointment-list">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto">
                            <h4 className="fw-bold mb-3 text-center text-md-start">Your Scheduled Appointments</h4>

                            {bookingsLoading ? (
                                <div className="text-center p-5 text-muted">
                                    <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                                    Loading database profiles...
                                </div>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <BookCard
                                        key={booking.id}
                                        booking={booking}
                                        doctors={doctors}
                                        onEdit={() => handleOpenEdit(booking)}
                                        onDelete={() => handleDelete(booking.id)}
                                    />
                                ))
                            ) : (
                                <Card className="text-center p-5 border border-dashed text-muted shadow-sm my-3">
                                    <Card.Body>
                                        <i className="bi bi-file-earmark-medical fs-1 mb-2 d-block text-secondary"></i>
                                        <p className="small mb-0">No active booking processed yet. Click the action button above to start.</p>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>

            <BookingModal
                show={showModal}
                onHide={() => setShowModal(false)}
                isEditing={isEditing}
                currentBooking={selectedBooking}
                onSubmit={handleFormSubmit}
                status={status}
                setStatus={setStatus}
                currentUser={currentUser}
            />
        </main>
    );
}