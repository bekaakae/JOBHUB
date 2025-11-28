// src/pages/EditJob.jsx - UPDATED
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useJob } from '../context/JobContext'
import { getJob, updateJob, getCategories } from '../services/jobService'
import { ArrowLeft, Upload, X, Mail, Globe } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'

const EditJob = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { state, dispatch } = useJob()
  const { categories } = state
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [job, setJob] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  // ADDED: Check for temporary admin
  const [tempAdmin, setTempAdmin] = useState(false)
  
  useEffect(() => {
    const isTempAdmin = localStorage.getItem('jobhub_temp_admin') === 'true'
    setTempAdmin(isTempAdmin)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm()

  const applicationLink = watch('applicationLink')
  const hrEmail = watch('hrEmail')

  // UPDATED: Include temp admin in admin check
  const isAdmin = user?.publicMetadata?.role === 'admin' || tempAdmin

  // ADDED: Function to grant temp admin access
  const makeMeAdmin = () => {
    localStorage.setItem('jobhub_temp_admin', 'true')
    setTempAdmin(true)
    alert('Temporary admin access granted! You can now edit jobs.')
  }

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true)
        const [jobResponse, categoriesResponse] = await Promise.all([
          getJob(id),
          getCategories()
        ])

        const jobData = jobResponse.data
        setJob(jobData)
        
        // Pre-fill form with existing data
        reset({
          title: jobData.title,
          description: jobData.description,
          company: jobData.company,
          location: jobData.location,
          jobType: jobData.jobType,
          experienceLevel: jobData.experienceLevel,
          category: jobData.category?._id,
          applicationLink: jobData.applicationLink || '',
          hrEmail: jobData.hrEmail || '',
          deadline: new Date(jobData.deadline).toISOString().split('T')[0],
          requirements: jobData.requirements?.length > 0 ? jobData.requirements : ['']
        })

        // Set image preview if exists
        if (jobData.image?.url) {
          setImagePreview(jobData.image.url)
        }

        dispatch({ type: 'SET_CATEGORIES', payload: categoriesResponse.data })
      } catch (error) {
        console.error('Error fetching job data:', error)
        alert('Failed to load job data')
        navigate('/admin')
      } finally {
        setLoading(false)
      }
    }

    fetchJobData()
  }, [id, reset, dispatch, navigate])

  const onSubmit = async (data) => {
    if (!isAdmin) {
      alert('You need admin privileges to edit jobs')
      return
    }

    // Validate that at least one contact method is provided
    if (!data.applicationLink && !data.hrEmail) {
      alert('Please provide either an application link or HR email')
      return
    }

    try {
      setSubmitting(true)

      const jobData = {
        ...data,
        requirements: data.requirements.filter(req => req.trim() !== ''),
        deadline: new Date(data.deadline).toISOString()
      }

      console.log('🔄 Updating job with data:', jobData)
      
      const response = await updateJob(id, jobData)
      
      console.log('✅ Job update response:', response)
      
      alert('Job updated successfully!')
      navigate('/admin')
    } catch (error) {
      console.error('❌ Error updating job:', error)
      
      // More specific error messages
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.')
      } else if (error.response?.status === 403) {
        alert('You do not have permission to edit this job.')
      } else if (error.response?.status === 404) {
        alert('Job not found. It may have been deleted.')
      } else if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment and try again.')
      } else {
        alert('Failed to update job. Please check your connection and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const addRequirement = () => {
    const currentRequirements = watch('requirements')
    setValue('requirements', [...currentRequirements, ''])
  }

  const removeRequirement = (index) => {
    const currentRequirements = watch('requirements')
    setValue('requirements', currentRequirements.filter((_, i) => i !== index))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">You need admin privileges to edit jobs.</p>
        
        <div className="space-y-4">
          <Button onClick={makeMeAdmin} className="bg-yellow-500 hover:bg-yellow-600">
            Click Here to Get Temporary Admin Access
          </Button>
          <br />
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          This will give you admin access in this browser only.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="large" text="Loading job data..." />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-8">The job you're trying to edit doesn't exist.</p>
        <Button onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {/* ADDED: Admin Status Indicator */}
      {tempAdmin && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-800 font-medium">
              🔐 Using Temporary Admin Access
            </span>
            <span className="ml-2 text-yellow-600 text-sm">
              (This session only)
            </span>
          </div>
        </div>
      )}

      <Card>
        <Card.Header>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job: {job.title}</h1>
          <p className="text-gray-600 mt-1">Update the job details below</p>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Job title is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Senior Frontend Developer"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  {...register('company', { required: 'Company name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Tech Corp Inc."
                />
                {errors.company && (
                  <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. New York, NY or Remote"
                />
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  {...register('jobType', { required: 'Job type is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  {...register('experienceLevel', { required: 'Experience level is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Methods</h3>
              <p className="text-sm text-gray-600 mb-4">
                Provide at least one way for applicants to contact you or apply
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>Application Link</span>
                    </div>
                  </label>
                  <input
                    type="url"
                    {...register('applicationLink', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL'
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://company.com/careers/apply"
                  />
                  {errors.applicationLink && (
                    <p className="text-red-600 text-sm mt-1">{errors.applicationLink.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>HR Email</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    {...register('hrEmail', {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="hr@company.com"
                  />
                  {errors.hrEmail && (
                    <p className="text-red-600 text-sm mt-1">{errors.hrEmail.message}</p>
                  )}
                </div>
              </div>

              {!applicationLink && !hrEmail && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Please provide either an application link or HR email address
                  </p>
                </div>
              )}
            </div>

            {/* Application Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  {...register('deadline', { 
                    required: 'Deadline is required',
                    validate: value => {
                      const selectedDate = new Date(value)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return selectedDate > today || 'Deadline must be in the future'
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.deadline && (
                  <p className="text-red-600 text-sm mt-1">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                rows="6"
                {...register('description', { 
                  required: 'Description is required',
                  minLength: {
                    value: 50,
                    message: 'Description must be at least 50 characters'
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                placeholder="Describe the job responsibilities, expectations, and what makes your company great..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <div className="space-y-2">
                {watch('requirements')?.map((_, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      {...register(`requirements.${index}`)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {watch('requirements').length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="mt-2"
              >
                Add Requirement
              </Button>
            </div>

            {/* Job Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Image (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="job-image"
                  />
                  <label
                    htmlFor="job-image"
                    className="cursor-pointer flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-200"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                  </label>
                </div>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!applicationLink && !hrEmail}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tempAdmin ? 'Update Job (Temporary Admin)' : 'Update Job'}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}

export default EditJob