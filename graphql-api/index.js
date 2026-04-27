const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const typeDefs = `#graphql
  type User {
    id: ID!
    fullname: String!
    email: String!
    dob: String
  }

  type Comment {
    id: ID!
    title: String!
    content: String!
  }

  type Article {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }

  type Query {
    # Fetch all articles, including their comments and author
    articles: [Article!]!
    
    # Fetch a specific article by its ID
    article(id: ID!): Article
  }

  type Mutation {
    # Create a new article
    createArticle(title: String!, content: String!, authorId: ID!): Article!
  }
`;

// Sample data to simulate a database
const users = [
  { id: '1', fullname: 'John Doe', email: 'john@example.com', dob: '1990-01-01' },
  { id: '2', fullname: 'Jane Smith', email: 'jane@example.com', dob: '1995-05-15' },
];

const comments = [
  { id: '101', articleId: '1', title: 'Great article!', content: 'I really enjoyed reading this.' },
  { id: '102', articleId: '1', title: 'Thanks', content: 'Very informative.' },
  { id: '103', articleId: '2', title: 'Question', content: 'Could you explain this further?' },
];

const articles = [
  { id: '1', title: 'Introduction to GraphQL', content: 'GraphQL is a query language for APIs...', authorId: '1' },
  { id: '2', title: 'Advanced GraphQL Concepts', content: 'Today we will discuss mutations...', authorId: '2' },
];

// Resolvers define how to fetch the types defined in your schema.
const resolvers = {
  Query: {
    articles: () => articles,
    article: (_, { id }) => articles.find(article => article.id === id),
  },
  Mutation: {
    createArticle: (_, { title, content, authorId }) => {
      const newArticle = {
        id: String(articles.length + 1), // Simple ID generation
        title,
        content,
        authorId,
      };
      articles.push(newArticle);
      return newArticle;
    },
  },
  Article: {
    // Fetch the author for an article
    author: (parent) => users.find(user => user.id === parent.authorId),

    // Fetch the comments for an article
    comments: (parent) => comments.filter(comment => comment.articleId === parent.id),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`  GraphQL Server ready at: ${url}`);
});
