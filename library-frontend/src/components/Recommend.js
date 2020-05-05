import React from 'react';
import { useQuery } from '@apollo/client';

import { ALL_BOOKS } from '../queries';

const Recommend = ({ show, user }) => {
  const result = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });

  if (!show) {
    return null;
  }

  if (result.loading) {
    let screen = <p>loading ....</p>;
    return screen;
  }

  //   console.log(user);
  //   console.log(result.data.allBooks);

  const books = result.data.allBooks.filter((book) =>
    book.genres.includes(user.data.me.favoriteGenre)
  );
  console.log(books);

  return (
    <div>
      <h2>Recommended books</h2>
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
    </div>
  );
};

export default Recommend;
