const express = require('express')
const bodyParser = require('body-parser')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')


const app = express()

const Event = require('./models/events')

app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
    type Event {
      _id: ID
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }
    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find()
      .then(events => {
        console.log('events', events)
        return events.map(event => {
          console.log('eventeventevent', event)
         return {
          ...event._doc,
          _id: event.id
         }
        })
      })
      .catch(err => {throw(err)})
    },
    createEvent: ({eventInput}) => {
      const event = new Event({
        title: eventInput.title,
        description: eventInput.description,
        price: +eventInput.price,
        date: new Date(eventInput.date),
      })

      return event
      .save()
      .then(res => {
        console.log(res)
        return {...res._doc, _id: res.id}
      })
      .catch(err => {
        console.log(err)
      })
    }
  },
  graphiql: true
}))

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.gu9f4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
)
.then(() => {
  app.listen(3000)
})
.catch(err => {
  console.log(err)
})