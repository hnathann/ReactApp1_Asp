import React, { useState, useEffect } from 'react';
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
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            setCurrentUser({ token, role });
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
        </div>
    );
}

const styles = {
    //no css for later 
};




function UserDashboard({ currentUser, onLogout }) {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetchBooks();
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
            console.error('Error fetching books for user:', error);
        }
    }

    return (
        <div>
            <h2>Library Catalog</h2>
            <button onClick={onLogout} style={styles.logoutButton}>
                Logout
            </button>
            <ul style={styles.bookList}>
                {books.map((book) => (
                    <li key={book.id} style={styles.bookItem}>
                        <strong>{book.title}</strong> by {book.author} <br />
                        <span>Publisher: {book.publisher}</span> <br />
                        <span>Published on: {new Date(book.publicationDate).toLocaleDateString()}</span> <br />
                        <span>Price: ${book.price.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}



export default App;
