const express = require('express')
const bodyParser = require('body-parser')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const app = express()

const Event = require('./models/events')
const User = require('./models/users')

app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
    type Event {
      _id: ID
      title: String!
      description: String!
      price: Float!
      date: String!
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

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
    }
    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find().populate('creator')
      .then(events => {
        return events.map(event => ({
          ...event._doc,
          _id: event.id,
          creator: {
            ...event._doc.creator._doc,
            _id: event._doc.creator.id
          }
         }))
      })
      .catch(err => {throw(err)})
    },
    createEvent: ({eventInput}) => {
      let createdEvent
      const event = new Event({
        title: eventInput.title,
        description: eventInput.description,
        price: +eventInput.price,
        date: new Date(eventInput.date),
        creator: '62e6abfd895851045e17f8d3',
      })

      return event
      .save()
      .then(result => {
        createdEvent = {...result._doc, _id: result.id}
        return User.findById('62e6abfd895851045e17f8d3')
      })
      .then(user => {
        if (!user) {
          throw Error('User does not find')
        }
        user.createdEvents.push(event)
        return user.save()
      })
      .then(result => {
        return createdEvent
      })
    },
    createUser: ({userInput}) => {
      return User.findOne({email: userInput.email})
      .then(result => {
        if (result) {
          throw Error('User exists already')
        }
        return bcrypt.hash(userInput.password, 12)
      })
      .then(hashedPassword => {
        const user = new User({
          email: userInput.email,
          password: hashedPassword
        })
        return user.save()
      })
      .then(result => ({
        ...result._doc,
        _id: result.id,
        password: null
      }))
    }
  },
  graphiql: true
}))

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.gu9f4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
)
.then(() => {
  console.log('userSchema listen')
  app.listen(3000)
})
.catch(err => {
  console.log('userSchema error')
  console.log(err)
})