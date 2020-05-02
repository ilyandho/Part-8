import React, { useState } from 'react';

const EditAuthor = ({ editAuthor, authors }) => {
  const [born, setBorn] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = event.target.eman.value;
    editAuthor(name, Number(born));
    setBorn('');
  };

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={(event) => handleSubmit(event)}>
        <label>
          Pick your favorite flavor:
          <select name="eman">
            {authors.map((author) => (
              <option key={author.name} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          born{' '}
          <input
            type="number"
            onChange={(event) => setBorn(event.target.value)}
          />
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default EditAuthor;
