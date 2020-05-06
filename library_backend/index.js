require('dotenv').config();
const { v4: uuid } = require('uuid');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
  PubSub,
} = require('apollo-server');

const Author = require('./models/Author');
const Book = require('./models/Book');
const User = require('./models/User');

const pubsub = new PubSub();

mongoose.set('useFindAndModify', false);

const MONGODB_URI = process.env.MONGODB_URI;

console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: String
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    password: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    authorCount: Int!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]!
    ): Book

    createAuthor(name: String!, born: String): Author
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      password: String!
      favoriteGenre: String!
    ): User

    login(username: String!, password: String!): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
  Query: {
    bookCount: () => {
      return Book.collection.countDocuments();
    },
    authorCount: () => {
      return Author.collection.countDocuments();
    },
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author');
      try {
        if (!args.author && !args.genre) {
          return books;
        } else if (args.author) {
          const byAuthor = books.filter(
            (book) => book.author.name === args.author
          );
          return byAuthor;
        } else if (args.genre) {
          const byGenre = books.filter((book) => {
            return book.genres.includes(args.genre);
          });

          return byGenre;
        } else if (args.author && args.genre) {
          const byGenreAndAuthor = books.filter((book) => {
            return (
              book.genres.includes(args.genre) &&
              book.author.name === args.author
            );
          });

          console.log(byGenreAndAuthor);
          return byGenreAndAuthor;
        }
      } catch (err) {
        throw new UserInpuError(err.message, {
          invalidArgs: args,
        });
      }
    },
    allAuthors: async () => {
      const result = await Author.find({});
      const authors = result.map((author) => author.toJSON());
      return authors;
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      console.log(args);
      if (!currentUser) {
        throw new AuthenticationError('You have to be logged in to add a book');
      }
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        const newAuthor = new Author({ name: args.author });
        author = await newAuthor.save();
      }
      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      });
      try {
        const newBook = await book.save();
        author.bookCount++;
        await author.save();

        const bookAuthor = await Author.findById({ _id: newBook.author });
        newBook.author = bookAuthor;
        pubsub.publish('BOOK_ADDED', { bookAdded: newBook });
        return newBook;
      } catch (e) {
        throw new UserInputError('title should not be less than 2 characters', {
          invalidArgs: args,
        });
      }
    },
    createAuthor: async (root, args) => {
      const author = new Author({ ...args });
      try {
        const newAuthor = await author.save();
        return newAuthor;
      } catch (err) {
        throw new UserInputError(
          'author should not be less than 4 characters',
          {
            invalidArgs: args,
          }
        );
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError(
          'You have to be logged in to edit an author'
        );
      }

      const author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;
      return author.save();
    },
    createUser: async (root, args) => {
      try {
        const hashPassword = await bcrypt.hash(args.password, 10);
        const user = new User({ ...args, password: hashPassword });
        return user.save();
      } catch (err) {
        console.log('error while saving', err);
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || !args.password) {
        throw new UserInputError('wrong credentials');
      }

      const correctPass = await bcrypt.compare(args.password, user.password);
      if (!correctPass) {
        throw new UserInputError(
          ' either the username or password is not correct'
        );
      }

      const userDetails = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userDetails, process.env.SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.SECRET);
      if (!decodedToken) {
        return { currentUser: null };
      }
      const currentUser = User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Subscription ready at ${subscriptionsUrl}`);
});
