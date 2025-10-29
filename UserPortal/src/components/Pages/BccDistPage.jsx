import React from 'react'
import Header from '../Navbar/Header'
import Sidebar from '../Navbar/Sidebar'
import Dashboard from '../Dashboard/Dashboard'
import BccDistribution from '../BccDistribution/BccDistribution'

const BccDistPage = () => {
  return (
    <>
     <Header/>
     
     <BccDistribution/>
    </>
  )
}

export default BccDistPage