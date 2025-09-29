'use client'

import { useFilter } from '@/context/FilterContext';
import React from 'react'

function ContentFilters() {

  const filterChoices = ['all', 'text', 'photo'];

  const { filterSelection, setFilterSelection } = useFilter();

  return (
    <div className='flex flex-col xl:flex-row gap-1'>
      {filterChoices.map((filter) => (
      <button
        onClick={() => setFilterSelection(filter)}
        key={filter}
          className={`xl:w-1/3 border-2 rounded-lg ${filterSelection === filter ? 'bg-BGbuttonSelected ' : 'bg-BGbutton hover:bg-HOVERbutton'} hover:cursor-pointer duration-250`}
      >
        {filter}
      </button>
      ))}
    </div>
  )
}

export default ContentFilters
