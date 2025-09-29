'use client'

import { useFilter } from '@/context/FilterContext';
import React, { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { GiSettingsKnobs } from "react-icons/gi";

function MobileContentFilters() {

  const filterChoices = ['all', 'text', 'photo'];

  const { filterSelection, setFilterSelection } = useFilter();

  const [isOpen, setIsOpen] = useState(false);



  return (
    <div className="w-full h-full">
      <div className="px-4 py-4">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-filters-dropdown"
            onClick={() => setIsOpen((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 focus:outline-none bg-BGbutton text-slate-100 shadow-md hover:cursor-pointer hover:bg-BGbuttonSelected"
          >
            <GiSettingsKnobs className="h-5 w-5" />
            <span>Filters</span>
          </button>

          <div className="flex-1 min-w-0">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id="mobile-filters-dropdown"
                  className="origin-right overflow-hidden"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ transformOrigin: 'right' }}
                >
                  <div className="flex gap-2 overflow-x-auto justify-end">
                    {filterChoices.map((choice) => {
                      const isActive = filterSelection === choice;

                      return (
                        <motion.button
                          key={choice}
                          onClick={() => {
                            setFilterSelection(choice);
                            setIsOpen(false);
                          }}
                          className={`flex-shrink-0 px-4 py-2 rounded-2xl font-semibold transition-colors duration-200 focus:outline-none ${isActive ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 border border-slate-200'} text-h3Mob`}
                          aria-pressed={isActive}
                          whileTap={{ scale: 0.95 }}
                          animate={{ scale: isActive ? 1.03 : 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          {choice.toUpperCase()}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileContentFilters
