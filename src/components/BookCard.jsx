import { Button, Card, Col, Row } from "react-bootstrap";

export default function BookCard({ booking, doctors, onEdit, onDelete }) {
    const getDoctorName = (doctorId) => {
        const foundDoctor = doctors.find(doc => doc.id === doctorId);
        return foundDoctor ? foundDoctor.name : "Unknown Practitioner";
    };

    return (
        <Card className="shadow-sm border mx-auto my-3">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center py-2 px-3">
                <div className="small fw-bold">
                    <i className="bi bi-check-circle-fill me-2"></i>Appointment Confirmed
                </div>
            </Card.Header>

            <Card.Body className="p-3">
                <Row className="g-2 align-items-center rounded py-2 m-0 border">
                    <Col sm={6} className="border-end">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>PATIENT</small>
                        <strong className="d-block text-truncate">
                            {booking.gender === "male" ? "Mr." : "Ms."} {booking.name}
                        </strong>
                    </Col>
                    <Col sm={6} className="ps-3">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>SPECIALIST</small>
                        <strong className="text-primary d-block text-truncate text-capitalize">
                            {getDoctorName(booking.doctor)}
                        </strong>
                    </Col>
                </Row>

                <hr className="my-2 opacity-25" />

                <Row className="g-2 text-center rounded py-2 m-0 border">
                    <Col sm={4}>
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-calendar3 me-1"></i>DATE-TIME
                        </small>
                        <span className="small fw-semibold">
                            {booking.datetime}
                        </span>
                    </Col>
                    <Col sm={4} className="border-start">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-building me-1"></i>DEPT
                        </small>
                        <span className="small fw-semibold text-capitalize text-truncate d-block px-1">
                            {booking.department}
                        </span>
                    </Col>
                    <Col sm={4} className="border-start">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-telephone me-1"></i>PHONE
                        </small>
                        <span className="small fw-semibold">{booking.phone}</span>
                    </Col>
                </Row>

                {booking.message && (
                    <div className="mt-2 p-2 rounded border small text-muted text-truncate italic" style={{ fontSize: '0.8rem' }}>
                        <strong>Note:</strong> "{booking.message}"
                    </div>
                )}
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between align-items-center py-2 px-3 border-top-0 bg-transparent">
                <span className="fw-semibold text-muted text-truncate me-2" style={{ fontSize: '0.75rem' }}>
                    {booking.email}
                </span>

                {/* Action Buttons connected directly to your passed handlers */}
                <div className="d-flex gap-2 shrink-0">
                    <Button
                        variant="outline-primary"
                        className="btn-sm py-1 px-2"
                        style={{ fontSize: '0.75rem' }}
                        onClick={onEdit} // <-- Triggers opening the Modal in edit mode
                    >
                        <i className="bi bi-pencil me-1"></i>Edit
                    </Button>
                    <Button
                        variant="outline-danger"
                        className="btn-sm py-1 px-2"
                        style={{ fontSize: '0.75rem' }}
                        onClick={onDelete} // <-- Triggers context window confirm delete row
                    >
                        <i className="bi bi-trash me-1"></i>Cancel
                    </Button>
                </div>
            </Card.Footer>
        </Card>
    );
}