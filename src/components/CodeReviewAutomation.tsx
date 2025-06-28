import React, { useState, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { GitPullRequest, CheckCircle, AlertTriangle, X, MessageSquare, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewComment {
  id: string;
  line: number;
  file: string;
  type: 'suggestion' | 'issue' | 'question' | 'praise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
  author: 'ai' | 'human';
  timestamp: Date;
  resolved: boolean;
}

interface CodeReview {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected';
  author: string;
  reviewer: string;
  createdAt: Date;
  comments: ReviewComment[];
  overallScore: number;
  metrics: {
    complexity: number;
    maintainability: number;
    testCoverage: number;
    security: number;
  };
}

export function CodeReviewAutomation() {
  const { state: editorState } = useEditor();
  const { state: aiState } = useAI();
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  useEffect(() => {
    // Load existing reviews
    const sampleReviews: CodeReview[] = [
      {
        id: '1',
        title: 'Feature: User Authentication',
        status: 'in-progress',
        author: 'john.doe',
        reviewer: 'ai-reviewer',
        createdAt: new Date(Date.now() - 3600000),
        comments: [
          {
            id: '1',
            line: 15,
            file: 'auth.ts',
            type: 'issue',
            severity: 'high',
            message: 'Potential security vulnerability: Password is not being hashed before storage',
            suggestion: 'Use bcrypt or similar library to hash passwords before storing in database',
            author: 'ai',
            timestamp: new Date(),
            resolved: false
          },
          {
            id: '2',
            line: 23,
            file: 'auth.ts',
            type: 'suggestion',
            severity: 'medium',
            message: 'Consider adding input validation for email format',
            suggestion: 'Use a library like joi or yup for robust input validation',
            author: 'ai',
            timestamp: new Date(),
            resolved: false
          }
        ],
        overallScore: 7.5,
        metrics: {
          complexity: 6.2,
          maintainability: 8.1,
          testCoverage: 75,
          security: 6.5
        }
      }
    ];
    setReviews(sampleReviews);
    setSelectedReview(sampleReviews[0]);
  }, []);

  const startAutomatedReview = async () => {
    if (!activeFile || !aiState.apiKeys.openai) return;

    setIsAnalyzing(true);

    try {
      // Simulate AI code review
      const newReview: CodeReview = {
        id: Date.now().toString(),
        title: `Review: ${activeFile.name}`,
        status: 'in-progress',
        author: 'current-user',
        reviewer: 'ai-reviewer',
        createdAt: new Date(),
        comments: await generateAIComments(activeFile.content),
        overallScore: Math.random() * 4 + 6, // 6-10 range
        metrics: {
          complexity: Math.random() * 5 + 5,
          maintainability: Math.random() * 3 + 7,
          testCoverage: Math.random() * 40 + 60,
          security: Math.random() * 3 + 7
        }
      };

      setReviews([newReview, ...reviews]);
      setSelectedReview(newReview);
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAIComments = async (code: string): Promise<ReviewComment[]> => {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const comments: ReviewComment[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for common issues
      if (line.includes('console.log')) {
        comments.push({
          id: `comment-${Date.now()}-${index}`,
          line: index + 1,
          file: activeFile?.name || 'file',
          type: 'suggestion',
          severity: 'low',
          message: 'Remove console.log statements before production',
          suggestion: 'Use a proper logging library like winston or pino',
          author: 'ai',
          timestamp: new Date(),
          resolved: false
        });
      }

      if (line.includes('var ')) {
        comments.push({
          id: `comment-${Date.now()}-${index}-var`,
          line: index + 1,
          file: activeFile?.name || 'file',
          type: 'issue',
          severity: 'medium',
          message: 'Use const or let instead of var',
          suggestion: 'Replace var with const for immutable values or let for mutable ones',
          author: 'ai',
          timestamp: new Date(),
          resolved: false
        });
      }

      if (line.includes('== ') && !line.includes('=== ')) {
        comments.push({
          id: `comment-${Date.now()}-${index}-equality`,
          line: index + 1,
          file: activeFile?.name || 'file',
          type: 'issue',
          severity: 'medium',
          message: 'Use strict equality (===) instead of loose equality (==)',
          suggestion: 'Replace == with === to avoid type coercion issues',
          author: 'ai',
          timestamp: new Date(),
          resolved: false
        });
      }
    });

    return comments;
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedReview || selectedLine === null) return;

    const comment: ReviewComment = {
      id: Date.now().toString(),
      line: selectedLine,
      file: activeFile?.name || 'file',
      type: 'question',
      severity: 'low',
      message: newComment,
      author: 'human',
      timestamp: new Date(),
      resolved: false
    };

    const updatedReview = {
      ...selectedReview,
      comments: [...selectedReview.comments, comment]
    };

    setSelectedReview(updatedReview);
    setReviews(reviews.map(r => r.id === selectedReview.id ? updatedReview : r));
    setNewComment('');
    setSelectedLine(null);
  };

  const resolveComment = (commentId: string) => {
    if (!selectedReview) return;

    const updatedReview = {
      ...selectedReview,
      comments: selectedReview.comments.map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    };

    setSelectedReview(updatedReview);
    setReviews(reviews.map(r => r.id === selectedReview.id ? updatedReview : r));
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'issue': return AlertTriangle;
      case 'suggestion': return CheckCircle;
      case 'question': return MessageSquare;
      case 'praise': return CheckCircle;
      default: return MessageSquare;
    }
  };

  const getCommentColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'low': return 'text-blue-500 bg-blue-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Reviews List */}
      <div className="w-1/3 border-r border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Code Reviews</h2>
          <button
            onClick={startAutomatedReview}
            disabled={isAnalyzing || !activeFile}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Review'}
          </button>
        </div>

        <div className="space-y-3">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedReview?.id === review.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800'
              }`}
              onClick={() => setSelectedReview(review)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white truncate">{review.title}</h3>
                <span className={`px-2 py-1 text-xs rounded ${
                  review.status === 'approved' ? 'bg-green-600 text-white' :
                  review.status === 'rejected' ? 'bg-red-600 text-white' :
                  review.status === 'in-progress' ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {review.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{review.author}</span>
                <span>{review.comments.length} comments</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {review.createdAt.toLocaleDateString()}
                </span>
                <span className={`text-sm font-medium ${getScoreColor(review.overallScore)}`}>
                  {review.overallScore.toFixed(1)}/10
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Review Details */}
      <div className="flex-1 flex flex-col">
        {selectedReview ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">{selectedReview.title}</h2>
                <div className="flex items-center space-x-2">
                  <GitPullRequest className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">#{selectedReview.id}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Author: {selectedReview.author}</span>
                <span>Reviewer: {selectedReview.reviewer}</span>
                <span>Created: {selectedReview.createdAt.toLocaleString()}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-medium text-white mb-3">Code Quality Metrics</h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(selectedReview.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(value)}`}>
                      {typeof value === 'number' ? value.toFixed(1) : value}
                      {key === 'testCoverage' ? '%' : ''}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">
                  Comments ({selectedReview.comments.filter(c => !c.resolved).length} unresolved)
                </h3>
              </div>

              <div className="space-y-4">
                {selectedReview.comments.map((comment) => {
                  const CommentIcon = getCommentIcon(comment.type);
                  return (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border rounded-lg ${
                        comment.resolved ? 'border-gray-600 bg-gray-800/50 opacity-60' : 'border-gray-600 bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <CommentIcon className={`h-4 w-4 ${getCommentColor(comment.severity).split(' ')[0]}`} />
                          <span className="text-sm font-medium text-white">
                            Line {comment.line} • {comment.file}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${getCommentColor(comment.severity)}`}>
                            {comment.severity}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {comment.author === 'ai' ? (
                            <span className="text-xs text-blue-400">AI</span>
                          ) : (
                            <User className="h-3 w-3 text-gray-400" />
                          )}
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {comment.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-2">{comment.message}</p>
                      
                      {comment.suggestion && (
                        <div className="p-3 bg-green-900/20 border border-green-700 rounded mt-2">
                          <div className="text-sm text-green-300">
                            <strong>Suggestion:</strong> {comment.suggestion}
                          </div>
                        </div>
                      )}
                      
                      {!comment.resolved && (
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => resolveComment(comment.id)}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            Mark as Resolved
                          </button>
                        </div>
                      )}
                      
                      {comment.resolved && (
                        <div className="flex items-center mt-2 text-green-400 text-sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Add Comment */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2 mb-2">
                <input
                  type="number"
                  placeholder="Line #"
                  value={selectedLine || ''}
                  onChange={(e) => setSelectedLine(parseInt(e.target.value) || null)}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim() || selectedLine === null}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Comment
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <GitPullRequest className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a review to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}