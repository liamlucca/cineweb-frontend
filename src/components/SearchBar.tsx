import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'

interface SearchBarProps {
  // text already searched, so the input keeps showing it on the results page
  initialText?: string
}

function SearchBar({ initialText = '' }: SearchBarProps) {
  //explanation of useNavigate is at the bottom
  const [text, setText] = useState(initialText)
  const navigate = useNavigate()

  // a <form> submits with Enter and with the button, so one handler covers both
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    // encodeURIComponent keeps characters like & or # from breaking the URL
    navigate(trimmed === '' ? '/search' : `/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form className="flex gap-2 px-4 mt-5" onSubmit={handleSearch} role="search">

        {/*SEARCH INPUT*/}
        <label className="input flex-1 lg:max-w-3xl">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
            >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
            </g>
        </svg>
        <input type="search" placeholder="Search movies and series by title..."
            aria-label="Search by title"
            value={text}
            onChange={e => setText(e.target.value)}/>
        </label>

        {/*SEARCH BUTTON*/}
        <button type="submit" className="btn btn-square" aria-label="Search">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        </button>

    </form>
  )
}

export default SearchBar

/*

EXPLANATION: useNavigate.
It's the way to change routes from code, without the user clicking a Link. When someone clicks search, navigate('/search?q=Shrek') sends them to that page.
*/
