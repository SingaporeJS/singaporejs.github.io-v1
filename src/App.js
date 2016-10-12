import React, { Component } from 'react'
import { Link } from 'react-router'

import Logo from './Logo'

import './App.css'

/**
 * Overall page layout, including sidebar, main content etc.
 */

export default class App extends Component {
  componentWillMount () {
    const { container } = this.props
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      container.onError(error || {message: msg, url, lineNo, columnNo})
    }

    window.onunhandledrejection = (event) => {
      container.onError(event)
    }
  }

  render () {
    const { upcoming, errors, past, about } = this.props.data
    const { container } = this.props
    return (
      <div className='App row fill'>
        <header className='App-header'>
          <Link to='/'>
            <Logo />
            <h2>SingaporeJS</h2>
          </Link>
          <h4>Events</h4>
          <menu className='App-menu'>
            {
              !about.next_event ? null
              : <li><Link to={`/event/${about.next_event.id}`} activeClassName='active' activeOnlyWhenExact>Next</Link></li>
            }
            <li><Link to='/upcoming' activeClassName='active' activeOnlyWhenExact>Upcoming <span className='count'>({upcoming.length})</span></Link></li>
            <li><Link to='/past' activeClassName='active'>Past <span className='count'>({past.length})</span></Link></li>
          </menu>
          <h4>Info</h4>
          <menu className='App-menu'>
            <li><Link to='/about' activeClassName='active'>About</Link></li>
            <li><a href='https://gitter.im/SingaporeJS/discussions' onClick={toggleChat}>Chat</a></li>
            <li><a href='http://www.meetup.com/Singapore-JS/' target='_blank'>Join</a></li>
            <li><a href='https://github.com/SingaporeJS' target='_blank'>Github</a></li>
          </menu>
        </header>
        <main className='App-main column fill'>
          {this.props.children}
          <Errors errors={errors} onClearErrors={container.clearErrors} />
        </main>
      </div>
    )
  }
}

/**
 * Container for displaying Errors
 */

function Errors (props) {
  const { errors } = props
  if (!errors.length) return null
  const errTitle = encodeURIComponent(errors.map(err => {
    return String(err.message || err.reason || err)
  }).join(' & ').slice(0, 50))

  const errBody = encodeURIComponent(window.location + '\n' + errors.map(err => {
    return String(err.message || err.reason || err).slice(0, 80) + '\n```\n' + String(err.message || err.reason || err) + '\n' + err.stack || JSON.stringify(err) || '' + '\n```'
  }).join('\n\n'))

  return (
    <dialog className='Errors column' open>
      <h4>Oops, there was a problem.</h4>
      <button className='close' onClick={props.onClearErrors}>X</button>
      {errors.map((err, i) => (
        <div className='error' key={i}>
          {String(err.message || err.reason || err).trim()}
        </div>
      ))}
      <div className='row actions'>
        <a className='button' onClick={() => window.location.reload()} title='Refresh'>Turn it on and off again</a>
        <a className='button' onClick={props.onClearErrors} title='Close Dialog'>Ignore</a>
        <a className='button' target='_blank' title='Open new issue on GitHub' href={`https://github.com/SingaporeJS/singaporejs.github.io/issues/new?title=${errTitle}&body=${errBody}&labels=bug`}>Report Error</a>
      </div>
    </dialog>
  )
}

function isChatOpen () {
  try {
    const el = window.gitter.chat.defaultChat.options.activationElement[0]
    return el.classList.contains('is-collapsed')
  } catch (_) {
    return false
  }
}

function toggleChat (event) {
  event.preventDefault()
  if (!window.gitter) return
  window.gitter.chat.defaultChat.toggleChat(!isChatOpen())
}
