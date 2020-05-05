import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';

import { LOGIN } from '../queries';
const Login = ({ show, setToken, setPage }) => {
  const [error, setError] = useState('');

  const [loginUser, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;

      setToken(token);
      localStorage.setItem('library-user-token', token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    event.target.username.value = '';
    event.target.password.value = '';
    loginUser({ variables: { username, password } });
    setPage('authors');
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>Login to Library</h2>
      <p>{error}</p>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div>
          <label htmlFor="username" name="username">
            username:{' '}
          </label>
          <input id="username" type="text" />
        </div>
        <div>
          <label htmlFor="passwrod" name="password">
            username:{' '}
          </label>
          <input id="password" type="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
