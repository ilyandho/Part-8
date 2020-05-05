import React, { useState } from 'react';
import { useQuery } from '@apollo/client';

import { ALL_BOOKS } from '../queries';

const Books = (props) => {
  const [genres, setGenres] = useState([]);
  const [filter, setFilter] = useState('all');
  const result = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  result.data.allBooks.forEach((book) => {
    book.genres.forEach((genre) => {
      if (!genres.includes(genre)) {
        const moreGenres = [...genres, genre];
        setGenres(moreGenres);
      }
    });
  });

  const books =
    filter === 'all'
      ? result.data.allBooks
      : result.data.allBooks.filter((book) => book.genres.includes(filter));

  const handleFilter = (event) => {
    setFilter(event.target.value);
  };
  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre) => {
        return (
          <button
            key={genre}
            value={genre}
            onClick={(event) => handleFilter(event)}>
            {genre}
          </button>
        );
      })}
      <button value="all" onClick={(event) => handleFilter(event)}>
        All
      </button>
    </div>
  );
};

export default Books;
