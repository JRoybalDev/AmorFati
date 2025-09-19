'use client'

import { useFilter } from '@/context/FilterContext';
import React, { useState } from 'react'

function ContentFilters() {

  const filterChoices = ['all', 'text', 'photo'];

  const { filterSelection, setFilterSelection } = useFilter();

  return (
    filterChoices.map((filter) => (
      <button
        onClick={() => setFilterSelection(filter)}
        key={filter}
        className={``}
      >
        {filter}
      </button>
    ))
  )
}

export default ContentFilters
