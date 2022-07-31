const bcrypt = require('bcryptjs')
const Event = require('../../models/events')
const User = require('../../models/users')


const events = eventIds => {
  return Event.find({ _id: { $in: eventIds} })
  .then(events => events.map(event => ({
    ...event._doc.creator,
    _id: event.id,
    date: new Date(event._doc.date).toISOString(),
    creator: user.bind(this, event._doc.creator)
  })))
}

const user = userId => {
  return User.findById(userId)
  .then(user => ({
    ...user._doc,
    _id: user.id,
    createdEvents: events.bind(this, user._doc.createdEvents)
  }))
}

module.exports = {
  events: () => {
    return Event.find()
    .then(events => {
      return events.map(event => ({
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
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
      createdEvent = {
        ...result._doc,
        _id: result.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      }
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
}