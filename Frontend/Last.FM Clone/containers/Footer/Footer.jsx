import { useState } from 'react'
import './Footer.css'

function Footer() {
  const date = new Date().getFullYear()
  
  return (
    <div className='app__footer'>
        Made by Dayshaun Goodluck | {`${date}`}
    </div>

  )
}

export default Footer