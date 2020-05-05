import React, { useState, useEffect } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';

import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import Recommend from './components/Recommend';

import { USER } from './queries';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);

  const [user, setUser] = useState(null);
  const client = useApolloClient();

  const currentUser = useQuery(USER);

  useEffect(() => {
    setUser(currentUser);
  }, [token, currentUser]);

  const logout = () => {
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
        {user ? <button onClick={() => setPage('add')}>add book</button> : null}
        {!user ? <button onClick={() => setPage('login')}>login</button> : null}
        {user ? (
          <button onClick={() => setPage('recommend')}>recommended</button>
        ) : null}
        {user ? <button onClick={logout}>logout</button> : null}
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />
      <Recommend show={page === 'recommend'} user={user} />

      <Login show={page === 'login'} setToken={setToken} setPage={setPage} />
    </div>
  );
};

export default App;
