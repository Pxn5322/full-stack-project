import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    collectionGroup,
    onSnapshot
} from "firebase/firestore";
import { createContext, useCallback, useEffect, useState } from "react";
import { auth, db } from "../firebase";

export const BooksContext = createContext();

export function BooksProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ loading: false, error: null, success: false });
    const [bookings, setBookings] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [allBookings, setAllBookings] = useState([]);
    const [allBookingsLoading, setAllBookingsLoading] = useState(false);

    const fetchBookingsByUser = useCallback(async (userId) => {
        setBookingsLoading(true);
        try {
            const bookingsRef = collection(db, `users/${userId}/bookings`);
            const querySnapshot = await getDocs(bookingsRef);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBookings(docs);
        } catch (error) {
            console.error(error);
        } finally {
            setBookingsLoading(false);
        }
    }, []);

    const fetchAllBookings = useCallback(async () => {
        setAllBookingsLoading(true);
        try {
            const bookingsGroupRef = collectionGroup(db, 'bookings');
            const querySnapshot = await getDocs(bookingsGroupRef);
            const docs = querySnapshot.docs.map(doc => {
                const pathSegments = doc.ref.path.split('/');
                const bookingOwnerId = pathSegments[1];

                return { id: doc.id, userId: bookingOwnerId, ...doc.data() };
            });

            setAllBookings(docs);
        } catch (error) {
            console.error("Error fetching all global bookings: ", error);
        } finally {
            setAllBookingsLoading(false);
        }
    }, []);

    const addDoctors = useCallback(async (name, department) => {
        try {
            const newDoctorRef = doc(collection(db, "doctors"));
            await setDoc(newDoctorRef, {
                name: name.trim(),
                department: department,
                active: true
            });
            const newDoctor = await getDocs(newDoctorRef);

            setDoctors(prev => [{ id: newDoctor.id, ...newDoctor.data() }, ...prev]);
        } catch (error) {
            console.error("Error fetch doctor: ", error);
        }
    }, []);

    const saveBooking = useCallback(async (userId, name, gender, email, phone, datetime, department, doctor, message) => {
        try {
            // 1. Check if the doctor already has a booking at this specific date and time slot
            const bookingsGroupRef = collectionGroup(db, 'bookings');
            const q = query(
                bookingsGroupRef,
                where('doctor', '==', doctor),
                where('datetime', '==', datetime)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // If any records are returned, it means a conflict exists
                setStatus({ loading: false, error: "This doctor is already booked for the selected date and time slot. Please choose another time or doctor.", success: false });
                return;
            }

            // 2. Proceed with booking if no conflict is found
            const bookingsRef = collection(db, `users/${userId}/bookings`);
            const newBookingRef = doc(bookingsRef);
            await setDoc(newBookingRef, { name, gender, email, phone, datetime, department, doctor, message });

            const newBooking = await getDoc(newBookingRef);
            setBookings(prev => [{ id: newBooking.id, ...newBooking.data() }, ...prev]);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const updateBooking = useCallback(async (userId, bookingId, newName, newGender, newEmail, newPhone, newDatetime, newDepartment, newDoctor, newMessage) => {
        try {
            const bookingsRef = doc(db, `users/${userId}/bookings/${bookingId}`);
            const bookingSnap = await getDoc(bookingsRef);
            if (!bookingSnap.exists()) throw new Error("Booking does not exist");

            const bookingData = bookingSnap.data();

            // Build temporary prospective data object to validate fields
            const targetDoctor = newDoctor || bookingData.doctor;
            const targetDatetime = newDatetime || bookingData.datetime;

            // Only run a conflict check if the doctor or time slot actually changed
            if (targetDoctor !== bookingData.doctor || targetDatetime !== bookingData.datetime) {
                const bookingsGroupRef = collectionGroup(db, 'bookings');
                const q = query(
                    bookingsGroupRef,
                    where('doctor', '==', targetDoctor),
                    where('datetime', '==', targetDatetime)
                );

                const querySnapshot = await getDocs(q);

                // Exclude this specific booking document from triggering the conflict match
                const conflicts = querySnapshot.docs.filter(doc => doc.id !== bookingId);

                if (conflicts.length > 0) {
                    setStatus({ loading: false, error: "This slot is already reserved for this practitioner. Please select another timing option.", success: false });
                    return;
                }
            }

            const updatedData = {
                ...bookingData,
                name: newName || bookingData.name,
                gender: newGender || bookingData.gender,
                email: newEmail || bookingData.email,
                phone: newPhone || bookingData.phone,
                datetime: targetDatetime,
                department: newDepartment || bookingData.department,
                doctor: targetDoctor,
                message: newMessage || bookingData.message,
            };

            await updateDoc(bookingsRef, updatedData);
            setBookings(prev => prev.map(b => (b.id === bookingId ? { id: bookingId, ...updatedData } : b)));
        } catch (error) {
            console.error(error);
        }
    }, []);

    const deleteBooking = useCallback(async (userId, bookingId) => {
        try {
            const bookingRef = doc(db, `users/${userId}/bookings/${bookingId}`);
            await deleteDoc(bookingRef);
            setBookings(prev => prev.filter(booking => booking.id !== bookingId));
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "doctors"),
            (querySnapshot) => {
                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setDoctors(docs);
            },
            (error) => {
                console.error("Error listening to dynamic doctor collection: ", error);
            }
        );

        // Clean up the stream listener pipeline automatically when unmounting
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
        });
    }, []);

    const value = { currentUser, bookings, bookingsLoading, doctors, status, setStatus, fetchBookingsByUser, saveBooking, updateBooking, deleteBooking, addDoctors, allBookings, allBookingsLoading, fetchAllBookings };

    return (
        <BooksContext.Provider value={value}>
            {!loading && children}
        </BooksContext.Provider>
    );
}