import { gql } from '@apollo/client';

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

// query {
//   allBooks {
//     title
//     author
//     published
//   }
// }

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      published
      id
      author {
        name
      }
      genres
      id
    }
  }
`;

export const ADD_NEW_BOOK = gql`
  mutation newBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title

      id
      author {
        name
        id
      }
    }
  }
`;

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const USER = gql`
  query {
    me {
      username
      id
      favoriteGenre
    }
  }
`;
