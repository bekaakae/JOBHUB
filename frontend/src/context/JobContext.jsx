// src/context/JobContext.jsx - PREVENT DUPLICATE REQUESTS
import { createContext, useContext, useReducer, useEffect } from 'react'
import { jobReducer, initialState } from '../reducers/jobReducer'
import { getJobs, getCategories } from '../services/jobService'

const JobContext = createContext()

export const useJob = () => {
  const context = useContext(JobContext)
  if (!context) {
    throw new Error('useJob must be used within a JobProvider')
  }
  return context
}

export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialState)

  // Enhanced data extraction with multiple fallbacks
  const extractDataFromResponse = (response, dataType = 'unknown') => {
    console.log(`🔧 Extracting ${dataType} data from:`, response)
    
    if (!response) {
      console.log(`⚠️ No response for ${dataType}`)
      return []
    }

    // If response.data is already an array, use it directly
    if (Array.isArray(response.data)) {
      console.log(`✅ ${dataType}: Using direct array from response.data`)
      return response.data
    }

    // If response.data has a data property that's an array
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log(`✅ ${dataType}: Using nested array from response.data.data`)
      return response.data.data
    }

    // If response.data is an object, look for array properties
    if (response.data && typeof response.data === 'object') {
      // Common patterns: results, items, categories, jobs
      const possibleArrayKeys = ['results', 'items', 'data', 'categories', 'jobs', 'list']
      
      for (const key of possibleArrayKeys) {
        if (Array.isArray(response.data[key])) {
          console.log(`✅ ${dataType}: Found array in response.data.${key}`)
          return response.data[key]
        }
      }

      // Try to find any array in the object values
      const objectValues = Object.values(response.data)
      const arrays = objectValues.filter(val => Array.isArray(val))
      if (arrays.length > 0) {
        console.log(`✅ ${dataType}: Found array in object values`)
        return arrays[0]
      }
    }

    // If response itself is an array (unlikely but possible)
    if (Array.isArray(response)) {
      console.log(`✅ ${dataType}: Response is directly an array`)
      return response
    }

    console.log(`❌ ${dataType}: No array data found in response structure`)
    return []
  }

  // Fetch initial data - only once when provider mounts
  useEffect(() => {
    let isMounted = true

    const fetchInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        const [jobsResponse, categoriesResponse] = await Promise.all([
          getJobs(),
          getCategories()
        ])

        // Only update state if component is still mounted
        if (!isMounted) return

        console.log('📊 Jobs API Response:', jobsResponse)
        console.log('📊 Categories API Response:', categoriesResponse)

        // Extract and set jobs data
        const jobsData = extractDataFromResponse(jobsResponse, 'jobs')
        console.log('📦 Processed jobs data:', jobsData)
        dispatch({ type: 'SET_JOBS', payload: jobsData })

        // Extract and set categories data
        const categoriesData = extractDataFromResponse(categoriesResponse, 'categories')
        console.log('📦 Processed categories data:', categoriesData)
        dispatch({ type: 'SET_CATEGORIES', payload: categoriesData })

      } catch (error) {
        if (!isMounted) return
        
        console.error('❌ Error fetching initial data:', error)
        dispatch({ type: 'SET_ERROR', payload: error.message })
        // Set empty arrays on error
        dispatch({ type: 'SET_JOBS', payload: [] })
        dispatch({ type: 'SET_CATEGORIES', payload: [] })
      } finally {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    fetchInitialData()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - only run once

  const value = {
    state,
    dispatch
  }

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  )
}