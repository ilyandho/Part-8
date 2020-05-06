import React, { useState, useEffect } from 'react';
import {
  useApolloClient,
  useQuery,
  // useMutation,
  useSubscription,
} from '@apollo/client';

import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import Recommend from './components/Recommend';

import { USER, BOOK_ADDED } from './queries';
import './App.css';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({});

  const client = useApolloClient();

  const currentUser = useQuery(USER);

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      setMessage({
        message: `There is a new book '${subscriptionData.data.bookAdded.title}' by '${subscriptionData.data.bookAdded.author.name}'`,
        type: 'success',
      });
      setTimeout(() => {
        setMessage({});
      }, 5000);
    },
  });

  useEffect(() => {
    if (currentUser.data !== undefined) {
      setUser(currentUser.data.me);
    }
  }, [token, currentUser]);

  const logout = () => {
    setUser(null);
    setPage('login');
    setToken(null);
    localStorage.removeItem('library-user-token');
    client.clearStore();
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <button onClick={() => setPage('add')}>add book</button>
        ) : null}
        {!token ? (
          <button onClick={() => setPage('login')}>login</button>
        ) : null}
        {token ? (
          <button onClick={() => setPage('recommend')}>recommended</button>
        ) : null}
        {token ? <button onClick={logout}>logout</button> : null}
      </div>
      <div className={message.type}>
        <h4>{message.message}</h4>
      </div>

      <Authors
        show={page === 'authors'}
        token={token}
        setMessage={setMessage}
      />

      <Books show={page === 'books'} setMessage={setMessage} />

      <NewBook
        show={page === 'add'}
        setPage={setPage}
        setMessage={setMessage}
      />
      <Recommend
        show={page === 'recommend'}
        user={user}
        setMessage={setMessage}
      />

      <Login
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
        setMessage={setMessage}
      />
    </div>
  );
};

export default App;
