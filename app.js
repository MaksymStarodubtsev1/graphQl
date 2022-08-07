require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { graphqlHTTP } = require('express-graphql')
const mongoose = require('mongoose')

const graphQlSchema = require('./graphql/schema/index')
const graphQlResolvers = require('./graphql/resolvers/index')

const app = express()

app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}))

mongoose.connect(
  `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
)
.then(() => {
  console.log('userSchema listen')
  app.listen(3000)
})
.catch(err => {
  console.log('userSchema error')
  console.log(err)
})