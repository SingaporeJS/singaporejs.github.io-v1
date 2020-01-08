const CORS_URL = ''
const UPCOMING = `${CORS_URL}https://api.meetup.com/singapore-js/events`
const PAST = `${CORS_URL}https://api.meetup.com/singapore-js/events`
const ABOUT = `${CORS_URL}https://api.meetup.com/singapore-js`

const Cache = Object.assign(new Map(), {
  counter: 0,
  save (key, data = {}) {
    Cache.touch(key)
    window.localStorage.setItem(key, JSON.stringify(data))
    Cache.set(key, data)
    return data
  },

  touch (key) {
    // keep track of last changed
    const uID = `${Date.now()}.${Cache.counter++}`
    window.localStorage.setItem('changed.' + key, uID)
    Cache.set('changed.' + key, uID)
  },

  isDirty (key) {
    const memID = Cache.get('changed.' + key)
    const storageID = window.localStorage.getItem('changed.' + key)
    if (!memID) return true
    if (!storageID) return true

    return (
      memID !== storageID
    )
  },

  load (key, defaultValue = {}) {
    if (!Cache.isDirty(key) && Cache.has(key)) {
      return Cache.get(key)
    }

    let data = null
    const raw = window.localStorage.getItem(key) || JSON.stringify(defaultValue)
    try {
      data = JSON.parse(raw)
    } catch (err) {
      window.localStorage.removeItem(key)
      data = defaultValue
    }

    Cache.touch(key)
    Cache.set(key, data)
    return data
  }
})

window.Cache = Cache

export function cachedPast () {
  return Cache.load(PAST, []) || []
}

export function cachedUpcoming () {
  return Cache.load(UPCOMING, []) || []
}

export function cachedAbout () {
  return Cache.load(ABOUT, {}) || {}
}

export const fetchPast = throttlePromise(() => {
  return fetchAndCache(PAST, {mode: 'cors'}, events => {
    return events.sort((a, b) => b.time - a.time)
  })
})

export const fetchUpcoming = throttlePromise(() => {
  return fetchAndCache(UPCOMING, {mode: 'cors'}, events => {
    return events.sort((a, b) => b.time - a.time)
  })
})

export const fetchAbout = throttlePromise(() => {
  return fetchAndCache(ABOUT, {mode: 'cors'})
})

function fetchAndCache (url, options = {}, transform = a => a) {
  return fetchJSON(url, options)
  .then(r => r && r.results || r)
  .then(r => transform(r))
  .then(data => Cache.save(url, data))
}

function fetchJSON (url, options = {}) {
  return window.fetch(url, options)
  .then(r => {
    if (r.ok) {
      return r.json()
    } else {
      return Promise.resolve().then(() => {
        if (r.status === 404) throw new Error('Not Found.')
        return r.text().then(text => {
          let data = null
          try {
            data = JSON.parse(text)
          } catch (_) {
            return Promise.reject(text.slice(0, 350))
          }
          if (!data) Promise.reject(text.slice(0, 350))
          if (!data.errors) return Promise.reject(data)
          return Promise.reject(data.errors)
        })
      })
      .catch(err => {
        return Promise.reject(new Error(`API Error ${r.status}: ${r.statusText}\n${r.url}\n\n${err}`))
      })
    }
  })
}

function throttlePromise (fn, timeout = 30000) {
  let lastTime = Infinity
  let lastPromise = null
  let isPending = false
  return function (...args) {
    const now = Date.now()
    if (
      isPending ||
      lastPromise &&
      (now - lastTime) < timeout
    ) return lastPromise

    isPending = true
    lastPromise = fn.call(this, ...args)
    return lastPromise.then((result) => {
      lastTime = now
      isPending = false
      return result
    }, err => {
      lastTime = now
      isPending = false
      return Promise.reject(err)
    })
  }
}

