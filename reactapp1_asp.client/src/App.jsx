import  { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [message, setMessage] = useState('');
    const [page, setPage] = useState('login'); // Navigation between Login and Register

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            setCurrentUser({ token, role });
        }
    }, []);

    function handleLogout() {
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setMessage('You have logged out.');
        setPage('login');
    }

    return (
        <div>
            <h1>Library App</h1>
            {currentUser ? (
                currentUser.role === 'librarian' ? (
                    <LibrarianDashboard currentUser={currentUser} onLogout={handleLogout} />
                ) : (
                        <UserDashboard currentUser={currentUser} onLogout={handleLogout} />
                )
            ) : (
                <>
                    <nav style={styles.nav}>
                        <button style={styles.navButton} onClick={() => setPage('login')}>
                            Login
                        </button>
                        <button style={styles.navButton} onClick={() => setPage('register')}>
                            Register
                        </button>
                    </nav>
                    {page === 'login' && <Login setCurrentUser={setCurrentUser} setMessage={setMessage} />}
                    {page === 'register' && <Register setMessage={setMessage} />}
                </>
            )}
            <p style={styles.message}>{message}</p>
        </div>
    );
}




function Login({ setCurrentUser, setMessage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin(event) {
        event.preventDefault();
        try {
            const response = await axios.post('/api/Users/login', { email, password });
            const { token, role } = response.data;

            // Décoder le token JWT pour récupérer l'ID utilisateur
            const decodedToken = JSON.parse(atob(token.split('.')[1])); // Attention à l'encodage JWT
            const userId = decodedToken.sub; // Récupère l'ID utilisateur (sub)

            // Sauvegarder les informations utilisateur
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId); // Sauvegarde l'ID utilisateur
            setCurrentUser({ token, role, id: userId }); // Met à jour currentUser avec l'ID utilisateur
            setMessage(`Login successful! Welcome, ${role}.`);
        } catch (error) {
            console.error('Login Error:', error);
            setMessage(error.response?.data?.message || 'Login failed.');
        }
    }   

    return (
        <form onSubmit={handleLogin} style={styles.form}>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
            />
            <button type="submit" style={styles.button}>
                Login
            </button>
        </form>
    );
}







function Register({ setMessage }) {
    const [formData, setFormData] = useState({
        userName: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
    });

    async function handleRegister(event) {
        event.preventDefault(); // Prevent page reload
        try {
            const response = await axios.post('/api/Users/register', formData);
            setMessage('Registration successful! You can now login.');
        } catch (error) {
            console.error('Registration Error:', error);
            setMessage(error.response?.data?.message || 'Registration failed.');
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <form onSubmit={handleRegister} style={styles.form}>
            <h2>Register</h2>
            <input
                type="text"
                name="userName"
                placeholder="Username"
                value={formData.userName}
                onChange={handleChange}
                style={styles.input}
            />
            <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
            />
            <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
            />
            <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={styles.input}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
            />
            <button type="submit" style={styles.button}>
                Register
            </button>
        </form>
    );
}

function LibrarianDashboard({ currentUser, onLogout }) {
    const [books, setBooks] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loans, setLoans] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        author: '',
        publisher: '',
        publicationDate: '',
        price: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchBooks();
        fetchReservations();
        fetchLoans();
    }, []);

    async function fetchBooks() {
        try {
            const response = await axios.get('/api/Books', {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }

    async function fetchReservations() {
        try {
            const response = await axios.get('/api/Reservations', {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            setReservations(response.data);
        } catch (error) {
            console.error('Error fetching reservations:', error.response || error);
        }
    }

    async function fetchLoans() {
        try {
            const response = await axios.get('/api/Loans', {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            setLoans(response.data);
        } catch (error) {
            console.error('Error fetching loans:', error.response || error);
        }
    }

    async function handleAcceptReservation(reservationId) {
        try {
            const response = await axios.post(
                "/api/Loans",
                reservationId, 
                {
                    headers: { Authorization: `Bearer ${currentUser.token}` },
                }
            );
            console.log("Loan created:", response.data);
            setMessage("Reservation accepted and loan created!");
        } catch (error) {
            console.error("Error accepting reservation:", error.response?.data || error);
            setMessage("Failed to accept the reservation.");
        }
    }



    async function handleReturnLoan(loanId) {
        try {
            await axios.put(`/api/Loans/${loanId}/Return`, null, {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            console.log('Loan marked as returned.');
            fetchLoans();
            fetchBooks();
        } catch (error) {
            console.error('Error returning loan:', error.response || error);
        }
    }

    async function handleDelete(bookId) {
        console.log('Attempting to delete book with ID:', bookId);
        try {
            await axios.delete(`/api/Books/${bookId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });
            setBooks(books.filter((book) => book.id !== bookId)); // Update UI
        } catch (error) {
            console.error('Error deleting book:', error.response || error);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            if (isEditing) {
                console.log('Updating book with ID:', formData.id);
                await axios.put(`/api/Books/${formData.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
                setBooks(books.map((book) => (book.id === formData.id ? { ...book, ...formData } : book)));
            } else {
                console.log('Adding new book:', formData);
                const response = await axios.post('/api/Books', {
                    title: formData.title,
                    author: formData.author,
                    publisher: formData.publisher,
                    publicationDate: formData.publicationDate,
                    price: formData.price,
                }, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
                console.log('Book added successfully:', response.data);
                setBooks([...books, response.data]);
            }
            resetForm();
        } catch (error) {
            console.error('Error saving book:', error.response || error);
        }
    }

    function handleEdit(book) {
        setFormData(book);
        setIsEditing(true);
    }

    function resetForm() {
        setFormData({
            id: null,
            title: '',
            author: '',
            publisher: '',
            publicationDate: '',
            price: '',
        });
        setIsEditing(false);
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div>
            <h2>Librarian Dashboard</h2>
            <button onClick={onLogout} style={styles.logoutButton}>
                Logout
            </button>

            {/* Add/Edit Book Section */}
            <h3>{isEditing ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="text"
                    name="author"
                    placeholder="Author"
                    value={formData.author}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="text"
                    name="publisher"
                    placeholder="Publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="date"
                    name="publicationDate"
                    value={formData.publicationDate}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>
                    {isEditing ? 'Update Book' : 'Add Book'}
                </button>
                {isEditing && (
                    <button type="button" onClick={resetForm} style={styles.cancelButton}>
                        Cancel
                    </button>
                )}
            </form>

            {/* Reservations Section */}
            <h3>Reservations</h3>
            <ul>
                {reservations.map((reservation) => (
                    <li key={reservation.id} style={styles.bookItem}>
                        <strong>{reservation.bookTitle}</strong> reserved by {reservation.userName}
                        <br />
                        <span>Reserved on: {new Date(reservation.reservationDate).toLocaleDateString()}</span>
                        <br />
                        <span>Expires on: {new Date(reservation.expirationDate).toLocaleDateString()}</span>
                        <button
                            onClick={() => handleAcceptReservation(reservation.id, reservation.bookId, reservation.userId)}
                            style={styles.acceptButton}
                        >
                            Accept Reservation
                        </button>
                    </li>
                ))}
            </ul>

            {/* Loans Section */}
            <h3>Loans</h3>
            <ul>
                {loans.map((loan) => (
                    <li key={loan.id} style={styles.bookItem}>
                        <strong>{loan.book.title}</strong> loaned to {loan.user.userName}
                        <br />
                        <span>Loaned on: {new Date(loan.loanDate).toLocaleDateString()}</span>
                        {loan.returnDate ? (
                            <span>
                                <br />Returned on: {new Date(loan.returnDate).toLocaleDateString()}
                            </span>
                        ) : (
                            <button
                                onClick={() => handleReturnLoan(loan.id)}
                                style={styles.returnButton}
                            >
                                Mark as Returned
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {/* Books List Section */}
            <h3>Books List</h3>
            <ul>
                {books.map((book) => (
                    <li key={book.id} style={styles.bookItem}>
                        <strong>{book.title}</strong> by {book.author} - ${book.price}
                        <button onClick={() => handleEdit(book)} style={styles.editButton}>
                            Edit
                        </button>
                        <button onClick={() => handleDelete(book.id)} style={styles.deleteButton}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}





function UserDashboard({ currentUser, onLogout }) {
    const [books, setBooks] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); 

    // Fetch books and reservations on component load
    useEffect(() => {
        fetchBooks();
        fetchReservations();
    }, []);

    // Fetch available books
    async function fetchBooks() {
        try {
            const response = await axios.get("/api/Books");
            setBooks(response.data.filter((book) => book.isAvailable)); // Only available books
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    }

    async function fetchReservations() {
        try {
            const response = await axios.get("/api/Reservations", {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });

            console.log("Reservations API response:", response.data);

            // Filter for all books where IsAvailable = false
            const unavailableBooks = response.data.filter(
                (reservation) => reservation.book && reservation.book.isAvailable === false
            );

            console.log("Books with IsAvailable = false:", unavailableBooks);

            setReservations(unavailableBooks);
        } catch (error) {
            console.error("Error fetching reservations:", error.response?.data || error);
        }
    }



    // Reserve a book
    async function handleReserve(bookId) {
        try {
            const response = await axios.post(
                "/api/Reservations",
                { bookId },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                }
            );
            alert("Book reserved successfully!");
            fetchBooks();
            fetchReservations();
        } catch (error) {
            console.error("Error reserving book:", error.response?.data || error);
            alert(error.response?.data?.message || "Failed to reserve the book.");
        }
    }

    // Cancel a reservation
    async function handleCancel(reservationId) {
        try {
            await axios.delete(`/api/Reservations/${reservationId}`, {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            fetchBooks(); 
            fetchReservations(); 
        } catch (error) {
            console.error("Error canceling reservation:", error.response?.data || error);
        }
    }

    // Filter books based on the search query
    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <h2>Welcome, {currentUser.userName}</h2>
            <button onClick={onLogout} style={styles.logoutButton}>
                Logout
            </button>

            {/* Search Bar */}
            <div style={styles.searchBarContainer}>
                <input
                    type="text"
                    placeholder="Search for a book..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {/* Available Books Section */}
            <h3>Available Books</h3>
            <ul style={styles.bookList}>
                {filteredBooks.map((book) => (
                    <li key={book.id} style={styles.bookItem}>
                        <strong>{book.title}</strong> by {book.author} <br />
                        <span>Publisher: {book.publisher}</span> <br />
                        <span>Price: ${book.price.toFixed(2)}</span> <br />
                        <button onClick={() => handleReserve(book.id)} style={styles.reserveButton}>
                            Reserve
                        </button>
                    </li>
                ))}
            </ul>

            {/* User Reservations Section */}
            <h3>My Reservations</h3>
            <ul style={styles.bookList}>
                {reservations.length > 0 ? (
                    reservations.map((reservation) => (
                        <li key={reservation.id} style={styles.bookItem}>
                            <strong>Book Title:</strong> {reservation.bookTitle} <br />
                            <span>Reserved on: {new Date(reservation.reservationDate).toLocaleDateString()}</span> <br />
                            <span>Expires on: {new Date(reservation.expirationDate).toLocaleDateString()}</span> <br />
                            <button
                                onClick={() => handleCancel(reservation.id)}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No reservations found.</p>
                )}
            </ul>
            <h3>Books Not Available</h3>
            <ul style={styles.bookList}>
                {reservations.map((reservation) => (
                    <li key={reservation.id} style={styles.bookItem}>
                        <strong>Book Title:</strong> {reservation.bookTitle} <br />
                        <strong>Reserved by:</strong> {reservation.userName} <br />
                        <span>Reserved on: {new Date(reservation.reservationDate).toLocaleDateString()}</span> <br />
                        <span>Expires on: {new Date(reservation.expirationDate).toLocaleDateString()}</span> <br />
                        <button
                            onClick={() => handleCancel(reservation.id)}
                            style={styles.cancelButton}
                        >
                            Cancel
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    logoutButton: {
        marginBottom: "20px",
        padding: "10px 20px",
        backgroundColor: "#f44",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    searchBarContainer: {
        marginBottom: "20px",
    },
    searchInput: {
        padding: "10px",
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },
    bookList: {
        listStyleType: "none",
        padding: 0,
    },
    bookItem: {
        marginBottom: "20px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
    },
    reserveButton: {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "10px",
    },
    cancelButton: {
        padding: "10px 20px",
        backgroundColor: "#f44",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "10px",
    },
};




export default App;
