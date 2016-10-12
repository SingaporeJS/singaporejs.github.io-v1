import React from 'react'
import Perf from 'react/lib/ReactPerf'
import { render } from 'react-dom'
import { HashRouter, Match, Miss, Link, Redirect } from 'react-router'
import humanDate from 'human-date'

import Data from './Data'
import _App from './App'

import './index.css'
import './favicon'

if (process.env !== 'production') {
  window.SingaporeJS = {
    Perf
  }
}

const App = Data(_App)

render(<Index />, document.querySelector('#root'))

/**
 * Router
 */

function Index () {
  return (
    <HashRouter>
      <App>
        <Match pattern='/' exactly component={Data(Next)} />
        <Match pattern='/upcoming' exactly component={Data(Upcoming)} />
        <Match pattern='/past' component={Data(Past)} />
        <Match pattern='/about' component={Data(About)} />
        <Match pattern='/event/:eventID' component={Data(Event)} />
        <Miss component={NotFound} />
      </App>
    </HashRouter>
  )
}

/**
 * Page Components
 */

function Next (props) {
  const { about } = props.data
  if (!about.next_event) return <div className='Next page'>No Upcoming Events!</div>
  return (
    <div className='Next page'>
      <Redirect to={`/event/${about.next_event.id}`} />
    </div>
  )
}

function Upcoming (props, context) {
  const events = props.data.upcoming
  const groups = groupBy(events, groupByMonthAndYear)
  return (
    <div className='Upcoming page'>
      <h2>Upcoming</h2>
      <GroupedEvents groups={groups} />
    </div>
  )
}

function Past (props, context) {
  const events = props.data.past
  const groups = groupBy(events, groupByMonthAndYear)

  return (
    <div className='Past page'>
      <h2>Past Events</h2>
      <GroupedEvents groups={groups} />
    </div>
  )
}

function About (props) {
  const { about } = props.data
  return (
    <div className='About page'>
      <div className='photo' style={{backgroundImage: `url(${about.key_photo.photo_link})`}} />
      <h1>SingaporeJS</h1>
      <a href='http://www.meetup.com/Singapore-JS/' target='_blank'>SingaporeJS on Meetup.com</a>
      <div className='info row'>
        <div>
          <h3>Members</h3>
          {about.members}
        </div>
        <div>
          <h3>Created</h3>
          <div className='column'>
            <LocaleDate date={about.created} dateonly />
            <RelativeDate date={about.created} />
          </div>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: about.description }} />
    </div>
  )
}

function NotFound () {
  return (
    <div className='NotFound page'>
      Not Found
    </div>
  )
}

function Event (props) {
  const { eventID } = props.params
  const event = (
    props.data.upcoming.find(d => d.id === eventID) ||
    props.data.past.find(d => d.id === eventID)
  )
  if (!event) return <NotFound />

  return (
    <div className='Event page'>
      <h1>{event.name} <a href={event.event_url} target='_blank' title='View event on Meetup.com' /></h1>
      {/* EVENT INFO */}
      <div className='info row'>
        <div>
          <h3>When</h3>
          <div className='column'>
            <LocaleDate date={event.time} />
            <RelativeDate date={event.time} />
          </div>
        </div>
        {
          !event.rating || !event.rating.count ? null
          : (
            <div>
              <h3>Rating</h3>
              {Math.round(event.rating.average * 10) / 10} out of 5 ({event.rating.count} Votes)
            </div>
          )
        }
        {
          !event.venue ? null
          : (
            <div>
              <h3>Where</h3>
              <address>
                {
                  [
                    event.venue.name,
                    event.venue.address_1,
                    event.venue.address_2,
                    event.venue.city
                  ].filter(Boolean).join('\n')
                }
              </address>
              <a href={GoogleMapsURL(event)} target='_blank'>
                View Map
              </a>
            </div>
          )
        }
        <div>
          <h3>{event.yes_rsvp_count} RSVPs</h3>
          <a href={event.event_url} target='_blank'>
            { event.status === 'upcoming' ? 'RSVP Now' : 'View Event' }
          </a>
        </div>
      </div>
      <div className='description'>
        {/* EVENT WYSIWYG HTML */}
        <div dangerouslySetInnerHTML={{ __html: event.description }} />
      </div>
    </div>
  )
}

/**
 * Other Components
 */

function GroupedEvents (props) {
  const { groups } = props
  return (
    <div className='GroupedEvents'>
      {Object.keys(groups).map(title => (
        <div className='eventGroup' key={title}>
          <h4>{title}</h4>
          <EventsLinks events={groups[title]} />
        </div>
      ))}
    </div>
  )
}

function EventsLinks (props) {
  const { events } = props
  return (
    <ul className='EventsLinks'>
      {events.map(event => (
        <li key={event.id} title={event.name}>
          <Link to={`/event/${event.id}`}>
            {event.name} <span className='count'>({event.yes_rsvp_count})</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function RelativeDate (props) {
  const { date } = props
  if (!date) return <span className='RelativeDate' />
  return (
    <time className='RelativeDate' dateTime={date} title={new Date(date).toLocaleString()}>{relativeDate(date)}</time>
  )
}

function LocaleDate (props) {
  const { date, dateonly } = props
  if (!date) return <span className='LocaleDate' />
  return (
    <time className='LocaleDate' dateTime={date} title={relativeDate(date)}>
      {
        dateonly
        ? new Date(date).toLocaleDateString()
        : new Date(date).toLocaleString()
      }
    </time>
  )
}

/**
 * Utility functions
 */

function relativeDate (date) {
  return humanDate.relativeTime(new Date(date))
}

function groupByMonthAndYear (event) {
  const d = new Date(event.time)
  const month = d.toLocaleString([], { month: 'long' })
  return `${month} ${d.getFullYear()}`
}

function groupBy (arr, getGroupName) {
  return arr.reduce((groups, obj) => {
    const groupName = getGroupName(obj)
    let group = groups[groupName]
    if (!group) {
      groups[groupName] = [obj]
    } else {
      group.push(obj)
    }
    return groups
  }, {})
}

function GoogleMapsURL (event) {
  return `https://maps.google.com/maps?f=q&hl=en&q=${
    encodeURIComponent([
      event.venue.address_1,
      event.venue.city,
      event.venue.country
    ].join(' '))
  }`
}
