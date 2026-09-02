import React from 'react'
import {PricingTable} from "@clerk/react"

const Pricing = () => {
  return (
    <div className='max-w-4xl mx-auto w-full min-h-[calc(100vh-7rem)] flex flex-col gap-5 items justify-center p-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-medium tracking-tight text-slate-900'>Upgrade your plan.</h1>
        <p className='text-sm text-slate-500 mt-1'>Choose the plan that's right for you and unlock all the features of MeetUp.</p>
      </div>
      <PricingTable />
    </div>
  )
}

export default Pricing