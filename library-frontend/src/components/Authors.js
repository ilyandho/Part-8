import React from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries';
import EditAuthor from './EditAuthor';

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const [updateAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });
  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const editAuthor = (name, born) => {
    console.log({ variables: { name, born } });
    updateAuthor({ variables: { name, born } });
  };
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <EditAuthor editAuthor={editAuthor} authors={result.data.allAuthors} />
    </div>
  );
};

export default Authors;
