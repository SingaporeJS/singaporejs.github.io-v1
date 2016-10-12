import * as Meetup from './meetup'
import React from 'react'
import PureMixin from 'react/lib/ReactComponentWithPureRenderMixin'

/**
 * Wraps supplied Component. Injects shared data as props.
 */

export default function RequiresData (Component) {
  return function (props) {
    return <DataWrapper {...props} Component={Component} />
  }
}

class DataWrapper extends React.Component {
  constructor (...props) {
    super(...props)
    DataWrapper.data = this.state = DataWrapper.data || {
      past: [],
      upcoming: [],
      about: {},
      errors: []
    }

    this.onError = this.onError.bind(this)
    this.clearErrors = this.clearErrors.bind(this)
  }

  onError (err) {
    const incomingErrors = Array.isArray(err) ? err : [err]
    const errors = this.state.errors.concat(incomingErrors)
    console.error('Whoops', errors)
    this.setState({ errors })
  }

  clearErrors () {
    this.setState({ errors: [] })
  }

  componentWillMount () {
    this.setState({
      past: Meetup.cachedPast(),
      upcoming: Meetup.cachedUpcoming(),
      about: Meetup.cachedAbout()
    })

    Meetup.fetchAbout().then(about => {
      this.setState({ about })
    }, this.onError)

    Meetup.fetchUpcoming().then(upcoming => {
      this.setState({ upcoming })
    }, this.onError)

    Meetup.fetchPast().then(past => {
      this.setState({ past })
    }, this.onError)
  }

  render () {
    if (process.env !== 'production') {
      Object.assign(window.SingaporeJS, this.state)
    }

    const Component = this.props.Component
    return (
      <Component {...this.props} data={this.state} container={this} />
    )
  }
}

Object.assign(DataWrapper.prototype, PureMixin)
