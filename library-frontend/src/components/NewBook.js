import React, { useState } from 'react';
import { useMutation } from '@apollo/client';

import { ADD_NEW_BOOK, ALL_BOOKS } from '../queries';

const NewBook = ({ show, setPage, setMessage }) => {
  const [title, setTitle] = useState('');
  const [author, setAuhtor] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const [addNewBook] = useMutation(ADD_NEW_BOOK, {
    onError: (error) => {
      setMessage({ message: error.graphQLErrors[0].message, type: 'error' });
    },
    update: (store, response) => {
      const booksInStore = store.readQuery({ query: ALL_BOOKS });

      store.writeQuery({
        query: ALL_BOOKS,
        data: {
          booksInStore,
          allBooks: [booksInStore, response.data.addBook],
        },
      });
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    console.log({ title, published: Number(published), author, genres });

    addNewBook({
      variables: { title, published: Number(published), author, genres },
    });

    setTitle('');
    setPublished('');
    setAuhtor('');
    setGenres([]);
    setGenre('');
    setPage('books');
  };

  const addGenre = () => {
    if (!genre) return;
    setGenres(genres.concat(genre));
    setGenre('');
    console.log(genres);
  };

  if (!show) {
    return null;
  }
  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(',')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
