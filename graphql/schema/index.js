const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Event {
      _id: ID
      title: String!
      description: String!
      price: Float!
      date: String!
      creator: User!
    }

    type Message {
      _id: ID
      message: String!
      creator: User!
    }

    type User {
      _id: ID
      email: String!
      password: String
      createdEvents: [Event!]
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input MessageInput {
      
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
      messages: []
    }
    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `)