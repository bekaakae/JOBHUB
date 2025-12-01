import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useSocket } from '../context/SocketContext'
import { useJob } from '../context/JobContext'
import { getJob } from '../services/jobService'
import { toggleLike, checkUserLike } from '../services/likeService'
import { getCommentsByJob, createComment, deleteComment } from '../services/commentService'
import { format, parseISO, isValid } from 'date-fns'
import { 
  MapPin, 
  Calendar, 
  Building2, 
  Clock, 
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Globe,
  Copy,
  Link as LinkIcon
} from 'lucide-react'
import Loading from '../components/ui/Loading'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isSignedIn, user, getToken } = useAuth()
  
  const { socket, isConnected, joinJobRoom } = useSocket()
  const { state, dispatch } = useJob()
  const { selectedJob } = state

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentLoading, setCommentLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userHasLiked, setUserHasLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  const isAdmin = user?.publicMetadata?.role === 'admin'

  // Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline set';
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      
      if (!isValid(date)) {
        return 'Invalid date';
      }
      
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Check if deadline is approaching
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    
    try {
      const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : new Date(deadline);
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      
      return isValid(deadlineDate) && deadlineDate <= twoDaysFromNow && deadlineDate > new Date();
    } catch (error) {
      console.error('Deadline check error:', error);
      return false;
    }
  };

  // Check if deadline is expired
  const isExpired = (deadline) => {
    if (!deadline) return false;
    
    try {
      const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : new Date(deadline);
      return isValid(deadlineDate) && deadlineDate < new Date();
    } catch (error) {
      console.error('Expired check error:', error);
      return false;
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text).then(() => {
      alert(message);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    });
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching job details for ID:', id);
        
        if (!id || id === 'undefined') {
          setError('Invalid job ID');
          setLoading(false);
          return;
        }

        const jobResponse = await getJob(id);
        console.log('📊 Job API Response:', jobResponse);
        
        if (jobResponse && jobResponse.success) {
          console.log('✅ Job data received:', jobResponse.data);
          const jobData = jobResponse.data;
          
          dispatch({ type: 'SET_SELECTED_JOB', payload: jobData });
          
          // Set likes count from job data
          setLikesCount(jobData.likesCount || jobData.likeCount || 0);
          
          // Check if current user has liked this job
          if (isSignedIn) {
            try {
              const likeCheck = await checkUserLike(id);
              console.log('💖 Like check response:', likeCheck);
              if (likeCheck.success) {
                setUserHasLiked(likeCheck.liked);
              }
            } catch (likeError) {
              console.error('❌ Error checking user like:', likeError);
            }
          }

          // Fetch comments
          try {
            const commentsResponse = await getCommentsByJob(id);
            console.log('✅ Comments data received:', commentsResponse);
            setComments(commentsResponse.data || commentsResponse || []);
          } catch (commentError) {
            console.error('❌ Error fetching comments:', commentError);
            setComments([]);
          }
        } else {
          const errorMsg = jobResponse?.message || 
                          jobResponse?.error?.message || 
                          jobResponse?.data?.message || 
                          'Failed to load job details';
          console.error('❌ Job fetch failed:', errorMsg);
          setError(errorMsg);
        }
      } catch (error) {
        console.error('❌ Error fetching job details:', error);
        
        if (error.response?.status === 404) {
          setError('Job not found. It may have been removed.');
        } else if (error.response?.status === 400) {
          setError('Invalid job ID.');
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          setError('Network error. Please check your connection.');
        } else {
          setError(error.response?.data?.message || error.message || 'Failed to load job details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, dispatch, isSignedIn]);

  // Socket.io for real-time comments and likes
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('🔌 Socket not available, skipping socket setup');
      return;
    }

    console.log('🔌 Setting up socket listeners for job:', id);
    
    joinJobRoom(id);

    const handleCommentAdded = (data) => {
      if (data.jobId === id) {
        console.log('💬 New comment received:', data.comment);
        setComments(prev => [data.comment, ...prev]);
      }
    };

    const handleCommentRemoved = (data) => {
      if (data.jobId === id) {
        console.log('💬 Comment removed:', data.commentId);
        setComments(prev => prev.filter(comment => comment._id !== data.commentId));
      }
    };

    const handleLikeUpdated = (data) => {
      if (data.jobId === id) {
        console.log('❤️ Like updated:', data);
        setLikesCount(data.likesCount || data.count || 0);
        if (data.userId === user?.id) {
          setUserHasLiked(data.action === 'liked');
        }
      }
    };

    socket.on('comment-added', handleCommentAdded);
    socket.on('comment-removed', handleCommentRemoved);
    socket.on('like-updated', handleLikeUpdated);

    return () => {
      console.log('🔌 Cleaning up socket listeners for job:', id);
      socket.off('comment-added', handleCommentAdded);
      socket.off('comment-removed', handleCommentRemoved);
      socket.off('like-updated', handleLikeUpdated);
      
      if (socket && isConnected) {
        socket.emit('leave-job-room', id);
      }
    };
  }, [socket, isConnected, id, joinJobRoom, user]);

  const handleLike = async () => {
    if (!isSignedIn) {
      alert('Please sign in to like jobs');
      return;
    }

    try {
      setLikeLoading(true);
      console.log('💖 Toggling like for job:', id);
      
      const response = await toggleLike(id);
      console.log('💖 Like toggle response:', response);
      
      if (response.success) {
        // Update local state immediately for better UX
        const newLikedState = !userHasLiked;
        setUserHasLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
        
        console.log('✅ Like updated successfully');
      } else {
        console.error('Like toggle failed:', response.message);
        alert('Failed to like job: ' + response.message);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      
      if (error.response?.status === 404) {
        alert('Like feature is currently unavailable. Please try again later.');
      } else if (error.response?.status === 401) {
        alert('Please sign in to like jobs');
      } else {
        alert('Failed to like job. Please try again.');
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!isSignedIn) {
      alert('Please sign in to comment')
      return
    }

    if (!newComment.trim()) return

    try {
      setCommentLoading(true)
      console.log('💬 Submitting comment for job:', id);
      
      const response = await createComment({
        content: newComment,
        jobId: id
      })
      
      console.log('💬 Comment submission response:', response);

      // Clear input on success
      setNewComment('')
      
      // Show success message
      alert('Comment posted successfully!');
      
    } catch (error) {
      console.error('Error creating comment:', error)
      
      // More specific error messages
      if (error.response?.status === 401) {
        alert('Please sign in to comment');
      } else if (error.response?.status === 404) {
        alert('Job not found. Cannot post comment.');
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      console.log('🗑️ Deleting comment:', commentId);
      await deleteComment(commentId)
      alert('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }

  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return

    try {
      setDeleteLoading(true)
      // Add delete job service call here
      // await deleteJob(id)
      navigate('/admin')
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job')
    } finally {
      setDeleteLoading(false)
    }
  }

  const shareJob = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedJob?.title,
          text: selectedJob?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      copyToClipboard(window.location.href, 'Job link copied to clipboard!');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="large" text="Loading job details..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedJob) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-8">The job you're looking for doesn't exist.</p>
        <Link
          to="/jobs"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-200"
        >
          Browse All Jobs
        </Link>
      </div>
    )
  }

  const deadlineApproaching = isDeadlineApproaching(selectedJob.deadline)
  const jobExpired = isExpired(selectedJob.deadline)

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      {/* Job Header */}
      <Card className="mb-6">
        <Card.Content>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {selectedJob.title || 'No Title'}
              </h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Building2 className="h-5 w-5 mr-3" />
                  <span className="text-lg">{selectedJob.company || 'No Company'}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span className="text-lg">{selectedJob.location || 'No Location'}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="text-lg">
                    Apply by {formatDate(selectedJob.deadline)}
                  </span>
                </div>

                {selectedJob.category && (
                  <div className="flex items-center">
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: `${selectedJob.category.color || '#6B7280'}20`,
                        color: selectedJob.category.color || '#6B7280'
                      }}
                    >
                      {selectedJob.category.name || 'Uncategorized'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => navigate(`/admin/edit-job/${id}`)}
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  loading={deleteLoading}
                  onClick={handleDeleteJob}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>

          {/* Contact Options */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Apply</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedJob.applicationLink && (
                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Online Application</h4>
                    <p className="text-sm text-gray-600 mb-2">Apply through our career portal</p>
                    <div className="flex space-x-2">
                      <a
                        href={selectedJob.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
                      >
                        <span>Apply Online</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(selectedJob.applicationLink, 'Application link copied!')}
                        className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 text-sm font-medium"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedJob.hrEmail && (
                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Email Application</h4>
                    <p className="text-sm text-gray-600 mb-2">Send your application via email</p>
                    
                    {/* Email display and copy section */}
                    <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 flex-1">
                        {selectedJob.hrEmail}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedJob.hrEmail, 'HR email copied to clipboard!')}
                        className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm transition duration-200"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    {/* Email action buttons */}
                    <div className="flex space-x-2 flex-wrap gap-2">
                      <a
                        href={`mailto:${selectedJob.hrEmail}?subject=Application for ${selectedJob.title}&body=Dear Hiring Manager,%0D%0A%0D%0AI am interested in applying for the ${selectedJob.title} position at ${selectedJob.company}.%0D%0A%0D%0APlease find my application attached.%0D%0A%0D%0ABest regards,%0D%0A[Your Name]`}
                        className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Open Email App</span>
                      </a>
                      
                      <button
                        onClick={() => {
                          const subject = `Application for ${selectedJob.title}`;
                          const body = `Dear Hiring Manager,\n\nI am interested in applying for the ${selectedJob.title} position at ${selectedJob.company}.\n\nPlease find my application attached.\n\nBest regards,\n[Your Name]`;
                          const mailtoLink = `mailto:${selectedJob.hrEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                          copyToClipboard(mailtoLink, 'Email link copied! You can paste this into any email application.');
                        }}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>Copy Email Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!selectedJob.applicationLink && !selectedJob.hrEmail && (
              <div className="text-center py-4 text-yellow-700 bg-yellow-50 rounded-lg">
                <p>No contact method provided for this job.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant={userHasLiked ? "primary" : "outline"}
              loading={likeLoading}
              onClick={handleLike}
              className="flex items-center space-x-2"
            >
              <Heart 
                className={`h-4 w-4 ${userHasLiked ? 'fill-current' : ''}`} 
              />
              <span>Like ({likesCount})</span>
            </Button>

            <Button
              variant="outline"
              onClick={shareJob}
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>

          {/* Deadline Warnings */}
          {jobExpired ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-red-800">
                <Clock className="h-5 w-5" />
                <span className="font-medium">This job posting has expired</span>
              </div>
            </div>
          ) : deadlineApproaching && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Clock className="h-5 w-5 animate-pulse" />
                <span className="font-medium">Application deadline is approaching!</span>
              </div>
            </div>
          )}

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {selectedJob.jobType && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Job Type</div>
                <div className="font-medium text-gray-900 capitalize">
                  {selectedJob.jobType?.replace('-', ' ') || 'Not specified'}
                </div>
              </div>
            )}

            {selectedJob.experienceLevel && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Experience</div>
                <div className="font-medium text-gray-900 capitalize">
                  {selectedJob.experienceLevel || 'Not specified'}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
            <div className="text-gray-700 whitespace-pre-line">
              {selectedJob.description || 'No description available.'}
            </div>
          </div>

          {/* Requirements */}
          {selectedJob.requirements && selectedJob.requirements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {selectedJob.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {selectedJob.benefits && selectedJob.benefits.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {selectedJob.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {selectedJob.tags && selectedJob.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Comments Section */}
      <Card>
        <Card.Header>
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {comments.length}
            </span>
          </div>
        </Card.Header>
        
        <Card.Content>
          {/* Comment Form */}
          {isSignedIn ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="mb-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                loading={commentLoading}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-gray-600">
                Please sign in to leave a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map(comment => {
              const commentDate = comment.createdAt ? formatDate(comment.createdAt) : 'Unknown date';
              
              return (
                <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <img
                        src={comment.user?.profileImage || comment.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || comment.userName || 'User')}&background=10B981&color=fff`}
                        alt={comment.user?.name || comment.userName || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.user?.name || comment.userName || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {commentDate}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                    
                    {(isAdmin || comment.user?._id === user?.id) && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default JobDetail